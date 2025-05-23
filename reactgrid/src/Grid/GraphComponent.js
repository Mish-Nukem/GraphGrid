/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass, WaveType } from './Graph';
import { GridINU, GridINUClass } from './GridINU';
import { GridClass } from './Grid';
import { Modal } from './Modal';
import AsyncSelect from 'react-select/async';
import { DatePicker } from './OuterComponents/DatePicker';
// ==================================================================================================================================================================
export function Graph(props) {
    let gc = null;

    const [graphState, setState] = useState({ graphComponent: gc, ind: 0 });

    const oldGraph = graphState.graphComponent;

    gc = oldGraph && oldGraph.uid === props.uid ? oldGraph : new GraphComponentClass(props);

    if (props.init) {
        props.init(gc);
    }

    gc.refreshState = function () {
        //log('refreshState ' + graph.stateind);
        setState({ graphComponent: gc, ind: gc.stateind++ });
    }

    useEffect(() => {
        //gc.setupEvents();

        if (!gc.graph) {
            gc.getScheme().then(
                (graph) => {
                    gc.graph = graph;
                    gc.refreshState();
                }
            );
        }

        return () => {
            //log(' 0.11 Clear GraphEvents');

            gc.removeEvents();
        }
    }, [gc])

    return (gc.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GraphComponentClass extends BaseComponent {
    constructor(props) {
        super(props);

        const gc = this;

        window._graphSeq = window._graphSeq || 0;
        window._graphDict = window._graphDict || {};

        gc.id = window._graphSeq++;
        gc.uid = props.uid || gc.id;
        gc.dataGetter = props.dataGetter;

        if (props.graph) {
            gc.prepareGraph(props.graph);
        }
        else {
            gc.schemeName = props.schemeName
        };

        gc.visible = true;

        gc.opt = {};
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    removeEvents() {
        const gc = this;

        if (window._graphDict && gc.uid) {
            log(' delete graph')
            delete window._graphDict[gc.uid];
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const gc = this;

        if (!gc.visible || !gc.graph) {
            return <></>;
        }

        const nodes = [];
        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];
            nodes.push(node);

            GridClass.applyTheme(node);
        }

        return (
            <>
                <div key={`graphall_${gc.stateind}_`}>
                    <div className="graph-filter-line" key={`filterstop_${gc.stateind}_`}>
                        {
                            nodes.map((node) => { return gc.renderFilter(node, true) })
                        }
                    </div>
                    <div className="graph-tabcontrol-buttons" key={`tabsstop_${gc.stateind}_`}>
                        {
                            nodes.map((node) => { return gc.renderGridTab(node, true) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridstop_${gc.stateind}_`}>
                        {
                            nodes.map((node) => { return gc.renderGrid(node, true) })
                        }
                    </div>
                    <div className="graph-filter-line" key={`filterslow_${gc.stateind}_`}>
                        {
                            nodes.map((node) => { return gc.renderFilter(node, false) })
                        }
                    </div>
                    <div className="graph-tabcontrol-buttons" key={`tabsslow_${gc.stateind}_`}>
                        {
                            nodes.map((node) => { return gc.renderGridTab(node, false) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridslow_${gc.stateind}_`}>
                        {
                            nodes.map((node, ind) => { return gc.renderGrid(node, false) })
                        }
                    </div>
                </div>
                {
                    gc.nodeSelectIsShowing ?
                        <Modal
                            title={gc.selectingNode.title}
                            renderContent={() => { return gc.renderLookupGrid() }}
                            pos={gc.selectingNodePos}
                            onClose={(e) => gc.closeLookup(e)}
                            init={(wnd) => { wnd.visible = gc.nodeSelectIsShowing; }}
                        >
                        </Modal>
                        :
                        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid() {
        const gc = this;
        return (
            gc.selectingNode.filterType === FilterType.date ?
                <DatePicker
                    date={gc.selectingNode.value}
                    onSelect={(date) => {
                        gc.selectingNode.value = date;
                        gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
                        gc.closeLookup();
                    }}
                ></DatePicker>
            :
            <GridINU
                findGrid={(props) => gc.replaceGrid(props)}
                graph={gc.graph}
                uid={gc.selectingNode.uid || gc.selectingNode.id}
                entity={gc.selectingNode.entity}
                dataGetter={gc.dataGetter || gc.selectingNode.dataGetter}
                onSelectValue={(e) => gc.selectLookupValue(e)}
                init={(grid) => {
                    grid.status = NodeStatus.filter;
                    grid.visible = true;
                    grid.title = gc.selectingNode.title;
                }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openLookup(e, node) {
        const gc = this;
        gc.selectingNodePos = gc.selectingNodePos || { x: 100, y: 100, w: 800, h: 600 };

        gc.selectingNode = node;
        gc.nodeSelectIsShowing = true;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeLookup(e) {
        const gc = this;
        gc.nodeSelectIsShowing = false;
        gc.selectingNode = null;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearLookup(e, node) {
        const gc = this;
        delete node.value;
        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectLookupValue(e) {
        const gc = this;
        if (!gc.selectingNode) return;

        gc.selectingNode.value = gc.selectingNode.selectedValue();
        gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
        gc.closeLookup();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

        if (+node.status !== +NodeStatus.filter || gc.isTop(node) !== top) return <></>;

        //if (node.filterType === FilterType.date) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        if (gc.isTop(node) && node.children.indexOf(gc.activeMaster) < 0) return <></>;

        return (
            <div
                className="graph-filter"
                key={`fltrdiv_${node.id}_${gc.id}_${gc.stateind}_`}
            >
                <span
                    key={`fltrttl_${node.id}_${gc.id}_${gc.stateind}_`}
                    style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                    className='graph-filter-title'
                >
                    {node.title}
                </span>
                {
                    node.filterType !== FilterType.date && false ?
                        <select
                            key={`fltrcmb_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                        >
                        </select> :
                        <input
                            key={`fltrinp_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                            value={
                                node.filterType !== FilterType.date ?
                                    (node.value !== undefined && node.selectedText ? node.selectedText() : '')
                                    :
                                    (node.value !== undefined ? node.value : '')
                            }
                            readOnly={true}
                        ></input>
                }
                <button
                    className={node.opt.filterButtonClass || 'graph-filter-button'}
                    key={`fltrsel_${node.id}_${gc.id}_${gc.stateind}_`}
                    onClick={(e) => gc.openLookup(e, node)}
                >
                    {node.images.filterSelect ? node.images.filterSelect() : node.translate('Select', 'graph-filter-select')}
                </button>
                <button
                    key={`fltrclr_${node.id}_${gc.id}_${gc.stateind}_`}
                    className={node.opt.filterButtonClass || 'graph-filter-button'}
                    disabled={node.value === undefined || node.value === '' ? 'disabled' : ''}
                    onClick={(e) => gc.clearLookup(e, node)}
                >
                    {node.images.filterClear ? node.images.filterClear() : node.translate('Clear', 'graph-filter-clear')}
                </button>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridTab(node, top) {
        const gc = this;
        if (+node.status !== +NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        const isActive = top && node.uid === gc.activeMaster || !top && node.uid === gc.activeDetail;
        return (
            <button
                key={`tabctrl_${node.id}_${gc.id}_${gc.stateind}_`}
                disabled={isActive ? 'disabled' : ''}
                className={node.opt.filterButtonClass || ''}
                onClick={(e) => gc.selectActiveTab(node, top)}
            >
                {node.title}
            </button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGrid(node, top) {
        const gc = this;

        if (!node.visible || +node.status !== +NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        return (
            <GridINU
                findGrid={(props) => gc.replaceGrid(props)}
                graph={gc.graph}
                uid={node.uid !== undefined ? node.uid : node.id}
                entity={node.entity}
                dataGetter={gc.dataGetter || node.dataGetter}
                init={(grid) => { grid.status = NodeStatus.grid; grid.visible = true; grid.isBottom = !top; grid.title = node.title; }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    replaceGrid(props) {
        if (!props.graph) return null;

        const gc = this;
        const graph = props.graph;
        let grid = graph.nodesDict[props.uid];

        if (grid && grid._replaced) return grid;

        grid = new GridINUClass(props);

        delete grid.refreshState;

        grid._replaced = true;
        grid.graph = graph;

        const obr = graph.nodesDict[grid.uid];
        grid.id = obr.id !== undefined ? obr.id : grid.id;

        grid.uid = obr.uid;
        grid.title = obr.title;
        grid.nameField = obr.nameField;
        grid.keyField = obr.keyField;
        //grid.entityAdd = obr.entityAdd;

        if (obr._readonly !== undefined) {
            grid.readonly = obr._readonly;
        }

        grid.columns = obr.columns || grid.columns;
        grid.getColumns = obr.getColumns || grid.getColumns;

        if (grid.columns && grid.columns.length > 0) {
            grid.prepareColumns(grid.columns);
        }

        grid.connectedToParents = true;
        grid.parents = obr.parents;
        for (let pid of grid.parents) {
            let link = graph.linksDict[grid.id + '_' + graph.nodesDict[pid].id];
            link.child = grid;
            link.content = grid.getDefaultLinkContent();
        }
        grid.children = obr.children;
        for (let cid of grid.children) {
            let link = graph.linksDict[graph.nodesDict[cid].id + '_' + grid.id];
            link.parent = grid;
        }

        if (!graph.nodeCount) {
            graph.nodeCount = 0;
            for (let uid in graph.nodesDict) {
                if (graph.nodesDict[uid] !== undefined) graph.nodeCount++
            }
        }

        if (gc.selectingNode) {
            if (String(grid.id) === String(gc.selectingNode.id)) {
                gc.selectingNode = grid;

                gc.selectingNode.isSelecting = true;
            }
        }

        grid.onRowDblClick = (e, row) => { gc.onGridRowDblClick(e, grid, row) };

        graph.nodesDict[grid.uid] = grid;
        return grid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onGridRowDblClick(e, node, row) {
        const gc = this;

        if (+node.status === +NodeStatus.filter) {
            gc.selectLookupValue(e);
        }
        else if (+node.status === +NodeStatus.grid) {
            if (!node.viewRecordDisabled(e)) {
                node.viewRecord(e);
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectActiveTab(node, top) {
        const gc = this;
        const isActive = top && node.uid === gc.activeMaster || !top && node.uid === gc.activeDetail;

        if (+node.status !== +NodeStatus.grid || gc.isTop(node) !== top || isActive) return;

        if (top) gc.activeMaster = node.uid; else gc.activeDetail = node.uid;

        for (let uid in gc.graph.nodesDict) {
            let lnode = gc.graph.nodesDict[uid];
            if (node === lnode || +lnode.status !== +NodeStatus.grid) continue;

            if (gc.isTop(node) === gc.isTop(lnode)) {
                lnode.visible = false;
            }
        }

        node.visible = true;

        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getScheme(e) {
        const gc = this;

        return new Promise(function (resolve, reject) {

            const params = [
                { key: 'atoken', value: gc.dataGetter.atoken },
                { key: 'rtoken', value: gc.dataGetter.rtoken },
                { key: 'graphScheme', value: gc.schemeName }
            ];

            gc.dataGetter.get({ url: 'system/graphScheme', params: params }).then(
                (schemeObj) => {
                    //const obj = JSON.parse(schemeObj);
                    gc.prepareGraph(schemeObj);

                    resolve(gc.graph, e);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isTop(node) {
        return node.isBottom === undefined || node.isBottom === false;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkNeedTriggerWave(node) {
        const gc = this;
        return node !== gc.selectingNode;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareGraph(obrGraph) {
        const gc = this;

        gc.graph = new GraphClass();
        gc.graph.nodesDict = obrGraph.nodesDict;
        gc.graph.linksDict = obrGraph.linksDict;
        gc.graph.nodeCount = 0;

        //    gc.graph = new GraphClass();

        //    gc.graph.nodesDict = obrGraph.nodesDict || gc.graph.nodesDict;
        //    gc.graph.linksDict = obrGraph.linksDict || gc.graph.linksDict;
        gc.graph.checkNeedTriggerWave = (node) => { return gc.checkNeedTriggerWave(node) };

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            node.graph = gc.graph;
            gc.graph.nodeCount++;

            node.opt = node.opt || {};

            if (node._readonly !== undefined) {
                node.readonly = node._readonly;
                delete node._readonly;
            }

            //log(' node ' + node.entity + '. status = ' + String(node.status));
            //log(' String(NodeStatus.grid) ' + String(NodeStatus.grid));

            if (node.status === NodeStatus.grid) {
                if (gc.isTop(node)) {
                    if (gc.activeMaster === undefined) {
                        gc.activeMaster = node.uid;
                        node.visible = true;
                    }
                }
                else {
                    if (gc.activeDetail === undefined) {
                        gc.activeDetail = node.uid;
                        node.visible = true;
                    }
                }
            }
        }

        for (let lid in gc.graph.linksDict) {
            let link = gc.graph.linksDict[lid];

            link.parent = link.parent ? gc.graph.nodesDict[link.parent] : link.parent;
            link.child = link.child ? gc.graph.nodesDict[link.child] : link.child;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}