import Grid from './GridInGraph.js';

window.NodeStatus = {
    grid: 0, hidden: 1, filter: 2, lookup: 3, custom: 4
};

export default class GridDB extends Grid {

    constructor(options) {
        super(options);

        this.pageNumber = 1;
        this.pageSize = options.pageSize;

        this.pageSizes = [5, 10, 15, 20, 30, 40, 50, 100];

        this.toolbarButtons = options.toolbarButtons;
        this.setupPagerButtons();
    }

    skipOnWaveVisit(e) {
        if (super.skipOnWaveVisit(e)) return true;

        if (e.waveType == WaveType.value) {
            if (this.status == NodeStatus.filter && !this._selecting || this.status == NodeStatus.hidden) {
                this.selectedRowIndex = -1;
                if (this.status == NodeStatus.filter) {
                    this.updateNodeControls(true);
                    this.graph.visitNodesByWave(e);
                }
                return true;
            }
        }
    }

    visitByWave(e) {
        if (this.skipOnWaveVisit(e)) return;

        this.pageNumber = 1;

        super.visitByWave(e);
    }

    draw() {
        const gridElemObj = this.createGridElement();
        if (gridElemObj.isNew) {
            this.parent.append(this.drawToolbar(true));
            this.parent.append(this.drawAppliedFilters(true));
            this.parent.append(this.drawPager(true));

            this.parent.appendChild(gridElemObj.gridElement);

            this.parent.append(this.drawPager(true, true));
        }
        else {
            this.drawToolbar(false);
            this.drawAppliedFilters(false);
            this.drawPager(false);

            this.drawPager(false, true);
        }
        this.drawHeader(gridElemObj.gridElement);
        this.drawBody(gridElemObj.gridElement);
    }

    drawToolbar(full) {
        if (!this.toolbarButtons || this.toolbarButtons.length <= 0) return '';

        const id = `grid_${this.id}_toolbar_`;
        let elem = full ? null : document.getElementById(id);
        if (!elem) {

            elem = document.createElement('div');
            elem.id = id;

            elem.className = this.opt.toolbarClass || 'toolbar-default';
            elem.style = this.opt.style || '';

            elem.addEventListener('click', this.onToolbarButtonClick);
        }

        let s = '';
        for (let button of this.toolbarButtons)
            s += `
                <button grid-toolbar-button="${this.id}_${button.id}" class="grid-toolbar-button ${button.class || this.toolbarButtonsClass || ''}" title="${button.title}" 
                ${button.getDisabled && button.getDisabled({ grid: this }) || button.disabled ? 'disabled' : ''}>
                    ${this.drawToolbarButtonTitle(button)}
                </button>
        `;

        elem.innerHTML = s;

        return elem;
    }

    drawAppliedFilters(full) {
        return '';
    }

    drawToolbarButtonTitle(button) {
        return button ? button.title ? button.title : button.name : '';
    }

    drawPagerButton(grid, button) {
        return `
                <button grid-pager-item="${grid.id}_${button.id}" class="${button.class ? button.class : 'grid-pager-button'}"
                title="${button.title}" ${button.getDisabled && button.getDisabled() || button.disabled ? 'disabled' : ''}>
                    ${button ? button.title ? button.title : button.name : ''}
                </button>
            `;
    }

    drawPager(full, bottom) {
        if (bottom && !this.allowBottomPager) return '';

        const id = `grid_${this.id}_pager_`;
        let elem = full ? null : document.getElementById(id);
        if (!elem) {

            elem = document.createElement('div');
            elem.id = id;

            elem.className = this.opt.pagerClass || 'pager-default';
            elem.style = this.opt.style || '';

            elem.addEventListener('click', this.onPagerButtonClick);
            elem.addEventListener('change', this.onPagerItemChange);
        }

        let s = '';
        for (let button of this.pagerButtons) {
            s += button.draw ? button.draw(this, button) : button.title;
        }

        elem.innerHTML = s;

        return elem;
    }

    onPagerButtonClick(e) {
        if (e.target.tagName != 'BUTTON') return;

        const [gridId, buttonId] = e.target.getAttribute('grid-pager-item').split('_');

        const grid = window._gridDict[gridId];

        let button = grid.pagerButtons.find(function (item, index, array) {
            return item.id == buttonId;
        });

        if (!button || !button.click) return;

        e.grid = grid;

        button.click(e);
    }

    onToolbarButtonClick(e) {
        if (e.target.tagName != 'BUTTON') return;

        const [gridId, buttonId] = e.target.getAttribute('grid-toolbar-button').split('_');

        const grid = window._gridDict[gridId];

        let button = grid.toolbarButtons.find(function (item, index, array) {
            return item.id == buttonId;
        });

        if (!button || !button.click) return;

        e.grid = grid;

        button.click(e);
    }

