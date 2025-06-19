export class DefaultGridTheme {
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    applyTheme(grid) {
        this.setupGridPagerButtons(grid);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupGridPagerButtons(grid) {
        if (!grid.pagerButtonsDict) return;

        let button;
        button = grid.pagerButtonsDict['refresh'];
        button.class = 'grid-pager-button';
        button.label = '';
        button.img = grid.images.refresh

        button = grid.pagerButtonsDict['settings'];
        button.class = 'grid-pager-button';
        button.label = '';
        button.img = grid.images.settings;

        if (grid.pageSize > 0) {
            button = grid.pagerButtonsDict['first'];
            button.class = 'grid-pager-button';
            button.label = '';
            button.img = grid.images.first;

            button = grid.pagerButtonsDict['prev'];
            button.class = 'grid-pager-button';
            button.label = '';
            button.img = grid.images.prev;

            button = grid.pagerButtonsDict['curr'];
            button.class = '';

            button = grid.pagerButtonsDict['pages'];
            button.class = 'grid-pager-button';

            button = grid.pagerButtonsDict['next'];
            button.class = 'grid-pager-button';
            button.label = '';
            button.img = grid.images.next;

            button = grid.pagerButtonsDict['last'];
            button.class = 'grid-pager-button';
            button.label = '';
            button.img = grid.images.last;

            button = grid.pagerButtonsDict['pgsize'];
            button.class = 'grid-pager-button';
        }

        button = grid.pagerButtonsDict['rows'];
        button.class = 'grid-pager-button';

        button = grid.pagerButtonsDict['clear'];
        if (button) {
            button.class = 'grid-pager-button';
            button.label = '';
            button.img = grid.images.clear;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}