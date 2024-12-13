export default class Grid {
    constructor(options) {
        this.opt = options || {};

        window._gridDict = window._gridDict || { seq: 0 };

        this.id = window._gridDict.seq++;

        this.getRows = this.opt.getRows || this.getRows;

        this.getColumns = this.opt.getColumns || this.getColumns;

        this.opt.zInd = this.opt.zInd || 1;

        this.selectedRowIndex = 0;
    }

    createGridElement() {
        const res = {};

        res.gridElement = document.getElementById(`grid_${this.id}_`);
        if (res.gridElement) {
            res.isNew = false;
            return res;
        }

        this.parent = this.opt.parentId ? document.getElementById(this.opt.parentId) : this.parent || this.opt.parent || document.body;
        this.parentIsDocument = this.parent == document.body;

        res.gridElement = document.createElement('table');
        res.isNew = true;
        res.gridElement.id = `grid_${this.id}_`;

        res.gridElement.className = this.opt.gridClass || 'grid-default';
        res.gridElement.style = this.opt.style || '';

        window._gridDict[this.id] = this;

        res.gridElement.addEventListener('click', this.onSelectGridRow);

        this.setupColumnResize(res.gridElement);
        this.setupColumnDrug(res.gridElement);

        return res;
    }

    draw() {
        const gridElemObj = this.createGridElement();
        if (gridElemObj.isNew) {
            this.parent.appendChild(gridElemObj.gridElement);
        }
        this.drawHeader();
        this.drawBody();
    }

    afterRefresh() {
        if (!this.columns) {
            this.prepareColumns(this.getColumns());
        }
        this.pagesCount = (this.totalRows / this.pageSize | 0) + (this.totalRows % this.pageSize > 0 ? 1 : 0);
        this.draw();
        this.onSelectedRowChanged({ prev: this.selectedRowIndex, new: this.selectedRowIndex });
    }

    refresh() {
        const grid = this;

        this.getRows({
            filters: grid.collectFilters ? grid.collectFilters() : [],
            resolve: function () {
                grid.afterRefresh();
            }
        });
    }

    remove() {
        const grid = window._gridDict[this.id];
        if (!grid) return;

        delete window._gridDict[this.id];

        const gridElement = document.getElementById(`grid_${this.id}_`);
        gridElement.setAttribute('display', 'none');

        gridElement.removeEventListener('click', this.onSelectGridRow);

        setTimeout(function () {
            gridElement.remove();
        }, 10);
    }

    drawHeader(gridElement) {
        if (!this.columns && (this.getColumns || this.rows)) {
            this.prepareColumns(this.getColumns());
        }

        if (!this.columns) return;

        const colClass = this.columnClass ? `class="${this.columnClass}"` : '';

        let w = 0;
        let s = '<thead><tr>';
        for (let col of this.columns) {
            s += `<th grid-header="${this.id}_${col.id}_" ${colClass} style="position: sticky;top: 0;width: ${col.w}px;overflow: hidden;">
                    <div class="grid-header-div">
                        ${this.drawHeaderCell(col)}
                    </div>
                    <div grid-rsz-x="${this.id}_${col.id}"
                        style="position: absolute;right: -6px;top: -1px;cursor: e-resize;height:100%;width: 12px;z-index: ${this.opt.zInd + 1};">
                    </div>
                </th>`;
            w += col.w;
        }
        s += '</tr></thead>';

        gridElement = gridElement || document.getElementById(`grid_${this.id}_`);

        gridElement.style.width = (w + (this.columns.length + 1) * 2) + 'px';

        const thead = gridElement.tHead;

        if (thead) {
            thead.innerHTML = s;
        }
        else {
            gridElement.innerHTML = s;
        }
    }

    drawHeaderCell(col) {
        return col.title || col.name;
    }

    drawBody(gridElement) {
        if (!this.columns || !this.rows) return;

        let i = 0;
        let s = '<tbody>';
        for (let row of this.rows) {
            s += `<tr ${(this.selectedRowIndex == i++ ? 'class="grid-selected-row"' : '')}>`;
            for (let col of this.columns) {
                s += `<td>${this.drawCell(col, row)}</td>`;
            }
            s += '</tr>';
        }
        s += '</tbody>';

        gridElement = gridElement || document.getElementById(`grid_${this.id}_`);
        const body = gridElement.tBodies[0];

        if (body) {
            body.innerHTML = s;
        }
        else {
            gridElement.innerHTML += s;
        }
    }

    drawCell(col, row) {
        const val = row[col.name];
        return val !== undefined ? val : '';
    }

    getRows(e) {
        this.rows = [];
        if (e.resolve) {
            e.resolve(this.rows);
        }
    }

    getColumns() {
        const res = [];
        this.colDict = {};

        for (let row of this.rows) {
            for (let key in row) {
                if (this.colDict[key]) continue;

                const col = { name: key };

                this.colDict[col.name] = col;
                res.push(col);
            }
        }

        return res;
    }

    prepareColumns(columns) {
        this.columns = columns || this.columns || [];
        this.colDict = this.colDict || {};
        this.columnsDefaultOrder = [];

        let id = 0;
        for (let col of this.columns) {
            col.id = id++;
            col.title = col.title || col.name;
            col.w = col.w || 100;
            col.minW = col.minW || 30;
            col.grid = this;
            this.colDict[col.id] = this.colDict[col.name] = col;
            col.initW = col.w;
        }

        Object.assign(this.columnsDefaultOrder, this.columns);
    }

    resetColumnsOrderToDefault() {
        Object.assign(this.columns, this.columnsDefaultOrder);
        this.draw();
    }

    resetColumnsWidthsToDefault() {
        for (let col of this.columns) {
            col.w = col.initW;
        }
        this.draw();
    }

    onSelectGridRow(e) {
        if (e.target.tagName != 'TD') return;

        const [gr, id] = this.id.split('_');
        const grid = window._gridDict[id];

        const prevSelected = grid.selectedRowIndex;
        grid.selectedRowIndex = 0;

        const rows = this.tBodies[0].rows;
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            if (row == e.target.parentElement) {
                grid.selectedRowIndex = i;
                row.classList.add('grid-selected-row')

                grid.onSelectedRowChanged({ prev: prevSelected, new: i });
            }
            else {
                if (row.classList.contains('grid-selected-row')) {
                    row.classList.remove('grid-selected-row');
                }
            }
        }
    }

    onSelectedRowChanged(e) {
    }

    setupColumnResize(gridElement) {
        const mouseDown = function (e) {
            if (!e.target.hasAttribute('grid-rsz-x')) return;

            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const gridElement = th.closest('TABLE');

            const [gridId, columnId] = e.target.getAttribute('grid-rsz-x').split('_');

            const grid = window._gridDict[gridId];
            const column = grid.colDict[columnId];

            //const initW = +th.style.width.replace('px', '');
            const initW = +getComputedStyle(th).width.replace('px', '');

            const shiftX = e.target.hasAttribute('grid-rsz-x') ? e.clientX : -1;
            const columns = column.grid.columns;

            let otherColsW = 0;
            for (let col of columns) {
                if (col == column) continue;
                otherColsW += col.w;
            }

            resize(e.pageX);

            function resize(pageX) {
                if (shiftX > 0) {
                    let w = initW + pageX - shiftX;

                    const prevW = column.w;
                    column.w = (!column.maxW || w <= column.maxW) && (!column.minW || w >= column.minW) ? w : column.w;

                    if (column.w != prevW) {
                        gridElement.style.width = '';

                        th.style.width = column.w + 'px';

                        gridElement.style.width = (otherColsW + column.w + (columns.length + 1) * 2) + 'px';
                    }
                }
            }

            function onMouseMove(e) {
                resize(e.pageX);
            }

            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mousemove', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        gridElement.addEventListener('mousedown', mouseDown);
    }

    setupColumnDrug(gridElement) {
        const addFakeGrid = function (e, grid, column, th) {
            const rect = th.getBoundingClientRect();
            const fakeGrid = document.createElement('table');

            fakeGrid.className = grid.opt.gridClass || 'grid-default';
            fakeGrid.style = grid.opt.style || '';
            fakeGrid.style.zIndex = 1000;
            fakeGrid.style.position = 'fixed';
            fakeGrid.style.top = (e.pageY - e.clientY + rect.top - 10) + 'px';
            fakeGrid.style.width = rect.width + 'px';
            fakeGrid.style.height = rect.height + 'px';

            const colClass = grid.columnClass ? `class="${grid.columnClass}"` : '';

            fakeGrid.innerHTML = `<thead><tr>
                <th ${colClass} style="width: ${column.w}px">
                    <div class="grid-header-div">
                        ${grid.drawHeaderCell(column)}
                    </div>
                </th>
            </tr></thead>`;

            document.body.append(fakeGrid);
            return fakeGrid;
        }

        const mouseDown = function (e) {
            if (e.target.hasAttribute('grid-rsz-x')) return;

            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const [gridId, columnId] = th.getAttribute('grid-header').split('_');
            const grid = window._gridDict[gridId];
            const column = grid.colDict[columnId];

            grid._movingColumn = column;

            let fakeGrid;

            function drawMovingColumn(pageX, pageY) {
                fakeGrid = fakeGrid || addFakeGrid(e, grid, column, th);

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

                if (grid._movingColumn && grid._targetColumn && grid._movingColumn != grid._targetColumn) {

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

                    grid.draw();
                }

                delete grid._movingColumn;
                delete grid._targetColumn;
            };
        };

        const mouseOver = function (e) {
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const [gridId, columnId] = th.getAttribute('grid-header').split('_');
            const grid = window._gridDict[gridId];
            const column = grid.colDict[columnId];

            if (!grid._movingColumn) return;

            if (e.target.hasAttribute('grid-rsz-x')) {
                e.target.style.cursor = "default";
            }

            grid._targetColumn = column;

            const elem = e.target.parentElement.tagName == 'TH' ? e.target.parentElement.firstElementChild : e.target;

            elem.classList.add('grid-header-drug-over');
        }

        const mouseOut = function (e) {
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const [gridId, columnId] = th.getAttribute('grid-header').split('_');
            const grid = window._gridDict[gridId];

            if (!grid._movingColumn) return;

            if (e.target.hasAttribute('grid-rsz-x')) {
                e.target.style.cursor = "e-resize";
            }

            clearMovingClass(e);

            delete grid._targetColumn;
        }

        const clearMovingClass = function (e) {
            const elem = e.target.parentElement.tagName == 'TH' ? e.target.parentElement.firstElementChild : e.target;

            if (elem.classList.contains('grid-header-drug-over')) {
                elem.classList.remove('grid-header-drug-over');
            }
        }

        const mouseDoubleClick = function (e) {
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            const gridElement = th.closest('TABLE');

            const [gridId, columnId] = th.getAttribute('grid-header').split('_');
            const grid = window._gridDict[gridId];
            const column = grid.colDict[columnId];

            //if (e.target.hasAttribute('grid-rsz-x')) return;
            const initW = +th.style.width.replace('px', '');

            const fakeDiv = document.createElement('div');
            fakeDiv.className = "grid-header-div";
            fakeDiv.style.opacity = 0;
            fakeDiv.style.position = 'fixed';
            fakeDiv.innerHTML = grid.drawHeaderCell(column);
            document.body.append(fakeDiv);

            let contentSize = Math.max(column.minW, +getComputedStyle(fakeDiv).width.replace('px', ''));

            fakeDiv.className = '';

            for (let row of grid.rows) {
                fakeDiv.innerHTML = grid.drawCell(column, row);
                contentSize = Math.max(contentSize, +getComputedStyle(fakeDiv).width.replace('px', ''));
            }

            const newW = contentSize + 5;//Math.max(column.w, contentSize);

            if (newW != initW) {
                column.w = newW;
                th.style.width = newW + 'px';
                gridElement.style.width = (+gridElement.style.width.replace('px', '') + newW - initW) + 'px';
            }
        }

        gridElement.addEventListener('mousedown', mouseDown);
        gridElement.addEventListener('mouseover', mouseOver);
        gridElement.addEventListener('mouseout', mouseOut);
        gridElement.addEventListener('dblclick', mouseDoubleClick);
    }
}