import { GridINU, GridINUClass } from './GridINU';
import { useState, useEffect } from 'react';
import { GridClass } from './Grid.js';
import { Modal } from './Modal';
import { GridFLClass } from './GridFL.js';
import { GridINUBaseClass } from './GridINUBase.js';
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
        needGetRows = !card.cardRow;
    }

    if (props.init) {
        props.init(card);
    }

    card.refreshState = function () {
        card.log(' -------------- refreshState ' + card.stateind + ' --------------- ');
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
            card.getColumns();
        }

        return () => {
            card.removeEvents();
        }
    }, [card, needGetRows])

    return (card.render());
}
// =================================================================================================================================================================
export class CardINUClass extends GridINUBaseClass {

    constructor(props) {
        super(props);

        const card = this;

        card.cardRow = {};
        card.initialRow = props.cardRow;
        Object.assign(card.cardRow, card.initialRow);

        if (props.isNewRecord) {
            card.isNewRecord = true;
            card._rowChanged = true;
        }

        //card.visible = true;
        //card.isVisible = props.isVisible || card.isVisible;

        card.cardButtons = [];

        //    card.entity = props.entity;
        //    card.entityAdd = props.entityAdd;
        //    card.dataGetter = props.dataGetter;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //isVisible() {
    //    return this.visible;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const card = this;

        GridClass.applyTheme(card);
        card.addCardButtons();

        return (
            <>
                <div className='graph-card-toolbar'>
                    {super.renderToolbar(card.cardButtons)}
                </div>
                <div className="graph-card-div">
                    {
                        card.columns.map((col) => { return card.renderField(col) })
                    }
                </div>
                {super.renderLookup()
                    //    card.lookupIsShowing ?
                    //        <Modal
                    //            title={card.lookupField.title}
                    //            renderContent={() => { return card.renderLookupGrid(card.lookupField) }}
                    //            pos={card.lookupPos}
                    //            onClose={(e) => card.closeLookup(e)}
                    //            init={(wnd) => { wnd.visible = card.lookupIsShowing; }}
                    //        >
                    //        </Modal>
                    //        :
                    //        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderField(col) {
        const card = this;
        const value = card.cardRow[col.name];
        if (col.type === undefined || col.type === null) {
            col.type = '';
        }
        switch (col.type.toLowerCase()) {
            case 'lookup':
                return (
                    <div className="graph-card-field">
                        <span
                            style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                        >
                            {col.title || col.name}
                        </span>
                        <input
                            key={`cardlookup_${card.id}_${col.id}_${card.stateind}_`}
                            value={value}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em', gridColumn: col.required || col.readonly ? 'span 2' : '' }}
                            disabled='disabled'
                        ></input>
                        <button
                            key={`cardlookupbtn_${card.id}_${col.id}_${card.stateind}_`}
                            className={'graph-card-button'}
                            onClick={(e) => card.openLookupField(e, col, card.cardRow)}
                        >
                            {card.images.filterSelect ? card.images.filterSelect() : card.translate('Select', 'graph-filter-select')}
                        </button>
                        {
                            !col.required && !col.readonly ?
                                <button
                                    key={`cardlookupclear_${card.id}_${col.id}_${card.stateind}_`}
                                    className={'graph-card-button'}
                                    disabled={value === undefined || value === '' ? 'disabled' : ''}
                                    onClick={(e) => card.clearField(e, col, card.cardRow)}
                                >
                                    {card.images.filterClear ? card.images.filterClear() : card.translate('Clear', 'graph-filter-clear')}
                                </button>
                                : <></>
                        }
                    </div>
                )
            //case 'date':
            //    break; //key={`cardinp_${card.id}_${card.stateind}_`}
            default:
                return (
                    <div className="graph-card-field">
                        <span
                            style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                        >
                            {col.title || col.name}
                        </span>
                        {
                            //col.maxW !== undefined && +col.maxW >= 200 ?
                            //
                            //    contentEditable={!col.readonly}

                            <textarea
                                
                                value={card.cardRow[col.name] !== undefined ? card.cardRow[col.name] : ''}
                                style={{ width: 'calc(100% - 4px)', height: col.maxW !== undefined && +col.maxW >= 200 ? '5em' : '2.3em', padding: '0 2px', boxSizing: 'border-box', gridColumn: col.required || col.readonly ? 'span 3' : 'span 2', resize: 'vertical' }}
                                onChange={(e) => card.changeField(e, col, card.cardRow)}
                                disabled={col.readonly ? 'disabled' : ''}
                            >
                            </textarea>
                        }
                        {
                            !col.required && !col.readonly ?
                                <button
                                    key={`cardfieldclear_${card.id}_${col.id}_${card.stateind}_`}
                                    className={'graph-card-button'}
                                    disabled={value === undefined || value === '' ? 'disabled' : ''}
                                    onClick={(e) => card.clearField(e, col, card.cardRow)}
                                >
                                    {card.images.filterClear ? card.images.filterClear() : card.translate('Clear', 'graph-filter-clear')}
                                </button>
                                : <></>
                        }
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
        return !card._rowChanged;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNodeDisabled(e) {
        const card = this;
        return !card._rowChanged;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNode(e) {
        const card = this;
        card.saveRow(e).then(
            () => {
                card._rowChanged = false;
                Object.assign(card.initialRow, card.cardRow);
                card.refreshState();
            }
        ).catch((message) => {
            Object.assign(card.cardRow, card.initialRow);
            card.refreshState();
            alert(message || 'Error!');
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNode(e) {
        const card = this;
        if (card.isNewRecord) {
            Object.assign(card.cardRow, card.initialRow);
            card.refreshState();
        }
        else {
            card.getRows({ filters: card.collectFilters(), card: card }).then(
                rows => {
                    card.rows = rows;
                    card.cardRow = rows[0];
                    Object.assign(card.initialRow, card.cardRow);
                    card._rowChanged = false;
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
        return card.cardRow;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //openLookupField(e, col) {
    //    const card = this;
    //    card.lookupPos = card.lookupPos || { x: 100, y: 100, w: 800, h: 600 };

    //    card.lookupField = col;
    //    card.lookupIsShowing = true;
    //    card.lookupRow = card.cardRow;
    //    card.refreshState();
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //closeLookup(e) {
    //    const card = this;
    //    card.lookupIsShowing = false;
    //    delete card.lookupField;
    //    delete card.lookupGrid;
    //    card.refreshState();
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //selectLookupValue(e) {
    //    const card = this;
    //    card.cardRow[card.lookupField.keyField] = card.lookupGrid.selectedValue();
    //    card.cardRow[card.lookupField.name] = card.lookupGrid.selectedText();
    //    card._rowChanged = true;
    //    card.closeLookup();
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const card = this;

        const params = [
            { key: 'atoken', value: card.dataGetter.atoken },
            { key: 'rtoken', value: card.dataGetter.rtoken },
            { key: 'pageSize', value: 1 },
            { key: 'pageNumber', value: 1 },
        ];

        params.push({ key: 'f0', value: card.keyField + ' = ' + card.cardRow[card.keyField] });

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
    saveRow(e) {
        const card = this;

        const params = [
            { key: 'atoken', value: card.dataGetter.atoken },
            { key: 'rtoken', value: card.dataGetter.rtoken },
            { key: 'row', value: card.initialRow },
            { key: 'upd', value: card.cardRow },
            { key: 'columns', value: card.keyField },
        ];

        if (!card.isNewRecord) {
            params.push({ key: 'f0', value: card.keyField + ' = ' + card.cardRow[card.keyField] });
        }

        return new Promise(function (resolve, reject) {
            card.dataGetter.get({ url: card.entity + '/' + (card.isNewRecord ? 'add' : 'update'), params: params }).then(
                (res) => {
                    if (res && +res.resStr > 0) {
                        if (card.isNewRecord) {
                            card.cardRow[card.keyField] = +res;
                            card.initialRow[card.keyField] = +res;
                            card.isNewRecord = false;
                        }
                        resolve(res.resStr);
                    }
                    else if (String(res.resStr.toLowerCase()) === 'true') {
                        resolve(res.resStr);
                    }
                    else {
                        reject(Error(res.resStr || "Error saving row"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}