import { GridINU } from './GridINU';
import { useState, useEffect } from 'react';
import { GridINUBaseClass } from './GridINUBase.js';
import { Select } from './OuterComponents/Select';
// =================================================================================================================================================================
export function CardINU(props) {
    let card = null;

    const [gridState, setState] = useState({ grid: card, ind: 0 });

    card = gridState.grid;
    let needGetRows = false;
    if (!card) {
        if (props.findGrid) {
            card = props.findGrid(props);
        }
        card = card || new CardINUClass(props);
        needGetRows = !card.changedRow;
    }

    if (props.init) {
        props.init(card);
    }

    card.refreshState = function () {
        setState({ grid: card, ind: card.stateind++ });
    }

    useEffect(() => {
        card.setupEvents();

        if (needGetRows && card.selectedRow() === undefined) {

            card.getRows({ filters: card.collectFilters(), card: card }).then(
                rows => {
                    card.rows = rows;
                    card.afterGetRows();
                    card.refreshState();
                }
            );
        }

        if (card.columns.length <= 0 && card.getColumns) {
            //card.columns = card.getColumns();
            card.prepareColumns().then(() => card.refreshState());
        }

        return () => {
            card.clearEvents();
        }
    }, [card, needGetRows])

    return (card.render());
}
// =================================================================================================================================================================
export class CardINUClass extends GridINUBaseClass {

