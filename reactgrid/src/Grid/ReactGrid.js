﻿import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useState, useEffect } from 'react';
// ==================================================================================================================================================================
export default function ReactGrid(props) {
    window._gridSeq = window._gridSeq || 0;

    //window._logEnabled = true;

    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid || new ReactGridClass(props);

    if (props.init) {
        props.init(grid);
    }

    log(' 0.1 Reinit. rows = ' + grid.rows.length + '. state = ' + grid.stateind);

    if (!grid.refreshState) {
        grid.refreshState = function () {
            log('refreshState ' + grid.stateind);
            setState({ grid: grid, ind: grid.stateind++ });
        }
    }

    return (grid.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
function log(message) {
    if (!window._logEnabled) return;

    console.log(message);
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class ReactGridClass {
    constructor(props) {
        log(' 0.0 Grid Constructor ');

        const grid = this;

        this.opt = { zInd: 1 };

        this.id = window._gridSeq++;

        //resolve([{ id: 0, text: 'obj_1' }, { id: 1, text: 'obj_2' }, { id: 2, text: 'obj_3' }])
        this.getRows = props.getRows || function ({ filters }) { return new Promise(function (resolve, reject) { resolve([]) }); }; 

        this.getColumns = props.getColumns || this.getColumns;

        this.opt.zInd = props.zInd || 1;

        this.selectedRowIndex = 0;

        this.rows = [];
        this.columns = [];

        this.stateind = 0;

        this.setupGridEvents();

        if (!props.noAutoRefresh && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid.getRows({ filters: grid.collectFilters ? grid.collectFilters() : [] }).then(
                rows => {
                    grid.rows = rows;

                    log(' 1.0 getRows(). rows = ' + rows.length);

                    if (grid.columns.length <= 0) {
                        grid.columns = grid.getColumns();
                        grid.prepareColumns(grid.columns);

                        log(' 1.1 prepareColumns()');
                    }
                    grid.calculatePagesCount();

                    log(' 2.0 columns = ' + grid.columns.length);

                    grid.onSelectedRowChanged({ grid: grid, prev: grid.selectedRowIndex, new: grid.selectedRowIndex });

                    grid.refreshState();
                }
            );
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupGridEvents() {
        log(' 0.1 setupGridEvents');

        const grid = this;

        grid.setupColumnDrag();

        document.addEventListener('click', function (e) {
            grid.onSelectGridRow(e);
        });

        document.addEventListener('mousedown', function (e) {
            grid.setupColumnResize(e);
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    translate(text, context) {
        return text;
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

        grid.getRows({ filters: grid.collectFilters ? grid.collectFilters() : [] }).then(
            rows => {
                grid.rows = rows;

                if (grid.columns.length <= 0) {
                    grid.columns = grid.getColumns();
                    grid.prepareColumns(grid.columns);
                }
                grid.calculatePagesCount();

                grid.onSelectedRowChanged({ grid: grid, prev: grid.selectedRowIndex, new: grid.selectedRowIndex });

                grid.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    remove() {
        const grid = this;

        const gridElement = document.getElementById(`grid_${grid.id}_${grid.stateind}_`);
        gridElement.setAttribute('display', 'none');

        document.removeEventListener('click', grid.onSelectGridRow);
        document.removeEventListener('mousedown', grid.setupColumnResize);

        grid.removeColumnDrag();

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

        log(' 3.1 RENDER(). columns = ' + grid.columns.length + '. w = ' + w);

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
    renderHeader(columns) {
        const grid = this;
        columns = columns || grid.columns;

        if (!columns) return '';

        return (
            <thead>
                <tr>
                    {columns.map((col, ind) => {
                        return (
                            <th
                                key={col.id + '_' + col.w + '_'}
                                grid-header={`${grid.id}_${col.id}_` + grid.stateind + '_' + col.w}
                                className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                                style={{ position: "sticky", top: 0, width: col.w + "px", overflow: "hidden", verticalAlign: "top" }}
                            >
                                <div
                                    className={`grid-header-div-default ${grid.opt.headerDivClass || 'grid-header-div'}`}
                                >
                                    {grid.renderHeaderCell(col)}
                                </div>
                                <div
                                    grid-rsz-x={`${grid.id}_${col.id}`}
                                    style={{ position: "absolute", right: "-6px", top: "-1px", cursor: "e-resize", height: "100%", width: "12px", zIndex: (grid.opt.zInd + 1) }}
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
        log(' 5.1 RenderBody(). rows = ' + grid.rows.length);
        log(' 5.3 ------------------------------ ');

        if (!grid.columns || !grid.rows) return;

        return (
            <tbody>
                {
                    grid.rows.map((row, rind) => {
                        return (
                            <tr
                                key={'row_' + rind + '_'}
                                className={grid.selectedRowIndex === rind ? `grid-selected-row ${grid.opt.selectedRowClass || ''}` : ''}
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
                    key={'cell_' + rowInd + '_' + cind + '_'}
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

                const col = { name: key };

                grid.colDict[col.name] = col;
                res.push(col);
            }
        }

        return res;
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
    setupColumnDrag() {
        const grid = this;
        const addFakeGrid = function (e, column, th) {
            const rect = th.getBoundingClientRect();
            const fakeGrid = document.createElement('table');

            fakeGrid.className = grid.opt.gridClass || 'grid-default';
            fakeGrid.style = grid.opt.style || '';
            fakeGrid.style.zIndex = 1000;
            fakeGrid.style.position = 'fixed';
            fakeGrid.style.top = (e.offsetY + rect.top) + 'px';
            fakeGrid.style.width = rect.width + 'px';
            fakeGrid.style.height = rect.height + 'px';

            fakeGrid.innerHTML = renderToStaticMarkup(grid.renderHeader([column]));

            document.body.append(fakeGrid);
            return fakeGrid;
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseDown = function (e) {
            if (e.target.tagName === 'INPUT' || e.target.hasAttribute('grid-rsz-x')) return;

            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const [, columnId] = th.getAttribute('grid-header').split('_');
            if (!grid.colDict) return;
            const column = grid.colDict[columnId];

            if (grid.columns.length < 2) return;

            grid._movingColumn = column;

            let fakeGrid;
            function drawMovingColumn(pageX, pageY) {
                fakeGrid = fakeGrid || addFakeGrid(e, column, th);

                const x = pageX + 10;

                fakeGrid.style.left = x + 'px';
            }
            function onMouseMove(e) {
                drawMovingColumn(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (fakeGrid) {
                    fakeGrid.remove();
                }
                clearMovingClass(e);

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
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseOver = function (e) {
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const [, columnId] = th.getAttribute('grid-header').split('_');
            if (!grid._movingColumn || !grid.colDict) return;

            const column = grid.colDict[columnId];

            if (e.target.hasAttribute('grid-rsz-x')) {
                e.target.style.cursor = "default";
            }

            grid._targetColumn = column;

            th.classList.add('grid-header-drag-over');
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseOut = function (e) {
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            if (!grid._movingColumn) return;

            if (e.target.hasAttribute('grid-rsz-x')) {
                e.target.style.cursor = "e-resize";
            }

            clearMovingClass(e, th);

            delete grid._targetColumn;
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const clearMovingClass = function (e, th) {
            th = th || e.target.closest('TH');

            if (!th) return;

            if (th.classList.contains('grid-header-drag-over')) {
                th.classList.remove('grid-header-drag-over');
            }
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseDoubleClick = function (e) {
            if (!e.target.hasAttribute('grid-rsz-x')) return;

            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const gridElement = th.closest('TABLE');

            const [, columnId] = th.getAttribute('grid-header').split('_');

            const column = grid.colDict[columnId];

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
                th.style.width = newW + 'px';
                gridElement.style.width = (parseInt(gridElement.style.width) + newW - initW) + 'px';

                grid.refreshState();
            }

            fakeDiv.remove();
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        document.addEventListener('mousedown', mouseDown);
        document.addEventListener('mouseover', mouseOver);
        document.addEventListener('mouseout', mouseOut);
        document.addEventListener('dblclick', mouseDoubleClick);
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        this.removeColumnDrag = function () {
            document.removeEventListener('mousedown', mouseDown);
            document.removeEventListener('mouseover', mouseOver);
            document.removeEventListener('mouseout', mouseOut);
            document.removeEventListener('dblclick', mouseDoubleClick);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSelectGridRow(e) {
        const grid = this;
        if (e.target.tagName !== 'TD') return;

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
    setupColumnResize(e) {
        if (e.target.tagName === 'INPUT') return;

        if (!e.target.hasAttribute('grid-rsz-x')) return;

        const th = e.target.closest('TH');
        if (!th || !th.hasAttribute('grid-header')) return;

        const gridElement = th.closest('TABLE');

        const grid = this;
        const [, columnId] = e.target.getAttribute('grid-rsz-x').split('_');

        if (!grid) return;

        const column = grid.colDict[columnId];

        const initW = parseInt(getComputedStyle(th).width);

        const shiftX = e.target.hasAttribute('grid-rsz-x') ? e.clientX : -1;
        const columns = column.grid.columns;

        let otherColsW = 0;
        for (let col of columns) {
            if (col === column) continue;
            otherColsW += col.w;
        }

        let resizing;
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
        function onMouseUp(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            gridElement.ondragstart = remDS;
            gridElement.onselectstart = remSS;

            if (resizing) {
                if (initW !== column.w) {
                    grid.refreshState();
                }
                resizing = false;
            }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------