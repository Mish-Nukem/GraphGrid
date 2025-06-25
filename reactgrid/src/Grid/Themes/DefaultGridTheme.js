//import { Images } from './Images';
export class DefaultGridTheme {

    constructor() {
        this.pagerButtonsClass = 'grid-pager-button';
        this.toolbarClass = '';
        this.toolbarButtonsClass = 'grid-toolbar-button';

        this.pagerClass = 'mb-1 grid-pager-default';

        this.gridClass = '';
        //this.headerDivClass = 'grid-header-div-default';
        this.headerDivClass = ' ';
        this.selectedRowClass = 'table-active';
        this.inputClass = '';

        this.menuClass = '';
        this.menuItemClass = '';
        this.dropdownWndClass = 'none';

        this.filterButtonClass = '';
        this.clearButtonClass = '';

        this.modalBodyClass = 'modal-window-body';
        this.modalHeaderClass = 'modal-window-header';
        this.modalFooterClass = 'modal-window-footer';
        this.modalFooterButtonClass = 'modal-window-footer-button'
        this.modalTitleClass = 'modal-window-header-title';
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //applyTheme(grid) {
    //    this.setupGridPagerButtons(grid);
    //}
    //// -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //setupGridPagerButtons(grid) {
    //    if (!grid.pagerButtonsDict) return;

    //    const images = Images.getImages();

    //    let button;
    //    button = grid.pagerButtonsDict['refresh'];
    //    button.class = 'grid-pager-button';
    //    button.label = '';
    //    button.img = images.refresh

    //    button = grid.pagerButtonsDict['settings'];
    //    button.class = 'grid-pager-button';
    //    button.label = '';
    //    button.img = images.settings;

    //    if (grid.pageSize > 0) {
    //        button = grid.pagerButtonsDict['first'];
    //        button.class = 'grid-pager-button';
    //        button.label = '';
    //        button.img = images.first;

    //        button = grid.pagerButtonsDict['prev'];
    //        button.class = 'grid-pager-button';
    //        button.label = '';
    //        button.img = images.prev;

    //        button = grid.pagerButtonsDict['curr'];
    //        button.class = '';

    //        button = grid.pagerButtonsDict['pages'];
    //        button.class = 'grid-pager-button';

    //        button = grid.pagerButtonsDict['next'];
    //        button.class = 'grid-pager-button';
    //        button.label = '';
    //        button.img = images.next;

    //        button = grid.pagerButtonsDict['last'];
    //        button.class = 'grid-pager-button';
    //        button.label = '';
    //        button.img = images.last;

    //        button = grid.pagerButtonsDict['pgsize'];
    //        button.class = 'grid-pager-button';
    //    }

    //    button = grid.pagerButtonsDict['rows'];
    //    button.class = 'grid-pager-button';

    //    button = grid.pagerButtonsDict['clear'];
    //    if (button) {
    //        button.class = 'grid-pager-button';
    //        button.label = '';
    //        button.img = images.clear;
    //    }
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}