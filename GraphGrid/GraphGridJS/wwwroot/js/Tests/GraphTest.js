import GridInGraph from '../GridInGraph.js';
import Modal from '../Modals.js';


let grid;
let modalGrid;
let modalChildGrid;
let wndModal;

function createGrid() {
    let res = new GridInGraph({
        getRows: function (e) {
            this.rows = [
                { Id: 1, Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy' },
                { Id: 2, Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
                { Id: 3, Name: 'Lyuda', Date: '03/07/1953', Comment: 'Mommy' },
                { Id: 4, Name: 'Borya', Date: '14/06/1953', Comment: 'Papa' },
                { Id: 5, Name: 'Nina', Date: '17/06/1917', Comment: 'Babushka' },
                { Id: 6, Name: 'Evgenia', Date: '31/10/1974', Comment: 'Sister' },
                { Id: 7, Name: 'Ilia', Date: '16/09/1980', Comment: 'Brother 1' },
                { Id: 8, Name: 'Mitka', Date: '04/07/1989', Comment: 'Brother 2' },
                { Id: 9, Name: 'Kolya', Date: '02/11/1954', Comment: 'Dadya' },
                { Id: 10, Name: 'Lara', Date: '??/01/19??', Comment: 'Tetya' },
                { Id: 11, Name: 'Valya', Date: '23/06/1933', Comment: 'Babushka' },
                { Id: 12, Name: 'Dashka', Date: '??/??/2000', Comment: 'Plemyannica 1' },
                { Id: 13, Name: 'Katka', Date: '??/??/2003', Comment: 'Plemyannica 2' },
                { Id: 14, Name: 'Tuyanka', Date: '??/??/2010', Comment: 'Plemyannica 3' },
            ];
            e.callback();
        },
    });
    return res;
}

function createChildGrid() {
    let res = new GridInGraph({
        getRows: function (e) {
            const res = [
                { Id: 1, ParentId: [3, 4], Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy' },
                { Id: 2, ParentId: [0], Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
                { Id: 3, ParentId: [11], Name: 'Lyuda', Date: '03/07/1953', Comment: 'Mommy' },
                { Id: 4, ParentId: [5], Name: 'Borya', Date: '14/06/1953', Comment: 'Papa' },
                { Id: 5, ParentId: [0], Name: 'Nina', Date: '17/06/1917', Comment: 'Babushka' },
                { Id: 6, ParentId: [3, 4], Name: 'Evgenia', Date: '31/10/1974', Comment: 'Sister' },
                { Id: 7, ParentId: [9, 10], Name: 'Ilia', Date: '16/09/1980', Comment: 'Brother 1' },
                { Id: 8, ParentId: [9, 10], Name: 'Mitka', Date: '04/07/1989', Comment: 'Brother 2' },
                { Id: 9, ParentId: [5], Name: 'Kolya', Date: '02/11/1954', Comment: 'Dadya' },
                { Id: 10, ParentId: [11], Name: 'Lara', Date: '??/01/19??', Comment: 'Tetya' },
                { Id: 11, ParentId: [0], Name: 'Valya', Date: '23/06/1933', Comment: 'Babushka' },
                { Id: 12, ParentId: [6], Name: 'Dashka', Date: '??/??/2000', Comment: 'Plemyannica 1' },
                { Id: 13, ParentId: [6], Name: 'Katka', Date: '??/??/2003', Comment: 'Plemyannica 2' },
                { Id: 14, ParentId: [6], Name: 'Tuyanka', Date: '??/??/2010', Comment: 'Plemyannica 3' },
            ];

            this.rows = [];

            if (e.filters && e.filters.length) {
                const filter = e.filters[0];
                for (let row of res) {
                    if (row['ParentId'].indexOf(+filter) >= 0) {
                        this.rows.push(row);
                    }
                }
            }

            e.callback();
        },
        getColumns: function () {
            return [{ name: 'Id' }, { name: 'Name' }, { name: 'Date' }];
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
            const div = document.createElement('div');
            div.style.margin = '10px';
            wndBodyElement.appendChild(div);

            if (!modalGrid) {
                modalGrid = createGrid();
            }
            modalGrid.parent = div;
            modalGrid.refresh();

            //const span = document.createElement('span');
            //span.innerHTML = ' ________ ';
            //span.style.margin = '10px';
            //wndBodyElement.appendChild(span);

            const div2 = document.createElement('div');
            div2.style.margin = '10px';
            wndBodyElement.appendChild(div2);

            if (!modalChildGrid) {
                modalChildGrid = createChildGrid();
            }
            modalChildGrid.parent = div2;
            modalChildGrid.refresh();
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

                    e.modal.close();
                }
            },
        ],
    });
    wndModal.show();
}