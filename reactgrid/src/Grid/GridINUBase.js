import { useState, useEffect } from 'react';
import { GridFLClass } from './GridFL.js';
import { FilterType, NodeStatus } from './Base';
import { WaveType } from './Graph.js';
import { Modal } from './Modal';
// ==================================================================================================================================================================
export function GridINUBase(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridINUBaseClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
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
export class GridINUBaseClass extends GridFLClass {
    constructor(props) {
        super(props);

        const grid = this;

        grid.entity = props.entity;
        grid.entityAdd = props.entityAdd;
        grid.dataGetter = props.dataGetter;

        grid.datePickerDateFormat = props.datePickerDateFormat || 'dd.MM.yyyy';

        grid.visible = true;

        grid.isVisible = props.isVisible || grid.isVisible;

        grid.onSelectValue = props.onSelectValue || function () { };

        grid._lookupEntityInfo = {};

        grid.reqInd = 0;
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
                {grid.renderPopup()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopup() {
        const grid = this;
        return (
            grid.popupIsShowing ?
                <Modal
                    title={grid.lookupTitle}
                    renderContent={() => { return grid.renderPopupContent() }}
                    pos={grid.popupPos}
                    onClose={(e) => {
                        if (grid.onClosePopup) {
                            grid.onClosePopup(e);
                        }
                        grid.popupIsShowing = false;
                        grid.lookupTitle = '';
                        delete grid.onClosePopup;
                        delete grid.popupPos;

                        grid.refreshState();
                    }}
                >
                </Modal>
                :
                <></>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return grid.lookupIsShowing ? grid.renderLookupGrid(grid.lookupField) : <></>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid() {
        const grid = this;
        const info = grid._lookupEntityInfo[grid.lookupField.entity];

        return (
            <GridINUBase
                entity={grid.lookupField.entity}
                dataGetter={grid.dataGetter}
                keyField={grid.lookupField.refKeyField}
                nameField={grid.lookupField.refNameField}
                onSelectValue={(e) => grid.selectLookupValue(e)}
                getColumns={info.columns ? () => { return info.columns; } : null}
                init={(lookupGrid) => grid.onLookupGridInit(lookupGrid)}
            >
            </GridINUBase>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onLookupGridInit(lookupGrid) {
        const grid = this;
        const info = grid._lookupEntityInfo[grid.lookupField.entity];

        lookupGrid.visible = true;
        lookupGrid.title = grid.lookupField.title;
        if (grid.activeRow) {
            lookupGrid.value = grid.activeRow;
            lookupGrid.activeRow = grid.activeRow;
            delete grid.activeRow;
        }
        lookupGrid.isSelecting = true;
        lookupGrid._entityInfo = info;
        grid.lookupGrid = lookupGrid;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeField(e, col, row) {
        const grid = this;

        grid.changedRow = grid.changedRow || {};

        grid.changedRow[col.name] = e.target.value;
        grid.setEditing(true);
        grid._changingCol = col;

        grid._remCursorPos = e.currentTarget.selectionEnd;

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearField(e, col, row) {
        const grid = this;

        grid.changedRow = grid.changedRow || {};

        if (col.type === 'lookup') {
            grid.changedRow[col.keyField] = '';
            grid.changedRow[col.name] = '';

            if (grid.setComboboxValue) {
                grid.setComboboxValue('');
            }
        }
        else {
            grid.changedRow[col.name] = '';
        }
        grid.setEditing(true);
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openLookupField(e, col, row) {
        const grid = this;
        grid.lookupPos = grid.lookupPos || { x: 100, y: 100, w: 800, h: 600 };
        grid.popupPos = grid.lookupPos;

        grid.popupIsShowing = true;
        grid.lookupIsShowing = true;

        grid.lookupField = col;
        grid.lookupTitle = col.title;
        grid.onClosePopup = grid.closeLookup;

        grid.changedRow = grid.changedRow || {};

        const currValue = grid.changedRow[col.keyField] !== undefined ? grid.changedRow[col.keyField] : row[col.keyField];
        if (currValue) {
            grid.activeRow = currValue;
        }

        if (grid._lookupEntityInfo[col.entity]) {
            grid.refreshState();
            return;
        }
        else {
            const params = [
                { key: 'entity', value: col.entity },
                { key: 'configUid', value: col.entity + '_' },
            ];

            grid.dataGetter.get({ url: 'system/entityInfo', params: params }).then(
                (eInfo) => {
                    grid._lookupEntityInfo[col.entity] = eInfo;
                    grid.refreshState();
                }
            );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async getEntityInfo() {
        const grid = this;
        if (grid._entityInfo) return grid._entityInfo;

        const params = [
            { key: 'entity', value: grid.entity },
            { key: 'configUid', value: grid.getConfigUid() },
        ];

        grid._entityInfo = await grid.dataGetter.get({ url: 'system/entityInfo', params: params });

        if (grid._entityInfo) {
            grid.allowEditGrid = grid.allowEditGrid !== undefined ? grid.allowEditGrid : grid._entityInfo.allowEdit;
            grid.allowView = grid._entityInfo.allowView;
            grid.allowAdd = grid.allowCopy = grid._entityInfo.allowAdd;
            grid.allowDelete = grid._entityInfo.allowDelete;
        }

        return grid._entityInfo;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectLookupValue(e) {
        const grid = this;
        grid.changedRow[grid.lookupField.keyField] = grid.lookupGrid.selectedValue();
        grid.changedRow[grid.lookupField.name] = grid.lookupGrid.selectedText();
        grid.setEditing(true);
        grid.closeLookup();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeLookup(e) {
        const grid = this;
        grid.lookupIsShowing = false;

        delete grid.lookupField;
        delete grid.lookupGrid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    /*
    openDatePickerWnd(e, col, value) {
        const grid = this;

        grid.selectingDatePos = grid.selectingDatePos || { x: e.clientX || 100, y: e.clientY || 100, w: 800, h: 600 }; 

        grid.selectingDatePos.x = e.clientX || grid.selectingDatePos.x;
        grid.selectingDatePos.y = e.clientY || grid.selectingDatePos.y;

        grid.datePickerIsShowing = true;
        grid.selectingDatePickerColumn = col;
        grid.selectingDatePickerValue = value;
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeDatePickerWnd(e) {
        const grid = this;
        grid.datePickerIsShowing = false;
        if (grid.selectingDatePickerColumn) {
            grid.selectingDatePickerColumn = null;
            grid.selectingDatePickerValue = '';
        }
        grid.refreshState();
    }
    */
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    skipOnWaveVisit(e) {
        if (super.skipOnWaveVisit(e)) return true;

        const grid = this;
        if (e.waveType === WaveType.refresh) {
            if (!grid.visible || grid.status === NodeStatus.hidden) return true;
            if (grid.status === NodeStatus.filter && !grid._selecting) return true;
        }
        else if (e.waveType === WaveType.value) {
            if (grid.visible === false || grid.status === NodeStatus.hidden) return true;
        }

        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getDefaultLinkContent() {
        const grid = this;
        return {
            applyLink: function (link) {
                const parent = link.parent;

                if (!parent || (!link.everLink && parent.visible === false && parent.status !== NodeStatus.hidden)) return '';

                if (parent.status === NodeStatus.grid) {
                    if (!parent.rows || parent.rows.length <= 0) return '1=2'
                }

                if (parent.getConnectContent) {
                    return parent.getConnectContent({ child: grid });
                }

                const scheme = parent.graph && parent.graph.schemeName ? parent.graph.schemeName : '';
                const parentKeyField = parent.getKeyColumn ? parent.getKeyColumn() : parent.keyField;

                let activeValue;
                let pref = parent.entity;
                switch (parent.status) {
                    case NodeStatus.grid:
                        if (!parentKeyField || !parent.entity) return '';

                        activeValue = parent.selectedValue();
                        break;
                    case NodeStatus.filter:
                        if (parent.filterType === FilterType.date) {
                            pref = 'date';
                        }
                        activeValue = parent.value;
                        //else {
                        //    activeValue = parent.selectedValue();
                        //}
                        break;
                    default:
                        if (link.everLink) {
                            activeValue = parent.value;
                        }
                        break;
                }

                if (!activeValue) return '';

                if (link.condition) {
                    return link.condition.replace(/:id/gi, activeValue);//{ type: parent.filterType === FilterType.date ? 'column' : 'graphLink', filter: link.condition.replace(/:id/gi, activeValue) };
                }

                if (grid._entityInfo && parent._entityInfo && grid._entityInfo.tableName) {
                    const refColumn = grid.columns.find(function (item, index, array) {
                        return item.type === 'lookup' && String(item.entity) === String(parent.entity);
                    });

                    if (!refColumn) return '';

                    const arr = grid._entityInfo.tableName.split('.');
                    const tname = arr[arr.length - 1];
                    return tname + '.' + refColumn.keyField + ' = ' + activeValue;
                }

                return `${pref};${parent.uid};${scheme} = ${activeValue}`;
            }
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getColumn(name) {
        return { name: name, sortable: true, filtrable: true };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async prepareColumns() {
        const grid = this;
        await super.prepareColumns().then(() => {
            for (let col of grid.columns) {
                if (col._readonly !== undefined) {
                    col.readonly = col._readonly;
                    delete col._readonly;
                }
            }

            if (grid._savedConfigApplied || !grid._entityInfo) return;

            grid._savedConfigApplied = true;

            const newColumns = [];
            for (let col of grid._entityInfo.Columns) {
                let obrCol = grid.colDict[col.name];
                if (!obrCol) continue;

                obrCol._movedFromConfig = true;
                obrCol.w = col.w > 0 ? col.w : obrCol.w;
                obrCol.asc = col.asc;
                obrCol.desc = col.desc;
                obrCol.sortInd = col.sortInd;
                newColumns.push(obrCol);
            }

            for (let id in grid.colDict) {
                let obrCol = grid.colDict[id];
                if (obrCol._movedFromConfig) continue;

                newColumns.push(obrCol);
            }

            grid.columns = newColumns;
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const grid = this;
        e = e || { filters: [] };

        const params = [
            { key: 'pageSize', value: grid.pageSize },
            { key: 'pageNumber', value: grid.pageNumber },
            { key: 'entity', value: grid.entity },
        ];

        const orderBy = [];
        for (let col of grid.columns) {
            if (!col.asc && !col.desc) continue;

            orderBy.push({ sortInd: col.sortInd, str: col.asc ? col.name : col.desc ? col.name + ' desc' : '' });
        }

        if (orderBy.length > 0) {
            orderBy.sort(function (a, b) { return a.sortInd > b.sortInd ? 1 : -1 });

            const sortedSortColumns = [];
            for (let scol of orderBy) {
                sortedSortColumns.push(scol.str);
            }
            params.push({ key: 'orderBy', value: sortedSortColumns.join(',') });
        }

        if (e.autocompleteColumn) {
            params.push({ key: 'autocompl', value: true });
            params.push({ key: 'columns', value: e.autocompleteColumn.name });
        }

        if (grid.activeRow) {
            params.push({ key: 'activeRow', value: grid.activeRow });
            delete grid.activeRow;
        }

        let i = 0, j = 0;
        for (let cond of e.filters) {
            if (cond.type === 'column') {
                params.push({ key: 'f' + i++, value: cond.filter });
            }
            else if (cond.type === 'graphLink') {
                params.push({ key: 'c' + j++, value: cond.filter });
            }
        }

        params.push({ key: 'reqInd', value: ++grid.reqInd });

        return new Promise(function (resolve, reject) {
            grid.dataGetter.get({ url: grid.entity + '/' + (!e.autocompleteColumn ? 'list' : 'autocomplete'), params: params }).then(
                (res) => {
                    if (res != null) {
                        if (+res.reqInd !== grid.reqInd) return;

                        if (!e.autocompleteColumn) {
                            grid.totalRows = res.count;
                        }

                        if (+res.pageNum > 0) {
                            grid.pageNumber = res.pageNum;
                        }

                        resolve(res.rows);
                    } else {
                        reject(Error("Error getting rows"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRow(e) {
        const grid = this;

        const params = [
            { key: 'id', value: grid.selectedValue() || grid.selectedRow()[grid.keyField] },
        ];

        return new Promise(function (resolve, reject) {
            grid.dataGetter.get({ url: grid.entity + '/delete', params: params }).then(
                (res) => {
                    if (res && String(res.resStr.toLowerCase()) === 'true') {
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
    isRowChanged(row) {
        const grid = this;
        if (!grid.changedRow) return false;

        let res = false;
        for (let col in grid.changedRow) {
            if (grid.changedRow[col] !== row[col]) return true;
        }

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    saveRow(e) {
        const grid = this;

        if (!grid.isRowChanged(e.row)) return new Promise(function (resolve, reject) { resolve(true); });

        const params = [
            { key: 'row', value: e.row },
            { key: 'upd', value: e.changedRow },
            { key: 'columns', value: grid.keyField },
        ];

        if (!grid.isNewRecord) {
            params.push({ key: 'f0', value: grid.keyField + ' = ' + e.row[grid.keyField] });
        }

        return new Promise(function (resolve, reject) {
            grid.dataGetter.get({ url: grid.entity + '/' + (grid.isNewRecord ? 'add' : 'update'), params: params }).then(
                (res) => {
                    if (res && +res.resStr > 0) {
                        if (grid.isNewRecord) {
                            e.row[grid.keyField] = +res;
                            e.changedRow[grid.keyField] = +res;
                            grid.isNewRecord = false;
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
    getConfigUid() {
        const grid = this;
        const graph = grid.graph;
        let configUid = `${grid.entity}_`;

        if (!graph || !graph.nodesDict || !graph.nodesDict[grid.uid]) return configUid;

        configUid += `${graph.uid}_${grid.uid}_`;

        return configUid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    saveColumnsConfig(e) {
        const grid = this;

        let savingColumns = [];
        for (let col of grid.columns) {
            let scol = { n: col.name, w: col.w };
            if (col.visible === false) scol.v = '0';
            if (col.asc) scol.s = '1'; else if (col.desc) scol.s = '0';
            if (col.sortInd !== undefined) scol.i = col.sortInd;
            savingColumns.push(scol);
        }

        if (savingColumns.length <= 0) return;

        const params = [
            { key: 'configUid', value: grid.getConfigUid() },
            { key: 'columns', value: savingColumns },
        ];

        grid.dataGetter.get({ url: 'system/saveColumnsSettings', params: params, type: 'text' }).then(
            (res) => {
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getLookupValues(col, filter, pageNum) {
        const grid = this;

        return new Promise((resolve) => {
            const params = [
                { key: 'filter', value: filter },
                { key: 'pageNumber', value: pageNum },
                { key: 'entity', value: grid.entity },
                { key: 'columns', value: col.name },
            ];

            grid.dataGetter.get({ url: 'system/getLookupValues', params: params }).then(
                (res) => {

                    const result = {
                        options: res,
                        hasMore: false,
                        additional: {
                            page: pageNum + 1,
                            node: grid
                        },
                    };

                    resolve(result);
                });
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterSortColumn(column) {
        super.afterSortColumn(column);

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterResizeColumn(column) {
        super.afterResizeColumn(column);

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterDragColumn(column) {
        super.afterDragColumn(column);

        const grid = this;
        grid.saveColumnsConfig();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}