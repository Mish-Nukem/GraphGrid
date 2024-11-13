import Utils from './Utils.js';

export default class Modal {
    constructor(options) {

        this.opt = options || {};

        this.opt.zInd = this.opt.zInd || 999;

        window._wndDict = window._wndDict || { seq: 0, lastZInd: this.opt.zInd };

        this.id = window._wndDict.seq++;
        window._wndDict[this.id] = this;

        this.opt.pos = this.opt.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        this.utils = new Utils();

        this.drawBody = options.drawBody;

        this.drawHeader = options.drawHeader !== undefined ? options.drawHeader : this.drawHeader;

        this.drawFooter = options.drawFooter !== undefined ? options.drawFooter : this.drawFooter;
    }
    show = function () {
        if (!this.opt.isOverlay && (this.opt.isModal || this.opt.closeWhenMiss || this.owner)) {
            this.overlay = new Modal({
                zInd: this.opt.zInd - 1,
                isOverlay: true,
                drawHeader: false,
                drawFooter: false,
                closeWhenClick: !this.opt.isModal,
                resizable: false,
                pos: { x: 0, y: 0, w: '100%', h: '100%' },
                isHidden: this.opt.closeWhenMiss,
            });

            this.overlay.owner = this;

            this.overlay.show();
        }

        let x = !isNaN(this.opt.pos.x) ? this.opt.pos.x + 'px' : this.opt.pos.x;
        let y = !isNaN(this.opt.pos.y) ? this.opt.pos.y + 'px' : this.opt.pos.y;
        let w = !isNaN(this.opt.pos.w) ? this.opt.pos.w + 'px' : this.opt.pos.w;
        let h = !isNaN(this.opt.pos.h) ? this.opt.pos.h + 'px' : this.opt.pos.h;

        let opacity = this.opt.isOverlay ? this.opt.isHidden ? 'opacity: 0;' : 'opacity: 0.2;' : this.opt.opacity ? `opacity: ${this.opt.opacity};` : '';
        let backgroundColor = this.opt.isOverlay && !this.opt.isHidden ? 'background:black;' : '';
        let style = this.opt.style || '';

        let div = document.createElement('div');
        div.id = `window_${this.id}_`;

        if (this.opt.windowClass) {
            div.className = this.opt.windowClass;
        }

        div.style = `top: ${y};
                left: ${x};
                width: ${w};
                height: ${h};
                z-index: ${this.opt.zInd};
                position: fixed;
                ${opacity}
                ${backgroundColor}
                ${style}
                `;

        let s = '';
        if (this.drawHeader) {
            s += this.drawHeader();
        }
        if (this.drawBody) {
            s += this.drawBody();
        }
        if (this.drawFooter) {
            s += this.drawFooter();
        }

        if (this.opt.resizable) {
            s += `<div wnd-rsz-y
                style="position: absolute;left: -1px;bottom: -6px;cursor: s-resize;height: 12px;width:calc(100% - 10px);z-index: ${this.opt.zInd + 5};">
                </div>
            <div wnd-rsz-x
                style="position: absolute;right: -6px;top: -1px;cursor: e-resize;height:calc(100% - 10px);width: 12px;z-index: ${this.opt.zInd + 5};">
                </div>
            <div wnd-rsz-xy
                style="position: absolute;right: -5px;bottom: -5px;cursor: se-resize;height: 16px;width: 16px;z-index: ${this.opt.zInd + 5};">
                </div>`;
        }

        div.innerHTML = s;

        document.body.append(div);

        if (this.opt.draggable) {
            this.setupDrag(div);
        }

        if (this.opt.resizable) {
            this.setupResize(div);
        }
    }

    drawHeader = function () {
        let headerClass = this.opt.headerClass || '';

        return `<div wnd-header class="${headerClass}" style="display: flex;flex-wrap: nowrap;justify-content: space-between;align-items: center;">
        <h4>${this.opt.title || ''}</h4>
        <button wnd-btn="close_${this.id}_" type="button" class="close" style="color: black;">×</button>
        </div>`;
    }

    drawFooter = function () {
        let footerClass = this.opt.footerClass || '';

        return `<div wnd-footer class="${footerClass}" style="display: flex;flex-wrap: nowrap;justify-content: space-between;align-items: center;">
        <h4>${this.opt.title || ''}</h4>
        </div>`;
    }

