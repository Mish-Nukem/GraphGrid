/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass } from './Graph';
import { GridFL, GridFLClass } from './GridFL';
import { GridINU, GridINUClass } from './GridINU';
import { ClipLoader } from 'react-spinners';
import { FieldEdit } from './FieldEdit';
import { GLObject } from './GLObject';
import { Images } from './Themes/Images';
// ==================================================================================================================================================================
export function GraphComponent(props) {
    let gc = null;

    const [graphState, setState] = useState({ graphComponent: gc, ind: 0 });

    const oldGraph = graphState.graphComponent;

    gc = oldGraph && oldGraph.uid === props.uid ? oldGraph : new GraphComponentClass(props);

    if (props.init) {
        props.init(gc);
    }

    gc.refreshState = function () {
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
        else if (GLObject.dataGetter) {
            gc.getGraphInfo().then(
                (gInfo) => {
                    gc.applyRestoredParams(gInfo);
                    gc.refreshState();
                }
            );
        }

        return () => {
            //log(' 0.11 Clear GraphEvents');

            gc.clearEvents();
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
        //window._graphDict = window._graphDict || {};

        gc.id = window._graphSeq++;
        gc.uid = props.uid || gc.id;

        GLObject.gridCreator = GLObject.gridCreator || {
            CreateGridClass: (props) => {
                if (props.entity) {
                    return new GridINUClass(props);
                }
                else {
                    return new GridFLClass(props);
                }
            }
        };

        gc.selectingNodeUid = props.selectingNodeUid;
        gc.onSelectFilterValue = props.onSelectFilterValue;
        gc.nodeBeforeOpenCondition = props.nodeBeforeOpenCondition;

        gc.filterButtonClass = props.filterButtonClass;
        gc.filterInputClass = props.filterInputClass;
        gc.tabControlButtonClass = props.tabControlButtonClass;

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
    clearEvents() {
        const gc = this;

        if (window._graphDict && gc.uid) {
            log(' delete graph: ' + gc.uid);
            delete window._graphDict[gc.uid];
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const gc = this;

        if (!gc.visible) {
            return <></>;
        }

        if (!gc.graph) {
            return <div className='grid-loader'><ClipLoader size={15} /></div>;
        }

        const topFilters = [];
        const lowFilters = [];
        const topGrids = [];
        const lowGrids = [];
        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            if (node.status === NodeStatus.filter) {
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
                    if (node.parents.indexOf(gc.activeMaster) >= 0 || node.parents.indexOf(gc.activeDetail) >= 0 || node.uid === gc.activeDetail) lowGrids.push(node);
                }
            }
        }

        return (
            <>
                <div key={`graphall_${gc.id}_`}>
                    {
                        topFilters.length <= 0 ? <></>
                            :
                            <div
                                key={`topFiltersMainDiv_${gc.id}_`}
                                className="graph-filters-div"
                                style={{ height: gc.topFiltersCollapsed ? '0' : ''  }}
                            >
                                <button
                                    key={`topFiltersCollapseButton_${gc.id}_`}
                                    onClick={() => { gc.topFiltersCollapsed = !gc.topFiltersCollapsed; gc.refreshState(); }}
                                    title={!gc.topFiltersCollapsed ? gc.translate('Collapse') : gc.translate('Expand')}
                                    className='menu-collapse-button'
                                >
                                    {gc.topFiltersCollapsed ? Images.images.chevronDown(20, 10) : Images.images.chevronUp(20, 10)}
                                </button>
                                {
                                    !gc.topFiltersCollapsed ?
                                        <div className="graph-filter-line" key={`filterstop_${gc.id}_`}>
                                            {
                                                topFilters.map((node) => { return gc.renderFilter(node, true) })
                                            }
                                        </div>
                                        :
                                        <></>
                                }
                            </div>
                    }
                    <div className="graph-tabcontrol-buttons" key={`tabsstop_${gc.id}_`}>
                        {
                            topGrids.map((node) => { return gc.renderGridTab(node, true) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridstop_${gc.id}_`}>
                        {
                            gc.renderGridInGraph(gc.graph.nodesDict[gc.activeMaster], true)
                        }
                    </div>
                    {
                        lowFilters.length <= 0 ? <></>
                            :

                            <div
                                key={`lowFiltersMainDiv_${gc.id}_`}
                                className="graph-filters-div"
                                style={{ height: gc.lowFiltersCollapsed ? '0' : '' }}
                            >
                                <button
                                    key={`lowFiltersCollapseButton_${gc.id}_`}
                                    onClick={() => { gc.lowFiltersCollapsed = !gc.lowFiltersCollapsed; gc.refreshState(); }}
                                    title={!gc.lowFiltersCollapsed ? gc.translate('Collapse') : gc.translate('Expand')}
                                    className='menu-collapse-button'
                                >
                                    {gc.lowFiltersCollapsed ? Images.images.chevronDown(20, 10) : Images.images.chevronUp(20, 10)}
                                </button>
                                {
                                    !gc.lowFiltersCollapsed ?
                                        <div className="graph-filter-line" key={`filterslow_${gc.id}_`}>
                                            {
                                                lowFilters.map((node) => { return gc.renderFilter(node, false) })
                                            }
                                        </div>
                                        :
                                        <></>
                                }
                            </div>
                    }
                    <div className="graph-tabcontrol-buttons" key={`tabsslow_${gc.id}_`}>
                        {
                            lowGrids.map((node) => { return gc.renderGridTab(node, false) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridslow_${gc.id}_`}>
                        {
                            gc.renderGridInGraph(gc.graph.nodesDict[gc.activeDetail], false)
                        }
                    </div>
                </div>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectingGraph(selectingNode) {
        const gc = this;
        return <GraphComponent
            uid={`${gc.uid}_select_${selectingNode.uid}_`}
            schemeName={selectingNode.schemeName}
            selectingNodeUid={selectingNode.inSchemeUid}
            onSelectFilterValue={(e) => gc.selectFilterValue(e, selectingNode)}
        >
        </GraphComponent >;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

        if (+node.status !== +NodeStatus.filter || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        if (gc.isTop(node) && node.children.indexOf(gc.activeMaster) < 0) return <></>;

        const isInput = node.filterType === FilterType.input;
        const isDate = node.filterType === FilterType.date;

        if (!node.filterColumn) {
            node.filterColumn = {
                refKeyField: node.keyField,
                refNameField: node.nameField,
                entity: node.entity,
                title: node.title,
                type: isDate ? 'date' : isInput ? '' : 'lookup',
                allowCombobox: true,
                id: node.id,
            };

            if (node.schemeName) {
                node.filterColumn.renderLookup = () => gc.renderSelectingGraph(node)
            }
        }

        return (
            <div
                className="graph-filter"
                key={`fltrdiv_${node.id}_${gc.id}_`}
            >
                <span
                    key={`fltrttl_${node.id}_${gc.id}_`}
                    //style={{ gridColumn: 'span 3', width: '100%' }}
                    className='graph-filter-title'
                >
                    {node.title}
                </span>

                <FieldEdit
                    keyPref={node.id + '_filter_'}
                    column={node.filterColumn}
                    entity={node.entity}
                    value={node.multi ? node._selectedOptions : node.value}
                    text={isInput || isDate ? node.value : node.value !== undefined && node.value !== '' && node.selectedText ? node.selectedText() : ''}
                    findFieldEdit={() => { return node.filterColumn._fieldEditObj; }}
                    large={true}
                    multi={node.multi}
                    init={
                        (fe) => {
                            node.filterColumn._fieldEditObj = fe;

                            if (node.multi) {
                                fe._selectedOptions = node._selectedOptions;
                                const texts = [];
                                fe.value = fe.getValueFromCombobox(texts);
                                fe.text = texts.join(', ');
                            }
                            else {
                                fe.value = node.value;
                                fe.text = node.selectedText ? node.selectedText() : node._selectedText;
                            }
                        }
                    }
                    onChange={(e) => {
                        const fe = node.filterColumn._fieldEditObj;
                        node.value = e.value;
                        node.text = e.text;
                        node._selectedOptions = fe._selectedOptions;

                        gc.saveGraphConfig();

                        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
                        gc.refreshState();
                    }}
                    disabled={gc.isEditing()}
                >
                </FieldEdit>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridTab(node, top) {
        const gc = this;
        if (+node.status !== +NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0 && node.parents.indexOf(gc.activeDetail) < 0 && node.uid !== gc.activeDetail) return <></>;

        const isActive = top && node.uid === gc.activeMaster || !top && node.uid === gc.activeDetail;
        return (
            <button
                key={`tabctrl_${node.id}_${gc.id}_`}
                disabled={isActive || gc.isEditing() ? 'disabled' : ''}
                className={gc.tabControlButtonClass || BaseComponent.theme.tabControlButtonClass || 'graph-tabcontrol-button'}
                onClick={(e) => gc.selectActiveTab(node, top)}
            >
                {node.title}
            </button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridInGraph(node, top) {
        const gc = this;

        if (!node || !node.visible || +node.status !== +NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0 && node.parents.indexOf(gc.activeMaster) < 0 && node.uid !== gc.activeDetail) return <></>;

        return gc.renderGrid(node, NodeStatus.grid, top);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onGridInit(grid, title, status, top) {
        grid.status = status;
        grid.visible = true;
        grid.isBottom = !top;
        grid.title = title;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGrid(node, status, top) {
        const gc = this;

        return (
            node.entity ?
                <GridINU
                    findGrid={(props) => gc.replaceGrid(props)}
                    graph={gc.graph}
                    uid={node.uid !== undefined ? node.uid : node.id}
                    entity={node.entity}
                    init={(grid) => gc.onGridInit(grid, node.title, status, top)}
                >
                </GridINU>
                :
                <GridFL
                    findGrid={(props) => gc.replaceGrid(props)}
                    graph={gc.graph}
                    uid={node.uid !== undefined ? node.uid : node.id}
                    init={(grid) => gc.onGridInit(grid, node.title, status, top)}
                >
                </GridFL>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectFilterValue(e, node) {
        const gc = this;
        if (!node) return;

        node.value = e.selectedValue || node.selectedValue();
        const selectedText = e.selectedText || node.selectedText();
        const selectedValues = e.selectedValues || node.selectedValues();

        const fe = node.filterColumn._fieldEditObj;

        node._selectedText = node.text = selectedText;

        node._selectedOptions = selectedValues;

        if (node.multi) {
            fe._selectedOptions = selectedValues;
            const texts = [];
            fe.value = fe.getValueFromCombobox(texts);
            fe.text = texts.join(', ');
        }
        else {
            fe.value = node.value;
            fe.text = node.selectedText ? node.selectedText() : node._selectedText;
        }

        gc.saveGraphConfig();

        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });

        fe.lookupIsShowing = false;
        gc.refreshState();
        //gc.closeFilterWnd();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //onGridRowDblClick(e, node, row) {
    //    const gc = this;

    //    if (+node.status === +NodeStatus.filter) {
    //        if (!node.multi) {
    //            gc.selectFilterValue(e);
    //        }
    //    }
    //    else if (+node.status === +NodeStatus.grid) {
    //        if (!node.viewRecordDisabled(e)) {
    //            node.viewRecord(e);
    //        }
    //    }
    //}
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
        node._forceRefresh = true;
        //if (!gc.isTop(node)) {
        //    node.refresh();
        //}

        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getScheme(e) {
        const gc = this;

        return new Promise(function (resolve, reject) {

            const params = [
                { key: 'graphScheme', value: gc.schemeName },
                { key: 'configUid', value: gc.uid }
            ];

            GLObject.dataGetter.get({ url: 'system/graphScheme', params: params }).then(
                (obrGraph) => {
                    gc.prepareGraph(obrGraph);

                    resolve(gc.graph, e);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGraphInfo(e) {
        const gc = this;

        return new Promise(function (resolve, reject) {

            if (!gc.graph || !gc.graph.uid) {
                resolve({});
                return;
            }

            const params = [
                { key: 'configUid', value: gc.graph.uid }
            ];

            GLObject.dataGetter.get({ url: 'system/getGraphSettings', params: params }).then(
                (gInfo) => {
                    resolve(gInfo);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    saveGraphConfig() {
        const gc = this;
        if (gc.noSaveConfig || !gc.graph || !gc.graph.uid) return;

        let savingData = {};
        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];
            if (node.value === undefined || node.value === '') continue;

            let so = { u: node.uid, v: node.value, o: [] };
            if (node._selectedOptions) {
                for (let opt of node._selectedOptions) {
                    so.o.push({ v: opt.value, t: opt.label });
                }
            }
            else if (node._selectedRows) {
                for (let uid in node._selectedRows) {
                    let row = node._selectedRows[uid];
                    so.o.push({ v: row[node.keyField], t: row[node.nameField] });
                }
            }
            so.t = so.o.length === 1 ? so.o[0].t : `${so.o.length} ${node.translate('items selected')}`;

            so.s = node.pageSize;
            so.n = node.pageNumber;

            savingData[node.uid] = so;
        }

        const params = [
            { key: 'configUid', value: gc.graph.uid },
            { key: 'gdata', value: savingData },
        ];

        GLObject.dataGetter.get({ url: 'system/saveGraphSettings', params: params, type: 'text' }).then(
            (res) => {
            }
        );
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
                node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, entity: node.entity });
            }

            node.pageSize = 100;
            node.pageNumber = pageNum || 1;
            //node.pageNumber = +e.Page || 1;

            ev.grid = node;

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
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setEditing(node, value) {
        const gc = this;
        if (node.uid === gc.activeMaster) {
            gc._masterIsEditing = value;
        }
        else if (node.uid === gc.activeDetail) {
            gc._detailIsEditing = value;
        }
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getValueFromCombobox(node, changeValue, saveConfig) {
        const gc = this;
        node._selectedOptions = node._selectedOptions || [];
        let arr = [];
        if (changeValue) {
            node._selectedRows = {}
        }

        for (let opt of node._selectedOptions) {
            arr.push(opt.value);
            if (changeValue) {
                let fakeRow = {};
                fakeRow[node.keyField] = opt.value;
                fakeRow[node.nameField] = opt.label;
                node._selectedRows[opt.value] = fakeRow;
            }
        }

        const res = arr.join(',');
        if (changeValue) {
            node.value = res;
            if (saveConfig) {
                gc.saveGraphConfig();
            }
        }

        return res;
    }
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

        grid = GLObject.gridCreator.CreateGridClass(props);

        delete grid.refreshState;

        grid._replaced = true;
        grid.graph = graph;

        const obr = graph.nodesDict[grid.uid];
        grid.id = obr.id !== undefined ? obr.id : grid.id;

        grid.uid = obr.uid;
        grid.title = obr.title || grid.title;
        grid.nameField = obr.nameField || grid.nameField;
        grid.keyField = obr.keyField || grid.keyField;

        grid.pageSize = obr.pageSize !== undefined && obr.pageSize !== null ? obr.pageSize : grid.pageSize;

        graph.nodesDict[grid.uid] = grid;

        grid.allowEditGrid = obr.allowEdit;
        grid.allowAdd = obr.allowAdd;
        grid.allowCopy = obr.allowCopy;
        grid.allowDelete = obr.allowDelete;
        grid.allowView = obr.allowView;

        grid.beforeOpen = obr.beforeOpen;

        const beforeOpenFromProps = gc.nodeBeforeOpenCondition ? gc.nodeBeforeOpenCondition[grid.uid] : '';
        if (beforeOpenFromProps) {
            grid.beforeOpen = (grid.beforeOpen ? ' and ' : '') + beforeOpenFromProps;
        }

        grid._forceRefresh = obr._forceRefresh;

        grid.multi = obr.multi;

        grid.schemeName = obr.schemeName;
        grid.inSchemeUid = obr.inSchemeUid;

        if (gc.selectingNodeUid === grid.uid) {
            grid.isSelecting = true;
            grid.onSelectValue = () => {
                gc.onSelectFilterValue({ selectedValue: grid.selectedValue(), selectedText: grid.selectedText(), selectedValues: grid.selectedValues() });
            };
        }
        else {
            grid.onSelectValue = (e) => gc.selectFilterValue(e);
        }

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

        if (obr._selectedOptions) {
            grid._selectedOptions = obr._selectedOptions;

            if (grid.filterType === FilterType.combobox) {
                gc.getValueFromCombobox(grid, true);
            }
        }

        grid.columns = obr.columns || grid.columns;
        grid.getColumns = obr.getColumns || grid.getColumns;

        if (grid.columns && grid.columns.length > 0) {
            grid.prepareColumns();
        }

        grid.getRows = obr.getRows || grid.getRows;

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

        //grid.onRowDblClick = (e, row) => gc.onGridRowDblClick(e, grid, row);

        grid.remSetEditing = grid.setEditing;
        grid.setEditing = (value) => { grid.remSetEditing(value); gc.setEditing(grid, value); };
        grid.isEditing = () => { return gc.isEditing(); };

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

        gc.graph.checkNeedTriggerWave = (node) => { return gc.checkNeedTriggerWave(node) };

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            node.graph = gc.graph;
            gc.graph.nodeCount++;

            node.opt = node.opt || {};

            //BaseComponent.theme.Apply(node);

            node.translate = node.translate || ((text) => { return text; });

            if (node._readonly !== undefined) {
                node.readonly = node._readonly;
                delete node._readonly;
            }

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

            if (node.status === NodeStatus.filter && node.filterType === FilterType.combobox) {
                node.multi = true;
            }

            if (node.status === NodeStatus.filter && !node.entity && node.filterType === FilterType.combobox) {
                node.status = NodeStatus.hidden;
            }
        }

        for (let lid in gc.graph.linksDict) {
            let link = gc.graph.linksDict[lid];

            link.parent = link.parent ? gc.graph.nodesDict[link.parent] : link.parent;
            link.child = link.child ? gc.graph.nodesDict[link.child] : link.child;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    applyRestoredParams(gInfo) {
        const gc = this;
        if (!gInfo || !gc.graph) return;

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            let obr = gInfo[uid];
            if (!obr) continue;

            node.value = obr.v || node.value;
            if (obr.o && obr.o.length > 0) {
                node._selectedOptions = obr.o;
            }

            if (node.value && obr.t) {
                node._selectedText = obr.t;
            }

            node.pageSize = node.pageSizes && node.pageSizes.indexOf(+obr.s) >= 0 ? +obr.s : node.pageSize;
            node.pageNumber = +obr.n >= 0 ? +obr.n : node.pageNumber;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}