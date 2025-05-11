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
                            key={`colfilter_${grid.id}_${col.id}_`}
                            id={`colfilter_${grid.id}_${col.id}_`}
                            className={`grid-col-filter ${grid.opt.filterInputClass || ''}`}
                            value={col.filter !== undefined ? col.filter : ''}
                            title={col.filter !== undefined ? col.filter : ''}
                            style={{ gridColumn: !hasFilter ? 'span 2' : '', width: 'calc(100% - 4px)', padding: '0 2px', boxSizing: 'border-box' }}
                            grid-col-filter={`${grid.id}_${col.id}_`}
                            onChange={(e) => { grid.columnFilterChanging(col, e.target.value, e) }}
                            onClick={(e) => { grid.onAutocompleteClick(col, e); }}
                            onInput={(e) => { grid.onAutocompleteInput(col, e) }}
                            autoFocus={grid._inputingColumn === col}
                            onFocus={(e) => { grid.onAutocompleteFocus(col, e) }}
                            onBlur={(e) => { grid.columnFocusLost(col, col.filter, e); }}
                        >
                        </input>
                        {
                            hasFilter ? <button
                                key={`colfilterClear_${grid.id}_${col.id}_`}
                                grid-filter-clear={`${grid.id}_${col.id}_`}
                                className={"grid-filter-clear"}
                                style={{ color: 'black' }}
                                type={'button'}
                                onClick={(e) => grid.clearColumnFilter(col)}
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
            return String(item.id) === String(e.itemId);
        });

        e.dropdown.items = [];
        grid._autocompleteDropdown.items = [];

        grid._inputingColumn.prevFilter = item.text;
        grid.columnFilterChanged(grid._inputingColumn, item.text);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showAutocomplete(e) {
        const grid = this;

        if (grid._autocompleteRect) {
            grid._autocompleteDropdown.opt.parentRect = grid._autocompleteRect;
        }

        grid._autocompleteDropdown.popup(e);

        if (grid._autocompleteRect) {
            delete grid._autocompleteRect;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    columnFilterChanging(column, filter, e) {
        const grid = this;
        if (grid._skipChange) return;

        column.filter = filter;
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        grid._autocompleteDropdown.items = [];
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    columnFocusLost(column, filter, e) {
        const grid = this;
        if (grid._skipChange || column.filter === column.prevFilter) return;

        delete grid._inputingColumn;
        column.prevFilter = '';
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    columnFilterChanged(column, filter, e) {
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
            grid._autocompleteRect = e.target.getBoundingClientRect();

            grid.showAutocomplete(e);
        }, 150);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocompleteFocus(col, e) {
        const grid = this;

        if (col.prevFilter === undefined) {
            col.prevFilter = col.filter;
        }

        const sameColumn = grid._inputingColumn === col;
        grid._inputingColumn = col;
        if (grid._autocompleteDropdown.visible && !sameColumn) {
            grid._autocompleteDropdown.close();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocompleteInput(col, e) {
        const grid = this;

        grid._autocompleteSeq = grid._autocompleteSeq || 0;
        let prevSeq = grid._autocompleteSeq;
        grid._autocompleteSeq++;


        setTimeout(() => {
            if (++prevSeq !== grid._autocompleteSeq) return;

            grid._inputingColumn = col;
            grid._autocompleteDropdown.items = [];

            const elem = document.getElementById(e.target.id);

            grid._autocompleteRect = elem ? elem.getBoundingClientRect() : e.target.getBoundingClientRect();

            grid.showAutocomplete(e);
        }, 100);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearColumnFilter(column) {
        const grid = this;

        column.filter = '';
        column.prevFilter = '';

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

        switch (String(itemId)) {
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
}
// ==================================================================================================================================================================