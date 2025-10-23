/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass } from './Graph';
import { GridFL, GridFLClass } from './GridFL';
import { GridINU, GridINUClass } from './GridINU';
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

    gc.selectingNodeValue = props.selectingNodeValue;
    gc.selectingNodeObject = props.selectingNodeObject;

    gc.refreshState = function (full) {
        gc._fullRefresh = full != null;
        setState({ graphComponent: gc, ind: gc.stateind++ });
    }

    useEffect(() => {
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

        gc.stateind = 0;

        window._graphSeq = window._graphSeq || 0;

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
        gc.selectingNodeMulti = props.selectingNodeMulti;
        gc.onSelectFilterValue = props.onSelectFilterValue;
        gc.nodeBeforeOpenCondition = props.nodeBeforeOpenCondition;

        gc.filterButtonClass = props.filterButtonClass;
        gc.filterInputClass = props.filterInputClass;
        gc.tabControlButtonClass = props.tabControlButtonClass;

        gc.prevGraph = props.prevGraph;
        gc.prevGrid = props.prevGrid;

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
            return gc.Spinner();
        }

        const topFilters = [];
        const lowFilters = [];
        const topGrids = [];
        const lowGrids = [];

        const keys = Object.keys(gc.graph.nodesDict);
        keys.sort();

        for (let uid of keys) {
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

        const topFilterWidth = topFilters.length <= 2 ? 400 : topFilters.length === 3 ? 300 : 250;
        const lowFilterWidth = lowFilters.length <= 2 ? 400 : lowFilters.length === 3 ? 300 : 250;

        if (gc._fullRefresh) {
            delete gc._fullRefresh;
            return <></>;
        }

        return (
            <>
                <div key={`graphAll_${gc.id}_`}>
                    {
                        topFilters.length <= 0 ? <></>
                            :
                            <div
                                key={`topFiltersMainDiv_${gc.id}_`}
                                className="graph-filters-div"
                                style={{ height: gc.topFiltersCollapsed ? '' : '', display: 'grid', gridTemplateColumns: '2.2em auto', alignItems: 'center', columnGap: '0.2em' }}
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
                                        <div
                                            key={`filtersTop_${gc.id}_`}
                                            className="graph-filter-line"
                                            style={{ gridTemplateColumns: `repeat(auto-fit, ${topFilterWidth}px)`, columnGap: '1em', display: 'grid' }}
                                        >
                                            {
                                                topFilters.map((node) => { return gc.renderFilter(node, true) })
                                            }
                                        </div>
                                        :
                                        <></>
                                }
                            </div>
                    }
                    <div className="graph-tabcontrol-buttons" key={`tabsTop_${gc.id}_`}>
                        {
                            topGrids.map((node) => { return gc.renderGridTab(node, true) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridsTop_${gc.id}_`}>
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
                                style={{ height: gc.lowFiltersCollapsed ? '0' : '', display: 'grid', gridTemplateColumns: '2.2em auto', alignItems: 'center', columnGap: '0.2em' }}
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
                                        <div
                                            key={`filtersLow_${gc.id}_`}
                                            className="graph-filter-line"
                                            style={{ gridTemplateColumns: `repeat(auto-fit, ${lowFilterWidth}px)` }}
                                        >
                                            {
                                                lowFilters.map((node) => { return gc.renderFilter(node, false) })
                                            }
                                        </div>
                                        :
                                        <></>
                                }
                            </div>
                    }
                    <div className="graph-tabcontrol-buttons" key={`tabsLow_${gc.id}_`}>
                        {
                            lowGrids.map((node) => { return gc.renderGridTab(node, false) })
                        }
                    </div>
                    <div className="graph-grid" key={`gridsLow_${gc.id}_`}>
                        {
                            gc.renderGridInGraph(gc.graph.nodesDict[gc.activeDetail], false)
                        }
                    </div>
                </div>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

        if (+node.status !== +NodeStatus.filter || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        if (gc.isTop(node) && node.children.indexOf(gc.activeMaster) < 0) return <></>;

        const isInput = node.filterType === FilterType.input;
        const isDate = node.filterType === FilterType.date;

        if (!node.fakeColumn) {
            node.schemeInfo = GLObject.gridCreator.GetSchemeInfo(node.entity, gc.schemeName);

            node.fakeColumn = {
                refKeyField: node.keyField,
                refNameField: node.nameField,
                entity: node.entity,
                title: node.title,
                type: isDate ? 'date' : isInput ? '' : 'lookup',
                allowCombobox: true,
                id: node.id,
                schemeInfo: node.schemeInfo,
                value: node.value,
                _selectedOptions: node._selectedOptions || [],
                multi: node.multi,
                prevGraph: gc.graph,
            };
        }
        else {
            node.fakeColumn.value = node.value;
            node.fakeColumn._selectedOptions = node._selectedOptions || [];
        }

        return (
            <div
                className="graph-filter"
                key={`filterDiv_${node.id}_${gc.id}_`}
            >
                <span
                    key={`filterTitle_${node.id}_${gc.id}_`}
                    className='graph-filter-title'
                >
                    {node.title + (node.multi && node._selectedOptions && node._selectedOptions.length > 1 ? ` (${node._selectedOptions.length})` : '')}
                </span>

                <FieldEdit
                    keyPref={node.id + '_filter_'}
                    column={node.fakeColumn}
                    entity={node.entity}
                    comboboxValues={node.comboboxValues}
                    value={node.value}
                    selectedOptions={node._selectedOptions}
                    text={isInput || isDate ? node.value : node.value != null && node.value !== '' && node.selectedText ? node.selectedText() : ''}
                    findFieldEdit={() => { return node.fakeColumn._fieldEditObj; }}
                    large={true}
                    multi={node.multi}
                    getFilters={() => {
                        return node.collectFilters ? node.collectFilters() : [];
                    }}
                    noCache={true}
                    level={gc.level}
                    init={
                        (fe) => {
                            node.fakeColumn._fieldEditObj = fe;
                        }
                    }
                    onChange={(e) => {
                        const fe = node.fakeColumn._fieldEditObj;
                        node.value = e.value;
                        node.text = e.text;
                        node._selectedOptions = fe._selectedOptions || [];

                        gc.graph.triggerWave({
                            nodes: [node], withStartNodes: false, afterAllVisited: () => {
                                gc.saveGraphConfig();
                            }
                        });
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
                key={`tabcontrol_${node.id}_${gc.id}_`}
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
        const gc = this;

        if (grid._grpahInitialized) return;
        grid._grpahInitialized = true;

        grid.status = status;
        grid.visible = true;
        grid.isBottom = !top;
        grid.title = title;

        if (gc.selectingNodeUid === grid.uid) {
            grid.getSelectedRowIndex();
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGrid(node, status, top) {
        const gc = this;

        return (
            node.entity ?
                <GridINU
                    findGrid={(props) => gc.replaceGrid(props)}
                    graph={gc.graph}
                    uid={node.uid != null ? node.uid : node.id}
                    entity={node.entity}
                    controller={GLObject.gridCreator.GetEntityController(node)}
                    init={(grid) => gc.onGridInit(grid, node.title, status, top)}
                >
                </GridINU>
                :
                <GridFL
                    findGrid={(props) => gc.replaceGrid(props)}
                    graph={gc.graph}
                    uid={node.uid != null ? node.uid : node.id}
                    init={(grid) => gc.onGridInit(grid, node.title, status, top)}
                >
                </GridFL>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectActiveTab(node, top) {
        const gc = this;
        const isActive = top && node.uid === gc.activeMaster || !top && node.uid === gc.activeDetail;

        if (+node.status !== +NodeStatus.grid || gc.isTop(node) !== top || isActive) return;

        if (top) {
            gc.activeMaster = node.uid;

            const dnode = gc.graph.nodesDict[gc.activeDetail];
            if (dnode && dnode.parents.indexOf(node.uid) < 0) {
                delete gc.activeDetail;
            }
        }
        else {
            gc.activeDetail = node.uid;
        }

        for (let uid in gc.graph.nodesDict) {
            let lnode = gc.graph.nodesDict[uid];
            if (node === lnode || +lnode.status !== +NodeStatus.grid) continue;

            if (gc.isTop(node) === gc.isTop(lnode)) {
                lnode.visible = false;
            }

            if (gc.isTop(node) && !gc.isTop(lnode)) {
                lnode.visible = lnode.parents.indexOf(node.uid) >= 0;
                if (lnode.visible && !gc.activeDetail) gc.activeDetail = lnode.uid;
            }
        }

        node.visible = true;
        node._forceRefresh = true;

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
            if (node.value == null || node.value === '') continue;

            let so = { u: node.uid, v: node.value, o: [] };
            if (node._selectedOptions) {
                for (let opt of node._selectedOptions) {
                    so.o.push({ v: opt.value, t: opt.label });
                }
            }
            else if (node._selectedRowsDict) {
                for (let uid in node._selectedRowsDict) {
                    let row = node._selectedRowsDict[uid];
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

            if (filter != null && filter !== '') {
                ev.filters = [`${node.nameField} starts ${filter}`];
            }

            if (!node._replaced) {
                node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, entity: node.entity });
            }

            node.pageSize = 100;
            node.pageNumber = pageNum || 1;

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
        return node.isBottom == null || node.isBottom === false;
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
            node._selectedRowsDict = {}
        }

        for (let opt of node._selectedOptions) {
            arr.push(opt.value);
            if (changeValue) {
                let fakeRow = {};
                fakeRow[node.keyField] = opt.value;
                fakeRow[node.nameField] = opt.label;
                node._selectedRowsDict[opt.value] = fakeRow;
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

        grid.refreshState = (() => { });

        grid._replaced = true;
        grid.graph = graph;

        grid.parentComponent = gc;

        const obr = graph.nodesDict[grid.uid];
        grid.id = obr.id != null ? obr.id : grid.id;

        grid.level = obr.level;

        grid.uid = obr.uid;
        grid.title = obr.title || grid.title;
        grid.nameField = obr.nameField || grid.nameField;
        grid.keyField = obr.keyField || grid.keyField;

        grid.pageSize = obr.pageSize != null ? obr.pageSize : grid.pageSize;

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

        grid.isBottom = obr.isBottom;

        grid.schemeName = obr.schemeName;
        grid.inSchemeUid = obr.inSchemeUid;

        grid.controller = GLObject.gridCreator.GetEntityController(grid);

        if (gc.selectingNodeUid === grid.uid) {
            grid.multi = gc.selectingNodeMulti != null ? gc.selectingNodeMulti : grid.multi;
            grid.isSelecting = true;
            grid.onSelectValue = (e) => {
                gc.onSelectFilterValue(e); //{ selectedValue: grid.selectedValue(), selectedText: grid.selectedText(), selectedValues: grid.selectedValues() }
            };
            if (gc.selectingNodeObject) {
                const obj = gc.selectingNodeObject;
                grid.value = obj.value;
                if (obj.multi) {
                    grid.multi = true;
                    grid._selectedRowsDict = {};
                    for (let row of obj._selectedOptions) {
                        let fr = {};
                        fr[grid.keyField] = row.value;
                        fr[grid.nameField] = row.label;
                        grid._selectedRowsDict[row.value] = fr;
                    }
                }
            }
            else {
                grid.value = '';
                grid._selectedRowsDict = {};
            }
        }
        //else {
        //    grid.onSelectValue = (e) => gc.selectFilterValue(e);
        //}

        if (obr.status != null) {
            grid.status = obr.status;
        }

        if (obr.filterType != null) {
            grid.filterType = obr.filterType;
        }

        if (obr._readonly != null) {
            grid.readonly = obr._readonly;
        }

        if (obr.value != null && obr.value !== '') {
            grid.value = obr.value;
        }

        if (obr._selectedOptions) {
            grid._selectedOptions = obr._selectedOptions || [];

            if (grid.filterType === FilterType.combobox && grid._selectedOptions.length > 0) {
                gc.getValueFromCombobox(grid, true);
            }
        }

        grid.columns = obr.columns || grid.columns;
        grid.getColumns = obr.getColumns || grid.getColumns;

        if (grid.columns && grid.columns.length > 0) {
            grid.prepareColumns();
        }

        grid.getRows = obr.getRows || grid.getRows;

        if (!grid.entity && obr.rows && obr.rows.length > 0) {
            grid.rows = obr.rows;
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
                if (graph.nodesDict[uid] != null) graph.nodeCount++
            }
        }

        if (gc.selectingNode) {
            if (String(grid.id) === String(gc.selectingNode.id)) {
                gc.selectingNode = grid;

                gc.selectingNode.isSelecting = true;
            }
        }

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

        if (obrGraph.uid != null) {
            gc.graph.uid = obrGraph.uid;
        }

        gc.graph.nodeCount = 0;

        gc.graph.checkNeedTriggerWave = (node) => { return gc.checkNeedTriggerWave(node) };

        gc.graph.nodeByEntity = {};

        const prevGridSelectedRow = gc.prevGrid ? gc.prevGrid.selectedRow() : undefined;

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            node.parentComponent = gc;

            node.graph = gc.graph;
            gc.graph.nodeCount++;

            node.opt = node.opt || {};

            if (node.entity && !node._replaced) {
                node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, entity: node.entity });
            }

            node.translate = node.translate || ((text) => { return text; });

            let hasRowsAndColumns = node.columns && node.columns.length > 0 && node.rows && node.rows.length > 0;

            if (node._readonly != null) {
                node.readonly = node._readonly;
                delete node._readonly;
            }

            if (node.status === NodeStatus.grid) {
                node.level = gc.level || 0;

                if (gc.isTop(node)) {
                    if (gc.activeMaster == null) {
                        gc.activeMaster = node.uid;
                        node.visible = true;
                    }
                    else {
                        node.visible = false;
                    }
                }
                else {
                    if (gc.activeDetail == null) {
                        gc.activeDetail = node.uid;
                        node.visible = true;
                    }
                    else {
                        node.visible = false;
                    }
                }
            }
            else {
                node.level = (gc.level || 0) + 1;
            }

            if (hasRowsAndColumns && !node.entity) {
                node.comboboxValues = [];
                for (let row of node.rows) {
                    node.comboboxValues.push({ value: row[node.keyField], label: row[node.nameField] });
                }
            }

            if (node.status === NodeStatus.filter && node.filterType === FilterType.combobox && node.multi == null) {
                node.multi = true;
            }

            if (node.status === NodeStatus.filter && node.filterType === FilterType.combobox && !node.entity && (!node.columns || node.columns.length <= 0) && (!node.rows || node.rows.length <= 0)) {
                node.status = NodeStatus.hidden;
            }

            if (node.status === NodeStatus.filter && node.entity) {
                gc.graph.nodeByEntity[node.entity] = node;

                if (gc.prevGraph && gc.prevGraph.nodeByEntity) {
                    const sameNode = gc.prevGraph.nodeByEntity[node.entity];
                    if (sameNode && sameNode.value) {
                        node.value = sameNode.value;
                        node.text = sameNode.text;
                        node.comboboxValues = [];

                        node._selectedOptions = [];
                        for (let so of sameNode._selectedOptions) {
                            node._selectedOptions.push(so);
                        }

                        if (node._selectedOptions.length <= 0) {
                            if (sameNode.comboboxValues && sameNode.comboboxValues.length) {
                                for (let cv of sameNode.comboboxValues) {
                                    node.comboboxValues.push(cv);
                                }
                            }
                            else {
                                node.comboboxValues.push({ value: sameNode.value, label: sameNode.text });
                            }
                        }
                    }
                }
                else if (prevGridSelectedRow) {

                    if (node.status !== NodeStatus.filter) continue;

                    node.value = node.text = '';

                    for (let pcol of gc.prevGrid.columns) {
                        if (pcol.entity === node.entity) {
                            let val = prevGridSelectedRow[pcol.name];
                            if (val != null && val !== '') {
                                node.value = prevGridSelectedRow[pcol.keyField];
                                node.text = prevGridSelectedRow[pcol.name];
                                node._selectedOptions = [{ value: node.value, label: node.text }];
                                break;
                            }
                        }
                    }
                }
            }
        }

        for (let lid in gc.graph.linksDict) {
            let link = gc.graph.linksDict[lid];

            if (link.parent !== null && typeof link.parent !== 'object') {
                link.parent = gc.graph.nodesDict[link.parent];
            }

            if (link.child !== null && typeof link.child !== 'object') {
                link.child = gc.graph.nodesDict[link.child];
            }
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
                node._selectedOptions = obr.o || [];
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