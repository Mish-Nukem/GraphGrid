import Grid from '../Grid.js';
import Modal from '../Modals.js';


let grid;
let modalGrid;
let wndModal;

function createGrid() {
    let res = new Grid({
        getRows: function (e) {
            this.rows = [
                { Id: 1, Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy' },
                { Id: 2, Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
                { Id: 3, Name: 'Mother', Date: '03/07/1953', Comment: 'Mommy' },
                { Id: 4, Name: 'Father', Date: '14/06/1953', Comment: 'Papa' },
                { Id: 5, Name: 'Grandmother', Date: '17/06/1917', Comment: 'Babushka', BlaBla: 'Bla Bla Bla Bla Bla Bla Bla Bla Bla Bla Bla Bla ' },
                { Id: 6, Name: 'Evgenia', Date: '31/10/1974', Comment: 'Sister' },
                { Id: 7, Name: 'Ilia', Date: '16/09/1980', Comment: 'Brother 1' },
                { Id: 8, Name: 'Mitka', Date: '04/07/1989', Comment: 'Brother 2' },
            ];
            e.resolve();
        },
    //    getColumns: function () {
    //        return [{ name: 'Id' }, { name: 'Name' }, { name: 'Comment' }];
    //    }
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
        title: 'Test grid',
        draggable: true,
        resizable: true,
        closeWhenEscape: true,
        pos: {
            x: 120,
            y: 120,
            w: 450,
            h: 200,
            minH: 50,
            minW: 100
        },
        style: 'background:white;border:1px solid;',
        drawBody: function (wndBodyElement) {
            const span = document.createElement('span');
            span.innerHTML = 'Drag column header to change columns order';
            span.style.margin = '10px';
            wndBodyElement.appendChild(span);

            if (!modalGrid) {
                modalGrid = createGrid();
            }

            const div = document.createElement('div');
            div.style.margin = '10px';
            wndBodyElement.appendChild(div);
            
            modalGrid.parent = div;
            modalGrid.refresh();
        },
        footerButtons: [
            {
                title: 'Reset columns order',
                onclick: function (e) {
                    modalGrid.resetColumnsOrderToDefault();
                }
            },

            {
                title: 'Reset columns widths',
                onclick: function (e) {
                    modalGrid.resetColumnsWidthsToDefault();
                }
            },
            {
                title: 'Close',
                onclick: function (e) {
                    e.modal.close();
                }
            },
            {
                title: 'Close and remove grid',
                onclick: function (e) {
                    modalGrid.remove();
                    modalGrid = undefined;

                    e.modal.close();
                }
            },
        ],
    });
    wndModal.show();
}