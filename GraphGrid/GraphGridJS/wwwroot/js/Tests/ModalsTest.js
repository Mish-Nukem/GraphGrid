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

export function TestModalWnd() {
    let wnd = new Modal({
        //closeWhenClick: true,
        isModal: true,
        title: 'Test modal title',
        pos: {
            x: 120,
            y: 120,
            w: 200,
            h: 200
        },
        style: 'background:white;border:1px solid;',
        drawBody: function () {
            return 'Test modal content';
        }
    });
    wnd.show();
}
