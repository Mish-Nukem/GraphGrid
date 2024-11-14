import Modal from '../Modals.js';

export function TestOverlay() {

    let wnd = new Modal({
        isOverlay: true,
        closeWhenClick: true,
    });
    wnd.show();
}

export function TestPopupWnd() {
    let wnd = new Modal({
        closeWhenClick: true,
        closeWhenMiss: true,
        closeWhenEscape: true,
        resizable: false,
        drawHeader: false,
        drawFooter: false,
        pos: {
            x: 120,
            y: 120,
            w: 200,
            h: 200
        },
        style: 'background:white;border:1px solid;',
        drawBody: function () {
            return 'Test popup content';
        }
    });
    wnd.show();
}

let wndModal;

export function TestModalWnd() {
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
        drawBody: function () {
            return 'Test modal content' + (this.result ? ' -> ' + this.result : '');
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
                        drawBody: function () {
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