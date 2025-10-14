import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
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
        this.inputClassLG = 'form-control form-control-sm';

        this.tabControlButtonClass = 'btn btn-outline-secondary btn-sm';

        this.menuClass = 'list-group';
        this.menuItemClass = 'list-group-item list-group-item-action list-group-item-light';
        this.mainMenuItemClass = 'btn btn-outline-secondary';
        this.dropdownWndClass = 'none';

        this.filterButtonClass = 'graph-filter-button btn btn-primary btn-sm';
        this.clearButtonClass = 'btn btn-outline-secondary btn-sm';

        this.modalFooterButtonClass = 'btn btn-primary btn-sm';
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}