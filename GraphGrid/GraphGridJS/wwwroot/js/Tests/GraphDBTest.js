import GridDB from '../GridDB.js';
import Modal from '../Modals.js';

let grid;
let modalGrid;
let modalChildGrid;
let modalSecondChildGrid;

let wndModal;

function getFamily(e) {
    const res = [
        { Id: 1, ParentId: [3, 4], Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy' },
        { Id: 2, ParentId: [0], Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
        { Id: 3, ParentId: [11, 23], Name: 'Lyuda', Date: '03/07/1953', Comment: 'Mommy' },
        { Id: 4, ParentId: [5, 22], Name: 'Borya', Date: '14/06/1953', Comment: 'Papa' },
        { Id: 5, ParentId: [0], Name: 'Nina', Date: '17/06/1917', Comment: 'Babushka' },
        { Id: 6, ParentId: [3, 4], Name: 'Evgenia', Date: '31/10/1974', Comment: 'Sister' },
        { Id: 7, ParentId: [9, 10], Name: 'Ilia', Date: '16/09/1980', Comment: 'Brother 1' },
        { Id: 8, ParentId: [9, 10], Name: 'Mitka', Date: '04/07/1989', Comment: 'Brother 2' },
        { Id: 9, ParentId: [5, 22], Name: 'Kolya', Date: '02/11/1954', Comment: 'Dadya' },
        { Id: 10, ParentId: [11, 23], Name: 'Lara', Date: '31/01/1961', Comment: 'Tetya' },
        { Id: 11, ParentId: [0], Name: 'Valya', Date: '23/06/1933', Comment: 'Babushka' },
        { Id: 12, ParentId: [6], Name: 'Dashka', Date: '??/??/2000', Comment: 'Plemyannica 1' },
        { Id: 13, ParentId: [6], Name: 'Katka', Date: '??/??/2003', Comment: 'Plemyannica 2' },
        { Id: 14, ParentId: [6], Name: 'Tuyanka', Date: '??/??/2010', Comment: 'Plemyannica 3' },
        { Id: 15, ParentId: [0], Name: 'Shura', Date: '22/04/1919', Comment: 'Dv. Babushka' },
        { Id: 16, ParentId: [15], Name: 'Ira', Date: '11/06/1947', Comment: 'Dv. Tetya' },
        { Id: 17, ParentId: [11, 23], Name: 'Sveta', Date: '??/??/19??', Comment: 'Tetya' },
        { Id: 18, ParentId: [11, 23], Name: 'Rita', Date: '??/??/19??', Comment: 'Tetya' },
        { Id: 19, ParentId: [11, 23], Name: 'Nadya', Date: '??/??/19??', Comment: 'Tetya' },
        { Id: 20, ParentId: [11, 23], Name: 'Vitia', Date: '??/??/19??', Comment: 'Dadya' },
        { Id: 21, ParentId: [11, 23], Name: 'Tanya', Date: '??/??/19??', Comment: 'Tetya' },
        { Id: 22, ParentId: [0], Name: 'Misha', Date: '??/??/19??', Comment: 'Ded' },
        { Id: 23, ParentId: [0], Name: 'Zambo', Date: '??/??/19??', Comment: 'Ded 2' },
    ];

    //e.totalRows = res.length;

    //const page = e.pageSize > 0 && e.pageNumber > 0 ? res.slice((e.pageNumber - 1) * e.pageSize, e.pageNumber * e.pageSize) : res;

    //return page;
    return res;
}

function createGrid() {
    let res = new GridDB({
        getRows: function (e) {
            this.rows = getFamily(e);
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
            const res = getFamily(e);

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
            const res = [
                { Id: 1, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], Content: 'Voronezh' },
                { Id: 2, ParentId: [1, 3, 4, 5, 6, 7, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23], Content: 'Grafskaya' },
                { Id: 3, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23], Content: 'Moskow' },
                { Id: 4, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16], Content: 'Pskov' },
                { Id: 5, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 23], Content: 'Elista' },
                { Id: 6, ParentId: [1, 3, 4, 6, 12, 13, 14], Content: 'Pyatigorsk' },
                { Id: 7, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16], Content: 'Piter' },
                { Id: 8, ParentId: [1, 3, 4, 11, 14, 17, 18, 19, 20, 23], Content: 'Novosibirsk' },
                { Id: 9, ParentId: [5, 15], Content: 'Ustyuzhna' },
                { Id: 10, ParentId: [1, 7, 8, 9, 20], Content: 'Army' },
                { Id: 11, ParentId: [2], Content: 'Bali' },
                { Id: 12, ParentId: [2], Content: 'Hanty-Mansiysk' },
            ];

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
                title: 'Reset columns state 1',
                onclick: function (e) {
                    modalGrid.resetColumnsOrderToDefault();
                    modalGrid.resetColumnsWidthsToDefault();
                }
            },
            {
                title: 'Reset columns state 2',
                onclick: function (e) {
                    modalChildGrid.resetColumnsOrderToDefault();
                    modalChildGrid.resetColumnsWidthsToDefault();
                }
            },
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