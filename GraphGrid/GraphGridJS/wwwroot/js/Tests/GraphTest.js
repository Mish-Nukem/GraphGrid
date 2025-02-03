import GridInGraph from '../GridInGraph.js';
import Modal from '../Modals.js';
import TestData from 'TestData.js';

let grid;
let modalGrid;
let modalChildGrid;
let modalSecondChildGrid;

let wndModal;

function createGrid() {
    let res = new GridInGraph({
        getRows: function (e) {
            const data = new TestData();
            this.rows = data.getFamily(e);
            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Id' }, { name: 'Name' }, { name: 'Date' }, { name: 'Comment' }];
        }
    });
    return res;
}

function createChildGrid() {
    let res = new GridInGraph({
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

            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Id' }, { name: 'Name', title: 'Child' }, { name: 'Date' }];
        }

    });

    res.connectToParentGrid(modalGrid, {
        applyLink: function (parentGrid) {
            return parentGrid.selectedRowIndex >= 0 ? parentGrid.rows[parentGrid.selectedRowIndex]['Id'] : '';
        }
    });

    return res;
}

function createSecondChildGrid() {
    let res = new GridInGraph({
        getRows: function (e) {
            const data = new TestData();
            const res = data.getCity(e);

            this.rows = [];

            if (e.filters && e.filters.length) {
                const filter = e.filters[0];
                for (let row of res) {
                    if (row['ParentId'] && row['ParentId'].indexOf(+filter) >= 0) {
                        this.rows.push(row);
                    }
                }
            }

            e.resolve();
        },
        getColumns: function () {
            return [{ name: 'Content', title: 'Lived in City' }];
        }

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

        const div2 = document.createElement('div');
        div2.style.margin = '10px';
        wndBodyElement.appendChild(div2);

        if (!modalChildGrid) {
            modalChildGrid = createChildGrid();
        }
        modalChildGrid.parent = div2;
        //modalChildGrid.refresh();

        const div3 = document.createElement('div');
        div3.style.margin = '10px';
        wndBodyElement.appendChild(div3);

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
            w: 550,
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
                title: 'Reset columns order 1',
                onclick: function (e) {
                    modalGrid.resetColumnsOrderToDefault();
                }
            },
            {
                title: 'Reset columns order 2',
                onclick: function (e) {
                    modalChildGrid.resetColumnsOrderToDefault();
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