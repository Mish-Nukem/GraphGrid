/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass, WaveType } from './Graph.js';
import { GridINU } from './GridINU';
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

    if (!gc.refreshState) {
        gc.refreshState = function (clear) {
            //log('refreshState ' + graph.stateind);
            setState({ graphComponent: gc, ind: gc.stateind++ });
        }
    }

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
            //gc.prepareGraph(props.graph);
            gc.graph = props.graph;
        }
        else {
            gc.schemeName = props.schemeName
        };

        gc.activeMaster = 0;
        gc.activeDetail = 0;

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
                        nodes.map((node, ind) => { return gc.renderFilter(node, true) })
                    }
                </div>
                <div className="graph-tabcontrol-buttons">
                    {
                        nodes.map((node, ind) => { return gc.renderGridTab(node, true, ind) })
                    }
                </div>
                <div>
                    {
                        nodes.map((node, ind) => { return gc.renderGrid(node, true, ind) })
                    }
                </div>
                <div className="graph-filter-line">
                    {
                        nodes.map((node, ind) => { return gc.renderFilter(node, false) })
                    }
                </div>
                <div className="graph-tabcontrol-buttons">
                    {
                        nodes.map((node, ind) => { return gc.renderGridTab(node, false, ind) })
                    }
                </div>
                <div>
                    {
                        nodes.map((node, ind) => { return gc.renderGrid(node, false, ind) })
                    }
                </div>
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        node.opt = node.opt || {};
        GridClass.applyTheme(node);

        if (node.status !== NodeStatus.filter || node.isBottom === top || !top && node.isBottom === undefined) return <></>;

        return (
            <div className="graph-filter">
                <span
                    style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                >
                    {node.title}
                </span>
                {
                    node.filterType !== FilterType.date ? <select></select> :
                        <input
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box' }}
                            value={node.value || ''}
                        ></input>
                }
                <button className={node.opt.filterButtonClass || ''}>
                    {node.filterSelectDictImg ? node.filterSelectDictImg() : node.translate('Select', 'graph-filter-select')}
                </button>
                <button className={node.opt.filterButtonClass || ''}>
                    {node.filterClearImg ? node.filterClearImg() : node.translate('Clear', 'graph-filter-clear')}
                </button>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridTab(node, top, ind) {
        const gc = this;
        if (node.status !== NodeStatus.grid || node.isBottom === top || !top && node.isBottom === undefined) return <></>;

        const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;
        return (
            <button
                disabled={isActive ? 'disabled' : ''}
                className={node.opt.filterButtonClass || ''}
                onClick={(e) => gc.selectActiveTab(node, top, ind)}
            >
                {node.title}
            </button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGrid(node, top, ind) {
        const gc = this;
        const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;

        if (node.status !== NodeStatus.grid || node.isBottom === top || !isActive || !top && node.isBottom === undefined) {
            //if (node.status === NodeStatus.grid) node.visible = false;
            return <></>;
        }
        //getRows = { gc.getRows(node) }
        //node.visible = true;
        return (
            <GridINU
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
    selectActiveTab(node, top, ind) {
        const gc = this;
        const isActive = top && ind === gc.activeMaster || !top && ind === gc.activeDetail;

        if (node.status !== NodeStatus.grid || node.isBottom === top || isActive) return;

        if (top) gc.activeMaster = ind; else gc.activeDetail = ind;

        for (let uid in gc.graph.nodesDict) {
            let lnode = gc.graph.nodesDict[uid];
            if (node === lnode || lnode.status !== NodeStatus.grid) continue;

            if (node.isBottom === lnode.isBottom) {
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
                    gc.graph = schemeObj;
                    //gc.prepareGraph(schemeObj);
                    
                    resolve(gc.graph, e);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //getRows(node) {
    //	const gc = this;

    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareGraph(/*schemeObj*/) {
        const gc = this;

        //gc.graph = schemeObj;

        let needAdd;
        if (!gc.graph.nodes || !gc.graph.nodes.length) {
            gc.graph.nodes = [];
            needAdd = true;
        }

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];
            if (needAdd) {
                gc.graph.nodes.push(node);
            }

            //node.skipOnWaveVisit = gc.skipOnWaveVisit;
        }

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}