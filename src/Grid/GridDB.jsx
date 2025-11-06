/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { Images } from './Themes/Images';
import { GridPKClass } from './GridPK';
import { Dropdown } from './Dropdown';
import { WaveType } from './Graph';
import { NodeStatus } from './Base';
import { BaseComponent } from './Base';
import { GLObject } from './GLObject';
// ==================================================================================================================================================================
export function GridDB(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid != null) {
        grid = null;
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridDBClass(props);
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

            grid._waitingRows = true;
            grid.getRows({ filters: grid.collectFilters(), grid: grid }).then(
                rows => {
                    grid.rows = rows;
                    grid.afterGetRows();
                    grid.refreshState();
                }
            ).finally(() => {
                grid._waitingRows = false;
                grid.refreshState();
            });
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
export class GridDBClass extends GridPKClass {

    constructor(props) {
        super(props);

        const grid = this;
        grid.pageNumber = 1;
        grid.pageSize = props.pageSize === 0 ? 0 : props.pageSize || 10;

        grid.pageSizes = [5, 10, 15, 20, 30, 40, 50, 100];

        grid.buttons = props.buttons || [];

        grid.sortDisabled = props.sortDisabled;

        grid.opt.toolbarClass = props.toolbarClass;
        grid.opt.toolbarButtonsClass = props.toolbarButtonsClass;
        grid.opt.pagerClass = props.pagerClass;
        grid.opt.pagerButtonsClass = props.pagerButtonsClass;
        grid.opt.inputClass = props.inputClass;

        grid.sortColumns = [];

        grid.multi = props.multi;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    visitByWave(e) {
        const grid = this;
        if (grid.skipOnWaveVisit(e)) return;

        if (e.waveType === WaveType.value) {
            if (grid.status === NodeStatus.filter) {
                if (!grid._selecting) {
                    grid.selectedRowIndex = -1;
                }
                grid.value = grid.text = '';
                grid._selectedOptions = [];
                return;
            }
        }

        grid.pageNumber = 1;

        super.visitByWave(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    keyAdd() {
        const grid = this;
        return `${super.keyAdd()}_${grid.pageSize}_${grid.pageNumber}_`;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const grid = this;
        grid.setupPagerButtons();

        return (
            <>
                {grid.renderToolbar()}
                {/*grid.renderAppliedFilters()*/}
                {grid.renderPager()}
                {super.render()}
                {grid.renderPager(true)}
                <Dropdown init={(dd) => { grid.menuDropdown = dd; }} getItems={(e) => { return grid.getGridSettings(e); }} onItemClick={(e) => { grid.onSettingsItemClick(e.itemId); }}></Dropdown>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    isEditing() {
        const grid = this;
        return grid._isEditing === true;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setEditing(value) {
        const grid = this;
        grid._isEditing = value;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderToolbar() {
        const grid = this;
        grid.buttons = grid.buttons || [];
        return (
            false ?
                <div

                    key={`gridToolbarDiv_${grid.id}_`}
                    className={grid.opt.toolbarClass || BaseComponent.theme.toolbarClass || 'toolbar-default'}
                >
                    {
                        grid.buttons.map((button, ind) => {
                            return (
                                button.getVisible && !button.getVisible() ? <span key={`toolbarEmpty_${grid.id}_${button.id}_${ind}_`}></span> :
                                    <button
                                        key={`toolbarButton_${grid.id}_${button.id}_${ind}_`}
                                    ></button>
                            )
                        })
                    }
                </div>

                :

                grid.buttons.length <= 0 ? <></> :
                    <div

                        key={`gridToolbarDiv_${grid.id}_`}
                        className={grid.opt.toolbarClass || 'toolbar-default'}
                    >
                        {
                            grid.buttons.map((button, ind) => {
                                return (
                                    button.render ?
                                        button.render()
                                        :
                                        <button
                                            key={`toolbarButton_${grid.id}_${button.id}_${ind}_`}
                                            className={`${button.class || grid.opt.toolbarButtonsClass || BaseComponent.theme.toolbarButtonsClass || 'grid-toolbar-button'}`}
                                            style={{
                                                width: button.w ? button.w : button.img ? '' : 'auto',
                                                display: button.getVisible && !button.getVisible() ? 'none' : '',
                                                padding: button.padding ? button.padding : '',
                                                margin: '5px 2px',
                                            }}
                                            title={grid.translate(button.title, 'grid-toolbar-button')}
                                            disabled={button.getDisabled && button.getDisabled({ grid: grid }) || button.disabled ? 'disabled' : ''}
                                            onClick={button.click ? (e) => {
                                                e.grid = grid;
                                                button.click(e);
                                            } : grid.onButtonClick ? (e) => { grid.onButtonClick(e) } : null}
                                        >
                                            {button.img ? button.img() : ''}
                                            {GLObject.gridSettings.buttonSize > 0 || !button.img ? grid.translate(button.label, 'grid-toolbar-button') || grid.translate(button.title, 'grid-toolbar-button') : ''}
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
                    key={`pagerDiv_${bottom ? 'bottom' : 'top'}_${grid.id}_`}
                    className={grid.opt.pagerClass || BaseComponent.theme.pagerClass || 'grid-pager-default'}
                    style={{ display: 'flex', alignItems: 'center' }}
                >
                    {
                        grid.pagerButtons.map((button, ind) => {
                            return (
                                button.render ? button.render(button, bottom) :
                                    <button
                                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_${ind}_`}
                                        grid-pager-item={`${grid.id}_${button.id}_`}
                                        className={`${button.class || BaseComponent.theme.pagerButtonsClass || 'grid-pager-button'}`}
                                        title={grid.translate(button.title, 'grid-pager-button')}
                                        disabled={grid.isEditing() || button.getDisabled && button.getDisabled({ grid: grid }) || button.disabled ? 'disabled' : ''}
                                        onClick={button.click ? button.click : null}
                                        style={{ margin: '5px 2px', minHeight: '2em', display: 'flex' }}
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
        if (grid.pagerButtons && grid.pagerButtons.length > 0) return;

        grid.pagerButtons = [];
        grid.pagerButtonsDict = {};

        const refresh = {
            id: 0,
            name: 'refresh',
            title: 'Refresh',
            label: Images.images.refresh ? '' : 'Refresh',
            click: function (e) {
                grid.refresh();
            },
            img: Images.images.refresh,
            class: grid.pagerButtonsClass,
            getDisabled: function () {
                return grid._waitingRows;
            },
        }

        grid.pagerButtons.push(refresh);
        grid.pagerButtonsDict[refresh.id] = grid.pagerButtonsDict[refresh.name] = refresh;

        if (grid.showGridSettings) {
            const settings = {
                id: 1,
                name: 'settings',
                title: 'Settings',
                label: Images.images.settings ? '' : 'Settings',
                click: function (e) {
                    grid.showGridSettings(e);
                },
                img: Images.images.settings,
                class: grid.pagerButtonsClass,
                getDisabled: function () {
                    return grid._waitingRows;
                },
            }

            grid.pagerButtons.push(settings);
            grid.pagerButtonsDict[settings.id] = grid.pagerButtonsDict[settings.name] = settings;
        }

        if (grid.multi) {
            const pocket = {
                id: 2,
                name: 'pocket',
                title: 'Pocket',
                label: Images.images.pocket ? '' : 'Pocket',
                click: function (e) {
                    grid.switchGridPocket(e);
                },
                img: grid.pocketOpened ? Images.images.pocketOpened : Images.images.pocket,
                class: grid.pagerButtonsClass,
                getDisabled: function () {
                    return grid._waitingRows;
                },
            }

            grid.pagerButtons.push(pocket);
            grid.pagerButtonsDict[pocket.id] = grid.pagerButtonsDict[pocket.name] = pocket;
        }

        if (grid.pageSize > 0) {

            const first = {
                id: 3,
                name: 'first',
                title: 'First',
                label: Images.images.first ? '' : 'First',
                click: function (e) {
                    grid.gotoFirstPage();
                },
                getDisabled: function () {
                    return grid._waitingRows || !grid.rows || grid.rows.length <= 0 || grid.pageNumber === 1;
                },
                img: Images.images.first,
                class: grid.pagerButtonsClass,
            }

            grid.pagerButtons.push(first);
            grid.pagerButtonsDict[first.id] = grid.pagerButtonsDict[first.name] = first;

            const prev = {
                id: 4,
                name: 'prev',
                title: 'Prev',
                label: Images.images.prev ? '' : 'Prev',
                click: function (e) {
                    grid.gotoPrevPage();
                },
                getDisabled: function () {
                    return grid._waitingRows || !grid.rows || grid.rows.length <= 0 || grid.pageNumber === 1;
                },
                img: Images.images.prev,
                class: grid.pagerButtonsClass,
            }

            grid.pagerButtons.push(prev);
            grid.pagerButtonsDict[prev.id] = grid.pagerButtonsDict[prev.name] = prev;

            const curr = {
                id: 5,
                name: 'curr',
                title: 'Current Page',
                label: 'Current Page',
                click: function (e) {
                },
                getDisabled: function () {
                    return grid._waitingRows || !grid.rows || grid.rows.length <= 1;
                },
                render: function (button, bottom) {
                    return (
                        <input
                            key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_`}
                            title={grid.translate(button.title, 'grid-pager-button')}
                            value={grid.pageNumber}
                            grid-pager-item={`${grid.id}_${button.id}_`}
                            className={`${button.class ? button.class : grid.opt.inputClass || BaseComponent.theme.inputClass || 'grid-pager-current'}`}
                            style={{ width: '3em', height: '2em', display: 'inline-block', margin: '0 2px' }}
                            disabled={grid._waitingRows || grid.isEditing() ? 'disabled' : ''}
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
                id: 6,
                name: 'pages',
                title: 'Total Pages',
                label: 'Total Pages',
                render: function (button, bottom) {
                    return (
                        <span
                            key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_`}
                            className={'grid-pager-of'}
                            title={grid.translate(button.title, 'grid-pager-button')}
                        >
                            {` ${grid.translate('of', 'pager-button')} ${grid.pagesCount >= 0 ? grid.pagesCount : '0'}`}
                        </span>
                    );
                }
            }

            grid.pagerButtons.push(pages);
            grid.pagerButtonsDict[pages.id] = grid.pagerButtonsDict[pages.name] = pages;

            const next = {
                id: 7,
                name: 'next',
                title: 'Next',
                label: Images.images.next ? '' : 'Next',
                click: function (e) {
                    grid.gotoNextPage();
                },
                getDisabled: function () {
                    return grid._waitingRows || !grid.rows || grid.rows.length <= 0 || grid.pageNumber === grid.pagesCount;
                },
                img: Images.images.next,
                class: grid.pagerButtonsClass,
            }

            grid.pagerButtons.push(next);
            grid.pagerButtonsDict[next.id] = grid.pagerButtonsDict[next.name] = next;

            const last = {
                id: 8,
                name: 'last',
                title: 'Last',
                label: Images.images.last ? '' : 'Last',
                click: function (e) {
                    grid.gotoLastPage();
                },
                getDisabled: function () {
                    return grid._waitingRows || !grid.rows || grid.rows.length <= 0 || grid.pageNumber === grid.pagesCount;
                },
                img: Images.images.last,
                class: grid.pagerButtonsClass,
            }

            grid.pagerButtons.push(last);
            grid.pagerButtonsDict[last.id] = grid.pagerButtonsDict[last.name] = last;

            const pgsize = {
                id: 9,
                name: 'pgsize',
                title: 'Page Size',
                label: 'Page Size',
                render: function (button, bottom) {
                    return (
                        <select
                            key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_`}
                            title={grid.translate(button.title, 'grid-pager-button')}
                            grid-pager-item={`${grid.id}_${button.id}_`}
                            className={`grid-pager-size ${button.class ? button.class : grid.opt.inputClass || BaseComponent.theme.inputClass || ''}`}
                            style={{ width: '4.5em', height: '2em', display: 'inline-block', margin: '0 2px' }}
                            value={grid.pageSize}
                            disabled={grid._waitingRows || grid.isEditing() ? 'disabled' : ''}
                            onChange={function (e) {
                                grid.setPageSize(+e.target.value);
                            }}
                        >
                            {
                                grid.pageSizes.map((size, ind) => {
                                    return (
                                        <option
                                            value={+size}
                                            key={`pageSize_${grid.id}_${ind}_`}
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
        }

        const rows = {
            id: 10,
            name: 'rows',
            title: 'Total Rows',
            label: 'Total Rows',
            render: function (button, bottom) {
                return (
                    <span
                        className={'grid-pager-total'}
                        title={grid.translate(button.title, 'grid-pager-button')}
                        key={`pager_${bottom ? 'bottom' : 'top'}_${grid.id}_${button.id}_`}
                        style={{ margin: '5px 2px' }}
                    >
                        {`${grid.translate('total rows', 'pager-button')} ${grid.totalRows >= 0 ? grid.totalRows : '0'}`}
                    </span>
                );
            }
        }

        grid.pagerButtons.push(rows);
        grid.pagerButtonsDict[rows.id] = grid.pagerButtonsDict[rows.name] = rows;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setPageSize(newSize) {
        const grid = this;

        if (grid.pageSize === newSize || grid.pageSizes.indexOf(newSize) < 0) return;

        grid.pageSize = newSize;
        grid.pageNumber = 1;
        grid.selectedRowIndex = 0;
        grid.checkPocketState();
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getHeaderGridTemplateColumns(col) {
        return col.sortInd == null ? 'auto 8px' : 'auto 18px';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeaderCell(col, context) {
        const grid = this;
        if (grid.sortDisabled) {
            return super.renderHeaderCell(col, context);
        }

        const title = grid.translate(col.title || col.name) || '';
        const sortDir = !col.sortable ? '' : col.asc ? '&#11205;' : col.desc ? '&#11206;' : '';

        const parser = new DOMParser();
        const decodedString = parser.parseFromString(`<!doctype html><body>${sortDir}`, 'text/html').body.textContent;

        return (
            <>
                <span
                    className={`grid-header-title ${col.sortable ? 'grid-header-title-sortable' : ''}`}
                    style={{
                        cursor: col.sortable && !grid._waitingRows && !grid.isEditing() ? 'pointer' : '',
                        gridColumn: !sortDir ? 'span 2' : '', opacity: !grid._waitingRows && !grid.isEditing() ? "1" : "0.6",
                        whiteSpace: 'nowrap',
                        overflowX: 'hidden',
                    }}
                    onClick={(e) => { if (!grid._waitingRows) grid.changeColumnSortOrder(col, e); }}
                    disabled={grid._waitingRows || col.disabled ? 'disabled' : ''}
                >
                    {title}
                </span>
                {sortDir ? <span className={'grid-header-sort-sign'} style={{ opacity: !grid._waitingRows && !grid.isEditing() ? "1" : "0.6" }}>{decodedString + (col.sortInd > 0 ? ` ${col.sortInd} ` : '')}</span> : ''}
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridSettingsList() {
        const grid = this;
        const res = [
            { id: 0, text: grid.translate('Reset columns order', 'grid-menu') },
            { id: 1, text: grid.translate('Reset columns widths', 'grid-menu') },
        ];

        if (!grid.sortDisabled) {
            res.push({ id: 2, text: grid.translate('Reset columns sort', 'grid-menu') });
        }

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
    checkPocketState() {
        super.checkPocketState();

        const grid = this;
        if (!grid.multi) return;

        grid.setPocketImage();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setPocketImage() {
        const grid = this;
        if (!grid.multi) return;

        const pocket = grid.pagerButtonsDict['pocket'];
        if (!pocket) return;

        pocket.img = grid.pocketOpened ? Images.images.pocketOpened : Images.images.pocket;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    switchGridPocket(e) {
        const grid = this;
        if (!grid.multi) return;

        grid.pocketOpened = !grid.pocketOpened;

        grid.setPocketImage();
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    loadPocketRows() {
        const grid = this;
        super.loadPocketRows();

        grid._sortColumns = [];
        for (let col of grid.columns) {
            if (col.sortInd != null && col.sortInd !== null || col.asc || col.desc) {
                grid._sortColumns.push(col);
            }
        }

        if (grid._sortColumns.length > 0) {
            grid._sortColumns.sort((a, b) => { return a.sortInd > b.sortInd ? 1 : -1 });
        }
        else {
            grid._sortColumns.push({ name: grid.getKeyColumn(), asc: true });
        }

        //let sortCol = null;
        //for (let col of grid.columns) {
        //    if (col.asc || col.desc) {
        //        sortCol = col;
        //        break;
        //    }
        //}

        //if (sortCol != null) {
        //    this._selectedRows.sort(function (a, b) { return a[sortCol.name] > b[sortCol.name] ? (sortCol.asc ? 1 : -1) : (sortCol.asc ? -1 : 1); });
        //}

        grid._selectedRows.sort((a, b) => {
            let lastCol;
            for (let col of grid._sortColumns) {
                if (a[col.name] === b[col.name]) continue;
                lastCol = col;
                break;
            }
            if (!lastCol) return 0;
            return a[lastCol.name] > b[lastCol.name] ? (lastCol.asc ? 1 : -1) : (lastCol.asc ? -1 : 1);
        });
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
            case '2':
                grid.resetColumnsSort();
                break;
            default:
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    resetColumnsSort() {
        const grid = this;
        for (let col of grid.columns) {
            delete col.asc;
            delete col.desc;
            delete col.sortInd;
        }
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeColumnSortOrder(column, e) {
        const grid = this;

        if (column === grid._skipClickColumn) {
            delete grid._skipClickColumn;
            return;
        }

        if (!column.sortable || grid.isEditing()) return;

        let nextInd = 1;
        if (e.shiftKey) {
            for (let col of grid.columns) {
                if (col.sortInd != null && col.sortInd !== null) {
                    nextInd++;
                }
                else if (col.asc || col.desc) {
                    col.sortInd = nextInd++;
                }
            }
        }

        if (column.asc) {
            delete column.asc;
            column.desc = true;
            if (!e.shiftKey) {
                delete column.sortInd;
            }
        }
        else if (column.desc) {
            const prevInd = column.sortInd;
            delete column.desc;
            delete column.sortInd;
            if (e.shiftKey) {
                for (let col of grid.columns) {
                    if (col.sortInd > prevInd) col.sortInd--;
                }
            }
        }
        else {
            column.asc = true;
            if (e.shiftKey) {
                column.sortInd = nextInd;
            }
            else {
                delete column.sortInd;
            }
        }

        if (!e.shiftKey) {
            for (let col of grid.columns) {
                if (col === column) continue;

                delete col.asc;
                delete col.desc;
                delete col.sortInd;
            }
        }

        grid.selectedRowIndex = 0;
        grid.afterSortColumn(column);
        grid.refresh();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterSortColumn(column) {
        const grid = this;
        delete grid._selectedRows;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}