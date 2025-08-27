import { useState, useEffect } from 'react';
import { GridFLClass } from './GridFL';
import { BaseComponent, FilterType, NodeStatus } from './Base';
import { WaveType } from './Graph';
import { Modal } from './Modal';
import { GLObject } from './GLObject';

// ==================================================================================================================================================================
export function GridINUBase(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid !== undefined) {
        grid = null;
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

            grid.getRows().then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }
        else if (grid.columns.length <= 0 && grid.getColumns) {
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

        grid.controller = props.controller || props.entity;
        grid.entity = props.entity;
        grid.entityAdd = props.entityAdd;

        grid.visible = true;

        grid.isVisible = props.isVisible || grid.isVisible;

        grid.onSelectValue = props.onSelectValue || function () { };

        grid.activeRow = props.activeRow || '';

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
                    title={grid.popupTitle}
                    renderContent={() => { return grid.renderPopupContent() }}
                    dimensionsByContent={grid.popupDimensionsByContent}
                    pos={grid.popupPos}
                    onClose={(e) => {
                        grid.onClosePopup(e);
                        grid.refreshState();
                    }}
                >
                </Modal>
                :
                <></>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        grid.popupIsShowing = false;
        grid.popupTitle = '';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        return <></>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async getEntityInfo(noConfig) {
        const grid = this;
        if (!grid.entity) return null;

        if (GLObject.entityInfo[grid.entity]) return GLObject.entityInfo[grid.entity];

        const params = [
            { key: 'entity', value: grid.entity },
        ];

        if (!noConfig) {
            params.push({ key: 'configUid', value: grid.getConfigUid() });
        }

        const entityInfo = await GLObject.dataGetter.get({ url: 'system/entityInfo', params: params });
        GLObject.entityInfo[grid.entity] = entityInfo;

        if (entityInfo) {
            grid.allowEditGrid = grid.allowEditGrid !== undefined ? grid.allowEditGrid : entityInfo.allowEdit;
            grid.allowView = entityInfo.allowView;
            grid.allowAdd = grid.allowCopy = entityInfo.allowAdd;
            grid.allowDelete = entityInfo.allowDelete;

            grid.pageSize = entityInfo.pageSize !== null && entityInfo.pageSize !== undefined ? entityInfo.pageSize : grid.pageSize;
            grid.pageNumber = entityInfo.pageNumber !== null && entityInfo.pageNumber !== undefined ? entityInfo.pageNumber : grid.pageNumber;
        }

        return entityInfo;
    }
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
                        break;
                    default:
                        if (link.everLink) {
                            activeValue = parent.value;
                        }
                        break;
                }

                if (!activeValue) return '';

                if (link.condition) {
                    return link.condition.replace(/:id/gi, activeValue);
                }

                const entityInfo = GLObject.entityInfo[grid.entity];

                if (entityInfo && entityInfo.tableName && parent.entity) {
                    const refColumn = entityInfo.columns.find(function (item) {
                        return item.type === 'lookup' && String(item.entity) === String(parent.entity);
                    });

                    if (!refColumn) return '';

                    const arr = entityInfo.tableName.split('.');
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
    async prepareColumns(noConfig) {
        const grid = this;
        if (grid._waitingColumns) return;

        const entityInfo = await grid.getEntityInfo(noConfig);

        await super.prepareColumns().then(() => {
            for (let col of grid.columns) {
                if (col._readonly !== undefined) {
                    col.readonly = col._readonly;
                    delete col._readonly;
                }
            }

            delete grid._waitingColumns;

            if (!entityInfo || grid._savedConfigApplied) return;

            grid._savedConfigApplied = true;

            const newColumns = [];
            for (let col of entityInfo.columns) {
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

            if (entityInfo.columnsDefaultOrder) {
                const dcols = String(entityInfo.columnsDefaultOrder).split(';');
                grid.columnsDefaultOrder = [];
                for (let colName of dcols) {
                    let col = grid.colDict[colName];
                    if (!col) continue;
                    grid.columnsDefaultOrder.push(col);
                }
            }
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const grid = this;
        e = e || {};

        const params = [{ key: 'entity', value: grid.entity }];

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

        params.push({ key: 'reqInd', value: ++grid.reqInd });

        return new Promise(function (resolve, reject) {
            if (!grid.entity && grid.rows && grid.rows.length > 0) {
                resolve(grid.rows);
                return;
            }

            grid.getEntityInfo().then((entityInfo) => {
                GLObject.entityInfo[grid.entity] = entityInfo;

                params.push({ key: 'pageSize', value: grid.pageSize });
                params.push({ key: 'pageNumber', value: grid.pageNumber });

                const filters = e.filters || grid.collectFilters();

                let i = 0, j = 0;
                for (let cond of filters) {
                    if (cond.type === 'column') {
                        params.push({ key: 'f' + i++, value: cond.filter });
                    }
                    else if (cond.type === 'graphLink') {
                        params.push({ key: 'c' + j++, value: cond.filter });
                    }
                }

                GLObject.dataGetter.get({ url: grid.controller + '/' + (!e.autocompleteColumn ? 'list' : 'autocomplete'), params: params }).then(
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
            })
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getNewRow() {
        const grid = this;

        const params = [{ key: 'entity', value: grid.entity }];

        return new Promise(function (resolve, reject) {
            GLObject.dataGetter.get({ url: 'system/getNewRow', params: params }).then(
                (res) => {
                    if (res) {
                        resolve(res);
                    }
                    else {
                        reject(Error("Error getting new row"));
                    }
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRow() {
        const grid = this;

        const params = [
            { key: 'entity', value: grid.entity },
            { key: 'id', value: grid.selectedValue() || grid.selectedRow()[grid.keyField] },
        ];

        return new Promise(function (resolve, reject) {
            GLObject.dataGetter.get({ url: grid.controller + '/delete', params: params }).then(
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

        if (!grid.isRowChanged(e.row)) return new Promise(function (resolve) { resolve(true); });

        const params = [
            { key: 'row', value: e.row },
            { key: 'upd', value: e.changedRow },
            { key: 'columns', value: grid.keyField },
            { key: 'entity', value: grid.entity },
        ];

        if (!grid.isNewRecord) {
            params.push({ key: 'f0', value: grid.keyField + ' = ' + e.row[grid.keyField] });
        }

        return new Promise(function (resolve, reject) {
            GLObject.dataGetter.get({ url: grid.controller + '/' + (grid.isNewRecord ? 'add' : 'update'), params: params }).then(
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
    saveColumnsConfig() {
        const grid = this;
        if (!GLObject.dataGetter) return;

        const savingColumns = [];
        for (let col of grid.columns) {
            let scol = { n: col.name, w: col.w };
            if (col.visible === false) scol.v = '0';
            if (col.asc) scol.s = '1'; else if (col.desc) scol.s = '0';
            if (col.sortInd !== undefined) scol.i = col.sortInd;
            savingColumns.push(scol);
        }

        if (savingColumns.length <= 0) return;

        const gridInfo = {
            s: grid.pageSize,
        };

        const params = [
            { key: 'configUid', value: grid.getConfigUid() },
            { key: 'columns', value: savingColumns },
            { key: 'ndata', value: gridInfo },
        ];

        GLObject.dataGetter.get({ url: 'system/saveColumnsSettings', params: params, type: 'text' });
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
    visitByWave(e) {
        const grid = this;

        if (grid.skipOnWaveVisit(e)) return;

        grid.selectedRowIndex = 0;

        grid.getRows().then(
            rows => {
                grid.rows = rows;
                grid.afterGetRows(e);
                grid.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}