import { useState, useEffect } from 'react';
import { GridDBClass } from './GridDB.js';
import { Dropdown } from './Dropdown.js';
// ==================================================================================================================================================================
export function GridFL(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        grid = new GridFLClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    if (!grid.refreshState) {
        grid.refreshState = function () {
            grid.log(' -------------- refreshState ' + grid.stateind + ' --------------- ');
            setState({ grid: grid, ind: grid.stateind++ });
        }
    }

    useEffect(() => {
        grid.setupEvents();

        if (needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0)) {

            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            );
        }

        if (grid.columns.length <= 0 && grid.getColumns) {
            grid.getColumns();
        }

        return () => {
            grid.removeEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}

// ==================================================================================================================================================================
export class GridFLClass extends GridDBClass {

    constructor(props) {
        super(props);

        const grid = this;

        grid.opt.filterInputClass = props.filterInputClass;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;

        return (
            <>
                {super.render()}
                <Dropdown getItems={(e) => { return grid.getAutocomleteItems(e); }} onItemClick={(e) => { grid.onAutocomleteItemClick(e); }}
                    init={(dd) => {
                        grid._autocompleteDropdown = dd;
                        if (grid._autocompleteRect) {
                            dd.opt.parentRect = grid._autocompleteRect;
                        }
                    }}
                >
                </Dropdown>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col, context) {
        const grid = this;

        const hasFilter = col.filtrable && context !== 'fake' && col.filter !== undefined && col.filter !== '';
        return (
            <>
                {super.renderHeaderCell(col, context)}

                {col.filtrable && context !== 'fake' ?
                    <>
                        <input
                            className={`grid-col-filter ${grid.opt.filterInputClass || ''}`}
                            value={col.filter !== undefined ? col.filter : ''}
                            title={col.filter !== undefined ? col.filter : ''}
                            style={{ gridColumn: !hasFilter ? 'span 2' : '', width: 'calc(100% - 8px)' }}
                            grid-col-filter={`${grid.id}_${col.id}_`}
                            onChange={(e) => { grid.columnFilterChange(col, e.target.value, e) }}
                            onClick={(e) => { grid.onAutocompleteClick(col, e); }}
                            onInput={(e) => { grid.onAutocompleteInput(col, e) }}
                            autoFocus={grid._inputingColumn === col}
                        >
                        </input>
                        {
                            hasFilter ? <button
                                grid-filter-clear={`${grid.id}_${col.id}_`}
                                className={"grid-filter-clear"}
                                style={{ color: 'black' }}
                                type={'button'}
                                onClick={(e) => { grid.clearColumnFilter(col) }}
                            >×</button> : <></>
                        }
                    </>
                    : <></>}
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getAutocomleteItems(e) {
        const grid = this;
        return new Promise(function (resolve, reject) {

            grid.getRows({ filters: grid.collectFilters(), grid: grid, autocompleteColumn: grid._inputingColumn }).then(
                rows => {
                    const res = [];
                    let i = 0;
                    for (let row of rows) {
                        res.push({ id: i++, text: String(row) });
                    };

                    resolve(res);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocomleteItemClick(e) {
        const grid = this;

        const item = grid._autocompleteDropdown.items.find(function (item, index, array) {
            return item.id == e.itemId;
        });

        e.dropdown.items = [];
        grid._autocompleteDropdown.items = [];

        grid.columnFilterChange(grid._inputingColumn, item.text);
        //delete grid._autocompleteDropdown;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------

    showAutocomplete(e) {
        const grid = this;
        grid._autocompleteDropdown.popup(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    columnFilterChange(column, filter, e) {
        const grid = this;
        if (grid._skipChange) return;

        column.filter = filter;
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearColumnFilter(column) {
        const grid = this;

        column.filter = '';

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearAllColumnFilters() {
        const grid = this;

        for (let col of grid.columns) {
            col.filter = '';
        }

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isFiltered() {
        const grid = this;

        for (let col of grid.columns) {
            if (col.filter) return true;
        }

        return false;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridSettingsList() {
        const res = super.getGridSettingsList();

        res.push({ id: 2, text: 'Clear all filters' });

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSettingsItemClick(grid, itemId) {
        super.onSettingsItemClick(grid, itemId);

        switch (itemId) {
            case '2':
                grid.clearAllColumnFilters();
                break;
            default:
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
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
            click: (e) => {
                grid.clearAllColumnFilters();
            },
            getDisabled: () => {
                return !grid.isFiltered();
            },
        }

        grid.pagerButtons.unshift(clear);
        grid.pagerButtonsDict[clear.id] = grid.pagerButtonsDict[clear.name] = clear;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocompleteClick(col, e) {
        const grid = this;

        e.target.focus();
        setTimeout(() => {
            if (grid._skipAutocomplete) {
                grid._skipAutocomplete = false;
                return;
            }

            grid._inputingColumn = col;
            grid._autocompleteDropdown.items = [];
            //grid._autocompleteDropdown.opt.parentElem = e.target;
            grid._autocompleteRect = e.target.getBoundingClientRect();

            grid.showAutocomplete(e);
        }, 150);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocompleteInput(col, e) {
        const grid = this;

        grid._autocompleteSeq = grid._autocompleteSeq || 0;
        let prevSeq = grid._autocompleteSeq;
        grid._autocompleteSeq++;


        setTimeout(() => {
            if (++prevSeq != grid._autocompleteSeq) return;

            grid._inputingColumn = col;
            grid._autocompleteDropdown.items = [];
            //grid._autocompleteDropdown.opt.parentElem = e.target;
            grid._autocompleteRect = e.target.getBoundingClientRect();

            grid.showAutocomplete(e);
        }, 100);
    }
}
// ==================================================================================================================================================================
//document.addEventListener('click', function (e) {
//    let gridId, itemId, grid;

//    switch (e.target.tagName) {
//        case 'INPUT':
//            if (!e.target.hasAttribute('grid-col-filter')) return;

//            e.target.focus();

//            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
//            grid = window._gridDict[gridId];
//            const column = grid.colDict[itemId];

//            const parentElem = e.target;

//            setTimeout(function () {
//                if (grid._skipAutocomplete) {
//                    grid._skipAutocomplete = false;
//                    return;
//                }
//                grid.showAutocomplete(parentElem, column);
//            }, 150);
//            break;
//    }
//});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
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
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
//document.addEventListener('change', function (e) {
//    let gridId, itemId, grid;

//    switch (e.target.tagName) {
//        case 'INPUT':
//            if (!e.target.hasAttribute('grid-col-filter')) return;

//            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
//            grid = window._gridDict[gridId];

//            if (grid._skipChange) return;

//            const column = grid.colDict[itemId];
//            const filter = e.target.value;

//            grid.columnFilterChange(column, filter);
//            break;
//    }
//});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
//document.addEventListener('input', function (e) {
//    let gridId, itemId, grid;

//    switch (e.target.tagName) {
//        case 'INPUT':
//            if (!e.target.hasAttribute('grid-col-filter')) return;

//            [gridId, itemId] = e.target.getAttribute('grid-col-filter').split('_');
//            grid = window._gridDict[gridId];
//            const column = grid.colDict[itemId];
//            column.filter = e.target.value;
//            const parentElem = e.target;

//            grid._autocompleteSeq = grid._autocompleteSeq || 0;
//            let prevSeq = grid._autocompleteSeq;
//            grid._autocompleteSeq++;

//            setTimeout(function () {
//                if (++prevSeq != grid._autocompleteSeq) return;

//                grid.showAutocomplete(parentElem, column);
//            }, 100);
//            break;
//    }
//});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
//document.addEventListener('click', function (e) {

//    switch (e.target.tagName) {
//        case 'BUTTON':
//            const attr = e.target.getAttribute('grid-filter-clear');
//            if (!attr) return;

//            const [gridId, itemId] = attr.split('_');

//            const grid = window._gridDict[gridId];
//            const column = grid.colDict[itemId];

//            column.filter = '';
//            grid.columnFilterChange(column, '');
//            break;
//    }
//});
// -------------------------------------------------------------------------------------------------------------------------------------------------------------