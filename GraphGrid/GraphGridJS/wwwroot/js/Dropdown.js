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

        res += `<ul class="dropdown-ul ${dd.opt.menuClass || ''}">`;

        for (let item of dd.items) {
            res += `
                <li dropdown-item="${dd.id}_${item.id}_" title="${dd.translate(item.title || item.text)}" class="${dd.opt.menuItemClass || ''} ${dd.activeItem == item ? 'active' : ''}">
                    ${dd.translate(item.text)}
                </li>`;
        }

        res += `</ul>`;

        if (dd.opt.allowUpload && dd.opt.pageSize > 0 && dd.items.length == dd.opt.pageSize * dd.pageNumber) {
            res += `<ul class="dropdown-ul">
                <li dropdown-item="${dd.id}_append_" title="${dd.translate('load more records')}" class="dropdown-item">
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
        //fakeDiv.className = 'modal-window-body';
        fakeDiv.style.position = 'fixed';
        fakeDiv.style.height = 'auto';
        fakeDiv.innerHTML = dd.draw();
        document.body.append(fakeDiv);
        const rect = getComputedStyle(fakeDiv);
        const w = parseInt(rect.width) + 1;
        const h = parseInt(rect.height) + 1;
        fakeDiv.remove();

        if (dd.items.length <= 0 && !dd.opt.allowUserFilter) return;

        const parentRect = dd.opt.parentElem ? dd.opt.parentElem.getBoundingClientRect() : { x: e.clientX, y: e.clientY, width: e.width, height: e.height };

        const wnd = new Modal({
            closeWhenClick: true,
            closeWhenMiss: true,
            closeWhenEscape: true,
            resizable: false,
            drawHeader: false,
            drawFooter: false,
            bodyClass: dd.opt.dropdownWndClass || 'dropdown-wnd',
            pos: {
                x: parentRect.x,
                y: parentRect.y + parentRect.height,
                w: Math.max(w, parentRect.width),
                h: h
            },
            //style: 'background:white;', //border:1px solid;
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

        if (dd.opt.onClose) {
            dd.opt.onClose();
        }

        dd.items = [];
        delete dd.activeItem;

        delete dd.lastPageNumber;

        if (dd.modal) {
            dd.modal.close();
            delete dd.modal;
        }
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

document.addEventListener('keydown', function (e) {
    const dd = window._dropdown;

    if (!dd) return;

    const key = e && e.key ? e.key.toLowerCase() : '';

    let activeItemElem, nextItemElem, itemElem, activeItem, nextItem, dropdownId, itemId, ind;

    switch (key) {
        case 'esc', 'escape':
            dd.close();;
            break;
        case 'enter':
            if (!dd.activeItem) return;

            dd.opt.onItemClick(dd.opt.owner, dd.activeItem.id);
            dd.close();
            break;
        case 'down', 'arrowdown':
            //activeItemElem = dd.modal.element.querySelector('li[class="active"]');
            if (dd.activeItem) {
                //[dropdownId, itemId] = activeItem.getAttribute('dropdown-item').split('_');

                //activeItem = dd.items.find(function (item, index, array) {
                //    item.id = itemId;
                //});

                //ind = dd.items.indexOf(activeItem);

                ind = dd.items.indexOf(dd.activeItem);

                if (ind < 0 || ind == dd.items.length - 1) return;

                activeItemElem = dd.modal.element.querySelector(`li[dropdown-item="${dd.id}_${dd.activeItem.id}_"]`);
                activeItemElem.classList.remove('active');

                dd.activeItem = dd.items[ind + 1];
            }
            else if (dd.items.length > 0) {
                dd.activeItem = dd.items[0];
            }

            if (dd.activeItem) {
                nextItemElem = dd.modal.element.querySelector(`li[dropdown-item="${dd.id}_${dd.activeItem.id}_"]`);
                nextItemElem.classList.add('active');
            }
            //if (activeItem)
            //nextItem = activeItem.newItems('li') || dd.modal.element.querySelector('li');

            //dd.items.find(function (item, index, array) {
            //    dd.activeItem = item;
            //    if (index < dd.items.length) {
            //        nextItem = dd.items[index + 1];
            //        nextItemElem = dd.modal.element.querySelector(`li[dropdown-item="${dd.id}_${nextItem.id}_"]`);
            //        nextItemElem.addClass('active');
            //    }
            //    //return item.id == itemId;
            //});

            //activeItemElem
            

            break;
        case 'up', 'arrowup':
            //activeItem = dd.modal.element.querySelector('li[class="active"]');

            if (dd.activeItem) {
                //[dropdownId, itemId] = activeItem.getAttribute('dropdown-item').split('_');

                //activeItem = dd.items.find(function (item, index, array) {
                //    item.id = itemId;
                //});

                //ind = dd.items.indexOf(activeItem);

                ind = dd.items.indexOf(dd.activeItem);

                if (ind <= 0) return;

                activeItemElem = dd.modal.element.querySelector(`li[dropdown-item="${dd.id}_${dd.activeItem.id}_"]`);
                activeItemElem.classList.remove('active');

                dd.activeItem = dd.items[ind - 1];
            }
            else if (dd.items.length > 0) {
                dd.activeItem = dd.items[0];
            }

            if (dd.activeItem) {
                nextItemElem = dd.modal.element.querySelector(`li[dropdown-item="${dd.id}_${dd.activeItem.id}_"]`);
                nextItemElem.classList.add('active');
            }
            break;
    }
})