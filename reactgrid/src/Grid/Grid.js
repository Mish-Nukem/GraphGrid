import { useState, useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BaseComponent, log } from './Base';
import { DefaultGridTheme as Theme } from './Themes/DefaultGridTheme';
//import { BootstrapTheme as NewTheme } from './Themes/BootstrapGridTheme';
import { DefaultGridTheme as NewTheme } from './Themes/DefaultGridTheme';
// ==================================================================================================================================================================
export function Grid(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        grid = new GridClass(props);
        needGetRows = !props.noAutoRefresh;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.log(' 0.1 ReactGrid(). state = ' + grid.stateind);

    if (!grid.refreshState) {
        grid.refreshState = function () {
            grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
            setState({ grid: grid, ind: grid.stateind++ });
        }
    }

    useEffect(() => {
        grid.setupEvents(grid);

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }

        if (grid.columns.length <= 0 && grid.getColumns) {
            grid.getColumns();
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

        window._gridSeq = window._gridSeq || 0;

        const grid = this;

        grid.opt = { zInd: 1 };

        grid.id = window._gridSeq++;

        grid.log(' 0.0 Grid Constructor ');

        if (props.getRows) {
            grid.getRows = props.getRows;// || function ({ filters }) { return new Promise(function (resolve, reject) { resolve([]) }); };
        }

        grid.getColumns = props.getColumns || grid.getColumns;

        grid.opt.zInd = props.zInd || 1;

        grid.selectedRowIndex = 0;

        grid.rows = [];
        grid.columns = [];

        grid.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    log(message, pref) {
        const grid = this;
        log(`${pref ? pref : `grid#${grid.id}`} : ` + message);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetRows() {
        const grid = this;
        grid.log(' 1.0 getRows(). rows = ' + grid.rows.length);

        if (grid.columns.length <= 0) {
            grid.columns = grid.getColumns();
            grid.prepareColumns(grid.columns);

            grid.log(' 1.1 prepareColumns(). columns = ' + grid.columns.length);
        }
        grid.calculatePagesCount();

        grid.onSelectedRowChanged({ grid: grid, prev: grid.selectedRowIndex, new: grid.selectedRowIndex });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static applyTheme(grid) {
        if (Theme !== undefined && !grid.themeApplied) {
            const theme = new Theme();
            theme.applyTheme(grid);

            if (NewTheme !== undefined) {
                const newtheme = new NewTheme();
                newtheme.applyTheme(grid);
            }

            grid.themeApplied = true;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const grid = this;
        grid.clearEvents = function () { }

        GridClass.applyTheme(grid);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    removeEvents() {
        const grid = this;
        grid.clearEvents();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    calculatePagesCount() {
        const grid = this;
        grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    refresh() {
        const grid = this;
        grid.ready = false;

        grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
            rows => {
                grid.rows = rows;
                grid.afterGetRows();
                grid.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    collectFilters() {
        return [];
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    remove() {
        const grid = this;

        const gridElement = document.getElementById(`grid_${grid.id}_${grid.stateind}_`);
        gridElement.setAttribute('display', 'none');

        grid.removeEvents();

        setTimeout(function () {
            gridElement.remove();
        }, 10);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;

        let w = 0;
        for (let col of grid.columns) {
            w += col.w;
        }

        grid.log(' 3.1 RENDER(). columns = ' + grid.columns.length + '. w = ' + w + '. rows = ' + grid.rows.length);

        return (
            <table
                id={`grid_${grid.id}_${grid.stateind}_`}
                className={grid.opt.gridClass || 'grid-default'}
                style={{ width: w + "px" }}
            >
                {grid.renderHeader()}
                {grid.renderBody()}
            </table>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeader(columns, context) {
        const grid = this;
        columns = columns || grid.columns;

        if (!columns) return '';

        return (
            <thead>
                <tr>
                    {columns.map((col, ind) => {
                        return (
                            <th
                                key={`${col.id}_${col.w}_${grid.stateind}_`}
                                grid-header={`${grid.id}_${col.id}_` + grid.stateind + '_' + col.w}
                                className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                                style={{ position: "sticky", top: 0, width: col.w + "px", overflow: "hidden", verticalAlign: "top" }}
                                onMouseDown={(e) => grid.mouseDownColumnDrag(e, col)}
                                onMouseOver={(e) => grid.mouseOverColumnDrag(e, col)}
                                onMouseOut={(e) => grid.mouseOutColumnDrag(e, col)}
                            >
                                <div
                                    className={`grid-header-div-default ${grid.opt.headerDivClass || 'grid-header-div'}`}
                                >
                                    {grid.renderHeaderCell(col, context)}
                                </div>
                                <div
                                    grid-rsz-x={`${grid.id}_${col.id}`}
                                    style={{ position: "absolute", right: "-6px", top: "-1px", cursor: "e-resize", height: "100%", width: "12px", zIndex: (grid.opt.zInd + 1) }}
                                    onMouseDown={(e) => { e.detail === 2 ? grid.mouseResizerDoubleClick(e, col) : grid.mouseResizerClick(e, col) }}
                                >
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col, context) {
        return (this.translate(col.title || col.name));
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderBody() {
        const grid = this;
        grid.log(' 5.1 RenderBody().');
        log(' -------------------------------- ');

        if (!grid.columns || !grid.rows) return;

        return (
            <tbody>
                {
                    grid.rows.map((row, rind) => {
                        return (
                            <tr
                                key={`row_${rind}_${grid.stateind}_`}
                                className={grid.selectedRowIndex === rind ? `grid-selected-row ${grid.opt.selectedRowClass || ''}` : ''}
                                onMouseDown={(e) => grid.onSelectGridRow(e)}
                            >
                                {grid.renderRow(row, rind)}
                            </tr>
                        );
                    })
                }
            </tbody>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderRow(row, rowInd) {
        const grid = this;
        return grid.columns.map((col, cind) => {
            return (
                <td
                    key={`cell_${rowInd}_${cind}_${grid.stateind}_`}
                >
                    {grid.renderCell(col, row)}
                </td>
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderCell(col, row) {
        const val = row[col.name];
        return val !== undefined ? val : '';
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
    prepareColumns(columns) {
        const grid = this;
        grid.columns = columns || grid.columns || [];
        grid.colDict = grid.colDict || {};
        grid.columnsDefaultOrder = [];

        let id = 0;
        for (let col of grid.columns) {
            col.id = id++;
            col.title = col.title || col.name;
            col.w = col.initW = col.w || 100;
            col.minW = col.minW || 30;
            col.grid = grid;
            grid.colDict[col.id] = grid.colDict[col.name] = col;
        }

        Object.assign(grid.columnsDefaultOrder, grid.columns);
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
    onSelectedRowChanged(e) {
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
        function drawMovingColumn(pageX, pageY) {
            fakeGrid = fakeGrid || grid.addFakeGrid(e, column, th);

            const x = pageX + 10;

            fakeGrid.style.left = x + 'px';
        }
        function onMouseMove(e) {
            drawMovingColumn(e.clientX/*e.pageX*/, e.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        function onMouseUp(e) {
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

        fakeGrid.className = grid.opt.gridClass || 'grid-default';
        fakeGrid.style = grid.opt.style || '';
        fakeGrid.style.zIndex = ++window._wndZInd || 1000;
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
    mouseOutColumnDrag(e, column) {
        const grid = this;
        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        if (!grid._movingColumn) return;

        grid.clearMovingClass(th);

        delete grid._targetColumn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectGridRow(e) {
        const grid = this;

        const gridElement = e.target.closest('TABLE');

        const prevSelectedIndex = grid.selectedRowIndex;

        if (e.target.parentElement.rowIndex - 1 === prevSelectedIndex) return;

        const rows = gridElement.tBodies[0].rows;

        const prevSelRow = rows[grid.selectedRowIndex];
        prevSelRow.classList.remove('grid-selected-row');
        if (grid.opt.selectedRowClass) {
            prevSelRow.classList.remove(grid.opt.selectedRowClass);
        }

        grid.selectedRowIndex = e.target.parentElement.rowIndex - 1;
        const newSelRow = rows[grid.selectedRowIndex];
        newSelRow.classList.add(`grid-selected-row`);
        if (grid.opt.selectedRowClass) {
            newSelRow.classList.add(grid.opt.selectedRowClass);
        }

        grid.onSelectedRowChanged({ grid: grid, prev: prevSelectedIndex, new: grid.selectedRowIndex });
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
            fakeDiv.innerHTML = renderToStaticMarkup(grid.renderCell(column, row));
            contentSize = Math.max(contentSize, parseInt(getComputedStyle(fakeDiv).width));
        }

        const newW = contentSize + 12;//Math.max(column.w, contentSize);

        if (newW !== initW) {
            column.w = newW;
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

        const shiftX = e.pageX;//e.clientX;
        const columns = column.grid.columns;

        let otherColsW = 0;
        for (let col of columns) {
            if (col === column) continue;
            otherColsW += col.w;
        }

        let resizing;
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        function resize(pageX) {
            if (shiftX > 0) {
                let w = initW + pageX - shiftX;

                const prevW = column.w;
                column.w = (!column.maxW || w <= column.maxW) && (!column.minW || w >= column.minW) ? w : column.w;

                if (column.w !== prevW) {
                    gridElement.style.width = '';

                    th.style.width = column.w + 'px';

                    gridElement.style.width = (otherColsW + column.w) + 'px';
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
        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            gridElement.ondragstart = remDS;
            gridElement.onselectstart = remSS;

            if (resizing) {
                resizing = false;
                if (initW !== column.w) {
                    grid.refreshState();
                }
            }
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------