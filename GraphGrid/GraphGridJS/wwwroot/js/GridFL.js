import Grid from './GridDB.js';
import Dropdown from './Dropdown.js';

export default class GridFL extends Grid {

    drawHeaderCell(col, context) {
        const grid = this;

        let res = super.drawHeaderCell(col);
        if (col.filtrable && context != 'fake') {
            res += `<div class="grid-header-filter">
                <input value="${col.filter !== undefined ? col.filter : ''}"  title="${col.filter !== undefined ? col.filter : ''}" grid-col-filter="${grid.id}_${col.id}_" class="grid-col-filter ${grid.opt.filterInputClass || ''}">
                ${col.filter !== undefined && col.filter !== '' ? `<button grid-filter-clear="${grid.id}_${col.id}_" type="button" class="grid-filter-clear" style="color: black;">×</button>` : ''}
            </div>`;
        }

        return res;
    }

    showAutocomplete(parentElem, column) {
        const grid = this;

        if (grid._autocompleteDropdown) {
            grid._autocompleteDropdown.close();
        }

        grid._autocompleteDropdown = new Dropdown({
            owner: grid,
            parentElem: parentElem,
            translate: grid.translate,
            menuItemClass: grid.opt.menuItemClass,
            menuClass: grid.opt.menuClass,
            dropdownWndClass: grid.opt.dropdownWndClass,
            getItems: function (e) {
                e.autocompleteColumn = column;

                grid.getRows({
                    autocompleteColumn: column, resolve: function (rows) {
                        rows = rows || [];

                        const res = [];
                        let i = 0;
                        for (let row of rows) {
                            res.push({ id: i++, text: String(row) });
                        };

                        if (e.resolve) {
                            e.resolve(res);
                        }
                    }
                })

            //    const res = [];
            //    let i = 0;
            //    for (let row of grid.getRows(e)) {
            //        res.push({ id: i++, text: String(row) });
            //    };

            //    if (e.resolve) {
            //        e.resolve(res);
            //    }

            //    return res;
            },
            onItemClick: function (owner, itemId) {
                const item = grid._autocompleteDropdown.items.find(function (item, index, array) {
                    return item.id == itemId;
                });
                owner.columnFilterChange(column, item.text);
            },
            onClose: function () {
                delete grid._autocompleteDropdown;
            },
            pageSize: grid.autocompleteMaxRows || 10
        });

        grid._autocompleteDropdown.show();
    }

    columnFilterChange(column, filter) {
        const grid = this;

        column.filter = filter;

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    clearAllColumnFilters() {
        const grid = this;

        for (let col of grid.columns) {
            col.filter = '';
        }

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }

    isFiltered() {
        const grid = this;

        for (let col of grid.columns) {
            if (col.filter) return true;
        }

        return false;
    }

    getGridSettings(grid) {
        const res = super.getGridSettings(grid);

        res.push({ id: 2, text: 'Clear all filters' });

        return res;
    }

    onSettingsItemClick(grid, itemId) {
        super.onSettingsItemClick(grid, itemId);

        switch (itemId) {
            case '2':
                grid.clearAllColumnFilters();
                break;
        }
    }

    setupPagerButtons() {
        const grid = this;

        super.setupPagerButtons();

        if (!grid.columns && grid.opt.getColumns) {
            grid.prepareColumns(grid.opt.getColumns());

            let hasFiltrable = false;
            for (let col of grid.columns) {
                if (col.filtrable) {
                    hasFiltrable = true;
                    break;
                }
            }

            if (!hasFiltrable) return;
        }

        const clear = {
            id: 10,
            name: 'clear',
            title: 'Clear all filters',
            label: 'Clear',
            click: function (e) {
                grid.clearAllColumnFilters();
            },
            getDisabled: function () {
                return /*!grid.rows || grid.rows.length <= 0 ||*/ !grid.isFiltered();
            },
            draw: grid.drawPagerButton,
        }

        grid.pagerButtons.unshift(clear);
        grid.pagerButtonsDict[clear.id] = grid.pagerButtonsDict[clear.name] = clear;
    }
}

document.addEventListener('click', function (e) {
    let gridId, itemId, grid;

    switch (e.target.tagName) {
        case 'INPUT':
            if (!e.target.hasAttribute('grid-col-filter')) return;

            e.target.focus();

            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
            grid = window._gridDict[gridId];
            const column = grid.colDict[itemId];

            const parentElem = e.target;

            setTimeout(function () {
                if (grid._skipAutocomplete) {
                    grid._skipAutocomplete = false;
                    return;
                }
                grid.showAutocomplete(parentElem, column);
            }, 150);
            break;
    }
});

//document.addEventListener('dblclick', function (e) {
//    let gridId, itemId, grid, column;

//    switch (e.target.tagName) {
//        case 'INPUT':
//            if (!e.target.hasAttribute('grid-col-filter')) return;

//            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
//            grid = window._gridDict[gridId];
//            column = grid.colDict[itemId];

//            grid._skipAutocomplete = true;
//            break;
//        case 'DIV':
//            const th = e.target.closest('TH');

//            if (!th || !th.hasAttribute('grid-header-th')) return;

//            [gridId, itemId] = e.target.getAttribute('grid-header-th').split('_');
//            grid = window._gridDict[gridId];
//            column = grid.colDict[itemId];

//            grid._skipAutocomplete = true;
//            break;
//    }
//});

document.addEventListener('change', function (e) {
    let gridId, itemId, grid;

    switch (e.target.tagName) {
        case 'INPUT':
            if (!e.target.hasAttribute('grid-col-filter')) return;

            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
            grid = window._gridDict[gridId];

            if (grid._skipChange) return;

            const column = grid.colDict[itemId];
            const filter = e.target.value;

            grid.columnFilterChange(column, filter);
            break;
    }
});

document.addEventListener('input', function (e) {
    let gridId, itemId, grid;

    switch (e.target.tagName) {
        case 'INPUT':
            if (!e.target.hasAttribute('grid-col-filter')) return;

            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
            grid = window._gridDict[gridId];
            const column = grid.colDict[itemId];
            column.filter = e.target.value;
            const parentElem = e.target;

            grid._autocompleteSeq = grid._autocompleteSeq || 0;
            let prevSeq = grid._autocompleteSeq;
            grid._autocompleteSeq++;

            setTimeout(function () {
                if (++prevSeq != grid._autocompleteSeq) return;

                grid.showAutocomplete(parentElem, column);
            }, 100);
            break;
    }
});

document.addEventListener('click', function (e) {

    switch (e.target.tagName) {
        case 'BUTTON':
            const attr = e.target.getAttribute('grid-filter-clear');
            if (!attr) return;

            const [gridId, itemId] = attr.split('_');

            const grid = window._gridDict[gridId];
            const column = grid.colDict[itemId];

            column.filter = '';
            grid.columnFilterChange(column, '');
            break;
    }
});
