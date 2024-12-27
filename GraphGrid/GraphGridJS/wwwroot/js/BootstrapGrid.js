import Grid from './GridDB.js';

export default class BootstrapGrid extends Grid {

    constructor(options) {
        super(options);

        this.toolbarButtonsClass = 'btn btn-sm btn-success';
        //this.toolbarButtonsClass = 'btn btn-primary';
        this.opt.pagerClass = 'mb-1';

        this.opt.gridClass = 'table table-sm table-bordered';
        this.opt.headerDivClass = 'grid-header-div-default';
        this.opt.selectedRowClass = 'table-active';
    }

    setupPagerButtons() {
        const grid = this;

        super.setupPagerButtons();

        for (let btn of grid.pagerButtons) {
            btn.class = btn.name == 'curr' ? 'form-control form-control-sm' : btn.name == 'pgsize' ? 'form-select form-select-sm' : 'btn btn-primary btn-sm';
        }
    }
}
