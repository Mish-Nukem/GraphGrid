export default class Grid {
    constructor(options) {
        this.opt = options || {};

        window._gridDict = window._gridDict || { seq: 0 };

        this.id = window._gridDict.seq++;

        this.getData = this.opt.getData || this.getData;

        this.getColumns = this.opt.getColumns || this.getColumns;

        this.opt.zInd = this.opt.zInd || 1;
    }

    getGridElement = function () {
        let grid = document.getElementById(`grid_${this.id}_`);
        if (grid) return grid;

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

        return grid;
    }

    draw = function (noRefresh) {
        let grid = this.getGridElement();;

        if (!noRefresh) {
            this.refresh();
        }
    }

    refresh = function () {
        if (!window._gridDict[this.id]) {
            this.draw(true);
        }

        let grid = this;

        this.getData(function () {
            grid.drawPager(false);

            if (!grid.columns) {
                grid.prepareColumns(grid.getColumns());
            }

            grid.drawHeader();

            grid.drawBody();
            grid.drawPager(false, true);
        });
    }

    remove = function () {

        let grid = window._gridDict[this.id];
        if (!grid) return;

        delete window._gridDict[this.id];

        let elem = document.getElementById(`grid_${this.id}_`);
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

    drawHeader = function (grid) {
        if (!this.columns) return;

        let s = '<thead><tr>';

        let w = 0;
        for (let col of this.columns) {
            w += col.w;
            let colClass = this.columnClass ? `class="${this.columnClass}"` : '';
            s += `<th id="col_${this.id}_${col.id}" ${colClass} style="position: sticky;top: 0;width: ${col.w}px">`;

            s += this.drawHeaderCell(col);

            s += `
            <div grid-rsz-x
                style="position: absolute;right: -6px;top: -1px;cursor: e-resize;height:100%;width: 12px;z-index: ${this.opt.zInd + 1};">
                </div>
            `;

            s += '</th>';
        }

        s += '</tr></thead>';

        grid = grid || document.getElementById(`grid_${this.id}_`);

        if (!this.parentIsDocument) {
            grid.style.width = (w + (this.columns.length + 1) * 2) + 'px';
        }

        let thead = grid.tHead;

        if (thead) {
            thead.innerHTML = s;
        }
        else {
            grid.innerHTML = s;
        }

        let grObj = this;
        setTimeout(function () {
            let i = 0;
            for (let th of grid.tHead.rows[0].children) {
                let col = grObj.columns[i++];
                grObj.setupResize(col, th, grid);
            }
        }, 10);
    }

    drawHeaderCell = function (col) {
        return col.title || col.name;
    }

    drawBody = function (grid) {
        if (!this.columns || !this.rows) return;

        let s = '<tbody>';

        for (let row of this.rows) {
            s += '<tr>';
            for (let col of this.columns) {
                s += '<td>';
                s += this.drawCell(col, row);
                s += '</td>';
            }
            s += '</tr>';
        }

        s += '</tbody>';

        grid = grid || document.getElementById(`grid_${this.id}_`);
        let body = grid.tBodies[0];

        if (body) {
            body.innerHTML = s;
        }
        else {
            grid.innerHTML += s;
        }
    }

    drawCell = function (col, row) {
        return row[col.name];
    }

    getData = function (callback) {
        this.rows = [];
        if (callback) {
            callback(this.rows);
        }
    }

    getColumns = function () {
        let res = [];
        this.colDict = {};

        for (let row of this.rows) {
            for (let key in row) {
                if (this.colDict[key]) continue;

                let col = { name: key };

                this.colDict[col.name] = col;
                res.push(col);
            }
        }

        return res;
    }

    prepareColumns = function (columns) {
        this.columns = columns || this.columns || [];
        this.colDict = this.colDict || {};

        let id = 0;
        for (let col of this.columns) {
            col.id = id++;
            col.title = col.title || col.name;
            col.w = col.w || 100;
            col.grid = this;
            this.colDict[col.id] = this.colDict[col.name] = col;
        }
    }

    setupResize = function (col, header, grid) {
        let mouseDown = function (e) {

            let initW = +header.style.width.replace('px', '');
            let shiftX = e.target.hasAttribute('grid-rsz-x') ? e.clientX : -1;

            resize(e.pageX);

            function resize(pageX) {
                if (shiftX > 0) {
                    let w = initW + pageX - shiftX;

                    let prevW = col.w;
                    col.w = (!col.maxW || w <= col.maxW) && (!col.minW || w >= col.minW) ? w : col.w;

                    if (col.w != prevW) {
                        grid.style.width = '';

                        header.style.width = col.w + 'px';
                    }
                }
            }

            function onMouseMove(e) {
                resize(e.pageX);
            }

            document.addEventListener('mousemove', onMouseMove);

            let rem = document.onmouseup;
            let columns = col.grid.columns;
            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = rem;

                if (!this.parentIsDocument) {
                    let w = 0;
                    for (let col of columns) {
                        w += col.w;
                    }
                    grid.style.width = (w + (columns.length + 1) * 2) + 'px';
                }
            };
        };

        header.querySelector('div[grid-rsz-x]').onmousedown = mouseDown;

        //    header.ondragstart = function () {
        //        return false;
        //    };
    }

}