    onPagerItemChange(e) {
        if (e.target.tagName == 'BUTTON') return;

        const [gridId, itemId] = e.target.getAttribute('grid-pager-item').split('_');

        const grid = window._gridDict[gridId];

        let button = grid.pagerButtons.find(function (item, index, array) {
            return item.id == itemId;
        });

        if (!button || !button.change) return;

        e.grid = grid;

        button.change(e);

    }

    //showGridSettings(e) {
    //    const grid = this;
    //    alert(`Showing settings for ${grid.id} grid...`);
    //}

    gotoFirstPage() {
        const grid = this;
        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    gotoPrevPage() {
        const grid = this;
        grid.pageNumber = grid.pageNumber > 1 ? grid.pageNumber - 1 : 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    gotoNextPage() {
        const grid = this;
        grid.calculatePagesCount();
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pageNumber + 1 : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    gotoLastPage() {
        const grid = this;
        grid.calculatePagesCount();
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pagesCount : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    setupPagerButtons() {
        const grid = this;
        grid.pagerButtons = [];

        if (grid.showGridSettings) {
            const settings = {
                id: 0,
                name: 'settings',
                title: 'Settings',
                click: function (e) {
                    grid.showGridSettings(e);
                },
                draw: drawPagerButton,
            }

            grid.pagerButtons.push(settings);
        }

        const first = {
            id: 1,
            name: 'first',
            title: 'First',
            click: function (e) {
                grid.gotoFirstPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(first);

        const prev = {
            id: 2,
            name: 'prev',
            title: 'Prev',
            click: function (e) {
                grid.gotoPrevPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(prev);

        const curr = {
            id: 3,
            name: 'curr',
            title: 'Current Page',
            click: function (e) {
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 1;
            },
            draw: function (grid, button) {
                return `<input value="${grid.pageNumber}" grid-pager-item="${grid.id}_${button.id}" class="grid-pager-current ${button.class ? button.class : ''}"
                    style="width: 3em;display: inline-block;"></input>`;
            },
            change: function (e) {
                const newPage = +e.target.value;

                if (e.grid.pageNumber != newPage && newPage >= 1 && newPage <= e.grid.pagesCount) {
                    e.grid.pageNumber = newPage;
                    e.grid.selectedRowIndex = 0;
                    e.grid.refresh();
                }
            }
        }

        grid.pagerButtons.push(curr);

        const total = {
            id: 4,
            name: 'total',
            title: 'Total Pages',
            draw: function (grid, button) {
                return `<span style="padding: 0 3px"> of ${grid.pagesCount >= 0 ? grid.pagesCount : ''}</span>`;
            }
        }

        grid.pagerButtons.push(total);

        const next = {
            id: 5,
            name: 'next',
            title: 'Next',
            click: function (e) {
                grid.gotoNextPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(next);

        const last = {
            id: 6,
            name: 'last',
            title: 'Last',
            click: function (e) {
                grid.gotoLastPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(last);

        const pgsize = {
            id: 7,
            name: 'pgsize',
            title: 'Page Size',
            draw: function (grid, button) {
                let s = `<select  grid-pager-item="${grid.id}_${button.id}" class="grid-pager-size ${button.class ? button.class : ''}" style="width: 4.5em;display: inline-block;">`;
                for (let itm of grid.pageSizes) {
                    s += `<option ${itm == grid.pageSize ? 'selected' : ''}>${itm}</option>`;
                }
                s += '</select>';
                return s;
            },
            change: function (e) {
                const newSize = +e.target.value;

                if (e.grid.pageSize != newSize) {
                    e.grid.pageSize = newSize;
                    e.grid.pageNumber = 1;
                    e.grid.selectedRowIndex = 0;
                    e.grid.refresh();
                }
            }
        }

        grid.pagerButtons.push(pgsize);
    }

    drawHeaderCell(col) {
        const title = super.drawHeaderCell(col);
        const sortDir = col.asc ? '&#11205;' : col.desc ? '&#11206;' : '';

        return `<span></span><span style="white-space: nowrap;overflow: hidden;${col.sortable ? 'cursor:pointer' : ''}">${title}</span><span class="grid-header-sort-sign">${sortDir}</span>`;
    }
}

document.addEventListener('click', function (e) {
    if (e.target.tagName != 'SPAN') return;

    const th = e.target.closest('TH');
    if (!th || !th.hasAttribute('grid-header')) return;

    const [gridId, columnId] = th.getAttribute('grid-header').split('_');
    const grid = window._gridDict[gridId];
    const column = grid.colDict[columnId];

    if (!column.sortable) return;

    if (column.asc) {
        delete column.asc;
        column.desc = true;
    }
    else if (column.desc) {
        delete column.desc;
    }
    else {
        column.asc = true;
    }

    for (let col of grid.columns) {
        if (col == column) continue;

        delete col.asc;
        delete col.desc;
    }

    grid.selectedRowIndex = 0;
    grid.refresh();
});