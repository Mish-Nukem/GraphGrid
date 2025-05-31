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
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridInGraphClass(props);
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
            grid.columns = grid.getColumns();
            grid.prepareColumns(grid.columns);
        }

        return () => {
            grid.clearEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GridInGraphClass extends GridClass {

    constructor(props) {
        super(props);

        const grid = this;

        if (props.entity) {
            grid.entity = props.entity;
        }

        if (props.getDefaultLinkContent) {
            grid.getDefaultLinkContent = props.getDefaultLinkContent;
        }

        if (!props.graph && (props.parentGrids || props.uid)) {
            grid.graphUid = props.graphUid || "defaultGraphUID";

            grid.parentGrids = props.parentGrids;

            window._graphDict = window._graphDict || {};

            window._graphDict[grid.graphUid] = window._graphDict[grid.graphUid] || new GraphClass();
            const graph = window._graphDict[grid.graphUid];

            while (graph.nodesDict[window._gridSeq]) {
                window._gridSeq++;
            }
            grid.id = window._gridSeq++;

            grid.graph = graph;
            graph.uid = grid.graphUid;

            grid.parents = [];
            grid.children = [];

            if (props.parentGrids) {
                grid.graph.needCheckIntegrity = true;
            }

            grid.uid = props.uid !== undefined ? props.uid : grid.id;
            graph.nodeCount++;
            graph.nodesDict[grid.uid] = grid;

        }
        else {
            grid.uid = props.uid !== undefined ? props.uid : grid.id;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    log(message, pref) {
        const grid = this;
        super.log(`${pref ? pref : `grid#${grid.uid ? grid.id + '(' + grid.uid + ')' : grid.id}`} : ` + message, ' ');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearEvents() {
        const grid = this;

        super.clearEvents();

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
        for (let uid in graph.nodesDict) {
            if (uid === grid.uid) continue;

            let parentGrid = graph.nodesDict[uid];
            if (parentUids.indexOf(parentGrid.uid) <= 0) continue;

            const link = { content: grid.getDefaultLinkContent(), parent: parentGrid, child: grid };

            const lkey = grid.id + '_' + parentGrid.id;
            graph.linksDict[lkey] = link;
            grid.parents.push(parentGrid.uid);
            parentGrid.children.push(grid.uid);
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
            applyLink: function (link) {
                if (!link.parent || !link.parent.rows) return '';

                if (link.parent.getConnectContent) {
                    return link.parent.getConnectContent({ child: grid });
                }

                return link.parent.selectedValue();
            }
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getEntity() {
        const grid = this;
        return grid.entity || 'grid_' + (grid.uid || grid.id);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectedRowChanged(e) {
        super.onSelectedRowChanged(e);

        const grid = this;
        const graph = grid.graph;
        if (graph) {

            if (!grid.connectedToParents) {
                grid.connectToParents();
            }

            if (graph.needCheckIntegrity) {
                grid.checkGraphIntegrity();
            }

            if (graph.checkNeedTriggerWave && !graph.checkNeedTriggerWave(grid)) return;

            graph.triggerWave({ nodes: [grid], withStartNodes: false });
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkGraphIntegrity() {
        const grid = this;
        const graph = grid.graph;
        graph.needCheckIntegrity = false;

        for (let uid in graph.nodesDict) {
            if (uid === grid.id) continue;

            let node = graph.nodesDict[uid];
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

        if (!grid.parents || grid.parents.length <= 0) return filters;

        for (let uid of grid.parents) {
            let link = grid.graph.linksDict[grid.id + '_' + grid.graph.nodesDict[uid].id];
            if (!link.content) continue;

            if (link.content.applyLink) {
                let filter = link.content.applyLink(link);
                if (filter === undefined || filter === '') continue;

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