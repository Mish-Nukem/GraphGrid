/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { GridInGraphClass } from './GridInGraph.js';
import { Dropdown } from './Dropdown.js';
import { WaveType } from './Graph.js';
import { NodeStatus } from './Base';
// ==================================================================================================================================================================
export function GridDB(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid) {
        grid = new GridDBClass(props);
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
export class GridDBClass extends GridInGraphClass {

    constructor(props) {
        super(props);

        const grid = this;
        grid.pageNumber = 1;
        grid.pageSize = props.pageSize || 10;

        grid.pageSizes = [5, 10, 15, 20, 30, 40, 50, 100];

        grid.toolbarButtons = props.buttons || [];

        grid.opt.toolbarClass = props.toolbarClass;
        grid.opt.toolbarButtonsClass = props.toolbarButtonsClass;
        grid.opt.pagerClass = props.pagerClass;
        grid.setupPagerButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    skipOnWaveVisit(e) {
        if (super.skipOnWaveVisit(e)) return true;

        const grid = this;
        if (e.waveType === WaveType.value) {
            if (grid.status === NodeStatus.filter && !grid._selecting || grid.status === NodeStatus.hidden) {
                grid.selectedRowIndex = -1;
                if (grid.status === NodeStatus.filter) {
                    grid.updateNodeControls(true);
                    grid.graph.visitNodesByWave(e);
                }
                return true;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    visitByWave(e) {
        const grid = this;
        if (grid.skipOnWaveVisit(e)) return;

        grid.pageNumber = 1;

        super.visitByWave(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;

        return (
            <>
                {grid.renderToolbar()}
                {grid.renderAppliedFilters()}
                {grid.renderPager()}
                {super.render()}
                {grid.renderPager(true)}
                <Dropdown init={(dd) => { grid.menuDropdown = dd; }} getItems={(e) => { return grid.getGridSettings(e); }} onItemClick={(e) => { grid.onSettingsItemClick(e.itemId); }}></Dropdown>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderToolbar() {
        const grid = this;
        return (
            grid.toolbarButtons.length <= 0 ? <></> :
                <div
                    id={`grid_${grid.id}_toolbar_`}
                    className={grid.opt.toolbarClass || 'toolbar-default'}
                >
                    {
                        grid.toolbarButtons.map((button, ind) => {
                            return (
                                <button
                                    key={`toolbar_${grid.id}_${button.id}_${grid.stateind}_`}
                                    grid-toolbar-button={`${grid.id}_${button.id}_`}
                                    className={`grid-toolbar-button ${button.class || grid.opt.toolbarButtonsClass || ''}`}
                                    title={grid.translate(button.title, 'grid-toolbar-button')}
                                    disabled={button.getDisabled && button.getDisabled({ grid: grid }) || button.disabled ? 'disabled' : ''}
                                    onClick={button.click ? (e) => {
                                        e.grid = grid;
                                        button.click(e);
                                    } : null}
                                >
                                    {button.img ? button.img : ''}
                                    {button.label ? grid.translate(button.label, 'grid-toolbar-button') : ''}
                                </button>
                            );
                        })
                    }
                </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderAppliedFilters() {
        return <></>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPager(bottom) {
        const grid = this;

        return (
            grid.pagerButtons.length <= 0 || bottom && !grid.allowBottomPager ? <></> :
                <div
                    id={`grid_${grid.id}_pager_${bottom ? 'bottom' : 'top'}_`}
                    className={grid.opt.pagerClass || 'grid-pager-default'}
                >
                    {
                        grid.pagerButtons.map((button, ind) => {
                            return (
                                button.render ? button.render(button, bottom) :
                                    <button
                                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${grid.stateind}_`}
                                        grid-pager-item={`${grid.id}_${button.id}_`}
                                        className={`${button.class ? button.class : 'grid-pager-button'}`}
                                        title={grid.translate(button.title, 'grid-pager-button')}
                                        disabled={button.getDisabled && button.getDisabled({ grid: grid }) || button.disabled ? 'disabled' : ''}
                                        onClick={button.click ? button.click : null}
                                    >
                                        {button.img ? button.img() : ''}
                                        {button.label ? grid.translate(button.label, 'grid-pager-button') : ''}
                                    </button>
                            );
                        })
                    }
                </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    gotoFirstPage() {
        const grid = this;
        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    gotoPrevPage() {
        const grid = this;
        grid.pageNumber = grid.pageNumber > 1 ? grid.pageNumber - 1 : 1;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    gotoNextPage() {
        const grid = this;
        grid.calculatePagesCount();
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pageNumber + 1 : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    gotoLastPage() {
        const grid = this;
        grid.calculatePagesCount();
        grid.pageNumber = grid.pageNumber < grid.pagesCount ? grid.pagesCount : grid.pageNumber;
        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupPagerButtons() {
        const grid = this;
        grid.pagerButtons = [];
        grid.pagerButtonsDict = {};

        const refresh = {
            id: 0,
            name: 'refresh',
            title: 'Refresh',
            label: 'Refresh',
            click: function (e) {
                grid.refresh();
            },
        }

        grid.pagerButtons.push(refresh);
        grid.pagerButtonsDict[refresh.id] = grid.pagerButtonsDict[refresh.name] = refresh;

        if (grid.showGridSettings) {
            const settings = {
                id: 1,
                name: 'settings',
                title: 'Settings',
                label: 'Settings',
                click: function (e) {
                    grid.showGridSettings(e);
                },
            }

            grid.pagerButtons.push(settings);
            grid.pagerButtonsDict[settings.id] = grid.pagerButtonsDict[settings.name] = settings;
        }

        const first = {
            id: 2,
            name: 'first',
            title: 'First',
            label: 'First',
            click: function (e) {
                grid.gotoFirstPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber === 1;
            },
        }

        grid.pagerButtons.push(first);
        grid.pagerButtonsDict[first.id] = grid.pagerButtonsDict[first.name] = first;

        const prev = {
            id: 3,
            name: 'prev',
            title: 'Prev',
            label: 'Prev',
            click: function (e) {
                grid.gotoPrevPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber === 1;
            },
        }

        grid.pagerButtons.push(prev);
        grid.pagerButtonsDict[prev.id] = grid.pagerButtonsDict[prev.name] = prev;

        const curr = {
            id: 4,
            name: 'curr',
            title: 'Current Page',
            label: 'Current Page',
            click: function (e) {
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 1;
            },
            render: function (button, bottom) {
                return (
                    <input
                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${grid.stateind}_`}
                        value={grid.pageNumber}
                        grid-pager-item={`${grid.id}_${button.id}_`}
                        className={`${button.class ? button.class : 'grid-pager-current'}`}
                        style={{ width: '3em', display: 'inline-block' }}
                        onChange={function (e) {
                            const newPage = +e.target.value;

                            if (grid.pageNumber !== newPage && newPage >= 1 && newPage <= grid.pagesCount) {
                                grid.pageNumber = newPage;
                                grid.selectedRowIndex = 0;
                                grid.refresh();
                            }
                        }}
                    >
                    </input>
                )
            },
        }

        grid.pagerButtons.push(curr);
        grid.pagerButtonsDict[curr.id] = grid.pagerButtonsDict[curr.name] = curr;

        const pages = {
            id: 5,
            name: 'pages',
            title: 'Total Pages',
            label: 'Total Pages',
            render: function (button, bottom) {
                return (
                    <span
                        className={'grid-pager-of'}
                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${grid.stateind}_`}
                    >
                        {` ${grid.translate('of', 'pager-button')} ${grid.pagesCount >= 0 ? grid.pagesCount : ''}`}
                    </span>
                );
            }
        }

        grid.pagerButtons.push(pages);
        grid.pagerButtonsDict[pages.id] = grid.pagerButtonsDict[pages.name] = pages;

        const next = {
            id: 6,
            name: 'next',
            title: 'Next',
            label: 'Next',
            click: function (e) {
                grid.gotoNextPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber === grid.pagesCount;
            },
        }

        grid.pagerButtons.push(next);
        grid.pagerButtonsDict[next.id] = grid.pagerButtonsDict[next.name] = next;

        const last = {
            id: 7,
            name: 'last',
            title: 'Last',
            label: 'Last',
            click: function (e) {
                grid.gotoLastPage();
            },
            getDisabled: function () {
                return !grid.rows || grid.rows.length <= 0 || grid.pageNumber === grid.pagesCount;
            },
        }

        grid.pagerButtons.push(last);
        grid.pagerButtonsDict[last.id] = grid.pagerButtonsDict[last.name] = last;

        const pgsize = {
            id: 8,
            name: 'pgsize',
            title: 'Page Size',
            label: 'Page Size',
            render: function (button, bottom) {
                return (
                    <select
                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${grid.stateind}_`}
                        grid-pager-item={`${grid.id}_${button.id}_`}
                        className={`grid-pager-size ${button.class ? button.class : ''}`}
                        style={{ width: '4.5em', display: 'inline-block' }}
                        value={grid.pageSize}
                        onChange={function (e) {
                            const newSize = +e.target.value;

                            if (grid.pageSize !== newSize) {
                                grid.pageSize = newSize;
                                grid.pageNumber = 1;
                                grid.selectedRowIndex = 0;
                                grid.refresh();
                            }
                        }}
                    >
                        {
                            grid.pageSizes.map((size, ind) => {
                                return (
                                    <option
                                        value={+size}
                                        key={`pagesize_${grid.id}_${ind}_${grid.stateind}_`}
                                    >
                                        {size}
                                    </option>
                                );
                            })
                        }
                    </select>
                );
            },
        }

        grid.pagerButtons.push(pgsize);
        grid.pagerButtonsDict[pgsize.id] = grid.pagerButtonsDict[pgsize.name] = pgsize;

        const rows = {
            id: 9,
            name: 'rows',
            title: 'Total Rows',
            label: 'Total Rows',
            render: function (button, bottom) {
                return (
                    <span
                        className={'grid-pager-total'}
                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${grid.stateind}_`}>
                        {`${grid.translate('total rows', 'pager-button')} ${grid.totalRows >= 0 ? grid.totalRows : ''}`}
                    </span>
                );
            }
        }

        grid.pagerButtons.push(rows);
        grid.pagerButtonsDict[rows.id] = grid.pagerButtonsDict[rows.name] = rows;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col, context) {
        const grid = this;
        const title = grid.translate(col.title || col.name) || '';
        const sortDir = !col.sortable ? '' : col.asc ? '&#11205;' : col.desc ? '&#11206;' : '';

        const parser = new DOMParser();
        const decodedString = parser.parseFromString(`<!doctype html><body>${sortDir}`, 'text/html').body.textContent;

        return (
            <>
                <span
                    className={'grid-header-title'}
                    style={{ cursor: col.sortable ? 'pointer' : '', gridColumn: !sortDir ? 'span 2' : '' }}
                    onClick={(e) => grid.changeColumnSortOrder(col)}
                >
                    {title}
                </span>
                {sortDir ? <span className={'grid-header-sort-sign'}>{decodedString}</span> : ''}
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridSettingsList() {
        const res = [
            { id: 0, text: 'Reset columns order' },
            { id: 1, text: 'Reset columns widths' }
        ];

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridSettings(e) {
        const grid = this;
        return new Promise(function (resolve, reject) {

            const items = grid.getGridSettingsList();
            resolve(items);
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showGridSettings(e) {
        const grid = this;

        if (!grid.menuDropdown) return;

        const elem = document.getElementById(e.target.id);
        grid.menuDropdown.opt.parentRect = elem ? elem.getBoundingClientRect() : e.target.getBoundingClientRect();

        grid.menuDropdown.popup(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onSettingsItemClick(itemId) {
        const grid = this;

        switch (String(itemId)) {
            case '0':
                grid.resetColumnsOrderToDefault();
                break;
            case '1':
                grid.resetColumnsWidthsToDefault();
                break;
            default:
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeColumnSortOrder(column) {
        const grid = this;

        if (!column.sortable) return;

        if (column.asc) {
            delete column.asc;
            column.desc = true;
        }
        else if (column.desc) {
            delete column.desc;
        }
        else {
            column.asc = true;
        }

        for (let col of grid.columns) {
            if (col === column) continue;

            delete col.asc;
            delete col.desc;
        }

        grid.selectedRowIndex = 0;
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}