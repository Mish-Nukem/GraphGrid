export default class Grid {
    constructor(options) {
        this.opt = options || {};

        window._gridDict = window._gridDict || { seq: 0 };

        this.id = window._gridDict.seq++;

        this.getData = this.opt.getData || this.getData;

        this.getColumns = this.opt.getColumns || this.getColumns;

        this.opt.zInd = this.opt.zInd || 1;
    }

    createGridElement = function () {
        let grid = document.getElementById(`grid_${this.id}_`);
        if (grid) return false;

        this.parent = this.opt.parentId ? document.getElementById(this.opt.parentId) : this.parent || this.opt.parent || document.body;
        this.parentIsDocument = this.parent == document.body;

        grid = document.createElement('table');
        grid.id = `grid_${this.id}_`;

        grid.className = this.opt.gridClass || 'grid-default';
        grid.style = this.opt.style || '';

        this.parent.append(this.drawToolbar(true));
        this.parent.append(this.drawPager(true));

        this.parent.appendChild(grid);

        this.parent.append(this.drawPager(true, true));

        window._gridDict[this.id] = this;

        return true;
    }

    draw = function () {
        if (!this.createGridElement()) {
            this.drawToolbar(false);
            this.drawPager(false);
            this.drawPager(false, true);
        }
        this.drawHeader();
        this.drawBody();
    }

    refresh = function () {
        const grid = this;

        this.getData(function () {
            if (!grid.columns) {
                grid.prepareColumns(grid.getColumns());
            }
            grid.draw();
        });
    }

    remove = function () {
        const grid = window._gridDict[this.id];
        if (!grid) return;

        delete window._gridDict[this.id];

        const elem = document.getElementById(`grid_${this.id}_`);
        elem.setAttribute('display', 'none');

        setTimeout(function () {
            elem.remove();
        }, 10);
    }

    drawToolbar = function (full) {
        return '';
    }

    drawPager = function (full, bottom) {
        return '';
    }

    drawHeader = function (gridElement) {
        if (!this.columns) return;

        const colClass = this.columnClass ? `class="${this.columnClass}"` : '';

        let w = 0;
        let s = '<thead><tr>';
        for (let col of this.columns) {
            s += `<th grid-header id="col_${this.id}_${col.id}" ${colClass} style="position: sticky;top: 0;width: ${col.w}px">
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
                grid.setupColumnDrug(col, th);
            }
        }, 10);
    }

    drawHeaderCell = function (col) {
        return col.title || col.name;
    }

    drawBody = function (gridElement) {
        if (!this.columns || !this.rows) return;

        let s = '<tbody>';

        for (let row of this.rows) {
            s += '<tr>';
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

    drawCell = function (col, row) {
        const val = row[col.name];
        return val !== undefined ? val : '';
    }

    getData = function (callback) {
        this.rows = [];
        if (callback) {
            callback(this.rows);
        }
    }

    getColumns = function () {
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

    prepareColumns = function (columns) {
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

    resetColumnsOrderToDefault = function () {
        Object.assign(this.columns, this.columnsDefaultOrder);
        this.draw();
    }

    setupColumnResize = function (column, th, gridElement) {
        const mouseDown = function (e) {

            const initW = +th.style.width.replace('px', '');
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

    setupColumnDrug = function (column, th) {
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

            const fakeGrid = addFakeGrid(e);

            drawMovingColumn(e.pageX, e.pageY);

            function drawMovingColumn(pageX, pageY) {
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

                fakeGrid.remove();
                clearMovingClass(e);

                if (grid._movingColumn && grid._targetColumn && grid._movingColumn != grid._targetColumn) {

                    const newColumns = [];
                    for (let col of columns) {
                        switch (col) {
                            case grid._movingColumn:
                                newColumns.push(grid._targetColumn);
                                break;
                            case grid._targetColumn:
                                newColumns.push(grid._movingColumn);
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

        th.addEventListener('mousedown', mouseDown);
        th.addEventListener('mouseover', mouseOver);
        th.addEventListener('mouseout', mouseOut);
    }
}