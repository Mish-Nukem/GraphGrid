import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { GridGRClass } from './GridGR';
// ==================================================================================================================================================================
export function GridPK(props) {
    let grid = null;

    const [gridState, setState] = useState({ grid: grid, ind: 0 });

    grid = gridState.grid;
    let needGetRows = false;
    if (!grid || grid.uid !== props.uid && props.uid != null) {
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

    grid._waitingRows = needGetRows && (grid.rows.length <= 0 || grid.columns.length <= 0);

    useEffect(() => {
        grid.setupEvents(grid);

        if (grid._waitingRows) {

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
    }, [grid])

    return (grid.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class GridPKClass extends GridGRClass {
    constructor(props) {
        super(props);

        const grid = this;

        grid._selectedRowsDict = {};
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
            !grid.multi || !grid.pocketOpened ? <></>
                :
                <th
                    key={`headerCellSelect_${grid.id}_${grid.keyAdd()}_`}
                    grid-header={`${grid.id}_select_`}
                    className={`${grid.opt.columnClass ? grid.opt.columnClass : ''} grid-header-th`}
                    style={{ position: "sticky", top: 0, width: "1.3em", overflow: "hidden", verticalAlign: "top"/*, padding: "2px 0 0 0"*/ }}
                >
                    {
                        !grid._allRowsOnPageSelected ?
                            <div className="grid-pocket-button-div">
                                <button
                                    className={(grid.opt.pocketButtonsClass || 'grid-pocket-button') + ' grid-pocket-button-all'}
                                    onClick={(e) => grid.selectAllRows(e)}
                                >
                                    {'+'}
                                </button>
                            </div>
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
                    //style={{ padding: "2px 0 0 0" }}
                >
                    {
                        grid._selectedRowsDict[row[grid.keyField]] == null ?
                            <div className="grid-pocket-button-div">
                                <button
                                    className={grid.opt.pocketButtonsClass || 'grid-pocket-button'}
                                    onClick={(e) => grid.selectRow(e, row)}
                                >
                                    {'+'}
                                </button>
                            </div>
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
                    //style={{ padding: "2px 0 0 0" }}
                >
                    <div className="grid-pocket-button-div">
                        <button
                            className={grid.opt.pocketButtonsClass || 'grid-pocket-button'}
                            onClick={(e) => grid.unselectRow(e, row)}
                        >
                            {'-'}
                        </button>
                    </div>
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
                                style={{ position: "sticky", top: 0, width: "1.5em", overflow: "hidden", verticalAlign: "top"/*, padding: "2px 0 0 0"*/ }}
                            >
                                {hasPocketRows ?
                                    <div className="grid-pocket-button-div">
                                        <button
                                            className={(grid.opt.pocketButtonsClass || 'grid-pocket-button') + ' grid-pocket-button-all'}
                                            onClick={(e) => grid.clearPocket(e)}
                                        >
                                            {'-'}
                                        </button>
                                    </div>
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
    renderRow(row, rowInd, selected) {
        const grid = this;
        return (
            <>
                {grid.multi && grid.pocketOpened ? grid.renderSelectColumn(row) : <></>}
                {
                    super.renderRow(row, rowInd, selected)
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
                {grid.renderPocketClearColumn(row, rowInd)}
                {
                    grid.columns.map((col, cind) => {
                        return (
                            col.visible === false ? <></> :
                                <td
                                    key={`gridPocketCell_${grid.id}_${rowInd}_${cind}_${grid.keyAdd()}_${row[grid.keyField]}_`}
                                >
                                    {grid.renderCell(grid, col, row, false)}
                                </td>
                        );
                    })
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getGridWidth() {
        const grid = this;

        let w = super.getGridWidth();

        if (grid.multi) w += 20;

        grid._currW = w;
        return grid._currW;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedValue(delim) {
        const grid = this;

        const keyColumn = grid.getKeyColumn();
        if (!grid.multi || !grid.pocketOpened) {
            const row = grid.selectedRow();

            return row != null ? row[keyColumn] : '';
        }
        else {
            delim = delim || ',';
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                res.push(row[keyColumn]);
            }
            return res.join(delim);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedText(delim) {
        const grid = this;
        if (!grid.nameField) return '';

        if (!grid.multi || !grid.pocketOpened) {
            const row = grid.selectedRow();
            return row != null ? row[grid.nameField] : '';
        }
        else {
            delim = delim || ',';
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                res.push(row[grid.nameField]);
            }
            return res.join(delim);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectedValues(texts) {
        const grid = this;
        texts = texts || [];

        const keyColumn = grid.getKeyColumn();
        if (!grid.multi || !grid.pocketOpened) {
            const row = grid.selectedRow();

            return row != null ? [{ value: row[keyColumn], label: row[grid.nameField] }] : [];
        }
        else {
            const res = [];
            for (let id in grid._selectedRowsDict) {
                let row = grid._selectedRowsDict[id];
                let text = row[grid.nameField];
                texts.push(text);
                res.push({ value: row[keyColumn], label: text });
            }
            return res;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    selectRow(e, row) {
        const grid = this;
        const keyColumn = grid.getKeyColumn();
        delete grid._selectedRows;

        grid._selectedRowsDict[row[keyColumn]] = row;

        grid.checkPocketState();
        grid.refreshState();

        if (grid.graph) {
            grid.graph.triggerWave({ nodes: [grid], withStartNodes: false });
        }
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

        if (grid.graph) {
            grid.graph.triggerWave({ nodes: [grid], withStartNodes: false });
        }
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

        if (grid.graph) {
            grid.graph.triggerWave({ nodes: [grid], withStartNodes: false });
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

        if (grid.graph) {
            grid.graph.triggerWave({ nodes: [grid], withStartNodes: false });
        }
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
            if (grid._selectedRowsDict[row[keyColumn]] == null) {
                grid._allRowsOnPageSelected = false;
                break;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}