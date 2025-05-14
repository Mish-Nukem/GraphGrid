/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass, WaveType } from './Graph.js';
import { GridINU, GridINUClass } from './GridINU';
import { GridClass } from './Grid.js';
import { Modal } from './Modal';
import AsyncSelect from 'react-select/async';
// ==================================================================================================================================================================
export function Graph(props) {
    let gc = null;

    const [graphState, setState] = useState({ graphComponent: gc, ind: 0 });

    const oldGraph = graphState.graphComponent;

    gc = oldGraph && oldGraph.uid === props.uid ? oldGraph : new GraphComponentClass(props);

    if (props.init) {
        props.init(gc);
    }

    //if (!gc.refreshState) {
        gc.refreshState = function (clear) {
            //log('refreshState ' + graph.stateind);
            setState({ graphComponent: gc, ind: gc.stateind++ });
        }
    //}

    useEffect(() => {
        //gc.setupEvents();

        if (!gc.graph) {
            gc.getScheme().then(
                () => {
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

        //gc.activeMaster = 0;
        //gc.activeDetail = 0;

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
            nodes.push(gc.graph.nodesDict[uid]);
        }

        return (
            <div>
                <div className="graph-filter-line">
                    {
                        nodes.map((node) => { return gc.renderFilter(node, true) })
                    }
                </div>
                <div className="graph-tabcontrol-buttons">
                    {
                        nodes.map((node) => { return gc.renderGridTab(node, true) })
                    }
                </div>
                <div className="graph-grid">
                    {
                        nodes.map((node) => { return gc.renderGrid(node, true) })
                    }
                </div>
                <div className="graph-filter-line">
                    {
                        nodes.map((node) => { return gc.renderFilter(node, false) })
                    }
                </div>
                <div className="graph-tabcontrol-buttons">
                    {
                        nodes.map((node) => { return gc.renderGridTab(node, false) })
                    }
                </div>
                <div className="graph-grid">
                    {
                        nodes.map((node, ind) => { return gc.renderGrid(node, false) })
                    }
                </div>
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

        GridClass.applyTheme(node);

        if (node.status !== NodeStatus.filter || gc.isTop(node) !== top) return <></>;

        if (node.filterType === FilterType.date) return <></>;

        return (
            <div className="graph-filter" key={`fltrdiv_${node.id}_${gc.id}_${gc.stateind}_`}>
                <span
                    key={`fltrttl_${node.id}_${gc.id}_${gc.stateind}_`}
                    style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                >
                    {node.title}
                </span>
                {
                    node.filterType !== FilterType.date ?
                        <select
                            key={`fltrcmb_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                        >
                        </select> :
                        <input
                            key={`fltrinp_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                            value={node.value || ''}
                        ></input>
                }
                <button
                    className={node.opt.filterButtonClass || 'graph-filter-button'}
                    key={`fltrsel_${node.id}_${gc.id}_${gc.stateind}_`}
                >
                    {node.filterSelectDictImg ? node.filterSelectDictImg() : node.translate('Select', 'graph-filter-select')}
                </button>
                <button
                    key={`fltrclr_${node.id}_${gc.id}_${gc.stateind}_`}
                    className={node.opt.filterButtonClass || 'graph-filter-button'}
                    disabled={node.value === undefined || node.value === '' ? 'disabled' : ''}
                >
                    {node.filterClearImg ? node.filterClearImg() : node.translate('Clear', 'graph-filter-clear')}
                </button>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridTab(node, top) {
        const gc = this;
        if (node.status !== NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        const isActive = top && node.id === gc.activeMaster || !top && node.id === gc.activeDetail;
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
        const isActive = top && node.id === gc.activeMaster || !top && node.id === gc.activeDetail;

        if (!node.visible || node.status !== NodeStatus.grid || gc.isTop(node) !== top) {
            //if (node.status === NodeStatus.grid) node.visible = false;
            return <></>;
        }
        //getRows = { gc.getRows(node) }
        //node.visible = true;
        return (
            <GridINU
                findGrid={gc.findGrid}
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
    findGrid(props) {
        if (!props.graph) return null;

        const graph = props.graph;
        let grid = graph.nodesDict[props.uid];

        if (grid && grid._replaced) return grid;

        grid = new GridINUClass(props);

        delete grid.refreshState;

        grid._replaced = true;
        grid.graph = graph;

        //graph.waveCache = {};

        const obr = graph.nodesDict[grid.uid];// || graph.nodesDict[grid.entity];
        grid.id = obr.id || grid.id;

        grid.getColumns = obr.getColumns || grid.getColumns;

        grid.connectedToParents = true;
        grid.parentLinks = obr.parentLinks;
        for (let id in grid.parentLinks) {
            let link = grid.parentLinks[id];
            link.child = grid;
            link.content = grid.getDefaultLinkContent();
        }
        grid.childLinks = obr.childLinks;
        for (let id in grid.childLinks) {
            let link = grid.childLinks[id];
            link.parent = grid;
        }

        if (!graph.nodeCount) {
            graph.nodeCount = 0;
            for (let _ in graph.nodesDict) graph.nodeCount++;
        }

        graph.nodesDict[grid.uid] = grid;
        return grid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectActiveTab(node, top) {
        const gc = this;
        const isActive = top && node.id === gc.activeMaster || !top && node.id === gc.activeDetail;

        if (node.status !== NodeStatus.grid || gc.isTop(node) !== top || isActive) return;

        if (top) gc.activeMaster = node.id; else gc.activeDetail = node.id;

        for (let uid in gc.graph.nodesDict) {
            let lnode = gc.graph.nodesDict[uid];
            if (node === lnode || lnode.status !== NodeStatus.grid) continue;

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

            const params = [{ key: 'scheme', value: gc.schemeName }];

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
    prepareGraph(obrGraph) {
        const gc = this;

        gc.graph = obrGraph;

        //    gc.graph = new GraphClass();

        //    gc.graph.nodesDict = obrGraph.nodesDict || gc.graph.nodesDict;
        //    gc.graph.linksDict = obrGraph.linksDict || gc.graph.linksDict;

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            node.graph = gc.graph;

            node.opt = node.opt || {};

            if (node.status === NodeStatus.grid) {
                if (gc.isTop(node)) {
                    if (gc.activeMaster === undefined) {
                        gc.activeMaster = node.id;
                        node.visible = true;
                    }
                }
                else {
                    if (gc.activeDetail === undefined) {
                        gc.activeDetail = node.id;
                        node.visible = true;
                    }
                }
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}