import GridDB from '../GridDB.js';
import Modal from '../Modals.js';
import TestData from 'TestData.js';

let grid;
let modalGrid;
let modalChildGrid;
let modalSecondChildGrid;

let wndModal;

function createGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const data = new TestData();
            this.rows = data.getFamily(e);
            this.totalRows = this.rows.length;

            if (this.columns) {
                let sortCol = null;
                for (let col of this.columns) {
                    if (col.asc || col.desc) {
                        sortCol = col;
                        break;
                    }
                }

                if (sortCol != null) {
                    this.rows.sort(function (a, b) { return a[sortCol.name] > b[sortCol.name] ? (sortCol.asc ? 1 : -1) : (sortCol.asc ? -1 : 1); });
                }
            }

            this.rows = this.pageSize > 0 && this.pageNumber > 0 ? this.rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : this.rows;

            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Id', sortable: true }, { name: 'Name', sortable: true }, { name: 'Date', sortable: true }, { name: 'Comment', sortable: true }];
        },
        pageSize: 5,
        toolbarButtons: [
            {
                id: 1,
                name: 'info',
                title: 'Persone Info',
                label: 'Persone Info',
                click: function (e) {
                    const selRow = e.grid.selectedRowIndex >= 0 && e.grid.rows.length > 0 ? e.grid.rows[e.grid.selectedRowIndex] : null;
                    if (!selRow) return;

                    alert(`Persone Name = ${selRow.Name}, Persone Birth Day = ${selRow.Date}`);
                },
                getDisabled: function (e) {
                    return !e.grid.rows || e.grid.rows.length <= 0;
                }
            }
            
        ]
    });
    return res;
}

function createChildGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const data = new TestData();
            const res = data.getFamily(e);

            this.rows = [];

            if (e.filters && e.filters.length) {
                const filter = e.filters[0];
                for (let row of res) {
                    if (row['ParentId'].indexOf(+filter) >= 0) {
                        this.rows.push(row);
                    }
                }
            }
            this.totalRows = this.rows.length;
            this.rows = this.pageSize > 0 && this.pageNumber > 0 ? this.rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : this.rows;

            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Id' }, { name: 'Name', title: 'Child' }, { name: 'Date' }];
        },
        pageSize: 5
    });

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['Id'] : '';
        }
    });

    return res;
}

function createSecondChildGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const data = new TestData();
            const res = data.getCity(e);

            this.rows =[];

            if (e.filters && e.filters.length) {
                const filter = e.filters[0];
                for (let row of res) {
                    if (row['ParentId'] && row['ParentId'].indexOf(+filter) >= 0) {
                        this.rows.push(row);
                    }
                }
            }

            e.pageNumber = e.pageNumber || 1;

            this.totalRows = this.rows.length;
            this.rows = this.pageSize > 0 && this.pageNumber > 0 ? this.rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : this.rows;

            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Content', title: 'Lived in City' }];
        },
        pageSize: 5
    });

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['Id'] : '';
        }
    });

    return res;
}

export function TestGrid() {
    if (!grid) {
        grid = createGrid();
    }
    grid.refresh();
}

export function TestPopupWndGrid() {

    const fillWndBody = function (wndBodyElement) {
        const div = document.createElement('div');
        div.style.margin = '10px';
        wndBodyElement.appendChild(div);

        if (!modalGrid) {
            modalGrid = createGrid();
        }
        modalGrid.parent = div;

        const divDetails = document.createElement('div');
        divDetails.style.margin = '10px';
        wndBodyElement.appendChild(divDetails);

        const div2 = document.createElement('div');
        div2.style.margin = '10px';
        div2.style.float = 'left';
        divDetails.appendChild(div2);

        if (!modalChildGrid) {
            modalChildGrid = createChildGrid();
        }
        modalChildGrid.parent = div2;
        //modalChildGrid.refresh();

        const div3 = document.createElement('div');
        div3.style.margin = '10px';
        div3.style.float = 'left';
        divDetails.appendChild(div3);

        if (!modalSecondChildGrid) {
            modalSecondChildGrid = createSecondChildGrid();
        }
        modalSecondChildGrid.parent = div3;
        //modalSecondChildGrid.refresh();

        modalGrid.refresh();
    }

    wndModal = wndModal || new Modal({
        isModal: true,
        title: 'Test grid with Graph',
        draggable: true,
        resizable: true,
        closeWhenEscape: true,
        pos: {
            x: 120,
            y: 120,
            w: 950,
            h: 800,
            minH: 50,
            minW: 100
        },
        style: 'background:white;border:1px solid;',
        drawBody: function (wndBodyElement) {
            fillWndBody(wndBodyElement);
        },
        footerButtons: [
            {
                title: 'Close',
                onclick: function (e) {
                    e.modal.close();
                }
            },
            {
                title: 'Close and remove grids',
                onclick: function (e) {
                    modalGrid.remove();
                    modalGrid = undefined;

                    modalChildGrid.remove();
                    modalChildGrid = undefined;

                    modalSecondChildGrid.remove();
                    modalSecondChildGrid = undefined;

                    e.modal.close();
                }
            },
        ],
    });
    wndModal.show();
}