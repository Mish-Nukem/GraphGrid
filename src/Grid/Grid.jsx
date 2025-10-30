import { useState, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BaseComponent, log } from './Base';
import { OverlayClass } from './Overlay';
import Moment from 'moment';
// ==================================================================================================================================================================
export function Grid(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid != null) {
        grid = null;
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridClass(props);
        needGetRows = !props.noAutoRefresh;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.opt.selectedRowClass = props.selectedRowClass || BaseComponent.theme.selectedRowClass || '';

    //grid.log(` 0.1 ReactGrid(). state = ${grid.stateind}`);

    grid.refreshState = function () {
        //grid.log(` -------------- refreshState ${grid.stateind} --------------- `);
        setState({ grid: grid, ind: grid.stateind++ });
    }

    useEffect(() => {
        grid.setupEvents(grid);

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid._waitingRows = true;
            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            ).finally(() => {
                grid._waitingRows = false;
                grid.refreshState();
            });
        }
        else if (grid.columns.length <= 0 && grid.getColumns) {
            grid.prepareColumns().then(() => grid.refreshState());
        }

        return () => {
            grid.clearEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GridClass extends BaseComponent {
    constructor(props) {
        super(props);

        const grid = this;

        grid.opt = { zInd: props.zInd || 1 };

        grid.id = GridClass._seq++;

        if (props.getRows) {
            grid.getRows = props.getRows;
        }

        grid._waitingRows = true;

        grid.getColumns = props.getColumns || grid.getColumns;

        grid.selectedRowIndex = 0;

        grid.keyField = props.keyField;
        grid.nameField = props.nameField;

        grid._selectedRowsDict = {};
        if (props.renderCell) {
            grid.defaultRenderCell = grid.renderCell;
            grid.renderCell = props.renderCell;
        }

        grid.dateFormat = props.dateFormat || 'DD.MM.YYYY';
        grid.dateTimeFormat = props.dateTimeFormat || 'DD.MM.YYYY HH:mm:ss';

        grid.rows = [];
        grid.columns = [];

        grid.stateind = 0;

        grid.frozenHeader = props.frozenHeader == null ? true : props.frozenHeader;
        grid.opt.selectedRowClass = props.selectedRowClass || BaseComponent.theme.selectedRowClass || '';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _seq = 0;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    log(message, pref) {
        const grid = this;
        pref = pref || `grid#${grid.id}`;
        log(`${pref} : ${message}`);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetRowsEvents() {
        const grid = this;
        grid.calculatePagesCount();
        grid.getSelectedRowIndex();
        grid.onSelectedRowChanged({ grid: grid, prev: grid.selectedRowIndex, new: grid.selectedRowIndex, source: 'afterGetRows' });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetRows() {
        const grid = this;
        grid._waitingRows = false;
        grid.log(`afterGetRows(). rows = ${grid.rows.length}. state = ${grid.stateind}`);

        if (grid.totalRows == null && grid.pageSize <= 0) {
            grid.totalRows = grid.rows && grid.rows.length ? grid.rows.length : 0;
        }

        if (grid.columns.length <= 0) {
            grid.prepareColumns().then(() => {
                grid.afterGetRowsEvents();
                grid.refreshState();
            });
        }
        else {
            grid.afterGetRowsEvents();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getSelectedRowIndex() {
        const grid = this;
        if (grid.selectedRowIndex == null || grid.selectedRowIndex < 0) {
            grid.selectedRowIndex = 0;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const grid = this;
        grid.clearEvents = function () { }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    calculatePagesCount() {
        const grid = this;
        grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    refresh() {
        const grid = this;
        grid._waitingRows = true;
        grid.refreshState();

        grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
            rows => {
                grid.rows = rows;
                grid.afterGetRows();
                grid.refreshState();
            }
        ).finally(() => {
            grid._waitingRows = false;
            grid.refreshState();
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    collectFilters() {
        return [];
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;

        grid.getGridWidth();

        grid.log(`render(). rows = ${grid.rows.length}. columns = ${grid.columns.length}. state = ${grid.stateind}`);
        log(' -------------------------------------------------------------------------------------------------------------------------------------- ');

        return (
            <div
                key={`gridDiv_${grid.id}_`}
                className="grid-div"
                style={{ maxHeight: grid.getGridMaxHeight(), overflowY: grid.frozenHeader ? 'auto' : 'hidden' }}
            >
                <table
                    key={`grid_${grid.id}_`}
                    className={grid.opt.gridClass || BaseComponent.theme.gridClass || 'grid-default'}
                    style={{ width: grid._currW + "px", tableLayout: 'fixed' }}
                >
                    {grid.renderHeader()}
                    {grid.renderBody()}
                </table>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridMaxHeight() {
        return this.frozenHeader ? '40vh' : '';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridWidth() {
        const grid = this;
        //if (grid._currW > 0) return grid._currW;

        let w = 0;
        for (let col of grid.columns) {
            if (col.visible === false) continue;
            w += col.w;
        }

        if (grid.multi) w += 20;

        grid._currW = w;
        return grid._currW;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    keyAdd() {
        return '';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    keyCellAdd() {
        const grid = this;
        return grid.stateind;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getHeaderGridTemplateColumns() {
        return 'auto 8px';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getHeaderMinHeight() {
        return '1em';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeader(columns, context) {
        const grid = this;
        columns = columns || grid.columns;

        if (!columns) return '';

        return (
            <thead>
                <tr
                /*style={{ position: "sticky", top: 0 }}*/
                >
                    {grid.multi && context !== 'fake' ? grid.renderSelectColumnHeader() : <></>}
                    {columns.map((col, ind) => {
                        return (
                            col.visible === false ? <></> :
                                <th
                                    key={`headerCell_${grid.id}_${col.id}_${col.w}_${ind}_${grid.keyAdd()}_`}
                                    grid-header={`${grid.id}_${col.id}_${col.w}_`}
                                    className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                                    style={{
                                        position: grid.frozenHeader ? "sticky" : "inherit",
                                        top: grid.frozenHeader ? 0 : undefined,
                                        zIndex: grid.frozenHeader ? 1 : undefined,
                                        width: col.w + "px",
                                        overflow: "hidden",
                                    }}
                                    onMouseDown={(e) => grid.mouseDownColumnDrag(e, col)}
                                    onMouseEnter={(e) => grid.mouseOverColumnDrag(e, col)}
                                    onMouseLeave={(e) => grid.mouseOutColumnDrag(e, col)}
                                >
                                    <div
                                        style={{ /*position: "sticky", top: 0,*/
                                            /*width: col.w + "px",*/
                                            overflow: "hidden",
                                            verticalAlign: "top",
                                            display: 'grid',
                                            gridTemplateColumns: 'calc(100% - 6px) 6px',
                                            /*marginRight: '-5px',*/
                                        }}
                                        disabled={grid._waitingRows || col.disabled ? 'disabled' : ''}
                                    >

                                        <div
                                            className={`grid-header-div-default ${grid.opt.headerDivClass || 'grid-header-div'}`}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: grid.getHeaderGridTemplateColumns(col),
                                                alignItems: 'center', //'start',//
                                                gridTemplateRows: '1.5em auto',
                                                gridAutoFlow: 'row',
                                                width: 'calc(100% + 8px)',
                                            }}
                                        >
                                            {grid.renderHeaderCell(col, context)}
                                        </div>
                                        <div //style={{ position: "absolute", right: "-6px", top: "-1px", cursor: "e-resize", height: "100%", width: "12px", zIndex: (grid.opt.zInd + 1) }}
                                            grid-rsz-x={`${grid.id}_${col.id}`}
                                            style={{
                                                position: "relative",
                                                minHeight: grid.getHeaderMinHeight(col),
                                                cursor: "e-resize",
                                                height: "100%",
                                                /*width: "12px",*/
                                                width: "6px",
                                                left: "0px",
                                                zIndex: (grid.opt.zInd + 1)
                                            }}
                                            onMouseDown={(e) => { e.detail === 2 ? grid.mouseResizerDoubleClick(e, col) : grid.mouseResizerClick(e, col) }}
                                        >
                                        </div>
                                    </div>
                                </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectColumnHeader() {
        const grid = this;
        return (
            <th
                key={`headerCellSelectAll_${grid.id}_${grid.keyAdd()}_`}
                grid-header={`${grid.id}_select_`}
                className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                style={{ position: "sticky", top: 0, width: "20px", overflow: "hidden", verticalAlign: "top" }}
            >
                <input type='checkbox'
                    className={`grid-select-checkbox`}
                    onChange={(e) => grid.selectAllRows(e)}
                    checked={grid._allRowsOnPageSelected}
                />
            </th>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectColumn(row, rind) {
        const grid = this;
        return (
            <td
                key={`gridCellSelect_${grid.id}_${rind}_${grid.keyAdd()}_`}
            >
                <input type='checkbox'
                    className={`grid-select-checkbox`}
                    onChange={(e) => grid.selectRow(e, row)}
                    checked={grid._selectedRowsDict[row[grid.keyField]] != null}
                />
            </td>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col) {
        return (this.translate(col.title || col.name));
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderBody() {
        const grid = this;

        if (grid._waitingRows || !grid.columns || !grid.rows) {
            return (
                <tbody>
                    {
                        grid.rows && grid.rows.length > 0 ?
                            grid.rows.map((row, rind) => {
                                return (
                                    <tr key={`gridRowWait_${grid.id}_${rind}_`} className="grid-waiting" style={{ borderTop: "0", borderBottom: "0" }}>
                                        {
                                            <td colSpan={grid.columns ? grid.columns.length : 0} className="grid-waiting">
                                                {rind === Math.min(Math.floor(grid.rows.length / 2), 10) ? grid.Spinner(grid.id, Math.min(Math.max(grid._currW, 100), window.innerWidth), window.innerWidth) : <span>&nbsp;</span>}
                                            </td>
                                        }
                                    </tr>
                                );
                            })
                            :
                            <tr key={`gridRowWait_${grid.id}_0_`} >
                                {
                                    <td colSpan={grid.columns ? grid.columns.length : 0} className="grid-waiting">
                                        {grid.Spinner(grid.id, Math.min(Math.max(grid._currW, 100), window.innerWidth), window.innerWidth)}
                                    </td>
                                }
                            </tr>
                    }
                </tbody>
            );
        }

        return (
            <tbody>
                {
                    grid.rows.map((row, rind) => {
                        let selected = grid.isRowSelected(row, rind);
                        return (
                            <tr
                                key={`gridRow_${grid.id}_${rind}_${row[grid.keyField]}_${grid.keyAdd()}_${grid.keyCellAdd(selected)}_`}
                                className={selected ? `grid-selected-row ${grid.opt.selectedRowClass || ''}` : ''}

                                onDoubleClick={(e) => {
                                    if (!grid._clicksDisabled) grid.onRowDblClick(e, row);
                                    e.stopPropagation();
                                }}
                                onClick={(e) => {
                                    if (!grid._clicksDisabled) grid.onSelectGridRow(e);
                                    e.stopPropagation();
                                }}
                            >
                                {grid.renderRow(row, rind, selected)}
                            </tr>
                        );
                    })
                }
                {
                    grid.renderAdditionalRows()
                }
            </tbody>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderAdditionalRows() {
        return <></>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isRowSelected(row, rowInd) {
        const grid = this;
        return grid.selectedRowIndex === rowInd;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderRow(row, rowInd, selected) {
        const grid = this;
        return (
            <>
                {grid.multi ? grid.renderSelectColumn(row) : <></>}
                {
                    grid.columns.map((col, cind) => {
                        return (
                            col.visible === false ? <></> :
                                <td
                                    key={`gridCell_${grid.id}_${rowInd}_${cind}_${grid.keyAdd()}_${row[grid.keyField]}_`}
                                >
                                    {grid.renderCell(grid, col, row, selected)}
                                </td>
                        );
                    })
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCell(grid, col, row) {
        let val = row[col.name];

        if (col.type === 'date' && val) {
            val = Moment(val, grid.dateFormat).format(grid.dateFormat);
        }

        if (col.allowVerticalResize) {
            return (
                <div style={{ display: 'flex' }}>
                    <textarea
                        key={`cellTextarea_${col.id}_`}
                        className={col.inputClass}
                        value={val != null ? val : ''}
                        style={{
                            width: 'calc(100% - 0px)',
                            minHeight: !col.inputClass ? col.textareaH : col.h,
                            height: '1.8em',
                            padding: '0',
                            boxSizing: 'border-box',
                            gridColumn: 'span 3',
                            resize: 'vertical',
                            overflow: 'hidden',
                            border: '0',
                        }}
                        readOnly={true}
                    >
                    </textarea>
                </div>
            );
        }

        return (<span className='grid-cell' style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' }}>{val != null ? val : ''}</span>);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getColumns() {
        const grid = this;
        const res = [];
        grid.colDict = {};

        for (let row of grid.rows) {
            for (let key in row) {
                if (grid.colDict[key]) continue;

                const col = grid.getColumn(key);

                grid.colDict[col.name] = col;
                res.push(col);
            }
        }

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getColumn(name) {
        return { name: name };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetColumns() {
        const grid = this;
        grid.columns = grid.columns || [];
        grid.colDict = grid.colDict || {};

        let id = 0;
        for (let col of grid.columns) {
            col.id = id++;
            col.title = col.title || col.name;
            col.w = col.initW = col.w || 100;
            col.minW = col.minW || 50;
            col.grid = grid;
            grid.colDict[col.id] = grid.colDict[col.name] = grid.colDict[col.name.toLowerCase()] = col;
        }

        if (!grid.columnsDefaultOrder) {
            grid.columnsDefaultOrder = [];
            Object.assign(grid.columnsDefaultOrder, grid.columns);
        }

        delete grid._waitingColumns;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async prepareColumns() {
        const grid = this;

        if (grid._waitingColumns) return;

        grid._waitingColumns = true;

        if (grid.getColumns && (!grid.columns || grid.columns.length <= 0)) {
            grid.columns = await grid.getColumns();
            grid.afterGetColumns();
        }
        else {
            grid.afterGetColumns();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsOrderToDefault() {
        const grid = this;
        let columns = [];
        Object.assign(columns, grid.columnsDefaultOrder);

        grid.refreshState();
        grid.columns = columns;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsWidthsToDefault() {
        const grid = this;
        for (let col of grid.columns) {
            if (col.w === col.initW) continue;

            col.w = col.initW;
        }
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectedRowChanged() {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseDownColumnDrag(e, column) {
        const grid = this;
        if (grid.columns.length < 2) return;

        if (e.target.tagName === 'INPUT' || e.target.hasAttribute('grid-rsz-x')) return;

        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        grid._movingColumn = column;

        let fakeGrid;
        function drawMovingColumn(pageX) {
            fakeGrid = fakeGrid || grid.addFakeGrid(e, column, th);

            const x = pageX + 10;

            fakeGrid.style.left = x + 'px';
        }
        function onMouseMove(ev) {
            drawMovingColumn(ev.clientX);

            grid._skipClickColumn = column;
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        function onMouseUp() {
            //e.preventDefault();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (fakeGrid) {
                fakeGrid.remove();
            }
            grid.clearMovingClass(th);

            if (grid._movingColumn && grid._targetColumn && grid._movingColumn !== grid._targetColumn) {

                const newColumns = [];
                for (let col of grid.columns) {
                    switch (col) {
                        case grid._movingColumn:
                            break;
                        case grid._targetColumn:
                            if (grid.columns.indexOf(grid._movingColumn) > grid.columns.indexOf(grid._targetColumn)) {
                                newColumns.push(grid._movingColumn);
                                newColumns.push(grid._targetColumn);
                            }
                            else {
                                newColumns.push(grid._targetColumn);
                                newColumns.push(grid._movingColumn);
                            }
                            break;
                        default:
                            newColumns.push(col);
                            break;
                    }
                }
                grid.columns = newColumns;
                grid.afterDragColumn(column);
                grid.refreshState();
            }

            delete grid._movingColumn;
            delete grid._targetColumn;
        };
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addFakeGrid(e, column, th) {
        const grid = this;
        const rect = th.getBoundingClientRect();
        const fakeGrid = document.createElement('table');

        fakeGrid.className = grid.opt.gridClass || BaseComponent.theme.gridClass || 'grid-default';
        fakeGrid.style = grid.opt.style || '';
        fakeGrid.style.zIndex = ++OverlayClass._zInd || 1000;
        fakeGrid.style.position = 'fixed';
        fakeGrid.style.top = (e.offsetY || 0 + rect.top + 5) + 'px';
        fakeGrid.style.width = rect.width + 'px';
        fakeGrid.style.height = rect.height + 'px';

        fakeGrid.innerHTML = renderToStaticMarkup(grid.renderHeader([column], 'fake'));

        document.body.append(fakeGrid);
        return fakeGrid;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearMovingClass = function (th) {
        if (th.classList.contains('grid-header-drag-over')) {
            th.classList.remove('grid-header-drag-over');
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseOverColumnDrag(e, column) {
        const grid = this;
        if (!grid._movingColumn || !grid.colDict) return;

        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        grid._targetColumn = column;

        th.classList.add('grid-header-drag-over');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseOutColumnDrag(e) {
        const grid = this;
        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        if (!grid._movingColumn) return;

        grid.clearMovingClass(th);

        delete grid._targetColumn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onRowDblClick() {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async canLeaveRow() {
        return true;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async onSelectGridRow(e) {
        const grid = this;

        const gridElement = e.target.closest('TABLE');
        if (!gridElement) return;

        const rows = gridElement.tBodies[0].rows;
        const clickedRow = e.target.closest('TR');

        const prevSelectedIndex = grid.selectedRowIndex;
        const newSelectedIndex = clickedRow.rowIndex - 1;

        if (newSelectedIndex === prevSelectedIndex) return;

        const saved = await grid.canLeaveRow(prevSelectedIndex);

        if (!saved) return;


        const prevSelRow = rows[grid.selectedRowIndex];
        if (prevSelRow) {
            prevSelRow.classList.remove('grid-selected-row');
            if (grid.opt.selectedRowClass) {
                prevSelRow.classList.remove(grid.opt.selectedRowClass);
            }
        }

        grid.selectedRowIndex = newSelectedIndex;
        const newSelRow = rows[grid.selectedRowIndex];
        newSelRow.classList.add(`grid-selected-row`);
        if (grid.opt.selectedRowClass) {
            newSelRow.classList.add(grid.opt.selectedRowClass);
        }

        grid.onSelectedRowChanged({ grid: grid, prev: prevSelectedIndex, new: grid.selectedRowIndex, source: 'rowClick' });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getKeyColumn() {
        const grid = this;
        if (grid.keyField) return grid.keyField;

        if (!grid.columns || grid.columns.length <= 0) return '';

        for (let col of grid.columns) {
            if (col.name.toLowerCase() === 'id') {
                grid.keyField = col.name;
                break;
            }
        }

        grid.keyField = grid.keyField || grid.columns[0].name;
        return grid.keyField;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedRow() {
        const grid = this;

        if (grid.selectedRowIndex == null || !grid.rows || grid.rows.length <= 0 || grid.selectedRowIndex < 0 || grid.selectedRowIndex >= grid.rows.length) return;

        return grid.rows[grid.selectedRowIndex];
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedValue(delim) {
        const grid = this;

        const keyColumn = grid.getKeyColumn();
        if (!grid.multi) {
            const row = grid.selectedRow();

            return row != null ? row[keyColumn] : '';
        }
        else {
            delim = delim || ',';
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                res.push(row[keyColumn]);
            }
            return res.join(delim);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedText(delim) {
        const grid = this;
        if (!grid.nameField) return '';

        if (!grid.multi) {
            const row = grid.selectedRow();
            return row != null ? row[grid.nameField] : '';
        }
        else {
            delim = delim || ',';
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                res.push(row[grid.nameField]);
            }
            return res.join(delim);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedRows() {
        const grid = this;
        return grid._selectedRowsDict || {};
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedValues(texts) {
        const grid = this;
        texts = texts || [];

        const keyColumn = grid.getKeyColumn();
        if (!grid.multi) {
            const row = grid.selectedRow();

            return row != null ? [{ value: row[keyColumn], label: row[grid.nameField] }] : [];
        }
        else {
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                let text = row[grid.nameField];
                texts.push(text);
                res.push({ value: row[keyColumn], label: text });
            }
            return res;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectRow(e, row) {
        const grid = this;
        const keyColumn = grid.getKeyColumn();

        if (grid._selectedRowsDict[row[keyColumn]]) {
            delete grid._selectedRowsDict[row[keyColumn]];
        }
        else {
            grid._selectedRowsDict[row[keyColumn]] = row;
        }

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectAllRows() {
        const grid = this;
        const keyColumn = grid.getKeyColumn();
        delete grid._selectedRows;

        grid._allRowsOnPageSelected = grid._allRowsOnPageSelected ? false : true;

        for (let row of grid.rows) {
            if (grid._allRowsOnPageSelected) {
                grid._selectedRowsDict[row[keyColumn]] = row;
            }
            else {
                delete grid._selectedRowsDict[row[keyColumn]];
            }
        }

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseResizerDoubleClick(e, column) {
        const grid = this;

        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        const initW = parseInt(th.style.width);

        const fakeDiv = document.createElement('div');
        fakeDiv.className = 'grid-header-div-default ' + (grid.opt.headerDivClass || "grid-header-div");
        fakeDiv.style.opacity = 0;
        fakeDiv.style.position = 'fixed';
        fakeDiv.innerHTML = renderToStaticMarkup(grid.renderHeaderCell(column, 'fake'));
        document.body.append(fakeDiv);

        let contentSize = Math.max(column.minW, parseInt(getComputedStyle(fakeDiv).width));

        fakeDiv.className = '';

        for (let row of grid.rows) {
            fakeDiv.innerHTML = renderToStaticMarkup(grid.renderCell(grid, column, row, false));
            contentSize = Math.max(contentSize, parseInt(getComputedStyle(fakeDiv).width));
        }

        if (column.maxW != null) {
            contentSize = Math.min(contentSize, +column.maxW);
        }

        const newW = contentSize + 12;//Math.max(column.w, contentSize);

        if (newW !== initW) {
            grid._currW = grid._currW - column.w + newW;
            column.w = newW;
            grid.afterResizeColumn(column);
            grid.refreshState();
        }

        fakeDiv.remove();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseResizerClick(e, column) {
        const grid = this;
        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        const gridElement = th.closest('TABLE');

        const initW = parseInt(getComputedStyle(th).width);

        const shiftX = e.pageX;

        let otherColsW = grid._currW - column.w;

        //const div = e.target.parentElement;

        let resizing;
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        function resize(pageX) {
            if (shiftX > 0) {
                let w = initW + pageX - shiftX;

                const prevW = column.w;
                column.w = (!column.maxW || w <= column.maxW) && (!column.minW || w >= column.minW) ? w : column.w;

                if (column.w !== prevW) {
                    grid._currW = otherColsW + column.w;

                    gridElement.style.width = '';

                    th.style.width = column.w + 'px';
                    //div.style.width = column.w + 'px';

                    gridElement.style.width = grid._currW + 'px';
                }
            }
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        function onMouseMove(e) {
            resizing = true;
            resize(e.pageX);
        }

        const remDS = gridElement.ondragstart;
        gridElement.ondragstart = function () {
            return false;
        };

        const remSS = gridElement.onselectstart;
        gridElement.onselectstart = function () {
            return false;
        };
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            gridElement.ondragstart = remDS;
            gridElement.onselectstart = remSS;

            if (resizing) {
                resizing = false;
                if (initW !== column.w) {
                    grid.afterResizeColumn(column);
                    grid.refreshState();
                }
            }
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterResizeColumn() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterDragColumn() { }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}