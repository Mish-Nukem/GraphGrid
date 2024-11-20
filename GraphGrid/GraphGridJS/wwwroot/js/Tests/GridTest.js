import Grid from '../Grid.js';
import Modal from '../Modals.js';


let grid;

function createGrid() {
    let res = new Grid({
        getData: function (after) {
            this.rows = [
                { Id: 1, Name: 'Mikle', Date: '26/01/1979', Comment: 'Good boy' },
                { Id: 2, Name: 'Nataly', Date: '15/01/1999', Comment: 'Good girl' },
                { Id: 3, Name: 'Mother', Date: '03/07/1953', Comment: 'Mommy' },
                { Id: 4, Name: 'Father', Date: '14/06/1953', Comment: 'Papa' },
                { Id: 5, Name: 'Grandmother', Date: '17/06/1917', Comment: 'Babushka' },
                { Id: 6, Name: 'Evgenia', Date: '31/10/1974', Comment: 'Sister' },
                { Id: 7, Name: 'Ilia', Date: '16/09/1980', Comment: 'Brother 1' },
                { Id: 8, Name: 'Mitka', Date: '04/07/1989', Comment: 'Brother 2' },
            ];
            after();
        }
    });
    return res;
}

export function TestGrid() {
    if (!grid) {
        grid = createGrid();
        grid.draw();
    }
    else {
        grid.refresh();
    }
}


let wndModal;
let mGrid;

export function TestPopupWndGrid() {
    wndModal = wndModal || new Modal({
        isModal: true,
        title: 'Test modal title',
        draggable: true,
        resizable: true,
        closeWhenEscape: true,
        pos: {
            x: 120,
            y: 120,
            w: 300,
            h: 200,
            minH: 50,
            minW: 100
        },
        style: 'background:white;border:1px solid;',
        drawBody: function (body) {

            if (!mGrid) {
                mGrid = createGrid();
            }
            mGrid.parent = body;
            mGrid.draw();
        },
        footerButtons: [
            {
                title: 'Modal',
                onclick: function (e) {
                    let modal2 = new Modal({
                        isModal: true,
                        title: 'Second Test modal',
                        draggable: true,
                        resizable: true,
                        closeWhenEscape: true,
                        pos: {
                            x: 140,
                            y: 140,
                            w: 200,
                            h: 200,
                            minH: 50,
                            minW: 100
                        },
                        style: 'background:white;border:1px solid;',
                        drawBody: function (ev) {
                            return 'Second Test modal content';
                        },
                    });
                    modal2.show();
                }
            },
            {
                title: 'OK',
                onclick: function (e) {
                    e.modal.result = 'Applied';
                    e.modal.refresh();
                }
            },
            {
                title: 'Cancel',
                onclick: function (e) {
                    e.modal.result = 'Cancelled';
                    e.modal.refresh();
                }
            },
            {
                title: 'Close',
                onclick: function (e) {
                    e.modal.result = '';
                    e.modal.close();
                }
            },
        ],
    });
    wndModal.show();
}