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
        let gridElement = document.getElementById(`grid_${this.id}_`);
        if (gridElement) return false;

        this.parent = this.opt.parentId ? document.getElementById(this.opt.parentId) : this.parent || this.opt.parent || document.body;
        this.parentIsDocument = this.parent == document.body;

        gridElement = document.createElement('table');
        gridElement.id = `grid_${this.id}_`;

        gridElement.className = this.opt.gridClass || 'grid-default';
        gridElement.style = this.opt.style || '';

        this.parent.append(this.drawToolbar(true));
        this.parent.append(this.drawPager(true));

        this.parent.appendChild(gridElement);

        this.parent.append(this.drawPager(true, true));

        window._gridDict[this.id] = this;

        gridElement.addEventListener('click', this.onSelectGridRow);

        return true;
    }

    draw() {
        if (!this.createGridElement()) {
            this.drawToolbar(false);
            this.drawPager(false);
            this.drawPager(false, true);
        }
        this.drawHeader();
        this.drawBody();
    }

    afterRefresh() {
        if (!this.columns) {
            this.prepareColumns(this.getColumns());
        }
        this.draw();
        this.onSelectedRowChanged({ prev: this.selectedRowIndex, new: this.selectedRowIndex });
    }

    refresh() {
        const grid = this;

        this.getRows({
            resolve: function () {
                grid.afterRefresh();
            //    if (!grid.columns) {
            //        grid.prepareColumns(grid.getColumns());
            //    }
            //    grid.draw();
            //    grid.onSelectedRowChanged({ prev: grid.selectedRowIndex, new: grid.selectedRowIndex });
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

    drawToolbar(full) {
        return '';
    }

    drawPager(full, bottom) {
        return '';
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
            s += `<th grid-header id="col_${this.id}_${col.id}_" ${colClass} style="position: sticky;top: 0;width: ${col.w}px;overflow: hidden;">
                    <div class="grid-header-div">
                        ${this.drawHeaderCell(col)}
                    </div>
                    <div grid-rsz-x
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

        const grid = this;
        setTimeout(function () {
            let i = 0;
            for (let th of gridElement.tHead.rows[0].children) {
                let col = grid.columns[i++];
                grid.setupColumnResize(col, th, gridElement);
                grid.setupColumnDrug(col, th, gridElement);
            }
        }, 10);
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
        }

        Object.assign(this.columnsDefaultOrder, this.columns);
    }

    resetColumnsOrderToDefault() {
        Object.assign(this.columns, this.columnsDefaultOrder);
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

    setupColumnResize(column, th, gridElement) {
        const mouseDown = function (e) {

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

            document.addEventListener('mousemove', onMouseMove);

            const rem = document.onmouseup;
            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = rem;
            };
        };

        th.querySelector('div[grid-rsz-x]').addEventListener('mousedown', mouseDown);

        th.ondragstart = function () {
            return false;
        };
    }

    setupColumnDrug(column, th, gridElement) {
        const grid = column.grid;
        const columns = column.grid.columns;

        const addFakeGrid = function (e) {
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

            grid._movingColumn = column;

            let fakeGrid;

            function drawMovingColumn(pageX, pageY) {
                fakeGrid = fakeGrid || addFakeGrid(e);

                const x = pageX + 10;

                fakeGrid.style.left = x + 'px';
            }

            function onMouseMove(e) {
                drawMovingColumn(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            const rem = document.onmouseup;
            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = rem;

                if (fakeGrid) {
                    fakeGrid.remove();
                }
                clearMovingClass(e);

                if (grid._movingColumn && grid._targetColumn && grid._movingColumn != grid._targetColumn) {

                    const newColumns = [];
                    for (let col of columns) {
                        switch (col) {
                            case grid._movingColumn:
                                break;
                            case grid._targetColumn:
                                if (columns.indexOf(grid._movingColumn) > columns.indexOf(grid._targetColumn)) {
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
            if (!grid._movingColumn) return;

            if (e.target.hasAttribute('grid-rsz-x')) {
                e.target.style.cursor = "default";
            }

            grid._targetColumn = column;

            const elem = e.target.parentElement.tagName == 'TH' ? e.target.parentElement.firstElementChild : e.target;

            elem.classList.add('grid-header-drug-over');
        }

        const mouseOut = function (e) {
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
            //if (e.target.hasAttribute('grid-rsz-x')) return;
            const initW = +th.style.width.replace('px', '');

            const fakeDiv = document.createElement('div');
            fakeDiv.className = "grid-header-div";
            fakeDiv.style.opacity = 0;
            fakeDiv.style.position = 'fixed';
            fakeDiv.innerHTML = grid.drawHeaderCell(column);
            document.body.append(fakeDiv);

            let contentSize = Math.max(column.w, +getComputedStyle(fakeDiv).width.replace('px', ''));

            fakeDiv.className = '';

            for (let row of grid.rows) {
                fakeDiv.innerHTML = grid.drawCell(column, row);
                contentSize = Math.max(contentSize, +getComputedStyle(fakeDiv).width.replace('px', ''));
            }

            const newW = Math.max(column.w, contentSize);

            if (newW > initW) {
                column.w = newW;
                th.style.width = newW + 'px';
                gridElement.style.width = (+gridElement.style.width.replace('px', '') + newW - initW) + 'px';
            }
        }

        th.addEventListener('mousedown', mouseDown);
        th.addEventListener('mouseover', mouseOver);
        th.addEventListener('mouseout', mouseOut);
        th.addEventListener('dblclick', mouseDoubleClick);
    }
}