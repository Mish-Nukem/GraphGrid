import { useState, useEffect } from 'react';
import { GridINUBaseClass } from './GridINUBase.js';
import { NodeStatus } from './Base';
import { CardINU } from './CardINU';
import { Modal } from './Modal';
import { Select } from './OuterComponents/Select';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import { format, isValid, parse } from "date-fns";
import ru from "date-fns/locale/ru";
import Moment from 'moment';

registerLocale("ru", ru);
// ==================================================================================================================================================================
export function GridINU(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid) {
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridINUClass(props);
        needGetRows = !props.noAutoRefresh && !grid.hasParentGrids();//props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        setState({ grid: grid, ind: grid.stateind++ });
    }

    useEffect(() => {
        grid.setupEvents();

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }

        if (grid.columns.length <= 0 && grid.getColumns) {
            //grid.columns = grid.getColumns();
            grid.prepareColumns().then(() => grid.refreshState());;
        }

        return () => {
            grid.clearEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}

// ==================================================================================================================================================================
export class GridINUClass extends GridINUBaseClass {

    constructor(props) {
        super(props);

        const grid = this;

        grid.status = NodeStatus.grid;

        grid.allowEditGrid = props.allowEditGrid;

        if (grid.columns.length <= 0 && grid.entity && !props.getColumns) {
            grid.getColumns = async () => {
                const res = await grid.getEntityInfo();
                return res.Columns;
            };
        }

        grid.addToolbarButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isVisible() {
        return this.visible;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;
        return (
            <>
                {super.render()}
                {
                    grid.cardIsShowing ?
                        <Modal
                            title={grid.title}
                            renderContent={() => { return grid.renderCard() }}
                            pos={grid.cardPos}
                            onClose={(e) => grid.closeCard(e)}
                            init={(wnd) => { wnd.visible = grid.cardIsShowing; }}
                        >
                        </Modal>
                        :
                        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCard() {
        const grid = this;
        return (
            <CardINU
                cardRow={grid.cardRow || {}}
                isNewRecord={grid.isNewRecord}
                uid={(grid.uid || grid.id) + '_card_'}
                entity={grid.entity}
                keyField={grid.keyField}
                dataGetter={grid.dataGetter || grid.dataGetter}
                init={(card) => {
                    card.visible = true;
                    card.columns = grid.columns;
                }}
            >
            </CardINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid(lookupField) {
        const grid = this;
        const info = grid._lookupEntityInfo[grid.lookupField.entity];

        return (
            <GridINU
                entity={grid.lookupField.entity}
                dataGetter={grid.dataGetter}
                keyField={grid.lookupField.refKeyField}
                nameField={grid.lookupField.refNameField}
                onSelectValue={(e) => grid.selectLookupValue(e)}
                getColumns={info.columns ? () => { return info.columns; } : null}
                init={(lookupGrid) => grid.onLookupGridInit(lookupGrid)}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    /*
                                old ?
                                    <>
                                        <span
                                            style={{
                                                width: '100%',
                                                height: '1.7em',
                                                padding: '0',
                                                boxSizing: 'border-box',
                                                gridColumn: noClear ? 'span 2' : '',
                                                overflowX: 'hidden',
                                            }}

                                        >
                                            {value}
                                        </span>
                                        <button
                                            key={`griddatepickerbtn_${grid.id}_${col.id}_`}
                                            className={'grid-cell-button'}
                                            onClick={(e) => grid.openDatePickerWnd(e, col, value)}
                                        >
                                            {'...'}
                                        </button>
                                    </>
                                    :

    */
    renderCell(col, row) {
        const grid = this;

        if (!grid.allowEditGrid || col.readonly || row !== grid.selectedRow()) return super.renderCell(col, row);

        let value = !grid.isEditing() ? row[col.name] : grid.changedRow && grid.changedRow[col.name] !== undefined ? grid.changedRow[col.name] : row[col.name];
        value = value !== undefined ? value : '';
        if (col.type === undefined || col.type === null) {
            col.type = '';
        }

        let parsedDate;
        if (col.type === 'date' && value) {
            parsedDate = Moment(value, grid.dateFormat);
            value = parsedDate.format(grid.dateFormat);
        }

        const noClear = col.required || value === undefined || value === '';
        //const old = false;
        switch (col.type.toLowerCase()) {
            case 'lookup':
                const keyFieldValue = !grid.isEditing() ? row[col.keyField] : grid.changedRow && grid.changedRow[col.keyField] !== undefined ? grid.changedRow[col.keyField] : row[col.keyField];
                if (col.setComboboxValue) {
                    col.setComboboxValue({ value: keyFieldValue, label: value });
                }
                return (
                    <div style={{ border: 'none' }} className='grid-cell-lookup' key={`gridlookupdiv_${grid.id}_${col.id}_`}>
                        {
                            !col.allowCombobox ?
                                <span
                                    key={`gridlookuptitle_${grid.id}_${col.id}_`}
                                    style={{ width: 'calc(100% - 4px)', gridColumn: noClear ? 'span 2' : '', overflowX: 'hidden' }}
                                >
                                    {value}
                                </span>
                                :
                                <Select
                                    key={`gridlookupselect_${grid.id}_${col.id}_`}
                                    value={{ value: keyFieldValue, label: value }}
                                    getOptions={(filter, pageNum) => grid.getLookupValues(col, filter, pageNum)}
                                    height={'1.5em'}
                                    gridColumn={noClear ? 'span 2' : 'span 1'}
                                    onChange={(e) => {
                                        grid.changedRow = grid.changedRow || {};
                                        grid.changedRow[col.keyField] = e.value;
                                        grid.changedRow[col.name] = e.label;

                                        grid.setEditing(true);
                                        grid.refreshState();
                                    }}
                                    init={(e) => { col.setComboboxValue = e.setComboboxValue; }}
                                >
                                </Select>
                        }
                        <button
                            key={`gridlookupbtn_${grid.id}_${col.id}_`}
                            className={'grid-cell-button'}
                            onClick={(e) => grid.openLookupField(e, col, row)}
                        >
                            {'...'}
                        </button>
                        {
                            noClear ? <></>
                                :
                                <button
                                    key={`gridlookupclear_${grid.id}_${col.id}_`}
                                    className={'grid-cell-button'}
                                    onClick={(e) => grid.clearField(e, col, row)}
                                >
                                    {'×'}
                                </button>
                        }
                    </div>
                );
            default:
                return (
                    <div
                        style={{ border: 'none' }}
                        className={col.type === 'date' ? 'grid-cell-lookup' : 'grid-cell-edit'}
                        key={`grideditdiv_${grid.id}_${col.id}_`}
                    >
                        {
                            col.type === 'date' ?
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '1.7em',
                                            minHeight: '1.7em',
                                            padding: '0',
                                            gridColumn: noClear ? 'span 3' : 'span 2',
                                            overflowX: 'hidden',
                                        }}
                                        className="datepicker-input"
                                    >
                                        <DatePicker
                                            selected={parsedDate}
                                            locale="ru"
                                            dateFormat={grid.datePickerDateFormat}
                                            showMonthDropdown
                                            showYearDropdown
                                            onSelect={(date) => {
                                                grid.changedRow = grid.changedRow || {};
                                                grid.changedRow[col.name] = Moment(date, grid.dateFormat);
                                                grid.setEditing(true);
                                                grid.refreshState();
                                        }}
                                        ></DatePicker>
                                    </div>
                                :
                                <textarea
                                    key={`gridedittextarea_${grid.id}_${col.id}_`}
                                    value={value}
                                    style={{
                                        width: '100%',
                                        height: '1.7em',
                                        minHeight: '1.7em',
                                        padding: '0',
                                        boxSizing: 'border-box',
                                        gridColumn: noClear ? 'span 2' : '',
                                        resize: 'vertical',
                                        overflowX: 'hidden',
                                    }}
                                    onChange={(e) => grid.changeField(e, col, row)}
                                    autoFocus={col === grid._changingCol && grid.isEditing()}
                                    onFocus={e => {
                                        if (col === grid._changingCol) {
                                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = grid._remCursorPos;
                                        }
                                    }}
                                >
                                </textarea>
                        }
                        {
                            noClear ? <></>
                                :
                                <button
                                    key={`gridlookupclear_${grid.id}_${col.id}_`}
                                    className={'grid-cell-button'}
                                    onClick={(e) => grid.clearField(e, col, row)}
                                >
                                    {'×'}
                                </button>
                        }
                    </div>
                );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const grid = this;

        //if (node._buttonsAdded) return;

        //GridClass.applyTheme(node);

        //node._buttonsAdded = true;

        //node.buttons.push({
        //    id: node.buttons.length,
        //    name: 'edit',
        //    title: node.translate('Start edit'),
        //    label: node.images.edit ? '' : node.translate('Start edit'),
        //    click: (e) => node.startEdit(e),
        //    img: node.images.edit
        //});

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'commit',
            title: grid.translate('Commit changes'),
            label: grid.images.commit ? '' : grid.translate('Commit changes'),
            img: grid.images.commit,
            click: (e) => grid.commitChanges(e),
            getDisabled: (e) => grid.commitChangesDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'rollback',
            title: grid.translate('Rollback changes'),
            label: grid.images.rollback ? '' : grid.translate('Rollback changes'),
            img: grid.images.rollback,
            click: (e) => grid.rollbackChanges(e),
            getDisabled: (e) => grid.rollbackChangesDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'add',
            title: grid.translate('Add new record'),
            label: grid.images.addRecord ? '' : grid.translate('Add new record'),
            img: grid.images.addRecord,
            click: (e) => grid.addRecord(e),
            getDisabled: (e) => grid.addRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'copy',
            title: grid.translate('Copy record'),
            label: grid.images.copyRecord ? '' : grid.translate('Copy record'),
            img: grid.images.copyRecord,
            click: (e) => grid.copyRecord(e),
            getDisabled: (e) => grid.copyRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'delete',
            title: grid.translate('Delete record'),
            label: grid.images.deleteRecord ? '' : grid.translate('Delete record'),
            img: grid.images.deleteRecord,
            click: (e) => grid.deleteRecord(e),
            getDisabled: (e) => grid.deleteRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'view',
            title: grid.translate('View record'),
            label: grid.images.viewRecord ? '' : grid.translate('View record'),
            img: grid.images.viewRecord,
            click: (e) => grid.viewRecord(e),
            getDisabled: (e) => grid.viewRecordDisabled(e),
        });

        //node.buttons.push({
        //    id: node.buttons.length,
        //    name: 'test',
        //    title: node.translate('TEST'),
        //    label: node.translate('Test'),
        //    click: (e) => node.test(e)
        //});

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'selectValue',
            title: grid.translate('Select'),
            label: grid.images.selectFilterValue ? '' : grid.translate('Select value'),
            click: (e) => grid.onSelectValue(e),
            img: grid.images.selectFilterValue,
            getVisible: () => { return grid.isSelecting },
        });

        grid._buttonsDict = {};
        for (let btn of grid.buttons) {
            grid._buttonsDict[btn.name] = btn;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onRowDblClick(e, row) {
        const grid = this;
        super.onRowDblClick(e, row);

        if (grid.isSelecting && !grid.multi && grid.onSelectValue) {
            grid.onSelectValue(e);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChanges(e) {
        const grid = this;

        const row = grid.selectedRow();

        grid.saveRow({ row: row, changedRow: grid.changedRow }).then(
            () => {
                grid.setEditing(false);
                Object.assign(row, grid.changedRow);
                grid.refreshState();
            }
        ).catch((message) => {
            Object.assign(grid.changedRow, row);
            grid.refreshState();
            alert(message || 'Error!');
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesDisabled(e) {
        const grid = this;
        return !grid.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChanges(e) {
        const grid = this;

        delete grid.changedRow;
        grid.setEditing(false);
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesDisabled(e) {
        const grid = this;
        return !grid.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        grid.cardRow = {};
        grid.isNewRecord = true;
        grid.cardIsShowing = true;
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordDisabled(e) {
        const grid = this;
        return grid.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        grid.cardRow = {};
        Object.assign(grid.cardRow, grid.selectedRow());
        grid.isNewRecord = true;
        grid.cardIsShowing = true;
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordDisabled(e) {
        const grid = this;
        return grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecord(e) {
        const grid = this;

        if (window.confirm('Delete  record?')) {
            grid.deleteRow(e).then(() => grid.refresh());
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecordDisabled(e) {
        const grid = this;
        return grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        grid.cardRow = grid.selectedRow();
        grid.cardIsShowing = true;
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordDisabled(e) {
        const grid = this;
        return grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //isRowSelected(row, rowInd) {
    //    const node = this;
    //    return node.value !== undefined && node.value !== '' ? row[node.keyField] === node.value : node.selectedRowIndex === rowInd;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectedRowChanged(e) {
        const grid = this;
        super.onSelectedRowChanged(e);

        if (grid.allowEditGrid) {
            grid.refreshState();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getSelectedRowIndex() {
        const grid = this;
        if (grid.value === undefined || grid.value === '') return;

        let i = 0;
        for (let row of grid.rows) {
            if (row[grid.keyField] === grid.value) {
                grid.selectedRowIndex = i;
                break;
            }
            i++;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async canLeaveRow(rowIndex) {
        const grid = this;
        let res;

        //if (node.detailNodeChangesSaved) {
        //    res = await node.detailNodeChangesSaved();
        //    if (!res) return false;
        //}

        res = await grid.detailNodesChangesSaved();
        if (!res) return false;

        if (!grid.allowEditGrid || !grid.isEditing()) return true;
        const row = grid.rows[rowIndex];

        await grid.saveRow({ row: row, changedRow: grid.changedRow }).then(
            () => {
                grid.setEditing(false);
                Object.assign(row, grid.changedRow);
                grid.refreshState();
                res = true;
            }
        ).catch((message) => {
            Object.assign(grid.changedRow, row);
            grid.refreshState();
            res = false;
            alert(message || 'Error!');
        });

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async detailNodesChangesSaved() {
        const grid = this;
        const graph = grid.graph;
        if (!graph || !grid.children || grid.children.length <= 0) return true;

        for (let cuid of grid.children) {
            let child = graph.nodesDict[cuid];

            if (!child.visible || !child.allowEditGrid || !child.isEditing() || !child.rows || child.rows.length <= 0) continue;

            let row = child.selectedRow();
            let res = true;

            await child.saveRow({ row: row, changedRow: child.changedRow }).then(
                () => {
                    child.setEditing(false);
                    Object.assign(row, child.changedRow);
                    res = true;
                }
            ).catch((message) => {
                Object.assign(child.changedRow, row);
                child.refreshState();
                res = false;
                alert(message || 'Error!');
            });

            if (!res) {
                return false;
            }
        }

        return true;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    hasParentGrids() {
        const grid = this;
        if (!grid.graph) return false;

        for (let puid of grid.parents) {
            let pnode = grid.graph.nodesDict[puid];
            if (pnode.visible !== false && pnode.status === NodeStatus.grid) return true;
        }

        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    test(e) {
        const grid = this;

        grid.saveColumnsConfig(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    keyCellAdd(selected) {
        const grid = this;
        return selected ? '1' : grid.stateind;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsOrderToDefault() {
        super.resetColumnsOrderToDefault();

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsWidthsToDefault() {
        super.resetColumnsWidthsToDefault();

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsSort() {
        super.resetColumnsSort();

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeCard(e) {
        const grid = this;
        grid.cardIsShowing = false;
        if (grid.isNewRecord) {
            grid.isNewRecord = false;
            grid.refresh();
        }
        else {
            grid.refreshState();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedText(delim) {
        const grid = this;
        let res = super.selectedText(delim);

        if (res !== undefined && res !== '') return res;

        if (grid.status === NodeStatus.filter && grid.value !== undefined && grid.value !== '' && grid._restoredText !== undefined && grid._restoredText !== '') return grid._restoredText;

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}