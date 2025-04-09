import GridDB from '../BootstrapGrid.js';
import Modal from '../Modals.js';
import TestData from '../Tests/TestData.js';

let grid;
let modalGrid;
let modalChildGrid;
let modalSecondChildGrid;
let modalThirdChildGrid;

let wndModal;

function passRow(grid, row, autocompleteColumn) {
    if (!grid.columns) return true;

    for (let col of grid.columns) {
        if (!col.filtrable || (col.filter === undefined || col.filter == '') && !autocompleteColumn) continue;

        const cellValue = String(row[col.name]).toLowerCase();
        if (cellValue == '') return false;

        const filter = col.filter === undefined || col.filter == '' ? '' : col.filter.toLowerCase();

        if (filter != '') {
            if (autocompleteColumn) {
                if (autocompleteColumn == col && cellValue.indexOf(filter) != 0 || autocompleteColumn != col && cellValue != filter) return false;

            }
            else {
                if (cellValue != filter) return false;
            }
        }

        if (autocompleteColumn && grid._autocomplDict[cellValue]) return false;
    }

    return true;
}

function createGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const data = new TestData();

            const allRows = data.getFamily(e);

            if (e.autocompleteColumn) {
                this._autocomplDict = {};
                this._autocomplCount = 0;
            }

            let rows = [];
            for (let row of allRows) {
                if (!passRow(this, row, e.autocompleteColumn)) continue;

                if (e.autocompleteColumn) {
                    this._autocomplCount++;
                    if (this._autocomplCount > 10) break;

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

                //return rows;
            }
            else {
                rows = this.pageSize > 0 && this.pageNumber > 0 ? rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : rows;

                this.rows = rows;
            }

            if (e.resolve) {
                e.resolve(rows);
            }
        },
        getColumns: function () {
            return [{ name: 'Id', sortable: true, filtrable: true }, { name: 'Name', sortable: true, filtrable: true }, { name: 'SecondName', sortable: true, filtrable: true }, { name: 'Date', sortable: true }, { name: 'Comment', sortable: true, filtrable: true }];
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
        ],
    //    drawCell: function (column, row) {
    //        let val = row[column.name];
    //        val = val !== undefined ? val : '';
    //        return (<span>${val}</span>)
    //    }
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

            if (e.resolve) {
                e.resolve();
            }
        },
        getColumns: function () {
            return [{ name: 'Id', sortable: true }, { name: 'Name', title: 'Child', sortable: true }, { name: 'SecondName', sortable: true }, { name: 'Date', sortable: true }];
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
            const data = new TestData();

            const res = data.getCity();

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

            if (e.resolve) {
                e.resolve();
            }
        },
        getColumns: function () {
            return [{ name: 'City', title: 'Lived in City', sortable: true }];
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

function createThirdChildGrid() {
    let res = new GridDB({
        getRows: function (e) {
            const data = new TestData();

            const res = data.getFamily(e);

            this.rows = [];

            if (e.filters && e.filters.length) {
                const filter = ',' + (e.filters[0] + '') + ',';//.replace('[', ',').replace(']', ',');
                for (let row of res) {
                    if (filter.indexOf(',' + row['Id'] + ',') >= 0) {
                        this.rows.push(row);
                    }
                }
            }
            this.totalRows = this.rows.length;
            this.rows = this.pageSize > 0 && this.pageNumber > 0 ? this.rows.slice((this.pageNumber - 1) * this.pageSize, this.pageNumber * this.pageSize) : this.rows;

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

            if (e.resolve) {
                e.resolve();
            }
        },
        getColumns: function () {
            return [{ name: 'Id', sortable: true }, { name: 'Name', title: 'Child', sortable: true }, { name: 'SecondName', sortable: true }, { name: 'Date', sortable: true }];
        },
        pageSize: 5
    });

    res.connectToParentGrid = res.connectToParentGrid || function () { };

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.rows.length > 0 && parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['ParentId'] : '';
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
        btn.id = 'parents-tab';
        btn.className = 'nav-link';
        btn.setAttribute('role', 'tab');
        btn.setAttribute('data-bs-toggle', 'tab');
        btn.setAttribute('data-bs-target', '#parents');
        btn.setAttribute('aria-controls', 'parents');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('type', 'button');
        btn.textContent = 'Parents';
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

        const div4 = document.createElement('div');
        div4.style.margin = '10px';
        div4.style.float = 'left';
        div4.className = 'tab-pane';
        div4.id = 'parents';
        div4.setAttribute('role', 'tabpanel');
        div4.setAttribute('aria-labelledby', 'parents-tab');
        div4.setAttribute('tabindex', '0');
        divDetails.appendChild(div4);

        if (!modalThirdChildGrid) {
            modalThirdChildGrid = createThirdChildGrid();
        }
        modalThirdChildGrid.parent = div4;

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

                    modalThirdChildGrid.remove();
                    modalThirdChildGrid = undefined;

                    e.modal.close();
                }
            },
        ],
    });
    wndModal.show();
}