    constructor(props) {
        super(props);

        const card = this;

        card.changedRow = {};
        card.initialRow = props.cardRow;
        Object.assign(card.changedRow, card.initialRow);

        if (props.isNewRecord) {
            card.isNewRecord = true;
            card.setEditing(true);
        }

        card.cardButtons = [];
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const card = this;

        //GridClass.applyTheme(card);
        card.addCardButtons();
        card.buttons = card.cardButtons;

        return (
            <>
                <div className='graph-card-toolbar'
                    key={`cardtoolbardiv_${card.id}_`}
                >
                    {super.renderToolbar()}
                </div>
                <div className="graph-card-div"
                    key={`cardbodydiv_${card.id}_`}
                >
                    {
                        card.columns.map((col) => { return card.renderField(col) })
                    }
                </div>
                {super.renderLookup()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderField(col) {
        const card = this;
        const value = card.changedRow[col.name];
        if (col.type === undefined || col.type === null) {
            col.type = '';
        }
        switch (col.type.toLowerCase()) {
            case 'lookup':
                return (
                    <div className="graph-card-field"
                        key={`cardlookupdiv_${card.id}_${col.id}_`}
                    >
                        <span
                            key={`cardlookuptitle_${card.id}_${col.id}_`}
                            style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                        >
                            {col.title || col.name}
                        </span>
                        {
                            !col.allowCombobox ?
                                <input
                                    key={`cardlookupinput_${card.id}_${col.id}_`}
                                    value={value}
                                    style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em', gridColumn: col.required || col.readonly ? 'span 2' : '' }}
                                    disabled='disabled'
                                ></input>
                                :
                                <Select
                                    key={`cardlookupselect_${card.id}_${col.id}_`}
                                    value={{ value: card.changedRow[col.keyField], label: value }}
                                    getOptions={(filter, pageNum) => card.getLookupValues(col, filter, pageNum)}
                                    style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', gridColumn: col.required || col.readonly ? 'span 2' : '' }}
                                    onChange={(e) => {
                                        card.changedRow[col.keyField] = e.value;
                                        card.changedRow[col.name] = e.label;
                                        card.refreshState();
                                    }}
                                >
                                </Select>
                        }
                        <button
                            key={`cardlookupbtn_${card.id}_${col.id}_`}
                            className={'graph-card-button'}
                            onClick={(e) => card.openLookupField(e, col, card.changedRow)}
                        >
                            {card.images.filterSelect ? card.images.filterSelect() : card.translate('Select', 'graph-filter-select')}
                        </button>
                        <button
                            key={`cardlookupclear_${card.id}_${col.id}_`}
                            className={'graph-card-button'}
                            disabled={value === undefined || value === '' ? 'disabled' : ''}
                            onClick={(e) => card.clearField(e, col, card.changedRow)}
                            style={{ display: !col.required && !col.readonly ? '' : 'none' }}
                        >
                            {card.images.filterClear ? card.images.filterClear() : card.translate('Clear', 'graph-filter-clear')}
                        </button>
                    </div>
                )
            //case 'date':
            //    break;
            default:
                return (
                    <div className="graph-card-field"
                        key={`cardfielddiv_${card.id}_${col.id}_`}
                    >
                        <span
                            key={`cardfieldtitle_${card.id}_${col.id}_`}
                            style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                        >
                            {col.title || col.name}
                        </span>
                        <textarea
                            key={`cardlookuptextarea_${card.id}_${col.id}_`}

                            value={card.changedRow[col.name] !== undefined ? card.changedRow[col.name] : ''}
                            style={{ width: 'calc(100% - 4px)', height: col.maxW !== undefined && +col.maxW >= 200 ? '5em' : '2.3em', padding: '0 2px', boxSizing: 'border-box', gridColumn: col.required || col.readonly ? 'span 3' : 'span 2', resize: 'vertical' }}
                            onChange={(e) => card.changeField(e, col, card.changedRow)}
                            disabled={col.readonly ? 'disabled' : ''}
                            autoFocus={col === card._changingCol}
                            onFocus={e => {
                                if (col === card._changingCol) {
                                    e.currentTarget.selectionStart = e.currentTarget.selectionEnd = card._remCursorPos;
                                }
                            }}
                        >

                        </textarea>
                        <button
                            key={`cardfieldclear_${card.id}_${col.id}_`}
                            className={'graph-card-button'}
                            disabled={value === undefined || value === '' ? 'disabled' : ''}
                            onClick={(e) => card.clearField(e, col, card.changedRow)}
                            style={{ display: !col.required && !col.readonly ? '' : 'none' }}
                        >
                            {card.images.filterClear ? card.images.filterClear() : card.translate('Clear', 'graph-filter-clear')}
                        </button>
                    </div>
                )
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addCardButtons() {
        const card = this;

        if (card._cardButtonsAdded) return;

        card._cardButtonsAdded = true;

        //card.cardButtons.push({
        //    id: card.cardButtons.length,
        //    name: 'edit',
        //    title: card.translate('Start edit'),
        //    label: card.images.edit ? '' : card.translate('Start edit'),
        //    click: (e) => card.startEditNode(e),
        //    img: card.images.edit
        //});

        card.cardButtons.push({
            id: card.cardButtons.length,
            name: 'commit',
            title: card.translate('Commit changes'),
            label: card.images.commit ? '' : card.translate('Commit changes'),
            img: card.images.commit,
            click: (e) => card.commitChangesNode(e),
            getDisabled: (e) => card.commitChangesNodeDisabled(e),
        });

        card.cardButtons.push({
            id: card.cardButtons.length,
            name: 'rollback',
            title: card.translate('Rollback changes'),
            label: card.images.rollback ? '' : card.translate('Rollback changes'),
            img: card.images.rollback,
            click: (e) => card.rollbackChangesNode(e),
            getDisabled: (e) => card.rollbackChangesNodeDisabled(e),
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNodeDisabled(e) {
        const card = this;
        return !card.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNodeDisabled(e) {
        const card = this;
        return !card.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNode(e) {
        const card = this;
        card.saveRow({ row: card.initialRow, changedRow: card.changedRow }).then(
            () => {
                card.setEditing(false);
                Object.assign(card.initialRow, card.changedRow);
                card.refreshState();
            }
        ).catch((message) => {
            Object.assign(card.changedRow, card.initialRow);
            card.refreshState();
            alert(message || 'Error!');
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNode(e) {
        const card = this;
        if (card.isNewRecord) {
            Object.assign(card.changedRow, card.initialRow);
            card.setEditing(false);
            card.refreshState();
        }
        else {
            card.getRows({ filters: card.collectFilters(), card: card }).then(
                rows => {
                    card.rows = rows;
                    card.changedRow = rows[0];
                    Object.assign(card.initialRow, card.changedRow);
                    card.setEditing(false);
                    card.afterGetRows();
                    card.refreshState();
                }
            );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid(lookupField) {
        const card = this;
        const info = card._lookupEntityInfo[card.lookupField.entity];
        return (
            <GridINU
                entity={card.lookupField.entity}
                dataGetter={card.dataGetter}
                keyField={card.lookupField.refKeyField}
                nameField={card.lookupField.refNameField}
                onSelectValue={(e) => card.selectLookupValue(e)}
                getColumns={info.columns ? () => { return info.columns; } : null}
                init={(grid) => {
                    grid.visible = true;
                    grid.title = card.lookupField.title;
                    grid.isSelecting = true;
                    card.lookupGrid = grid;
                }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedRow() {
        const card = this;
        return card.changedRow;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const card = this;

        const params = [
            { key: 'atoken', value: card.dataGetter.atoken },
            { key: 'rtoken', value: card.dataGetter.rtoken },
            { key: 'pageSize', value: 1 },
            { key: 'pageNumber', value: 1 },
        ];

        params.push({ key: 'f0', value: card.keyField + ' = ' + card.initialRow[card.keyField] });

        return new Promise(function (resolve, reject) {
            card.dataGetter.get({ url: card.entity + '/list', params: params }).then(
                (res) => {
                    if (res != null && res.rows && res.rows.length === 1) {
                        card.totalRows = res.count;
                        resolve(res.rows);
                    } else {
                        reject(Error("Error getting rows"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}