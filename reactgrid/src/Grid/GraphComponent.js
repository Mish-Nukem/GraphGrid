/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass, WaveType } from './Graph';
import { GridINU, GridINUClass } from './GridINU';
import { GridClass } from './Grid';
import { Modal } from './Modal';
import { Select } from './OuterComponents/Select';
//import { AsyncPaginate } from 'react-select-async-paginate';
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
        log('refreshState gc ' + gc.stateind);
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

    //if (!gc.graph) {
    //    gc.getScheme().then(
    //        (graph) => {
    //            gc.graph = graph;
    //            gc.refreshState();
    //        }
    //    );
    //}

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

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];
            if (node.status === NodeStatus.filter) {
                if (!node._replaced) {
                    node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, dataGetter: gc.dataGetter || node.dataGetter, entity: node.entity });
                }
            }
        }

        const topFilters = [];
        const lowFilters = [];
        const topGrids = [];
        const lowGrids = [];
        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            GridClass.applyTheme(node);

            if (node.status === NodeStatus.filter) {
                //if (!node._replaced) {
                //    node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, dataGetter: gc.dataGetter || node.dataGetter, entity: node.entity });
                //}

                node._selectedOption = node._selectedOption || {};

                if (node.value !== node._selectedOption.value) {
                    node._selectedOption.value = node.value;
                    node._selectedOption.label = node.value !== undefined && node.value !== '' ? node.selectedText() : '';
                }

                if (gc.isTop(node)) {
                    if (node.children.indexOf(gc.activeMaster) >= 0) topFilters.push(node);
                }
                else {
                    if (node.parents.indexOf(gc.activeMaster) >= 0) lowFilters.push(node);
                }
            }
            else if (node.status === NodeStatus.grid) {
                if (gc.isTop(node)) {
                    topGrids.push(node);
                }
                else {
                    if (node.parents.indexOf(gc.activeMaster) >= 0) lowGrids.push(node);
                }
            }
        }

        return (
            <>
                <div key={`graphall_${gc.id}_${gc.stateind}_`}>
                    <div className="graph-filter-line" key={`filterstop_${gc.id}_$${gc.stateind}_`}>
                        {
                            topFilters.map((node) => { return gc.renderFilter(node, true) })
                        }
                    </div>
                    <div className="graph-tabcontrol-buttons" key={`tabsstop_${gc.id}_$${gc.stateind}_`}>
                        {
                            topGrids.map((node) => { return gc.renderGridTab(node, true) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridstop_${gc.id}_$${gc.stateind}_`}>
                        {
                            gc.renderGrid(gc.graph.nodesDict[gc.activeMaster], true)

                            /*nodes.map((node) => { return gc.renderGrid(node, true) })*/
                        }
                    </div>
                    <div className="graph-filter-line" key={`filterslow_${gc.id}_$${gc.stateind}_`}>
                        {
                            lowFilters.map((node) => { return gc.renderFilter(node, false) })
                        }
                    </div>
                    <div className="graph-tabcontrol-buttons" key={`tabsslow_${gc.id}_$${gc.stateind}_`}>
                        {
                            lowGrids.map((node) => { return gc.renderGridTab(node, false) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridslow_${gc.id}_$${gc.stateind}_`}>
                        {
                            gc.renderGrid(gc.graph.nodesDict[gc.activeDetail], false)

                            /*nodes.map((node, ind) => { return gc.renderGrid(node, false) })*/
                        }
                    </div>
                </div>
                {
                    gc.nodeSelectIsShowing ?
                        <Modal
                            title={gc.selectingNode.title}
                            renderContent={() => { return gc.renderFilterGrid() }}
                            pos={gc.selectingNodePos}
                            onClose={(e) => gc.closeFilterGrid(e)}
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
    renderFilterGrid() {
        const gc = this;
        return (
            gc.selectingNode.filterType === FilterType.date ?
                <DatePicker
                    date={gc.selectingNode.value}
                    onSelect={(date) => {
                        gc.selectingNode.value = date;
                        gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
                        gc.closeFilterGrid();
                    }}
                ></DatePicker>
                :
                <GridINU
                    findGrid={(props) => gc.replaceGrid(props)}
                    graph={gc.graph}
                    uid={gc.selectingNode.uid || gc.selectingNode.id}
                    entity={gc.selectingNode.entity}
                    dataGetter={gc.dataGetter || gc.selectingNode.dataGetter}
                    onSelectValue={(e) => gc.selectFilterValue(e)}
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
                    node.filterType === FilterType.combobox ?
                        <Select
                            value={node._selectedOption}
                            getOptions={(filter, pageNum) => gc.promiseOptions(filter, node, pageNum)}
                            onChange={(e) => {
                                node.value = e.value;
                                node._selectedOption = { value: e.value, label: e.label };
                                gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
                                gc.refreshState();
                            }}
                            init={(e) => { node.setComboboxValue = e.setComboboxValue; }}
                            disabled={gc.isEditing()}
                        >
                        </Select>
                        :
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
                            disabled={gc.isEditing() ? 'disabled' : ''}
                        ></input>
                }
                {
                    node.filterType !== FilterType.input ?
                        <button
                            className={node.opt.filterButtonClass || 'graph-filter-button'}
                            key={`fltrsel_${node.id}_${gc.id}_${gc.stateind}_`}
                            onClick={(e) => gc.openFilterGrid(e, node)}
                            disabled={gc.isEditing() ? 'disabled' : ''}
                        >
                            {node.images.filterSelect ? node.images.filterSelect() : node.translate('Select', 'graph-filter-select')}
                        </button>
                        : <></>
                }
                <button
                    key={`fltrclr_${node.id}_${gc.id}_${gc.stateind}_`}
                    className={node.opt.filterButtonClass || 'graph-filter-button'}
                    disabled={gc.isEditing() || node.value === undefined || node.value === '' ? 'disabled' : ''}
                    onClick={(e) => gc.clearFilter(e, node)}
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
                disabled={isActive || gc.isEditing() ? 'disabled' : ''}
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
                init={(grid) => {
                    grid.status = NodeStatus.grid;
                    grid.visible = true;
                    grid.isBottom = !top;
                    grid.title = node.title;
                }}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openFilterGrid(e, node) {
        const gc = this;
        gc.selectingNodePos = gc.selectingNodePos || { x: 100, y: 100, w: 800, h: 600 };

        if (node.value) {
            node.activeRow = node.value;
        }

        gc.selectingNode = node;

        gc.nodeSelectIsShowing = true;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeFilterGrid(e) {
        const gc = this;
        gc.nodeSelectIsShowing = false;
        gc.selectingNode = null;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearFilter(e, node) {
        const gc = this;
        delete node.value;
        node._selectedOption = { value: '', label: '' };
        if (node.setComboboxValue) {
            node.setComboboxValue(null);
        }

        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectFilterValue(e) {
        const gc = this;
        if (!gc.selectingNode) return;

        gc.selectingNode.value = gc.selectingNode.selectedValue();
        if (gc.selectingNode.setComboboxValue) {
            gc.selectingNode.setComboboxValue({ value: gc.selectingNode.value, label: gc.selectingNode.selectedText() });
        }

        gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
        gc.closeFilterGrid();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onGridRowDblClick(e, node, row) {
        const gc = this;

        if (+node.status === +NodeStatus.filter) {
            gc.selectFilterValue(e);
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
    promiseOptions(filter, node, pageNum) {
        const gc = this;

        return new Promise((resolve) => {
            const ev = { filters: [] };

            if (filter !== undefined && filter !== '') {
                ev.filters = [`${node.nameField} starts ${filter}`];
            }

            if (!node._replaced) {
                node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, dataGetter: gc.dataGetter || node.dataGetter, entity: node.entity });
            }

            node.pageSize = 100;
            node.pageNumber = pageNum || 1;
            //node.pageNumber = +e.Page || 1;

            node.getRows(ev).then(
                (rows) => {
                    const result = {
                        options: [],
                        hasMore: false,
                        additional: {
                            page: pageNum + 1,
                            node: node
                        },
                    };
                    for (let row of rows) {
                        result.options.push({ value: row[node.keyField], label: row[node.nameField] });
                    }
                    result.hasMore = node.pageSize * node.pageNumber < node.totalRows;
                    resolve(result);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isTop(node) {
        return node.isBottom === undefined || node.isBottom === false;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isEditing() {
        const gc = this;
        return gc._masterIsEditing || gc._detailIsEditing;

    //    const master = gc.graph.nodesDict[gc.activeMaster];
    //    const detail = gc.graph.nodesDict[gc.activeDetail];

    //    return master && master.isEditing && master.isEditing() || detail && detail.isEditing && detail.isEditing();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setEditing(grid, value) {
        const gc = this;
        if (grid.uid === gc.activeMaster) {
            gc._masterIsEditing = value;
        }
        else if (grid.uid === gc.activeDetail) {
            gc._detailIsEditing = value;
        }
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //async detailNodeChangesSaved(node) {
    //    const gc = this;
    //    if (node.uid !== gc.activeMaster) return true;

    //    const detail = gc.graph.nodesDict[gc.activeDetail];

    //    if (!detail.rows || detail.rows.length <= 0) return true;

    //    let res;
    //    const row = detail.rows[detail.selectedRowIndex];
    //    if (!row) return true;

    //    await detail.saveRow({ row: row, changedRow: detail.changedRow }).then(
    //        () => {
    //            detail.setEditing(false);
    //            Object.assign(row, detail.changedRow);
    //            detail.refreshState();
    //            res = true;
    //        }
    //    ).catch((message) => {
    //        Object.assign(detail.changedRow, row);
    //        detail.refreshState();
    //        res = false;
    //        alert(message || 'Error!');
    //    });

    //    return res;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkNeedTriggerWave(node) {
        const gc = this;
        return node !== gc.selectingNode;
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

        grid.allowEditGrid = obr.allowEditGrid;

        if (obr.status !== undefined) {
            grid.status = obr.status;
        }

        if (obr.filterType !== undefined) {
            grid.filterType = obr.filterType;
        }

        if (obr._readonly !== undefined) {
            grid.readonly = obr._readonly;
        }

        if (obr.value !== undefined) {
            grid.value = obr.value;
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

        grid.remSetEditing = grid.setEditing;
        grid.setEditing = (value) => { grid.remSetEditing(value); gc.setEditing(grid, value); /*gc.refreshState();*/ };
        grid.isEditing = () => { return gc.isEditing(); };

        //if (gc.isTop(grid)) {
        //    grid.detailNodeChangesSaved = async () => { const res = await gc.detailNodeChangesSaved(grid); return res; };
        //}

        graph.nodesDict[grid.uid] = grid;
        return grid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    prepareGraph(obrGraph) {
        const gc = this;

        gc.graph = new GraphClass();
        gc.graph.nodesDict = obrGraph.nodesDict;
        gc.graph.linksDict = obrGraph.linksDict;

        if (obrGraph.uid !== undefined) {
            gc.graph.uid = obrGraph.uid;
        }

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