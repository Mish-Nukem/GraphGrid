import { useState, useEffect } from 'react';
import { GridINUBaseClass } from './GridINUBase.js';
import { NodeStatus } from './Base';
import { WaveType } from './Graph.js';
import { CardINU } from './CardINU';
import { Modal } from './Modal';
// ==================================================================================================================================================================
export function GridINU(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid && grid.uid !== props.uid) {
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridINUClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
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
            grid.getColumns();
        }

        return () => {
            grid.removeEvents();
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

        grid.addButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isVisible() {
        return this.visible;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const node = this;
        return (
            <>
                {super.render()}
                {
                    node.cardIsShowing ?
                        <Modal
                            title={node.title}
                            renderContent={() => { return node.renderCard() }}
                            pos={node.cardPos}
                            onClose={(e) => node.closeCard(e)}
                            init={(wnd) => { wnd.visible = node.cardIsShowing; }}
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
        const node = this;
        return (
            <CardINU
                cardRow={node.cardRow || {}}
                isNewRecord={node.isNewRecord}
                uid={node.uid || node.id}
                entity={node.entity}
                keyField={node.keyField}
                dataGetter={node.dataGetter || node.dataGetter}
                init={(card) => {
                    card.visible = true;
                    card.columns = node.columns;
                }}
            >
            </CardINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid(lookupField) {
        const node = this;
        const info = node._lookupEntityInfo[node.lookupField.entity];
        return (
            <GridINU
                entity={node.lookupField.entity}
                dataGetter={node.dataGetter}
                keyField={node.lookupField.refKeyField}
                nameField={node.lookupField.refNameField}
                onSelectValue={(e) => node.selectLookupValue(e)}
                getColumns={info.columns ? () => { return info.columns; } : null}
                init={(grid) => {
                    grid.visible = true;
                    grid.title = node.lookupField.title;
                    if (node.activeRow) {
                        grid.value = node.activeRow;
                        grid.activeRow = node.activeRow;
                        delete node.activeRow;
                    }
                    grid.isSelecting = true;
                    node.lookupGrid = grid;
                }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCell(col, row) {
        const node = this;
        //if (row !== node.selectedRow()) return super.renderCell(col, row);

        const value = row[col.name];
        if (col.type === undefined || col.type === null) {
            col.type = '';
        }
        //{node.images.filterSelect ? node.images.filterSelect() : node.translate('Select', 'graph-filter-select')}
        switch (col.type.toLowerCase()) {
            case 'lookup':
                return (
                    <div style={{ border: 'none' }} className='grid-cell-lookup' key={`gridlookupdiv_${node.id}_${col.id}_${node.stateind}_`}>
                        <span
                            key={`gridlookuptitle_${node.id}_${col.id}_${node.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', gridColumn: col.required || col.readonly ? 'span 2' : '', overflowX: 'hidden' }}
                        >
                            {value}
                        </span>
                        <button
                            key={`gridlookupbtn_${node.id}_${col.id}_${node.stateind}_`}
                            className={'grid-cell-button'}
                            onClick={(e) => node.openLookupField(e, col, row)}
                        >
                            {'...'}
                        </button>
                        {
                            col.required || col.readonly || value === undefined || value === '' ? <></>
                                :
                                <button
                                    key={`gridlookupclear_${node.id}_${col.id}_${node.stateind}_`}
                                    className={'grid-cell-button'}
                                    onClick={(e) => node.clearField(e, col, row)}
                                >
                                    {'×'}
                                </button>
                        }
                    </div>
                );
            default:
                return value !== undefined ? value : '';
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addButtons() {
        const node = this;

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

        node.buttons.push({
            id: node.buttons.length,
            name: 'commit',
            title: node.translate('Commit changes'),
            label: node.images.commit ? '' : node.translate('Commit changes'),
            img: node.images.commit,
            click: (e) => node.commitChanges(e),
            getDisabled: (e) => node.commitChangesDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'rollback',
            title: node.translate('Rollback changes'),
            label: node.images.rollback ? '' : node.translate('Rollback changes'),
            img: node.images.rollback,
            click: (e) => node.rollbackChanges(e),
            getDisabled: (e) => node.rollbackChangesDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'add',
            title: node.translate('Add new record'),
            label: node.images.addRecord ? '' : node.translate('Add new record'),
            img: node.images.addRecord,
            click: (e) => node.addRecord(e),
            getDisabled: (e) => node.addRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'copy',
            title: node.translate('Copy record'),
            label: node.images.copyRecord ? '' : node.translate('Copy record'),
            img: node.images.copyRecord,
            click: (e) => node.copyRecord(e),
            getDisabled: (e) => node.copyRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'delete',
            title: node.translate('Delete record'),
            label: node.images.deleteRecord ? '' : node.translate('Delete record'),
            img: node.images.deleteRecord,
            click: (e) => node.deleteRecord(e),
            getDisabled: (e) => node.deleteRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'view',
            title: node.translate('View record'),
            label: node.images.viewRecord ? '' : node.translate('View record'),
            img: node.images.viewRecord,
            click: (e) => node.viewRecord(e),
            getDisabled: (e) => node.viewRecordDisabled(e),
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'test',
            title: node.translate('TEST'),
            label: node.translate('Test'),
            click: (e) => node.test(e)
        });

        node.buttons.push({
            id: node.buttons.length,
            name: 'selectValue',
            title: node.translate('Select'),
            label: node.images.selectFilterValue ? '' : node.translate('Select value'),
            click: (e) => node.onSelectValue(e),
            img: node.images.selectFilterValue,
            getVisible: () => { return node.isSelecting },
        });

        node._buttonsDict = {};
        for (let btn of node.buttons) {
            node._buttonsDict[btn.name] = btn;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onRowDblClick(e, row) {
        const node = this;
        super.onRowDblClick(e, row);

        if (node.isSelecting && node.onSelectValue) {
            node.onSelectValue(e);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChanges(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesDisabled(e) {
        const node = this;
        return !node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChanges(e) {
        const node = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesDisabled(e) {
        const node = this;
        return !node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecord(e) {
        const node = this;

        node.cardPos = node.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        node.cardRow = {};
        node.isNewRecord = true;
        node.cardIsShowing = true;
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordDisabled(e) {
        const node = this;
        return node.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecord(e) {
        const node = this;

        node.cardPos = node.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        node.cardRow = {};
        Object.assign(node.cardRow, node.selectedRow());
        node.isNewRecord = true;
        node.cardIsShowing = true;
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecord(e) {
        const node = this;

        if (window.confirm('Delete  record?')) {
            node.deleteRow(e).then(() => node.refresh());
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord(e) {
        const node = this;

        node.cardPos = node.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        node.cardRow = node.selectedRow();
        node.cardIsShowing = true;
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordDisabled(e) {
        const node = this;
        return node.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //isRowSelected(row, rowInd) {
    //    const node = this;
    //    return node.value !== undefined && node.value !== '' ? row[node.keyField] === node.value : node.selectedRowIndex === rowInd;
    //}
    //// -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //onSelectedRowChanged(e) {
    //    const node = this;
    //    if (e.source && e.source === 'rowClick') {
    //        node.value = node.selectedValue();
    //    }
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getSelectedRowIndex() {
        const node = this;
        if (node.value === undefined || node.value === '') return;

        let i = 0;
        for (let row of node.rows) {
            if (row[node.keyField] === node.value) {
                node.selectedRowIndex = i;
                break;
            }
            i++;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    test(e) {
        const node = this;

        const func = async function () {
            let rows = await node.getRows();
        }

        func();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeCard(e) {
        const node = this;
        node.cardIsShowing = false;
        if (node.isNewRecord) {
            node.isNewRecord = false;
            node.refresh();
        }
        else {
            node.refreshState();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}