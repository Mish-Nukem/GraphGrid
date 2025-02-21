//import Grid from './Grid.js';
import Grid from './GridInGraph.js';
//import Modal from './Modals.js';
import Dropdown from './Dropdown.js';

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
                <button grid-toolbar-button="${this.id}_${button.id}" class="grid-toolbar-button ${button.class || this.opt.toolbarButtonsClass || ''}" title="${this.translate(button.title)}" 
                ${button.getDisabled && button.getDisabled({ grid: this }) || button.disabled ? 'disabled' : ''}>
                    ${button.img ? button.img : ''} 
                    ${button.label ? this.translate(button.label, 'toolbar-button') : ''}
                </button>
        `;

        elem.innerHTML = s;

        return elem;
    }

    drawAppliedFilters(full) {
        return '';
    }

    drawPagerButton(grid, button) {
        return `
                <button grid-pager-item="${grid.id}_${button.id}_" class="${button.class ? button.class : 'grid-pager-button'}"
                title="${button.title ? grid.translate(button.title, 'pager-button') : ''}" ${button.getDisabled && button.getDisabled() || button.disabled ? 'disabled' : ''} type="button">
                    ${button.img ? button.img : ''} 
                    ${button.label ? grid.translate(button.label, 'pager-button') : ''}
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
            s += button.draw ? button.draw(this, button) : this.translate(button.title, 'pager-button');
        }

        elem.innerHTML = s;

        return elem;
    }

    onPagerButtonClick(e) {
        const elem = e.target.closest('BUTTON') || e.target;

        if (elem.tagName != 'BUTTON') return;

        const [gridId, buttonId] = elem.getAttribute('grid-pager-item').split('_');

        const grid = window._gridDict[gridId];

        //let button = grid.pagerButtons.find(function (item, index, array) {
        //    return item.id == buttonId;
        //});

        const button = grid.pagerButtonsDict[buttonId];

        if (!button || !button.click) return;

        e.grid = grid;

        button.click(e);
    }

    onToolbarButtonClick(e) {
        const elem = e.target.closest('BUTTON') || e.target;

        if (elem.tagName != 'BUTTON') return;

        const [gridId, buttonId] = elem.getAttribute('grid-toolbar-button').split('_');

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
        grid.pagerButtonsDict = {};

        const refresh = {
            id: 0,
            name: 'refresh',
            title: 'Refresh',
            label: 'Refresh',
            click: function (e) {
                grid.refresh();
            },
            //getDisabled: function () {
            //    return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            //},
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(refresh);
        grid.pagerButtonsDict[refresh.id] = grid.pagerButtonsDict[refresh.name] = refresh;

        if (grid.showGridSettings) {
            const settings = {
                id: 1,
                name: 'settings',
                title: 'Settings',
                label: 'Settings',
                click: function (e) {
                    grid.showGridSettings(e);
                },
                draw: grid.drawPagerButton,
            }

            grid.pagerButtons.push(settings);
            grid.pagerButtonsDict[settings.id] = grid.pagerButtonsDict[settings.name] = settings;
        }

        const first = {
            id: 2,
            name: 'first',
            title: 'First',
            label: 'First',
            click: function (e) {
                grid.gotoFirstPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(first);
        grid.pagerButtonsDict[first.id] = grid.pagerButtonsDict[first.name] = first;

        const prev = {
            id: 3,
            name: 'prev',
            title: 'Prev',
            label: 'Prev',
            click: function (e) {
                grid.gotoPrevPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(prev);
        grid.pagerButtonsDict[prev.id] = grid.pagerButtonsDict[prev.name] = prev;

        const curr = {
            id: 4,
            name: 'curr',
            title: 'Current Page',
            label: 'Current Page',
            click: function (e) {
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 1;
            },
            draw: function (grid, button) {
                return `<input value="${grid.pageNumber}" grid-pager-item="${grid.id}_${button.id}_" class="grid-pager-current ${button.class ? button.class : ''}"
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
        grid.pagerButtonsDict[curr.id] = grid.pagerButtonsDict[curr.name] = curr;

        const pages = {
            id: 5,
            name: 'pages',
            title: 'Total Pages',
            label: 'Total Pages',
            draw: function (grid, button) {
                return `<span style="padding: 0 3px"> ${grid.translate('of', 'pager-button')} ${grid.pagesCount >= 0 ? grid.pagesCount : ''}</span>`;
            }
        }

        grid.pagerButtons.push(pages);
        grid.pagerButtonsDict[pages.id] = grid.pagerButtonsDict[pages.name] = pages;

        const next = {
            id: 6,
            name: 'next',
            title: 'Next',
            label: 'Next',
            click: function (e) {
                grid.gotoNextPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(next);
        grid.pagerButtonsDict[next.id] = grid.pagerButtonsDict[next.name] = next;

        const last = {
            id: 7,
            name: 'last',
            title: 'Last',
            label: 'Last',
            click: function (e) {
                grid.gotoLastPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.push(last);
        grid.pagerButtonsDict[last.id] = grid.pagerButtonsDict[last.name] = last;

        const pgsize = {
            id: 8,
            name: 'pgsize',
            title: 'Page Size',
            label: 'Page Size',
            draw: function (grid, button) {
                let s = `<select  grid-pager-item="${grid.id}_${button.id}_" class="grid-pager-size ${button.class ? button.class : ''}" style="width: 4.5em;display: inline-block;">`;
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
        grid.pagerButtonsDict[pgsize.id] = grid.pagerButtonsDict[pgsize.name] = pgsize;

        const rows = {
            id: 9,
            name: 'rows',
            title: 'Total Rows',
            label: 'Total Rows',
            draw: function (grid, button) {
                return `<span style="padding: 0 3px"> ${grid.translate('total rows', 'pager-button')} ${grid.totalRows >= 0 ? grid.totalRows : ''}</span>`;
            }
        }

        grid.pagerButtons.push(rows);
        grid.pagerButtonsDict[rows.id] = grid.pagerButtonsDict[rows.name] = rows;

    }

    drawHeaderCell(col) {
        const title = this.translate(col.title || col.name);
        const sortDir = !col.sortable ? '' : col.asc ? '&#11205;' : col.desc ? '&#11206;' : '';

        //return `<div class="grid-header-content">
        //        <span></span><span style="white-space: nowrap;overflow: hidden;${col.sortable ? 'cursor:pointer' : ''}">${title}</span><span class="grid-header-sort-sign">${sortDir}</span>
        //    </div>`;
        //`<div class="grid-header-content-grid">`
        let res = `<span class="grid-header-title" style="${col.sortable ? 'cursor:pointer' : ''}">${title}</span>`;
        res += sortDir ? `<span class="grid-header-sort-sign">${sortDir}</span>` : '';
        //`</div>`;
        return res;
    }

    getGridSettings(e) {
        return [{ id: 0, text: 'Reset columns order' }, { id: 1, text: 'Reset columns widths' }];
    }

    showGridSettings(e) {
        const grid = this;

        const dropdown = new Dropdown({
            owner: grid,
            parentElem: document.querySelector(`button[grid-pager-item="${grid.id}_1_"]`),
            translate: grid.translate,
            getItems: grid.getGridSettings,
            onItemClick: grid.onSettingsItemClick,
            menuItemClass: grid.opt.menuItemClass,
            menuClass: grid.opt.menuClass,
            dropdownWndClass: grid.opt.dropdownWndClass,
        });

        dropdown.show();
    }

    onSettingsItemClick(grid, itemId) {
        switch (itemId) {
            case '0':
                grid.resetColumnsOrderToDefault();
                break;
            case '1':
                grid.resetColumnsWidthsToDefault();
                break;
        }
    }

    changeColumnSortOrder(column) {
        const grid = this;

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
    }
}

document.addEventListener('click', function (e) {
    let gridId, itemId, grid;

    switch (e.target.tagName) {
        case 'SPAN':
            const th = e.target.closest('TH');
            if (!th || !th.hasAttribute('grid-header')) return;

            [gridId, itemId] = th.getAttribute('grid-header').split('_');
            grid = window._gridDict[gridId];
            const column = grid.colDict[itemId];

            grid.changeColumnSortOrder(column);
            break;
    }
});