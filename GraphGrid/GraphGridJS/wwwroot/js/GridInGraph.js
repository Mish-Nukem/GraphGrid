import Grid from './Grid.js';
import Graph from './Graph.js';

window.WaveType = {
    value: 0, refresh: 1, save: 2
};

window.MoveType = {
    fromParent: 0, fromChild: 1, All: 2
};

//let Graph;
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export default class GridInGraph extends Grid {

    constructor(options) {
        super(options);
    }

    /*async*/ connectToParentGrid(parentGrid, content, noDetectCycles) {
        const grid = this;

        //if (!Graph) {
        //    await import('./Graph.js').then(function (obj) { Graph = obj; });
        //}

        if (!parentGrid || parentGrid == grid || parentGrid.id == grid.id) return;

        if (grid.graph && parentGrid.graph) {
            parentGrid.graph.nodeCount = parentGrid.graph.nodeCount + grid.graph.nodeCount;

            for (let id in grid.graph.nodesDict) {
                parentGrid.graph.nodesDict[id] = grid.graph.nodesDict[id];
            }
            for (let id in grid.graph.linksDict) {
                parentGrid.graph.linksDict[id] = grid.graph.linksDict[id];
            }

            grid.graph = parentGrid.graph;
        }
        else if (grid.graph) {
            parentGrid.graph = grid.graph;
            grid.graph.nodeCount++;
            grid.graph.nodesDict[parentGrid.id] = parentGrid;
        }
        else if (parentGrid.graph) {
            grid.graph = parentGrid.graph;
            grid.graph.nodeCount++;
            grid.graph.nodesDict[grid.id] = grid;
        }
        else {
            grid.graph = parentGrid.graph = new Graph(); //Graph.CreateGraph();
            grid.graph.nodeCount = 2;
            grid.graph.nodesDict[parentGrid.id] = parentGrid;
            grid.graph.nodesDict[grid.id] = grid;
        }

        grid.parentLinks = grid.parentLinks || {};
        parentGrid.childLinks = parentGrid.childLinks || {};

        const link = { content: content, parent: parentGrid, child: grid };

        grid.graph.linksDict[grid.id + '_' + parentGrid.id] = link;
        grid.parentLinks[parentGrid.id] = link;
        parentGrid.childLinks[grid.id] = link;

        if (!noDetectCycles) {
            grid.graph.markCycles();
        }
    }

    onSelectedRowChanged(e) {
        super.onSelectedRowChanged(e);

        if (this.graph) {
            this.graph.triggerWave({ nodes: [this], withStartNodes: false });
        }
    }

    collectFilters() {
        const filters = [];

        for (let id in this.parentLinks) {
            let link = this.parentLinks[id];
            if (!link.content || link.parent.selectedRowIndex < 0) continue;

            if (link.content.applyLink) {
                let filter = link.content.applyLink(link.parent);
                if (filter === undefined) continue;

                filters.push(filter);
            }
        }

        return filters;
    }

    skipOnWaveVisit(e) {
        if (e.waveType == WaveType.refresh) {
            if (!this.visible || this.status == NodeStatus.hidden) return true;
            if (this.status == NodeStatus.filter && !this._selecting) return true;
        }
    }

    visitByWave(e) {
        if (this.skipOnWaveVisit(e)) return;

        const grid = this;

        grid.selectedRowIndex = 0;
        grid.getRows({
            filters: grid.collectFilters(),
            resolve: function () {
                grid.draw();
                grid.graph.visitNodesByWave(e);
            }
        });
    }
}