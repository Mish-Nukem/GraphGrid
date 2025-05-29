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
export class GridINUBaseClass extends GridFLClass {
    constructor(props) {
        super(props);

        const node = this;

        node.entity = props.entity;
        node.entityAdd = props.entityAdd;
        node.dataGetter = props.dataGetter;

        node.visible = true;

        node.isVisible = props.isVisible || node.isVisible;

        node.onSelectValue = props.onSelectValue || function () { };

        node._lookupEntityInfo = {};

        node.reqInd = 0;
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
                {node.renderLookup()}
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookup() {
        const node = this;
        return (
            node.lookupIsShowing ?
                <Modal
                    title={node.lookupField.title}
                    renderContent={() => { return node.renderLookupGrid(node.lookupField) }}
                    pos={node.lookupPos}
                    onClose={(e) => node.closeLookup(e)}
                    init={(wnd) => { wnd.visible = node.lookupIsShowing; }}
                >
                </Modal>
                :
                <></>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid(lookupField) {
        const node = this;
        const info = node._lookupEntityInfo[node.lookupField.entity];
        return (
            <GridINUBase
                entity={node.lookupField.entity}
                dataGetter={node.dataGetter}
                keyField={node.lookupField.refKeyField}
                nameField={node.lookupField.refNameField}
                onSelectValue={(e) => node.selectLookupValue(e)}
                getColumns={info.columns ? () => { return info.columns; } : null}
                init={(grid) => {
                    grid.visible = true;
                    grid.title = node.lookupField.title;
                    grid.isSelecting = true;
                    node.lookupGrid = grid;
                }}
            >
            </GridINUBase>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeField(e, col, row) {
        const node = this;

        node.changedRow = node.changedRow || {};

        node.changedRow[col.name] = e.target.value;
        node.setEditing(true);
        node._changingCol = col;

        node._remCursorPos = e.currentTarget.selectionEnd;

        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearField(e, col, row) {
        const node = this;

        node.changedRow = node.changedRow || {};

        if (col.type === 'lookup') {
            node.changedRow[col.keyField] = '';
            node.changedRow[col.name] = '';
        }
        else {
            node.changedRow[col.name] = '';
        }
        node.setEditing(true);
        node.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openLookupField(e, col, row) {
        const node = this;
        node.lookupPos = node.lookupPos || { x: 100, y: 100, w: 800, h: 600 };

        node.lookupField = col;
        node.lookupIsShowing = true;
        node.changedRow = node.changedRow || {};

        const currValue = node.changedRow[col.keyField] !== undefined ? node.changedRow[col.keyField] : row[col.keyField];
        if (currValue) {
            node.activeRow = currValue;
        }

        if (node._lookupEntityInfo[col.entity]) {
            node.refreshState();
            return;
        }
        else {
            const params = [
                { key: 'atoken', value: node.dataGetter.atoken },
                { key: 'rtoken', value: node.dataGetter.rtoken },
                { key: 'entity', value: col.entity },
                { key: 'configUid', value: node.getConfigUid() },
            ];

            node.dataGetter.get({ url: 'system/entityInfo', params: params }).then(
                (columns) => {
                    node._lookupEntityInfo[col.entity] = { columns: columns };
                    node.refreshState();
                }
            );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async getColumnsFromEntity() {
        const node = this;
        const params = [
            { key: 'atoken', value: node.dataGetter.atoken },
            { key: 'rtoken', value: node.dataGetter.rtoken },
            { key: 'entity', value: node.entity },
            { key: 'configUid', value: node.getConfigUid() },
        ];

        let res = [];
        await node.dataGetter.get({ url: 'system/entityInfo', params: params }).then(
            (columns) => {
                res = columns;
                //node.prepareColumns(node.columns);
            }
        );

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectLookupValue(e) {
        const node = this;
        node.changedRow[node.lookupField.keyField] = node.lookupGrid.selectedValue();
        node.changedRow[node.lookupField.name] = node.lookupGrid.selectedText();
        node.setEditing(true);
        node.closeLookup();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeLookup(e) {
        const node = this;
        node.lookupIsShowing = false;
        delete node.lookupField;
        delete node.lookupGrid;
        node.refreshState();
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

                if (!parent || (parent.visible === false && parent.status !== NodeStatus.hidden)) return '';

                if (parent.status === NodeStatus.grid) {
                    if (!parent.rows || parent.rows.length <= 0) return '1=2'
                }

                if (parent.getConnectContent) {
                    return parent.getConnectContent({ child: grid });
                }

                const scheme = parent.graph && parent.graph.schemeName ? parent.graph.schemeName : '';
                const keyField = parent.getKeyColumn ? parent.getKeyColumn() : parent.keyField;

                let activeValue;
                let pref = parent.entity;
                switch (parent.status) {
                    case NodeStatus.grid:
                        if (!keyField || !parent.entity) return '';

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
                }

                if (!activeValue) return '';

                return `${pref};${parent.uid};${scheme || ''}  = ${activeValue}`;
            }
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getColumn(name) {
        return { name: name, sortable: true, filtrable: true };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareColumns(columns) {
        const grid = this;
        super.prepareColumns(columns);

        for (let col of grid.columns) {
            if (col._readonly !== undefined) {
                col.readonly = col._readonly;
                delete col._readonly;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getRows(e) {
        const grid = this;
        e = e || { filters: [] };

        const params = [
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'rtoken', value: grid.dataGetter.rtoken },
            { key: 'pageSize', value: grid.pageSize },
            { key: 'pageNumber', value: grid.pageNumber },
        ];

        let orderBy = '';
        for (let col of grid.columns) {
            orderBy += col.asc ? (orderBy ? ', ' : '') + col.name : '';
            orderBy += col.desc ? (orderBy ? ', ' : '') + col.name + ' desc' : '';
        }

        if (orderBy) {
            params.push({ key: 'orderBy', value: orderBy });
        }

        if (e.autocompleteColumn) {
            params.push({ key: 'autocompl', value: true });
            params.push({ key: 'columns', value: e.autocompleteColumn.name });
        }

        if (grid.activeRow) {
            params.push({ key: 'activeRow', value: grid.activeRow });
            delete grid.activeRow;
        }

        let i = 0;
        for (let cond of e.filters) {
            params.push({ key: 'f' + i++, value: cond });
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
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'rtoken', value: grid.dataGetter.rtoken },
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
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'rtoken', value: grid.dataGetter.rtoken },
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
            savingColumns.push(scol);
        }

        if (savingColumns.length <= 0) return;

        const params = [
            { key: 'atoken', value: grid.dataGetter.atoken },
            { key: 'rtoken', value: grid.dataGetter.rtoken },
            { key: 'configUid', value: grid.getConfigUid() },
            { key: 'columns', value: savingColumns },
        ];

        grid.dataGetter.get({ url: 'system/saveColumnsSettings', params: params, type: 'text' }).then(
            (res) => {
            }
        );
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