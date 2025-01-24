import Modal from './Modals.js';
export default class Dropdown {
    constructor(options) {
        this.opt = options || {};

        this.getItems = this.opt.getItems || this.getItems;

        window._dropdownSeq = window._dropdownSeq || 0;

        this.id = window._dropdownSeq++;

        this.pageNumber = 1;
        this.pageSize = this.opt.pageSize || 20;
        this.items = [];

        this.translate = this.opt.translate || function (text) { return text; };
    }

    getItems(e) {
        return [];
    }

    appendRows() {
        const dd = this;

        dd.modal.close();
        delete dd.modal;

        dd.pageNumber++;

        setTimeout(function () {
            dd.show();
        }, 15);
    }

    draw() {
        const dd = this;

        if (!dd.lastPageNumber || dd.lastPageNumber != dd.pageNumber) {
            const newItems = dd.getItems({ filter: dd.filter, pageSize: dd.pageSize, pageNumber: dd.pageNumber });

            dd.items.push(...newItems);

            dd.lastPageNumber = dd.pageNumber;
        }

        let res = ``;

        if (dd.opt.allowUserFilter) {
            res += ``;
        }

        res += `<ul class="dropdown-ul">`;

        for (let item of dd.items) {
            res += `
                <li dropdown-item="${dd.id}_${item.id}_" title="${dd.translate(item.title || item.text)}">
                    ${dd.translate(item.text)}
                </li>`;
        }

        res += `</ul>`;

        if (dd.opt.allowUpload && dd.opt.pageSize > 0 && dd.items.length == dd.opt.pageSize * dd.pageNumber) {
            res += `<ul class="dropdown-ul">
                <li dropdown-item="${dd.id}_append_" title="${dd.translate('load more records')}">
                    ${dd.translate('more...')}
                </li>
            </ul>`;
        }

        return res;
    }

    show(e) {
        const dd = this;

        //e.parentElem = document.querySelector(`button[grid-pager-item="${grid.id}_1_"]`);

        const fakeDiv = document.createElement('div');
        fakeDiv.style.opacity = 0;
        fakeDiv.style.position = 'fixed';
        fakeDiv.innerHTML = dd.draw();
        document.body.append(fakeDiv);
        const rect = getComputedStyle(fakeDiv);
        fakeDiv.remove();

        const parentRect = dd.opt.parentElem ? dd.opt.parentElem.getBoundingClientRect() : { x: e.clientX, y: e.clientY, width: e.width, height: e.height };

        const wnd = new Modal({
            closeWhenClick: true,
            closeWhenMiss: true,
            closeWhenEscape: true,
            resizable: false,
            drawHeader: false,
            drawFooter: false,
            pos: {
                x: parentRect.x,
                y: parentRect.y + parentRect.height,
                w: rect.width,
                h: rect.height
            },
            style: 'background:white;border:1px solid;',
            drawBody: function (body) {
                return dd.draw();
            }
        });
        wnd.show();

        dd.modal = wnd;
        window._dropdown = dd;
    }

    close() {
        const dd = this;
        dd.items = [];

        delete dd.lastPageNumber;

        dd.modal.close();
        delete dd.modal;
    }
}

document.addEventListener('click', function (e) {
    let dropdownId, itemId;

    switch (e.target.tagName) {
        case 'LI':
            if (!window._dropdown || !e.target.hasAttribute('dropdown-item')) return;

            [dropdownId, itemId] = e.target.getAttribute('dropdown-item').split('_');
            if (dropdownId != window._dropdown.id) return;

            if (itemId == 'append') {
                window._dropdown.appendRows();
            }
            else {
                window._dropdown.opt.onItemClick(window._dropdown.opt.owner, itemId);
                window._dropdown.close();
            }
            break;
    }

});