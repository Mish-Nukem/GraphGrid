import Grid from './GridInGraph.js';

window.NodeStatus = {
    grid: 0, hidden: 1, filter: 2, lookup: 3, custom: 4
};

export default class GridDB extends Grid {

    constructor(options) {
        super(options);

        this.pageNumber = 1;
        this.pageSize = 10;

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

    drawPagerButton(button) {
        return button ? button.title ? button.title : button.name : '';
    //    switch (button.name.toLowerCase()) {
    //        case 'settings':
    //            return 'Settings';
    //            break;
    //    }
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
                <button id="pager_${this.id}_${button.id}" grid-pager-button="${this.id}_${button.id}" class="grid-pager-button" title="${button.title}">
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

    setupPagerButtons() {
        this.pagerButtons = [];
        const grid = this;

        const settings = {
            id: 0,
            name: 'settings',
            title: 'Grid Settings',
            click: function (e) {
                alert(`Showing settings for ${grid.id} grid...`);
            }
        }

        this.pagerButtons.push(settings);

        const first = {
            id: 1,
            name: 'first',
            title: 'First',
            click: function (e) {
                alert(`Moving to first page for ${grid.id} grid...`);
            }
        }

        this.pagerButtons.push(first);

        const prev = {
            id: 2,
            name: 'prev',
            title: 'Prev',
            click: function (e) {
                alert(`Moving to prev page for ${grid.id} grid...`);
            }
        }

        this.pagerButtons.push(prev);

        const next = {
            id: 3,
            name: 'next',
            title: 'Next',
            click: function (e) {
                alert(`Moving to next page for ${grid.id} grid...`);
            }
        }

        this.pagerButtons.push(next);

        const last = {
            id: 4,
            name: 'last',
            title: 'Last',
            click: function (e) {
                alert(`Moving to last page for ${grid.id} grid...`);
            }
        }

        this.pagerButtons.push(last);

    }
}
