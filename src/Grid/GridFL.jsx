﻿import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { Images } from './Themes/Images';
import { GridDBClass } from './GridDB';
import { Dropdown } from './Dropdown';
// ==================================================================================================================================================================
export function GridFL(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid !== undefined) {
        grid = null;
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridFLClass(props);
        needGetRows = !props.noAutoRefresh && !props.parentGrids;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        setState({ grid: grid, ind: grid.stateind++ });
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
        else if (grid.columns.length <= 0 && grid.getColumns) {
            grid.prepareColumns().then(() => grid.refreshState());;
        }

        return () => {
            grid.clearEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}

// ==================================================================================================================================================================
export class GridFLClass extends GridDBClass {

    constructor(props) {
        super(props);

        const grid = this;

        grid.filtersDisabled = props.filtersDisabled;
        grid.beforeOpen = props.beforeOpen;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;

        return (
            <>
                {super.render()}
                <Dropdown
                    getItems={(e) => { return grid.getAutocomleteItems(e); }}
                    onItemClick={(e) => { grid.onAutocomleteItemClick(e); }}
                    init={(dd) => {
                        if (grid._autocompleteDropdown) {
                            dd.visible = grid._autocompleteDropdown.visible;
                        }
                        grid._autocompleteDropdown = dd;
                        if (grid._autocompleteRect) {
                            dd.opt.parentRect = grid._autocompleteRect;
                        }
                    }}
                    onClose={() => {
                        if (grid._inputingColumn) {
                            delete grid._inputingColumn;
                            if (grid.needRefresh()) {
                                grid.pageNumber = 1;
                                grid.selectedRowIndex = 0;
                                grid.refresh();
                            }
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
        if (grid.filtersDisabled) {
            return super.renderHeaderCell(col, context);
        }

        const hasFilter = col.filtrable && context !== 'fake' && col.filter !== undefined && col.filter !== '';

        const needFocus = grid._autoFocusColumn === col;
        if (needFocus) {
            delete grid._autoFocusColumn;
        }

        return (
            <>
                {super.renderHeaderCell(col, context)}

                {col.filtrable && context !== 'fake' ?
                    <>
                        <input
                            key={`colfilter_${grid.id}_${col.id}_`}
                            className={`grid-col-filter ${grid.opt.inputClass || BaseComponent.theme.inputClass || ''}`}
                            value={col.filter !== undefined ? col.filter : ''}
                            title={col.filter !== undefined ? col.filter : ''}
                            style={{ gridColumn: !hasFilter ? 'span 2' : '' }}
                            grid-col-filter={`${grid.id}_${col.id}_`}
                            onChange={(e) => { grid.onColumnFilterChanging(col, e.target.value, e) }}
                            onClick={(e) => { grid.onColumnFilterClick(col, e); }}
                            onInput={(e) => { grid.onColumnFilterInput(col, e) }}
                            autoFocus={needFocus}
                            disabled={grid.isEditing() ? 'disabled' : '' }
                            onBlur={(e) => { grid.onColumnFocusLost(col, col.filter, e); }}
                            autoComplete="off"
                        >
                        </input>
                        {
                            <button
                                key={`colfilterClear_${grid.id}_${col.id}_`}
                                className={"grid-filter-clear"}
                                style={{ color: 'black', display: hasFilter ? '' : 'none' }}
                                type={'button'}
                                disabled={grid.isEditing() ? 'disabled' : ''}
                                onClick={() => grid.clearColumnFilter(col)}
                            >×</button> /*: <></>*/
                        }
                    </>
                    : <></>}
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getAutocomleteItems() {
        const grid = this;
        return new Promise(function (resolve) {

            grid.getRows({ filters: grid.collectFilters(true), grid: grid, autocompleteColumn: grid._inputingColumn }).then(
                rows => {
                    const res = [];
                    let i = 0;
                    for (let row of rows) {
                        res.push({ id: i++, text: row[grid._inputingColumn.name] || String(row) });
                    };

                    resolve(res);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    collectFilters(noSaveFilterStr) {
        const grid = this;
        const filters = super.collectFilters();
        const filterList = [];
        let fo;

        for (let col of grid.columns) {
            if (!col.filtrable || col.filter === undefined || col.filter === '') continue;

            fo = { type: 'column', filter: `${col.name} = ${col.filter}` };
            filters.push(fo);

            if (!noSaveFilterStr) {
                filterList.push(fo.filter);
            }
        }

        if (grid.beforeOpen !== undefined && grid.beforeOpen !== '') {
            fo = { type: 'graphLink', filter: grid.beforeOpen };
            filters.push(fo);
        }

        if (!noSaveFilterStr) {
            grid._lastFilters = filterList.join('&+&');
        }
        return filters;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showAutocomplete(e) {
        const grid = this;

        if (grid._autocompleteRect) {
            grid._autocompleteDropdown.opt.parentRect = grid._autocompleteRect;
        }

        delete grid._autocompleteDropdown.maxW;
        if (grid._inputingColumn && grid._inputingColumn.maxW) {
            grid._autocompleteDropdown.maxW = +grid._inputingColumn.maxW;
        }

        grid._autocompleteDropdown.popup(e);

        if (grid._autocompleteRect) {
            delete grid._autocompleteRect;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    needRefresh() {
        const grid = this;
        const prevFilterStr = grid._lastFilters;
        grid.collectFilters();

        return prevFilterStr !== grid._lastFilters;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onAutocomleteItemClick(e) {
        const grid = this;

        const item = grid._autocompleteDropdown.items.find(function (item) {
            return String(item.id) === String(e.itemId);
        });

        if (!item) {
            grid.log('onAutocomleteItemClick: ' + e.itemId + ' - does not found!');
            return;
        }

        e.dropdown.items = [];
        grid._autocompleteDropdown.items = [];
        grid._autocompleteDropdown.visible = false;

        grid._autoFocusColumn = grid._inputingColumn;

        //console.log('onAutocomleteItemClick : ' + grid._inputingColumn.filter);

        grid._inputingColumn.filter = item.text;
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        if (grid.needRefresh()) {
            grid.pageNumber = 1;
            grid.selectedRowIndex = 0;
            grid.refresh();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onColumnFilterChanging(column, filter, e) {
        const grid = this;

        //console.log('onColumnFilterChanging : ' + column.filter);

        column.filter = filter;
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        grid._autocompleteDropdown.items = [];
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onColumnFocusLost(column, filter, e) {
        const grid = this;
        if (grid._inputingColumn !== column) {
            //console.log('onColumnFocusLost: grid._inputingColumn !== column');
            delete grid._inputingColumn;
        }
        if (e && e.target) {
            grid._autocompleteRect = e.target.getBoundingClientRect();
        }

        setTimeout(() => {
            if (grid.needRefresh()) {
                //console.log('onColumnFocusLost : ' + column.filter);
                grid._autocompleteDropdown.visible = false;
                grid.pageNumber = 1;
                grid.selectedRowIndex = 0;
                grid.refresh();
            }
        }, 150);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //onAutocompleteItemSelected(column, filter, e) {
    //    const grid = this;
    //    //if (grid._skipChange) return;
    //    if (!column) return;

    //    console.log('onAutocompleteItemSelected : ' + column.filter);

    //    column.filter = filter;
    //    if (e && e.target) {
    //        grid._autocompleteRect = e.target.getBoundingClientRect();
    //    }

    //    //grid._skipAutocomplete = true;

    //    if (grid.needRefresh()) {
    //        //grid._skipAutocomplete = true;
    //        grid.pageNumber = 1;
    //        grid.selectedRowIndex = 0;
    //        grid.refresh();
    //    }
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onColumnFilterClick(col, e) {
        const grid = this;

        grid._inputingColumn = col;
        e.target.focus();
        setTimeout(() => {
            //if (grid._skipAutocomplete) {
            //    grid._skipAutocomplete = false;
            //    return;
            //}

            grid._autocompleteDropdown.items = [];
            grid._autocompleteRect = e.target.getBoundingClientRect();

            grid.showAutocomplete(e);
        }, 150);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onColumnFilterInput(col, e) {
        const grid = this;

        grid._autocompleteSeq = grid._autocompleteSeq || 0;
        let prevSeq = grid._autocompleteSeq;
        grid._autocompleteSeq++;

        col.filter = e.target.value;
        grid._autoFocusColumn = col;

        setTimeout(() => {
            if (++prevSeq !== grid._autocompleteSeq) return;

            grid._inputingColumn = col;
            grid._autocompleteDropdown.items = [];

            const elem = document.getElementById(e.target.id);

            grid._autocompleteRect = elem ? elem.getBoundingClientRect() : e.target.getBoundingClientRect();

            //grid._skipChange = true;

            grid.showAutocomplete(e);
        }, 100);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearColumnFilter(column) {
        const grid = this;

        column.filter = '';
        //column.prevFilter = '';

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

        const grid = this;
        if (!grid.filtersDisabled) {
            res.push({ id: 3, text: grid.translate('Clear all filters', 'grid-menu') });
        }

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSettingsItemClick(itemId) {
        super.onSettingsItemClick(itemId);
        const grid = this;

        switch (String(itemId)) {
            case '3':
                grid.clearAllColumnFilters();
                break;
            default:
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupPagerButtons() {
        const grid = this;
        if (grid.pagerButtons && grid.pagerButtons.length > 0) return;

        super.setupPagerButtons();

        const clear = {
            id: 10,
            name: 'clear',
            title: 'Clear all filters',
            label: Images.images.clear ? '' : 'Clear',
            click: () => {
                grid.clearAllColumnFilters();
            },
            getDisabled: () => {
                return !grid.isFiltered();
            },
            img: Images.images.clear,
            class: grid.pagerButtonsClass,
        }

        grid.pagerButtons.unshift(clear);
        grid.pagerButtonsDict[clear.id] = grid.pagerButtonsDict[clear.name] = clear;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}
// ==================================================================================================================================================================