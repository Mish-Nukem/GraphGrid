import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { GridGRClass } from './GridGR';
// ==================================================================================================================================================================
export function GridPK(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid !== undefined) {
        grid = null;
        if (props.findGrid) {
            grid = props.findGrid(props);
        }
        grid = grid || new GridPKClass(props);
        needGetRows = !props.noAutoRefresh;
    }

    if (props.init) {
        props.init(grid);
    }

    grid.refreshState = function () {
        setState({ grid: grid, ind: grid.stateind++ });
    }

    useEffect(() => {
        grid.setupEvents(grid);

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
            grid.prepareColumns().then(() => grid.refreshState());
        }

        return () => {
            grid.clearEvents();
        }
    }, [grid, needGetRows])

    return (grid.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GridPKClass extends GridGRClass {
    constructor(props) {
        super(props);

        const grid = this;

        if (props.multi === true && props.keyField) {
            grid.multi = true;
            grid._allRowsOnPageSelected = false;
        }

        grid.opt.pocketButtonsClass = props.pocketButtonsClass || BaseComponent.theme.pocketButtonsClass || '';
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    afterGetRowsEvents() {
        const grid = this;
        super.afterGetRowsEvents();
        grid.checkPocketState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const grid = this;
        grid.clearEvents = function () { }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectColumnHeader() {
        const grid = this;
        return (
            !grid.pocketOpened ? <></>
                :
                <th
                    key={`headerCellSelect_${grid.id}_${grid.keyAdd()}_`}
                    grid-header={`${grid.id}_select_`}
                    className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                    style={{ position: "sticky", top: 0, width: "1.3em", overflow: "hidden", verticalAlign: "top" }}
                >
                    {
                        !grid._allRowsOnPageSelected ?
                            <button
                                className={(grid.opt.pocketButtonsClass || 'grid-pocket-button') + ' grid-pocket-button-all'}
                                onClick={(e) => grid.selectAllRows(e)}
                            >
                                {'+'}
                            </button>
                            :
                            <></>
                    }
                </th>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectColumn(row, rind) {
        const grid = this;
        return (
            !grid.pocketOpened ? <></>
                :
                <td
                    key={`gridCellSelect_${grid.id}_${rind}_${grid.keyAdd()}_`}
                >
                    {
                        grid._selectedRowsDict[row[grid.keyField]] === undefined ?
                            < button
                                className={grid.opt.pocketButtonsClass || 'grid-pocket-button'}
                                onClick={(e) => grid.selectRow(e, row)}
                            >
                                {'+'}
                            </button>
                            :
                            <></>
                    }
                </td>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPocketClearColumn(row, rind) {
        const grid = this;
        return (
            !grid.pocketOpened ? <></>
                :
                <td
                    key={`gridCellClear_${grid.id}_${rind}_${grid.keyAdd()}_`}
                >
                    <button
                        className={grid.opt.pocketButtonsClass || 'grid-pocket-button'}
                        onClick={(e) => grid.unselectRow(e, row)}
                    >
                        {'-'}
                    </button>
                </td>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderAdditionalRows() {
        const grid = this;
        if (!grid.pocketOpened) return <></>;

        const hasPocketRows = Object.keys(grid._selectedRowsDict).length > 0;

        if (!grid._selectedRows) {
            grid._selectedRows = [];
            grid.loadPocketRows();
        }

        return (
            <>
                {
                    <tr key={`gridPocketDivider_${grid.id}_`} className="" style={{ borderTop: "0", borderBottom: "0" }}>
                        {
                            <td
                                key={`gridPocketSysCol_${grid.id}_`}
                                className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                                style={{ position: "sticky", top: 0, width: "1.5em", overflow: "hidden", verticalAlign: "top" }}
                            >
                                {hasPocketRows ?
                                    <button
                                        className={(grid.opt.pocketButtonsClass || 'grid-pocket-button') + ' grid-pocket-button-all'}
                                        onClick={(e) => grid.clearPocket(e)}
                                    >
                                        {'-'}
                                    </button>
                                    :
                                    <></>
                                }
                            </td>
                        }
                        {
                            <td colSpan={grid.columns ? grid.columns.length : 0}>
                                <span className="grid-pocket-title">{`${this.translate('Pocket')} (${grid._selectedRows.length})`}</span>
                            </td>
                        }
                    </tr>
                }
                {
                    grid._selectedRows.map((row, rind) => {
                        return (
                            <tr
                                key={`gridPocketRow_${grid.id}_${rind}_${row[grid.keyField]}_${grid.keyAdd()}_`}
                            >
                                {grid.renderPocketRow(row, rind)}
                            </tr>
                        )
                    })
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    loadPocketRows() {
        const grid = this;
        for (let id in grid._selectedRowsDict) {
            let row = grid._selectedRowsDict[id];
            grid._selectedRows.push(row);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPocketRow(row, rowInd) {
        const grid = this;
        return (
            <>
                {grid.multi ? grid.renderPocketClearColumn(row, rowInd) : <></>}
                {
                    grid.columns.map((col, cind) => {
                        return (
                            col.visible === false ? <></> :
                                <td
                                    key={`gridPocketCell_${grid.id}_${rowInd}_${cind}_${grid.keyAdd()}_${row[grid.keyField]}_`}
                                >
                                    {grid.renderCell(grid, col, row, false, true)}
                                </td>
                        );
                    })
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedRows() {
        const grid = this;
        return grid._selectedRowsDict || {};
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectRow(e, row) {
        const grid = this;
        const keyColumn = grid.getKeyColumn();
        delete grid._selectedRows;

        grid._selectedRowsDict[row[keyColumn]] = row;

        grid.checkPocketState();
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    unselectRow(e, row) {
        const grid = this;
        const keyColumn = grid.getKeyColumn();
        delete grid._selectedRows;
        delete grid._selectedRowsDict[row[keyColumn]];
        grid._allRowsOnPageSelected = false;

        grid.checkPocketState();
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectAllRows() {
        const grid = this;
        const keyColumn = grid.getKeyColumn();
        delete grid._selectedRows;

        grid._allRowsOnPageSelected = true;

        for (let row of grid.rows) {
            grid._selectedRowsDict[row[keyColumn]] = row;
        }

        grid.checkPocketState();
        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkPocketState() {
        const grid = this;
        const keyColumn = grid.getKeyColumn();

        if (Object.keys(grid._selectedRowsDict).length <= 0) {
            //grid.pocketOpened = false;
            grid._allRowsOnPageSelected = false;
            return;
        }

        //grid.pocketOpened = true;
        grid._allRowsOnPageSelected = true;

        for (let row of grid.rows) {
            if (grid._selectedRowsDict[row[keyColumn]] === undefined) {
                grid._allRowsOnPageSelected = false;
                break;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearPocket() {
        const grid = this;
        grid._selectedRowsDict = {};
        delete grid._selectedRows;
        grid._allRowsOnPageSelected = false;
        grid.checkPocketState();

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}