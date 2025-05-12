import { useState, useEffect } from 'react';
import { GridClass } from './Grid.js';
import { GraphClass/*, WaveType*/ } from './Graph.js';
// ==================================================================================================================================================================
export function GridInGraph(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        grid = new GridInGraphClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    if (!grid.refreshState) {
        grid.refreshState = function () {
            grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
            setState({ grid: grid, ind: grid.stateind++ });
        }
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
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GridInGraphClass extends GridClass {

    constructor(props) {
        super(props);

        const grid = this;

        if (props.keyField) {
            grid.keyField = props.keyField;
        }

        if (props.entity) {
            grid.entity = props.entity;
        }

        if (props.parentGrids || props.uid) {
            grid.graphUid = props.graphUid || "defaultGraphUID";

            grid.parentGrids = props.parentGrids;
            grid.uid = props.uid || grid.id;

            window._graphDict = window._graphDict || {};

            window._graphDict[grid.graphUid] = window._graphDict[grid.graphUid] || new GraphClass();
            const graph = window._graphDict[grid.graphUid];

            grid.graph = graph;
            graph.uid = grid.graphUid;

            graph.nodeCount++;
            graph.nodesDict[grid.id] = grid;

            grid.parentLinks = {};
            grid.childLinks = {};

            if (props.getDefaultLinkContent) {
                grid.getDefaultLinkContent = props.getDefaultLinkContent;
            }

            if (props.parentGrids) {
                grid.graph.needConnect = true;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    log(message, pref) {
        const grid = this;
        super.log(`${pref ? pref : `grid#${grid.uid ? grid.id + '(' + grid.uid + ')' : grid.id}`} : ` + message, ' ');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    removeEvents() {
        const grid = this;

        super.removeEvents();

        if (window._graphDict && grid.graphUid) {
            grid.log(' delete graph')
            delete window._graphDict[grid.graphUid];
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    connectToParents(noDetectCycles) {
        const grid = this;
        const graph = grid.graph;

        grid.connectedToParents = true;

        const parentUids = ',' + grid.parentGrids + ',';
        for (let id in graph.nodesDict) {
            if (+id === grid.id) continue;

            let parentGrid = graph.nodesDict[id];
            if (parentUids.indexOf(parentGrid.uid) <= 0) continue;

            const link = { content: grid.getDefaultLinkContent(parentGrid), parent: parentGrid, child: grid };

            graph.linksDict[grid.id + '_' + parentGrid.id] = link;
            grid.parentLinks[parentGrid.id] = link;
            parentGrid.childLinks[grid.id] = link;
        }

        graph.waveCache = {};

        if (!noDetectCycles) {
            graph.markCycles();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getDefaultLinkContent() {
        const grid = this;
        return {
            applyLink: function (parentGrid) {
                if (!parentGrid || !parentGrid.rows) return '';

                if (parentGrid.getConnectContent) {
                    return parentGrid.getConnectContent({ child: grid });
                }

                const keyField = parentGrid.getKeyColumn();
                if (!keyField) return '';

                const activeRow = parentGrid.rows[parentGrid.selectedRowIndex];

                return activeRow[keyField];
            }
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getEntity() {
        const grid = this;
        return grid.entity || 'grid_' + (grid.uid || grid.id);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getKeyColumn() {
        const grid = this;
        if (grid.keyField) return grid.keyField;

        if (!grid.columns || grid.columns.length <= 0) return '';

        for (let col of grid.columns) {
            if (col.name.toLowerCase() === 'id') {
                grid.keyField = col.name;
                break;
            }
        }

        grid.keyField = grid.keyField || grid.columns[0].name;
        return grid.keyField;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectedRowChanged(e) {
        super.onSelectedRowChanged(e);

        const grid = this;
        if (grid.graph) {

            if (!grid.connectedToParents) {
                grid.connectToParents();
            }

            if (grid.graph.needConnect) {
                grid.checkGraphIntegrity();
            }

            grid.graph.triggerWave({ nodes: [grid], withStartNodes: false });
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkGraphIntegrity() {
        const grid = this;
        const graph = grid.graph;
        graph.needConnect = false;

        for (let id in graph.nodesDict) {
            if (id === grid.id) continue;

            let node = graph.nodesDict[id];
            if (!node.connectedToParents) {
                node.connectToParents();
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    collectFilters() {
        const grid = this;
        const filters = [];

        if (grid.parentGrids && !grid.connectedToParents) {
            return ["1=2"];
        }

        for (let id in grid.parentLinks) {
            let link = grid.parentLinks[id];
            if (!link.content || link.parent.selectedRowIndex < 0) continue;

            if (link.content.applyLink) {
                let filter = link.content.applyLink(link.parent);
                if (filter === undefined) continue;

                filters.push(String(filter));
            }
        }

        return filters;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    skipOnWaveVisit(e) {
        //if (e.waveType == WaveType.refresh) {
        //    if (!this.visible || this.status == NodeStatus.hidden) return true;
        //    if (this.status == NodeStatus.filter && !this._selecting) return true;
        //}
        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    visitByWave(e) {
        const grid = this;

        if (grid.skipOnWaveVisit(e)) return;

        grid.selectedRowIndex = 0;

        grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
            rows => {
                grid.rows = rows;
                grid.afterGetRows(e);
                grid.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetRows(e) {
        super.afterGetRows(e);

        const grid = this;

        if (grid.graph) {
            grid.graph.visitNodesByWave(e);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}