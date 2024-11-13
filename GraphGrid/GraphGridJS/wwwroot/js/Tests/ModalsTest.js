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
        //closeWhenClick: true,
        isModal: true,
        title: 'Test modal title',
        draggable: true,
        resizable: true,
        pos: {
            x: 120,
            y: 120,
            w: 200,
            h: 200,
            minH: 50,
            minW: 100
        },
        style: 'background:white;border:1px solid;',
        drawBody: function () {
            return 'Test modal content';
        },
        drawFooter: false
    });
    wndModal.show();
}
