import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
// ==================================================================================================================================================================
export class BootstrapTheme {
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    applyTheme(grid) {
        //grid.toolbarButtonsClass = 'btn btn-sm btn-success';
        grid.opt.toolbarButtonsClass = 'btn btn-primary btn-sm';
        grid.opt.pagerClass = 'mb-1 grid-pager-default';

        grid.opt.gridClass = 'table table-sm table-bordered';
        //grid.opt.headerDivClass = 'grid-header-div-default';
        grid.opt.headerDivClass = ' ';
        grid.opt.selectedRowClass = 'table-active';
        grid.opt.inputClass = 'form-control form-control-sm';

        grid.opt.menuClass = 'list-group';
        grid.opt.menuItemClass = 'list-group-item list-group-item-action list-group-item-light';
        grid.opt.dropdownWndClass = 'none';

        grid.opt.filterButtonClass = 'btn btn-primary btn-sm';
        grid.opt.clearButtonClass = 'btn btn-outline-secondary btn-sm';

        this.setupGridPagerButtons(grid);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupGridPagerButtons(grid) {
        if (!grid.pagerButtonsDict) return;

        for (let id in grid.pagerButtonsDict) {
            let button = grid.pagerButtonsDict[id];
            button.class = 'btn btn-primary btn-sm';
        }

        for (let id in grid.toolbarButtons) {
            let button = grid.toolbarButtons[id];
            button.class = 'btn btn-primary btn-sm';
        }

        let button2;

        button2 = grid.pagerButtonsDict['curr'];
        button2.class = 'form-control form-control-sm';

        button2 = grid.pagerButtonsDict['pgsize'];
        button2.class = 'form-select form-select-sm';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}