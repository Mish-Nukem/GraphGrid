import Grid from './GridInGraph.js';

window.NodeStatus = {
    grid: 0, hidden: 1, filter: 2, lookup: 3, custom: 4
};

export default class GridDB extends Grid {

    constructor(options) {
        super(options);

        this.pageNumber = 1;
        this.pageSize = options.pageSize;

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
        return '';
    }

    drawAppliedFilters(full) {
        return '';
    }

    drawPagerButton(button) {
        //return button ? button.title ? button.title : button.name : '';
        switch (button.name.toLowerCase()) {
            case 'settings':
                return 'Settings';
                break;
            case 'first':
                return button.title;
                break;
            case 'prev':
                return button.title;
                break;
            case 'next':
                return button.title;
                break;
            case 'last':
                return button.title;
                break;
            default:
                return button.title;
        }
        return '';
    }

    drawAppliedFilters(full) {
        return '';
    }

    drawPager(full, bottom) {
        if (bottom && !this.allowBottomPager) return '';

        const id = `grid_${this.id}_pager_`;
        let elem = full ? null : document.getElementById(id);
        if (!elem) {

            elem = document.createElement('div');
            elem.id = id;

            elem.className = this.opt.gridClass || 'grid-default';
            elem.style = this.opt.style || '';

            elem.addEventListener('click', this.onPagerButtonClick);
        }

        let s = '';
        for (let button of this.pagerButtons)
            s += `
                <button id="pager_${this.id}_${button.id}" grid-pager-button="${this.id}_${button.id}" class="grid-pager-button" title="${button.title}" 
                ${button.getDisabled && button.getDisabled() || button.disabled ? 'disabled' : ''}>
                    ${this.drawPagerButton(button)}
                </button>
        `;

        elem.innerHTML = s;

        return elem;
    }

    onPagerButtonClick(e) {
        if (e.target.tagName != 'BUTTON') return;

        const [gridId, buttonId] = e.target.getAttribute('grid-pager-button').split('_');

        const grid = window._gridDict[gridId];

        let button = grid.pagerButtons.find(function (item, index, array) {
            return item.id == buttonId;
        });

        if (!button || !button.click) return;

        button.click();
    }

    showGridSettings(e) {
        const grid = this;
        alert(`Showing settings for ${grid.id} grid...`);
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
        grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pageNumber + 1 : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    gotoLastPage() {
        const grid = this;
        grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pagesCount : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    setupPagerButtons() {
        this.pagerButtons = [];
        const grid = this;

        const settings = {
            id: 0,
            name: 'settings',
            title: 'Grid Settings',
            click: function (e) {
                grid.showGridSettings(e);
            }
        }

        this.pagerButtons.push(settings);

        const first = {
            id: 1,
            name: 'first',
            title: 'First',
            click: function (e) {
                grid.gotoFirstPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            }
        }

        this.pagerButtons.push(first);

        const prev = {
            id: 2,
            name: 'prev',
            title: 'Prev',
            click: function (e) {
                grid.gotoPrevPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == 1;
            }
        }

        this.pagerButtons.push(prev);

        const next = {
            id: 3,
            name: 'next',
            title: 'Next',
            click: function (e) {
                grid.gotoNextPage();
            },
            getDisabled: function () {
                grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);

                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            }
        }

        this.pagerButtons.push(next);

        const last = {
            id: 4,
            name: 'last',
            title: 'Last',
            click: function (e) {
                grid.gotoLastPage();
            },
            getDisabled: function () {
                grid.pagesCount = (grid.totalRows / grid.pageSize | 0) + (grid.totalRows % grid.pageSize > 0 ? 1 : 0);

                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber == grid.pagesCount;
            }
        }

        this.pagerButtons.push(last);

    }
}
