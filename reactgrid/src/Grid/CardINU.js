import { GridINU, GridINUClass } from './GridINU';
import { useState, useEffect } from 'react';
import { GridClass } from './Grid.js';
import { Modal } from './Modal';
import { GridFLClass } from './GridFL.js';
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
export class CardINUClass extends GridFLClass {

    constructor(props) {
        super(props);

        const card = this;

        card.cardRow = props.cardRow || {};
        card.initialRow = {};
        if (props.isNewRecord) {
            card.isNewRecord = true;
        }
        Object.assign(card.initialRow, card.cardRow);

        card.visible = true;
        card.isVisible = props.isVisible || card.isVisible;

        card.cardButtons = [];

        card.entity = props.entity;
        card.entityAdd = props.entityAdd;
        card.dataGetter = props.dataGetter;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isVisible() {
        return this.visible;
    }
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
                {
                    card.lookupIsShowing ?
                        <Modal
                            renderContent={() => { return card.renderLookupGrid(card.lookupField) }}
                            pos={card.lookupPos}
                            onClose={(e) => card.closeLookup(e)}
                            init={(wnd) => { wnd.visible = card.lookupIsShowing; }}
                        >
                        </Modal>
                        :
                        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderField(col) {
        const card = this;
        const value = card.cardRow[col.name];
        if (col.type === undefined) {
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
                            value={value}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em', gridColumn: col.required || col.readonly ? 'span 2' : '' }}
                            disabled='disabled'
                        ></input>
                        <button
                            className={'graph-card-button'}
                            key={`cardsel_${card.id}_${card.stateind}_`}
                            onClick={(e) => card.openLookupField(e, col)}
                        >
                            {card.images.filterSelect ? card.images.filterSelect() : card.translate('Select', 'graph-filter-select')}
                        </button>
                        {
                            !col.required && !col.readonly ?
                                <button
                                    key={`cardclr_${card.id}_${card.stateind}_`}
                                    className={'graph-card-button'}
                                    disabled={value === undefined || value === '' ? 'disabled' : ''}
                                    onClick={(e) => card.clearField(e, col)}
                                >
                                    {card.images.filterClear ? card.images.filterClear() : card.translate('Clear', 'graph-filter-clear')}
                                </button>
                                : <></>
                        }
                    </div>
                )
            //case 'date':
            //    break;
            default:
                return (
                    <div className="graph-card-field">
                        <span
                            style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                        >
                            {col.title || col.name}
                        </span>
                        <input
                            value={value}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em', gridColumn: col.required || col.readonly ? 'span 3' : 'span 2' }}
                            onChange={(e) => card.changeField(e, col)}
                            disabled={col.readonly ? 'disabled' : ''}
                        ></input>
                        {
                            !col.required && !col.readonly ?
                                <button
                                    key={`cardclr_${card.id}_${card.stateind}_`}
                                    className={'graph-card-button'}
                                    disabled={value === undefined || value === '' ? 'disabled' : ''}
                                    onClick={(e) => card.clearField(e, col)}
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
        return !card._rowCahnged;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNodeDisabled(e) {
        const card = this;
        return !card._rowCahnged;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNode(e) {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNode(e) {
        const card = this;
        if (card.isNewRecord) {
            //card.cardRow = card.initialRow;
            Object.assign(card.cardRow, card.initialRow);
            card.refreshState();
        }
        else {
            card.getRows({ filters: card.collectFilters(), card: card }).then(
                rows => {
                    card.rows = rows;
                    card.cardRow = rows[0];
                    card.afterGetRows();
                    card.refreshState();
                }
            );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid(lookupField) {
        const card = this;
        return (
            <GridINU
                //findGrid={(props) => gc.replaceGrid(props)}
                //graph={gc.graph}
                //uid={gc.lookupField.entity}
                entity={card.lookupField.entity}
                dataGetter={card.dataGetter}
                keyField={card.lookupField.refKeyField}
                nameField={card.lookupField.refNameField}
                onSelectValue={(e) => card.selectLookupValue(e)}
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
    openLookupField(e, col) {
        const card = this;
        card.lookupPos = card.lookupPos || { x: 100, y: 100, w: 800, h: 600 };

        card.lookupField = col;
        card.lookupIsShowing = true;
        card.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeLookup(e) {
        const card = this;
        card.lookupIsShowing = false;
        delete card.lookupField;
        delete card.lookupGrid;
        card.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearField(e, col) {
        const card = this;
        if (col.type === 'lookup') {
            card.cardRow[col.keyField] = '';
            card.cardRow[col.name] = '';
        }
        else {
            card.cardRow[col.name] = '';
        }
        card._rowCahnged = true;
        card.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectLookupValue(e) {
        const card = this;
        card.cardRow[card.lookupField.keyField] = card.lookupGrid.selectedValue();
        card.cardRow[card.lookupField.name] = card.lookupGrid.selectedText();
        card._rowCahnged = true;
        card.closeLookup();
        card.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeField(e, col) {
        const card = this;
        card.cardRow[col.name] = e.target.value;
        card._rowCahnged = true;
        card.refreshState();
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

        params.push({ key: 'f0', value: card.keyField + ' = ' + card.cardRow[card.keyField] });

        return new Promise(function (resolve, reject) {
            card.dataGetter.get({ url: card.entity + '/' + (card.isNewRecord ? 'add' : 'update'), params: params }).then(
                (res) => {
                    if (+res > 0) {
                        if (card.isNewRecord) {
                            card.cardRow[card.keyField] = +res;
                            card.initialRow[card.keyField] = +res;
                            card.isNewRecord = false;
                        }
                        resolve(res);
                    }
                    else if (String(res) === 'true') {
                        resolve(res);
                    }
                    else {
                        reject(Error("Error saving row"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}