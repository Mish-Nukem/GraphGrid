import /*bootstrapCss from*/ '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
// ==================================================================================================================================================================
export class BootstrapTheme {
    constructor() {
        this.pagerButtonsClass = 'btn btn-primary btn-sm';
        this.toolbarButtonsClass = 'btn btn-primary btn-sm';

        this.pagerClass = 'mb-1 grid-pager-default';

        this.gridClass = 'table table-sm table-bordered';
        //this.headerDivClass = 'grid-header-div-default';
        this.headerDivClass = ' ';
        this.selectedRowClass = 'table-active';
        this.inputClass = 'form-control form-control-sm';

        this.tabControlButtonClass = 'btn btn-primary btn-sm';

        this.menuClass = 'list-group';
        this.menuItemClass = 'list-group-item list-group-item-action list-group-item-light';
        this.mainMenuItemClass = 'btn btn-outline-secondary';
        this.dropdownWndClass = 'none';

        this.filterButtonClass = 'graph-filter-button btn btn-primary btn-sm';
        this.clearButtonClass = 'btn btn-outline-secondary btn-sm';

        this.modalFooterButtonClass = 'btn btn-primary btn-sm';

        //this.tableClass = 'table';

        //document.adoptedStyleSheets = document.adoptedStyleSheets || [];
        //document.adoptedStyleSheets.push(bootstrapCss);

        //document.bootstrapStyleSheet = bootstrapCss;
        //document.adoptedStyleSheet = bootstrapCss;

        //for (let styleSheet of document.styleSheets) {
        //    styleSheet.disabled = true;
        //}
        if (!document.BootstrapStyleSheets) {
            document.BootstrapStyleSheets = [];
            document.BootstrapRules = [];

            let prevCount = 0;

            for (let i = 0; i < document.styleSheets.length; i++) {
                let ss = document.styleSheets[i];
                for (let _ of ss.cssRules) {
                    prevCount++;
                }
                //document.BootstrapStyleSheets.push(document.styleSheets[i]);
            }

            //document.styleSheets.length;

            import('../../../node_modules/bootstrap/dist/css/bootstrap.min.css').then(() => {
                let ncount = 0;
                for (let i = 0; i < document.styleSheets.length; i++) {
                    let ss = document.styleSheets[i];
                    for (let rule of ss.cssRules) {
                        ncount++;

                        if (ncount > prevCount) {
                            document.BootstrapRules.push(rule);
                        }
                    }

                    //document.BootstrapStyleSheets.push(document.styleSheets[i]);
                }
            });
        }
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //applyTheme(grid) {
    //    //grid.toolbarButtonsClass = 'btn btn-sm btn-success';
    //    grid.opt.toolbarButtonsClass = 'btn btn-primary btn-sm';
    //    grid.opt.pagerClass = 'mb-1 grid-pager-default';

    //    grid.opt.gridClass = 'table table-sm table-bordered';
    //    //grid.opt.headerDivClass = 'grid-header-div-default';
    //    grid.opt.headerDivClass = ' ';
    //    grid.opt.selectedRowClass = 'table-active';
    //    grid.opt.inputClass = 'form-control form-control-sm';

    //    grid.opt.menuClass = 'list-group';
    //    grid.opt.menuItemClass = 'list-group-item list-group-item-action list-group-item-light';
    //    grid.opt.dropdownWndClass = 'none';

    //    grid.opt.filterButtonClass = 'btn btn-primary btn-sm';
    //    grid.opt.clearButtonClass = 'btn btn-outline-secondary btn-sm';

    //    this.setupGridPagerButtons(grid);
    //}
    //// -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //setupGridPagerButtons(grid) {
    //    if (!grid.pagerButtonsDict) return;

    //    for (let id in grid.pagerButtonsDict) {
    //        let button = grid.pagerButtonsDict[id];
    //        button.class = 'btn btn-primary btn-sm';
    //    }

    //    for (let id in grid.toolbarButtons) {
    //        let button = grid.toolbarButtons[id];
    //        button.class = 'btn btn-primary btn-sm';
    //    }

    //    let button2;

    //    button2 = grid.pagerButtonsDict['curr'];
    //    button2.class = 'form-control form-control-sm';

    //    button2 = grid.pagerButtonsDict['pgsize'];
    //    button2.class = 'form-select form-select-sm';
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}