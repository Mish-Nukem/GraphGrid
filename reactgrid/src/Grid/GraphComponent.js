/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass, WaveType } from './Graph.js';
import { GridINU, GridINUClass } from './GridINU';
import { CardINU, CardINUClass } from './CardINU';
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

    gc.refreshState = function () {
        //log('refreshState ' + graph.stateind);
        setState({ graphComponent: gc, ind: gc.stateind++ });
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
                {
                    gc.lookupIsShowing ?
                        <Modal
                            renderContent={() => { return gc.renderLookupGrid() }}
                            pos={gc.lookupPos}
                            onClose={(e) => gc.closeLookup(e)}
                            init={(wnd) => { wnd.visible = gc.lookupIsShowing; }}
                        >
                        </Modal>
                        :
                        <></>
                }
                {
                    gc.cardIsShowing ?
                        <Modal
                            renderContent={() => { return gc.renderCard() }}
                            pos={gc.cardPos}
                            onClose={(e) => gc.closeCard(e)}
                            init={(wnd) => { wnd.visible = gc.cardIsShowing; }}
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
            <GridINU
                findGrid={(props) => gc.replaceGrid(props)}
                graph={gc.graph}
                uid={gc.lookupNode.uid || gc.lookupNode.id}
                entity={gc.lookupNode.entity}
                dataGetter={gc.dataGetter || gc.lookupNode.dataGetter}
                init={(grid) => {
                    grid.status = NodeStatus.filter;
                    grid.visible = true;
                    grid.title = gc.lookupNode.title;
                }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openLookup(e, node) {
        const gc = this;
        gc.lookupPos = gc.lookupPos || { x: 100, y: 100, w: 800, h: 600 };

        gc.lookupNode = node;
        gc.lookupIsShowing = true;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeLookup(e) {
        const gc = this;
        gc.lookupIsShowing = false;
        gc.lookupNode = null;
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
        if (!gc.lookupNode) return;

        gc.lookupNode.value = gc.lookupNode.selectedValue();
        gc.graph.triggerWave({ nodes: [gc.lookupNode], withStartNodes: false });
        gc.closeLookup();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addLookupButtons(node) {
        const gc = this;

        if (node._lookupButtonsAdded) return;

        GridClass.applyTheme(node);

        node._lookupButtonsAdded = true;
        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'selectValue',
            title: node.translate('Select'),
            label: node.images.selectFilterValue ? '' : node.translate('Select value'),
            click: (e) => gc.selectLookupValue(e),
            img: node.images.selectFilterValue
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addButtons(node) {
        const gc = this;

        if (node._buttonsAdded) return;

        GridClass.applyTheme(node);

        node._buttonsAdded = true;

        //node.toolbarButtons.push({
        //    id: node.toolbarButtons.length,
        //    name: 'edit',
        //    title: node.translate('Start edit'),
        //    label: node.images.edit ? '' : node.translate('Start edit'),
        //    click: (e) => gc.startEditNode(e),
        //    img: node.images.edit
        //});

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'commit',
            title: node.translate('Commit changes'),
            label: node.images.commit ? '' : node.translate('Commit changes'),
            img: node.images.commit,
            click: (e) => gc.commitChangesNode(e, node),
            getDisabled: (e) => gc.commitChangesNodeDisabled(e, node),
        });

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'rollback',
            title: node.translate('Rollback changes'),
            label: node.images.rollback ? '' : node.translate('Rollback changes'),
            img: node.images.rollback,
            click: (e) => gc.rollbackChangesNode(e, node),
            getDisabled: (e) => gc.rollbackChangesNodeDisabled(e, node),
        });

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'add',
            title: node.translate('Add new record'),
            label: node.images.addRecord ? '' : node.translate('Add new record'),
            img: node.images.addRecord,
            click: (e) => gc.addRecordNode(e, node),
            getDisabled: (e) => gc.addRecordNodeDisabled(e, node),
        });

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'copy',
            title: node.translate('Copy record'),
            label: node.images.copyRecord ? '' : node.translate('Copy record'),
            img: node.images.copyRecord,
            click: (e) => gc.copyRecordNode(e, node),
            getDisabled: (e) => gc.copyRecordNodeDisabled(e, node),
        });

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'delete',
            title: node.translate('Delete record'),
            label: node.images.deleteRecord ? '' : node.translate('Delete record'),
            img: node.images.deleteRecord,
            click: (e) => gc.deleteRecordNode(e, node),
            getDisabled: (e) => gc.deleteRecordNodeDisabled(e, node),
        });

        node.toolbarButtons.push({
            id: node.toolbarButtons.length,
            name: 'view',
            title: node.translate('View record'),
            label: node.images.viewRecord ? '' : node.translate('View record'),
            img: node.images.viewRecord,
            click: (e) => gc.viewRecordNode(e, node),
            getDisabled: (e) => gc.viewRecordNodeDisabled(e, node),
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

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
                    node.filterType !== FilterType.date && false ?
                        <select
                            key={`fltrcmb_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                        >
                        </select> :
                        <input
                            key={`fltrinp_${node.id}_${gc.id}_${gc.stateind}_`}
                            style={{ width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box', height: '2.3em' }}
                            value={node.value !== undefined && node.selectedText ? node.selectedText() : ''}
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

        if (!node.visible || node.status !== NodeStatus.grid || gc.isTop(node) !== top) {
            return <></>;
        }
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

        grid.title = obr.title;
        grid.nameField = obr.nameField;
        grid.keyField = obr.keyField;
        grid.entityAdd = obr.entityAdd;

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

        gc.addButtons(grid);

        if (gc.lookupNode) {
            if (String(grid.id) === String(gc.lookupNode.id)) {
                gc.lookupNode = grid;

                //GridClass.applyTheme(gc.lookupNode);

                gc.addLookupButtons(gc.lookupNode);
            }
        }

        grid.onRowDblClick = (e, row) => { gc.onGridRowDblClick(e, grid, row) };

        graph.nodesDict[grid.uid] = grid;
        return grid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onGridRowDblClick(e, node, row) {
        const gc = this;

        if (node.status === NodeStatus.filter) {
            gc.selectLookupValue(e);
        }
        else if (node.status === NodeStatus.grid) {
            if (!gc.viewRecordNodeDisabled(e, node)) {
                gc.viewRecordNode(e, node);
            }
        }
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
    checkNeedTriggerWave(node) {
        const gc = this;
        return node !== gc.lookupNode;//node == null || gc.lookupNode == null || String(node.id) !== String(gc.lookupNode.id);//  node !== gc.lookupNode;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareGraph(obrGraph) {
        const gc = this;

        gc.graph = obrGraph;

        //    gc.graph = new GraphClass();

        //    gc.graph.nodesDict = obrGraph.nodesDict || gc.graph.nodesDict;
        //    gc.graph.linksDict = obrGraph.linksDict || gc.graph.linksDict;
        gc.graph.checkNeedTriggerWave = (node) => { return gc.checkNeedTriggerWave(node) };

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
    isEditing() {
        const gc = this;
        return gc._isEditing === true;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNode(e, node) {
        const gc = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    commitChangesNodeDisabled(e, node) {
        const gc = this;
        return !gc.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNode(e, node) {
        const gc = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    rollbackChangesNodeDisabled(e, node) {
        const gc = this;
        return !gc.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordNode(e, node) {
        const gc = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecordNodeDisabled(e, node) {
        const gc = this;
        return gc.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordNode(e, node) {
        const gc = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    copyRecordNodeDisabled(e, node) {
        const gc = this;
        return gc.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecordNode(e, node) {
        const gc = this;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteRecordNodeDisabled(e, node) {
        const gc = this;
        return gc.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordNode(e, node) {
        const gc = this;

        gc.cardPos = gc.cardPos || { x: 110, y: 110, w: 800, h: 600 };

        gc.cardNode = node;
        gc.cardIsShowing = true;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecordNodeDisabled(e, node) {
        const gc = this;
        return gc.isEditing() || node.selectedRowIndex === undefined || node.selectedRowIndex < 0 || !node.rows || node.rows.length <= 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeCard(e) {
        const gc = this;
        gc.cardIsShowing = false;
        gc.cardNode = null;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCard() {
        const gc = this;
        return (
            <CardINU
                findGrid={(props) => gc.replaceGrid(props)}
                cardRow={gc.cardNode.selectedRow()}
                graph={gc.graph}
                uid={gc.cardNode.uid || gc.cardNode.id}
                entity={gc.cardNode.entity}
                dataGetter={gc.dataGetter || gc.cardNode.dataGetter}
                init={(card) => {
                    card.visible = true;
                }}
            >
            </CardINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}