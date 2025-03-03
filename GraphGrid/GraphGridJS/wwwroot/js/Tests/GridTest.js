import Grid from '../Grid.js';
import Modal from '../Modals.js';
import TestData from '../Tests/TestData.js';


let grid;
let modalGrid;
let wndModal;

function createGrid() {
    let res = new Grid({
        getRows: function (e) {
            //fetch('my.db.com/family/list', function (data) {
            //    this.rows = data;
            //})
            const data = new TestData();
            this.rows = data.getFamily(e);


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
            h: 300,
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