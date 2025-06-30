/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { GridINUBaseClass } from './GridINUBase';
import { Images } from './Themes/Images';
import { NodeStatus } from './Base';
import { CardINU } from './CardINU';
import { FieldEdit } from './FieldEdit';
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
        needGetRows = !props.noAutoRefresh && !grid.hasVisibleParentGrids();
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        setState({ grid: grid, ind: grid.stateind++ });
    }

    useEffect(() => {
        grid.setupEvents();

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0) || grid._forceRefresh) {

            grid._forceRefresh = false;

            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }

        if (grid.columns.length <= 0 && grid.getColumns) {
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

        grid.schemeName = props.schemeName;
        grid.inSchemeUid = props.inSchemeUid;

        if (grid.columns.length <= 0 && grid.entity && !props.getColumns) {
            grid.getColumns = async () => {
                const res = await grid.getEntityInfo();
                grid.refresh();
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
        return (
            <>
                {super.render()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return grid.cardIsShowing ? grid.renderCardContent() : super.renderPopupContent();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCardContent() {
        const grid = this;
        return (
            <CardINU
                cardRow={grid.cardRow || {}}
                isNewRecord={grid.isNewRecord}
                uid={(grid.uid || grid.id) + '_card_'}
                entity={grid.entity}
                keyField={grid.keyField}
                dataGetter={grid.dataGetter}
                init={(card) => {
                    card.visible = true;
                    card.columns = grid.columns;
                    for (let col of card.columns) {
                        delete col._fieldEditObj;
                    }
                    grid.onClosePopup = () => {
                        for (let col of card.columns) {
                            delete col._fieldEditObj;
                        }
                    };
                }}
            >
            </CardINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCell(col, row) {
        const grid = this;

        if (!grid.allowEditGrid || col.readonly || row !== grid.selectedRow()) return super.renderCell(col, row);

        row = !grid.isEditing() || !grid.changedRow ? row : grid.changedRow;

        return <FieldEdit
            keyPref={grid.id}
            column={col}
            entity={grid.entity}
            dataGetter={grid.dataGetter}
            value={col.type === 'lookup' ? row[col.keyField] : row[col.name]}
            text={row[col.name]}
            findFieldEdit={() => { return col._fieldEditObj; }}
            
            init={
                (fe) => {
                    if (grid.isEditing() && !grid.changedRow) {
                        grid.changedRow = {};
                        Object.assign(grid.changedRow, grid.selectedRow());
                    }

                    const lrow = !grid.isEditing() ? grid.selectedRow() : grid.changedRow;

                    col._fieldEditObj = fe;
                    fe.value = col.type === 'lookup' ? lrow[col.keyField] : lrow[col.name];
                    fe.text = lrow[col.name];
                }
            }
            onChange={(e) => {
                if (!grid.changedRow) {
                    grid.changedRow = {};
                    Object.assign(grid.changedRow, grid.selectedRow());
                }

                if (col.type === 'lookup') {
                    grid.changedRow[col.keyField] = e.value;
                    grid.changedRow[col.name] = e.text;
                    if (col.setComboboxValue) {
                        col.setComboboxValue({ value: e.value, label: e.text });
                    }
                    if (!grid.isEditing()) {
                        grid.setEditing(true);
                        grid.refreshState();
                    }
                }
                else {
                    grid.changedRow[col.name] = e.value;
                    grid.setEditing(true);
                    grid.refreshState();
                }
            }}
        >
        </FieldEdit>
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col, context) {
        const grid = this;
        if (grid.filtersDisabled || col.type !== 'date') {
            return super.renderHeaderCell(col, context);
        }

        return (
            <>
                {super.renderHeaderCell(col, 'fake')}
                <FieldEdit
                    keyPref={grid.id + '_colfilter_'}
                    column={{ type: 'date', id: col.id, title: col.title }}
                    dataGetter={grid.dataGetter}
                    value={col.filter}
                    text={col.filter}
                    findFieldEdit={() => { return col._filterEditObj; }}
                    gridColumn={'span 2'}
                    w={'calc(100% + 2px)'}
                    
                    init={
                        (fe) => {
                            col._filterEditObj = fe;
                            fe.value = fe.text = col.filter;
                        }
                    }
                    onChange={(e) => {
                        col.filter = e.value;
                        grid.refresh();
                    }}
                >
                </FieldEdit>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const grid = this;

        const images = Images.getImages();

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
            label: images.commit ? '' : grid.translate('Commit changes'),
            img: images.commit,
            click: (e) => grid.commitChanges(e),
            getDisabled: (e) => grid.commitChangesDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'rollback',
            title: grid.translate('Rollback changes'),
            label: images.rollback ? '' : grid.translate('Rollback changes'),
            img: images.rollback,
            click: (e) => grid.rollbackChanges(e),
            getDisabled: (e) => grid.rollbackChangesDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'add',
            title: grid.translate('Add new record'),
            label: images.addRecord ? '' : grid.translate('Add new record'),
            img: images.addRecord,
            click: (e) => grid.addRecord(e),
            getDisabled: (e) => grid.addRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'copy',
            title: grid.translate('Copy record'),
            label: images.copyRecord ? '' : grid.translate('Copy record'),
            img: images.copyRecord,
            click: (e) => grid.copyRecord(e),
            getDisabled: (e) => grid.copyRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'delete',
            title: grid.translate('Delete record'),
            label: images.deleteRecord ? '' : grid.translate('Delete record'),
            img: images.deleteRecord,
            click: (e) => grid.deleteRecord(e),
            getDisabled: (e) => grid.deleteRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'view',
            title: grid.translate('View record'),
            label: images.viewRecord ? '' : grid.translate('View record'),
            img: images.viewRecord,
            click: (e) => grid.viewRecord(e),
            getDisabled: (e) => grid.viewRecordDisabled(e),
        });

        grid.buttons.push({
            id: grid.buttons.length,
            name: 'selectValue',
            title: grid.translate('Select'),
            label: images.selectFilterValue ? '' : grid.translate('Select value'),
            click: (e) => {
                if (!grid.multi) {
                    const row = grid.selectedRow();
                    e.value = row[grid.keyField];
                    e.text = row[grid.nameField];
                }
                else {
                    const texts = [];
                    e.value = grid.selectedValues(texts);
                    e.text = texts.join(', ');
                }

                grid.onSelectValue(e);
            },
            img: images.selectFilterValue,
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
            const row = grid.selectedRow();
            e.value = row[grid.keyField];
            e.text = row[grid.nameField];
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
        grid.popupPos = grid.cardPos;

        grid.cardRow = {};
        grid.isNewRecord = true;
        grid.cardIsShowing = true;
        grid.popupIsShowing = true;
        grid.popupTitle = grid.title;
        grid.onClosePopup = grid.closeCard;

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordDisabled(e) {
        const grid = this;
        return !grid.allowAdd || grid.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.cardPos;

        grid.cardRow = {};
        Object.assign(grid.cardRow, grid.selectedRow());
        grid.isNewRecord = true;
        grid.cardIsShowing = true;
        grid.popupIsShowing = true;
        grid.popupTitle = grid.title;
        grid.onClosePopup = grid.closeCard;

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordDisabled(e) {
        const grid = this;
        return !grid.allowCopy || grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
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
        return !grid.allowDelete || grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord(e) {
        const grid = this;

        grid.cardPos = grid.cardPos || { x: 110, y: 110, w: 800, h: 600 };
        grid.popupPos = grid.cardPos;

        grid.cardRow = grid.selectedRow();
        grid.cardIsShowing = true;
        grid.popupIsShowing = true;
        grid.popupTitle = grid.title;
        grid.onClosePopup = grid.closeCard;

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordDisabled(e) {
        const grid = this;
        return !grid.allowView || grid.isEditing() || grid.selectedRowIndex === undefined || grid.selectedRowIndex < 0 || !grid.rows || grid.rows.length <= 0;
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
    hasVisibleParentGrids() {
        const grid = this;
        if (!grid.graph) return false;

        for (let puid of grid.parents) {
            let pnode = grid.graph.nodesDict[puid];
            if (pnode.visible !== false && pnode.status === NodeStatus.grid) return true;

            let link = grid.graph.linksDict[grid.id + '_' + pnode.id];
            if (link.everLink) return true;
        }

        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    TEST(e) {
        //const grid = this;

        //grid.saveColumnsConfig(e);
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
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedText(delim) {
        const grid = this;
        let res = super.selectedText(delim);

        if (res !== undefined && res !== '') return res;

        if (grid.status === NodeStatus.filter && grid.value !== undefined && grid.value !== '' && grid._selectedText !== undefined && grid._selectedText !== '') return grid._selectedText;

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}