import GridDB from '../BootstrapGrid.js';
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

        { Id: 24, ParentId: [18], Name: 'Alina', Date: '??/??/????', Comment: 'Dv. Sister' },
        { Id: 25, ParentId: [19], Name: 'Igor', Date: '??/??/????', Comment: 'Dv. Brother' },
        { Id: 26, ParentId: [19], Name: 'Dima', Date: '??/??/????', Comment: 'Dv. Brother' },
        { Id: 27, ParentId: [20], Name: 'Olga', Date: '??/??/????', Comment: 'Dv. Sister' },
        { Id: 28, ParentId: [20], Name: 'Venia', Date: '??/??/????', Comment: 'Dv. Brother' },
        { Id: 29, ParentId: [20], Name: 'Oleg', Date: '??/??/????', Comment: 'Dv. Brother' },

        { Id: 30, ParentId: [0], Name: 'Yura', Date: '??/??/????', Comment: 'Dv. Ded' },
    ];

    //e.totalRows = res.length;

    //const page = e.pageSize > 0 && e.pageNumber > 0 ? res.slice((e.pageNumber - 1) * e.pageSize, e.pageNumber * e.pageSize) : res;

    //return page;
    return res;
}

function passRow(grid, row, autocompleteColumn) {
    if (!grid.columns) return true;

    for (let col of grid.columns) {
        if (!col.filtrable || col.filter === undefined || col.filter == '') continue;

        const cellValue = String(row[col.name]).toLowerCase();
        if (cellValue == '') return false;

        const filter = col.filter.toLowerCase();
        if (autocompleteColumn) {
            if (cellValue.indexOf(filter) != 0) return false;

            if (grid._autocomplDict[cellValue]) return false;
        }
        else {
            if (cellValue != filter) return false;
        }
    }

    return true;
}

function createGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const allRows = getFamily(e);

            if (e.autocompleteColumn) {
                this._autocomplDict = {};
                this._autocomplCount = 0;
            }

            let rows = [];
            for (let row of allRows) {
                if (!passRow(this, row, e.autocompleteColumn)) continue;

                if (e.autocompleteColumn) {
                    this._autocomplCount++;
                    if (this._autocomplCount >= 10) break;

                    let cellValue = row[e.autocompleteColumn.name];
                    this._autocomplDict[String(cellValue).toLowerCase()] = 1;

                    rows.push(cellValue);
                }
                else {
                    rows.push(row);
                }
            }

            if (!e.autocompleteColumn) {
                this.totalRows = rows.length;

                if (this.columns) {
                    let sortCol = null;
                    for (let col of this.columns) {
                        if (col.asc || col.desc) {
                            sortCol = col;
                            break;
                        }
                    }

                    if (sortCol != null) {
                        rows.sort(function (a, b) { return a[sortCol.name] > b[sortCol.name] ? (sortCol.asc ? 1 : -1) : (sortCol.asc ? -1 : 1); });
                    }
                }
            }

            if (e.autocompleteColumn) {
                rows.sort(function (a, b) { return a > b ? 1 : -1; });

                return rows;
            }
            else {
                rows = this.pageSize > 0 && this.pageNumber > 0 ? rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : rows;

                this.rows = rows;

                e.resolve();
            }
        },
        getColumns: function () {
            return [{ name: 'Id', sortable: true, filtrable: true }, { name: 'Name', sortable: true, filtrable: true }, { name: 'Date', sortable: true }, { name: 'Comment', sortable: true, filtrable: true }];
        },
        pageSize: 5,
        toolbarButtons: [
            {
                id: 1,
                name: 'info',
                title: 'Persone Info',
                label: 'Persone Info',
                img: `<svg xmlns="http://www.w3.org/2000/svg"  width="20" height="20" fill="currentColor" viewBox="0 0 320 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"/></svg>`,
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

    res.connectToParentGrid = res.connectToParentGrid || function () { };

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.rows.length > 0 && parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['Id'] : '';
        }
    });

    return res;
}

function createSecondChildGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const res = [
                { Id: 1, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Voronezh' },
                { Id: 2, ParentId: [1, 3, 4, 5, 6, 7, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Grafskaya' },
                { Id: 3, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 28, 29], City: 'Moskow' },
                { Id: 4, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 30], City: 'Pskov' },
                { Id: 5, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29], City: 'Elista' },
                { Id: 6, ParentId: [1, 3, 4, 6, 12, 13, 14], City: 'Pyatigorsk' },
                { Id: 7, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16], City: 'Piter' },
                { Id: 8, ParentId: [1, 3, 4, 11, 14, 17, 18, 19, 20, 23], City: 'Novosibirsk' },
                { Id: 9, ParentId: [5, 15, 30], City: 'Ustyuzhna' },
                { Id: 10, ParentId: [1, 7, 8, 9, 20], City: 'Army' },
                { Id: 11, ParentId: [2], City: 'Bali' },
                { Id: 12, ParentId: [2], City: 'Hanty-Mansiysk' },
                { Id: 13, ParentId: [21], City: 'Paris' },
                { Id: 14, ParentId: [19, 25, 26], City: 'Energodar' },
            ];

            this.rows = [];

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
            return [{ name: 'City', title: 'Lived in City' }];
        },
        pageSize: 5
    });

    res.connectToParentGrid = res.connectToParentGrid || function () { };

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.rows.length > 0 && parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['Id'] : '';
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

        const ul = document.createElement('ul');
        ul.className = 'nav nav-tabs';
        ul.setAttribute('role', 'tablist');

        let tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.setAttribute('role', 'presentation');
        ul.appendChild(tab);

        let btn = document.createElement('button');
        btn.id = 'children-tab';
        btn.className = 'nav-link active';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('data-bs-toggle', 'tab');
        btn.setAttribute('data-bs-target', '#children');
        btn.setAttribute('aria-controls', 'children');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('type', 'button');
        btn.textContent = 'Children';
        tab.appendChild(btn);

        tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.setAttribute('role', 'presentation');
        ul.appendChild(tab);

        btn = document.createElement('button');
        btn.id = 'cities-tab';
        btn.className = 'nav-link';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('data-bs-toggle', 'tab');
        btn.setAttribute('data-bs-target', '#cities');
        btn.setAttribute('aria-controls', 'cities');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('type', 'button');
        btn.textContent = 'Cities';
        tab.appendChild(btn);

        wndBodyElement.appendChild(ul);

        const divDetails = document.createElement('div');
        divDetails.className = 'tab-content';
        divDetails.style.margin = '10px';

        wndBodyElement.appendChild(divDetails);

        const div2 = document.createElement('div');
        div2.style.margin = '10px';
        div2.style.float = 'left';
        div2.className = 'tab-pane active';
        div2.id = 'children';
        div2.setAttribute('role', 'tabpanel');
        div2.setAttribute('aria-labelledby', 'children-tab');
        div2.setAttribute('tabindex', '0');
        divDetails.appendChild(div2);

        if (!modalChildGrid) {
            modalChildGrid = createChildGrid();
        }
        modalChildGrid.parent = div2;

        const div3 = document.createElement('div');
        div3.style.margin = '10px';
        div3.style.float = 'left';
        div3.className = 'tab-pane';
        div3.id = 'cities';
        div3.setAttribute('role', 'tabpanel');
        div3.setAttribute('aria-labelledby', 'cities-tab');
        div3.setAttribute('tabindex', '0');
        divDetails.appendChild(div3);

        if (!modalSecondChildGrid) {
            modalSecondChildGrid = createSecondChildGrid();
        }
        modalSecondChildGrid.parent = div3;

        modalGrid.refresh();
    }

    wndModal = wndModal || new Modal({
        isModal: true,
        title: 'Test grid with Graph',
        draggable: true,
        resizable: true,
        closeWhenEscape: true,
        titleClass: 'modal-title',
        //headerClass: 'modal-header',
        //footerClass: 'modal-footer',
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
                class: 'btn btn-md btn-primary',
                onclick: function (e) {
                    e.modal.close();
                }
            },
            {
                title: 'Close and remove grids',
                class: 'btn btn-md btn-primary',
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