    close = function () {
        //if (!noRemove) {
        //    delete window._wndDict[this.id];
        //}

        let elem = document.getElementById(`window_${this.id}_`);
        elem.setAttribute('display', 'none');

        setTimeout(function () {
            elem.remove();
        }, 10);
    }

    remove = function () {
        delete window._wndDict[this.id];

        this.close();
    }

    setupDrag = function (elem) {
        let pos = this.opt.pos;
        let mouseDown = function (e) {

            let rect = elem.getBoundingClientRect();
            let shiftX = e.clientX - rect.left;
            let shiftY = e.clientY - rect.top;

            moveAt(e.pageX, e.pageY);

            // переносит окно на координаты (pageX, pageY),
            // дополнительно учитывая изначальный сдвиг относительно указателя мыши
            function moveAt(pageX, pageY) {
                pos.x = pageX - shiftX;
                pos.y = pageY - shiftY;

                elem.style.left = pos.x + 'px';
                elem.style.top = pos.y + 'px';
            }

            function onMouseMove(e) {
                moveAt(e.pageX, e.pageY);
            }

            // передвигаем окно при событии mousemove
            document.addEventListener('mousemove', onMouseMove);

            // отпустить окно, удалить ненужные обработчики
            let rem = document.onmouseup;
            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = rem;
            };

        };

        let header = elem.querySelector('div[wnd-header]');
        let footer = elem.querySelector('div[wnd-footer]');

        if (header) {
            header.onmousedown = mouseDown;
        }
        if (footer) {
            footer.onmousedown = mouseDown;
        }
        elem.ondragstart = function () {
            return false;
        };
    }

    setupResize = function (elem) {
        let pos = this.opt.pos;
        let mouseDown = function (e) {

            let rect = elem.getBoundingClientRect();
            let shiftX = e.target.hasAttribute('wnd-rsz-x') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientX : -1;
            let shiftY = e.target.hasAttribute('wnd-rsz-y') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientY : -1;

            resize(e.pageX, e.pageY);

            function resize(pageX, pageY) {
                if (shiftX > 0) {
                    let w = rect.width + pageX - shiftX;

                    pos.w = (!pos.maxW || w <= pos.maxW) && (!pos.minW || w >= pos.minW) ? w : pos.w;
                    elem.style.width = pos.w + 'px';
                }
                if (shiftY > 0) {
                    let h = rect.height + pageY - shiftY;

                    pos.h = (!pos.maxH || h <= pos.maxH) && (!pos.minH || h >= pos.minH) ? h : pos.h;
                    elem.style.height = pos.h + 'px';
                }
            }

            function onMouseMove(e) {
                resize(e.pageX, e.pageY);
            }

            // передвигаем окно при событии mousemove
            document.addEventListener('mousemove', onMouseMove);

            // отпустить окно, удалить ненужные обработчики
            let rem = document.onmouseup;
            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = rem;
            };
        };

        elem.querySelector('div[wnd-rsz-y]').onmousedown = mouseDown;
        elem.querySelector('div[wnd-rsz-x]').onmousedown = mouseDown;
        elem.querySelector('div[wnd-rsz-xy]').onmousedown = mouseDown;

        elem.ondragstart = function () {
            return false;
        };
    }
}

document.addEventListener('click', function (e) {
    if (!e.target || !window._wndDict) return;

    let wndAttr = e.target.getAttribute('wnd-btn') || e.target.id;
    if (!wndAttr) return;

    let parts = wndAttr.split('_');
    if (parts.length < 2) return;

    let wnd = window._wndDict[parts[1]];
    if (!wnd) return;

    switch (parts[0]) {
        case 'window':
            if (wnd.opt.closeWhenClick || wnd.owner && wnd.owner.opt.closeWhenMiss) {
                if (wnd.overlay) {
                    wnd.overlay.remove();
                }

                if (wnd.owner) {
                    wnd.owner.close();
                }

                wnd.close();
            }
            break;
        case 'close':
            if (wnd.overlay) {
                wnd.overlay.remove();
            }

            wnd.close();
            break;
    }

});