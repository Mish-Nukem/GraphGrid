export default class Grid {
    constructor(options) {
        this.opt = options || {};

        window._gridDict = window._gridDict || { seq: 0 };

        this.id = window._gridDict.seq++;

        this.getData = this.opt.getData || this.getData;

        this.getColumns = this.opt.getColumns || this.getColumns;

        this.opt.zInd = this.opt.zInd || 1;
    }

    draw = function (noRefresh) {
        let grid = document.getElementById(`grid_${this.id}_`);

        if (!grid) {
            this.parent = this.opt.parentId ? document.getElementById(this.opt.parentId) : document.body;

            let grid = document.createElement('table');
            grid.id = `grid_${this.id}_`;

            grid.className = this.opt.gridClass || 'grid-default';
            let style = this.opt.style || '';

            grid.style = `${style}`;

            this.parent.append(this.drawToolbar(true));
            this.parent.append(this.drawPager(true));

            grid.innerHTML = this.drawGrid(true);
            this.parent.append(grid);

            this.parent.append(this.drawPager(true, true));

            window._gridDict[this.id] = this;
        }

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
                grid.getColumns();

                grid.drawHeader();
            }

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

        for (let col of this.columns) {
            s += `<th class="${this.columnClass}" style="position: sticky;top: 0">`;

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
        //grid.append(s);

        //let header = grid.querySelector('thead');

        grid.innerHTML = s;
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
        //let body = grid.querySelector('tbody');

        grid.innerHTML += s;

        //body.innerHTML = s;
    }

    drawCell = function (col, row) {
        return row[col.name];
    }

    drawGrid = function (noRefresh) {
        let grid = document.getElementById(`grid_${this.id}_`);
        if (!grid) {
            this.parent = this.opt.parentId ? document.getElementById(this.opt.parentId) : document.body;

            let grid = document.createElement('table');
            grid.id = `grid_${this.id}_`;

            grid.className = this.opt.gridClass || 'grid-default';
            let style = this.opt.style || '';

            grid.style = `${style}`;

            this.parent.append(grid);

            window._gridDict[this.id] = this;
        }

        //let s = '';

        this.drawHeader(grid);
        this.drawBody(grid);

        //grid.innerHTML = s;

        if (!noRefresh) {
            this.refresh();
        }
    }

    getData = function (callback) {
        this.rows = [];
        if (callback) {
            callback(this.rows);
        }
    }

    getColumns = function () {
        this.columns = [];
        this.colDict = {};

        for (let row of this.rows) {
            //let row = this.rows[i];
            for (let key in row) {
                if (this.colDict[key]) continue;

                let col = { name: key, title: key };

                this.colDict[key] = col;
                this.columns.push(col);
            }
        }
    }
}