/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent, NodeStatus, FilterType, log } from './Base';
import { GraphClass } from './Graph';
import { GridINU, GridINUClass } from './GridINU';
import { Modal } from './Modal';
import { Select } from './OuterComponents/Select';
import DatePicker from "react-datepicker";
import Moment from 'moment';
import { FadeLoader } from 'react-spinners';
import "react-datepicker/dist/react-datepicker.css";
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
        else {
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
        gc.dataGetter = props.dataGetter;

        gc.gridCreator = props.gridCreator || {
            CreateGridClass: (props) => {
                return new GridINUClass(props);
            }
        };

        gc.selectingNodeUid = props.selectingNodeUid;
        gc.onSelectFilterValue = props.onSelectFilterValue;

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
    /*
                        gc.selectingNode.filterType === FilterType.date ?
                            <Modal
                                title={gc.selectingNode.title}
                                renderContent={() => { return gc.renderDatePicker() }}
                                pos={gc.selectingDatePos}
                                onClose={(e) => gc.closeFilterWnd(e)}
                                init={(wnd) => { wnd.visible = gc.nodeSelectIsShowing; }}
                                dimensionsByContent={true}
                                closeWhenMiss={true}
                                closeWhenEscape={true}
                                noHeader={true}
                                noFooter={true}
                                noPadding={true}
                                resizable={false}
                                margin={'1em'}
                            >
                            </Modal>
                            :

    */
    render() {
        const gc = this;

        if (!gc.visible) {
            return <></>;
        }

        if (!gc.graph) {
            return <div className='grid-loader'><FadeLoader /></div>;
        }

        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];
            if (node.status !== NodeStatus.filter || node._replaced) continue;

            node = gc.replaceGrid({ graph: gc.graph, uid: node.uid, dataGetter: gc.dataGetter || node.dataGetter, entity: node.entity });
        }

        const topFilters = [];
        const lowFilters = [];
        const topGrids = [];
        const lowGrids = [];
        for (let uid in gc.graph.nodesDict) {
            let node = gc.graph.nodesDict[uid];

            if (node.status === NodeStatus.filter) {
                const comboValue = gc.getValueFromCombobox(node);
                if (node.value !== comboValue) {
                    node._selectedOptions = node.value !== undefined && node.value !== '' ? [{ value: node.value, label: node.selectedText() }] : [];
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
                <div key={`graphall_${gc.id}_`}>
                    <div className="graph-filter-line" key={`filterstop_${gc.id}_`}>
                        {
                            topFilters.map((node) => { return gc.renderFilter(node, true) })
                        }
                    </div>
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
                    <div className="graph-filter-line" key={`filterslow_${gc.id}_`}>
                        {
                            lowFilters.map((node) => { return gc.renderFilter(node, false) })
                        }
                    </div>
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
                {
                    gc.nodeSelectIsShowing ?
                        <Modal
                            title={gc.selectingNode.title}
                            renderContent={() => { return gc.renderSelectingFilterGrid(gc.selectingNode) }}
                            pos={gc.selectingNodePos}
                            onClose={(e) => gc.closeFilterWnd(e)}
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
    renderSelectingFilterGrid(node) {
        const gc = this;
        return !node.schemeName ? gc.renderGrid(node, NodeStatus.filter, true) : gc.renderSelectingGraph(node);

        //    return (
        //        <GridINU
        //            findGrid={(props) => gc.replaceGrid(props)}
        //            graph={gc.graph}
        //            uid={node.uid || node.id}
        //            entity={node.entity}
        //            dataGetter={gc.dataGetter || node.dataGetter}
        //            init={(grid) => {
        //                grid.status = NodeStatus.filter;
        //                grid.visible = true;
        //                grid.title = node.title;
        //            }}
        //        >
        //        </GridINU>
        //    );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectingGraph(selectingNode) {
        const gc = this;
        return <Graph
            uid={`${gc.uid}_select_${selectingNode.uid}_`}
            schemeName={selectingNode.schemeName}
            selectingNodeUid={selectingNode.inSchemeUid}
            dataGetter={gc.dataGetter}
            onSelectFilterValue={(e) => gc.selectFilterValue(e)}
        >
        </Graph >;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    /*
    renderDatePicker() {
        const gc = this;
        return (
            <DatePicker
                date={gc.selectingNode.value}
                onSelect={(date) => {
                    gc.selectingNode.value = date;
                    gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
                    gc.closeFilterWnd();
                }}
            ></DatePicker>
        );
    }
    */
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFilter(node, top) {
        const gc = this;

        if (+node.status !== +NodeStatus.filter || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

        if (gc.isTop(node) && node.children.indexOf(gc.activeMaster) < 0) return <></>;

        let parsedDate;
        if (node.filterType === FilterType.date && node.value) {
            //parsedDate = parse(node.value, node.dateFormat, new Date());
            parsedDate = Moment(node.value, node.dateFormat);
        }

        return (
            <div
                className="graph-filter"
                key={`fltrdiv_${node.id}_${gc.id}_`}
            >
                <span
                    key={`fltrttl_${node.id}_${gc.id}_`}
                    style={{ gridColumn: 'span 3', width: '100%' }}
                    className='graph-filter-title'
                >
                    {node.title}
                </span>
                {
                    node.filterType === FilterType.combobox ?
                        <Select
                            value={node._selectedOptions}
                            isMulti={node.multi}
                            getOptions={(filter, pageNum) => gc.promiseOptions(filter, node, pageNum)}
                            onChange={(e) => {
                                node._selectedOptions = node.multi ? e : [e];
                                gc.getValueFromCombobox(node, true, true);
                                gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
                                gc.refreshState();
                            }}
                            init={(e) => { node.setComboboxValue = e.setComboboxValue; }}
                            disabled={gc.isEditing()}
                        >
                        </Select>
                        :
                        node.filterType === FilterType.date ?
                            <div
                                style={{
                                    width: '100%',
                                    height: '2em',
                                    minHeight: '2em',
                                    padding: '0',
                                    gridColumn: 'span 2',
                                    overflowX: 'hidden',
                                }}
                                className="datepicker-filter"
                            >

                                <DatePicker
                                    selected={parsedDate}
                                    locale="ru"
                                    dateFormat={node.datePickerDateFormat}
                                    showMonthDropdown
                                    showYearDropdown
                                    onSelect={(date) => {
                                        node.value = Moment(date, node.dateFormat).format(node.dateFormat);//format(date, node.dateFormat);
                                        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
                                        gc.refreshState();
                                    }}
                                    disabled={gc.isEditing()}
                                ></DatePicker>
                            </div>
                            :
                            <input
                                key={`fltrinp_${node.id}_${gc.id}_`}
                                style={{ width: '100%', padding: '0 2px', boxSizing: 'border-box', height: '2.3em', gridColumn: node.filterType === FilterType.input ? 'span 2' : '' }}
                                value={
                                    node.filterType !== FilterType.date ?
                                        node.filterType !== FilterType.input ?
                                            (node.value !== undefined && node.selectedText ? node.selectedText() : '')
                                            :
                                            node.value
                                        :
                                        (node.value !== undefined ? node.value : '')
                                }
                                readOnly={node.filterType !== FilterType.input}
                                disabled={gc.isEditing() ? 'disabled' : ''}
                                onChange={(e) => {
                                    const prevValue = e.target.value;
                                    node.value = e.target.value;
                                    gc.refreshState();

                                    setTimeout(() => {
                                        if (prevValue === e.target.value) {

                                            gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
                                        }
                                    }, 150);

                                }}
                            ></input>
                }
                {
                    node.filterType !== FilterType.input && node.filterType !== FilterType.date ?
                        <button
                            className={node.opt.filterButtonClass || 'graph-filter-button'}
                            key={`fltrsel_${node.id}_${gc.id}_`}
                            onClick={(e) => gc.openFilterWnd(e, node)}
                            disabled={gc.isEditing() ? 'disabled' : ''}
                        >
                            {node.images.filterSelect ? node.images.filterSelect() : node.translate('Select', 'graph-filter-select')}
                        </button>
                        : <></>
                }
                <button
                    key={`fltrclr_${node.id}_${gc.id}_`}
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
                key={`tabctrl_${node.id}_${gc.id}_`}
                disabled={isActive || gc.isEditing() ? 'disabled' : ''}
                className={node.opt.filterButtonClass || ''}
                onClick={(e) => gc.selectActiveTab(node, top)}
            >
                {node.title}
            </button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderGridInGraph(node, top) {
        const gc = this;

        if (!node.visible || +node.status !== +NodeStatus.grid || gc.isTop(node) !== top) return <></>;

        if (!gc.isTop(node) && node.parents.indexOf(gc.activeMaster) < 0) return <></>;

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
            <GridINU
                findGrid={(props) => gc.replaceGrid(props)}
                graph={gc.graph}
                uid={node.uid !== undefined ? node.uid : node.id}
                entity={node.entity}
                dataGetter={gc.dataGetter || node.dataGetter}
                init={(grid) => gc.onGridInit(grid, node.title, status, top)}
            >
            </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openFilterWnd(e, node) {
        const gc = this;

        gc.selectingDatePos = gc.selectingDatePos || { x: e.clientX || 100, y: e.clientY || 100, w: 800, h: 600 };
        gc.selectingNodePos = gc.selectingNodePos || { x: e.clientX || 100, y: e.clientY || 100, w: 800, h: 600 };

        gc.selectingNodePos.x = e.clientX || gc.selectingNodePos.x;
        gc.selectingNodePos.y = e.clientY || gc.selectingNodePos.y;

        gc.selectingDatePos.x = e.clientX || gc.selectingDatePos.x;
        gc.selectingDatePos.y = e.clientY || gc.selectingDatePos.y;

        if (node.value) {
            node.activeRow = node.value;
        }

        gc.selectingNode = node;
        gc.selectingNode.isSelecting = true;

        gc.nodeSelectIsShowing = true;
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    closeFilterWnd(e) {
        const gc = this;
        gc.nodeSelectIsShowing = false;
        if (gc.selectingNode) {
            gc.selectingNode.isSelecting = false;
            gc.selectingNode = null;
        }
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearFilter(e, node) {
        const gc = this;
        node.value = '';
        node._selectedOptions = [];
        if (node.setComboboxValue) {
            node.setComboboxValue([]);
        }

        gc.saveGraphConfig();

        gc.graph.triggerWave({ nodes: [node], withStartNodes: false });
        gc.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectFilterValue(e) {
        const gc = this;
        if (!gc.selectingNode) return;

        gc.selectingNode.value = e.selectedValue || gc.selectingNode.selectedValue();
        const selectedText = e.selectedText || gc.selectingNode.selectedText();
        const selectedValues = e.selectedValues || gc.selectingNode.selectedValues();

        if (gc.selectingNode.setComboboxValue) {
            if (gc.selectingNode.multi) {
                gc.selectingNode.setComboboxValue(selectedValues);
            }
            else {
                gc.selectingNode.setComboboxValue([{ value: gc.selectingNode.value, label: selectedText }]);
            }
        }
        else {
            gc.selectingNode._selectedOptions = selectedValues;
            gc.selectingNode._selectedText = selectedText;
        }

        gc.selectingNode.isSelecting = false;
        gc.saveGraphConfig();

        gc.graph.triggerWave({ nodes: [gc.selectingNode], withStartNodes: false });
        gc.closeFilterWnd();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onGridRowDblClick(e, node, row) {
        const gc = this;

        if (+node.status === +NodeStatus.filter) {
            if (!node.multi) {
                gc.selectFilterValue(e);
            }
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
                { key: 'graphScheme', value: gc.schemeName }
            ];

            gc.dataGetter.get({ url: 'system/graphScheme', params: params }).then(
                (schemeObj) => {
                    gc.prepareGraph(schemeObj);

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

            gc.dataGetter.get({ url: 'system/getGraphSettings', params: params }).then(
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

            savingData[node.uid] = so;
        }

        const params = [
            { key: 'configUid', value: gc.graph.uid },
            { key: 'gdata', value: savingData },
        ];

        gc.dataGetter.get({ url: 'system/saveGraphSettings', params: params, type: 'text' }).then(
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

        // TODO: сделать создание разных форм, в зависимости от контекста
        grid = gc.gridCreator.CreateGridClass(props);  //new GridINUClass(props);

        delete grid.refreshState;

        grid._replaced = true;
        grid.graph = graph;

        const obr = graph.nodesDict[grid.uid];
        grid.id = obr.id !== undefined ? obr.id : grid.id;

        grid.uid = obr.uid;
        grid.title = obr.title || grid.title;
        grid.nameField = obr.nameField || grid.nameField;
        grid.keyField = obr.keyField || grid.keyField;

        graph.nodesDict[grid.uid] = grid;

        grid.allowEditGrid = obr.allowEditGrid;
        grid.allowAdd = obr.allowAdd; 
        grid.allowCopy = obr.allowCopy; 
        grid.allowDelete = obr.allowDelete; 
        grid.allowView = obr.allowView; 

        grid.beforeOpen = obr.beforeOpen;

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

            gc.getValueFromCombobox(grid, true);
        }

        grid.columns = obr.columns || grid.columns;
        grid.getColumns = obr.getColumns || grid.getColumns;

        if (grid.columns && grid.columns.length > 0) {
            grid.prepareColumns();
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

        grid.onRowDblClick = (e, row) => gc.onGridRowDblClick(e, grid, row);

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
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}