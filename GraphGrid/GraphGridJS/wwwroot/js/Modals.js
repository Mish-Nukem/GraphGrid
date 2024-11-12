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

        let x = this.utils.isInt(this.opt.pos.x) ? this.opt.pos.x + 'px' : this.opt.pos.x;
        let y = this.utils.isInt(this.opt.pos.y) ? this.opt.pos.y + 'px' : this.opt.pos.y;
        let w = this.utils.isInt(this.opt.pos.w) ? this.opt.pos.w + 'px' : this.opt.pos.w;
        let h = this.utils.isInt(this.opt.pos.h) ? this.opt.pos.h + 'px' : this.opt.pos.h;

        let opacity = this.opt.isOverlay ? this.opt.isHidden ? 'opacity: 0;' : 'opacity: 0.2;' : this.opt.opacity ? `opacity: ${this.opt.opacity};` : '';
        let backgroundColor = this.opt.isOverlay && !this.opt.isHidden ? 'background:black;' : '';
        let style = this.opt.style || '';
        let windowClass = this.opt.windowClass || '';

        let div = document.createElement('div');

        let s = `<div id="window_${this.id}_"
            class="${windowClass}"
            style="top: ${y};
                left: ${x};
                width: ${w};
                height: ${h};
                z-index: ${this.opt.zInd};
                position: fixed;
                ${opacity}
                ${backgroundColor}
                ${style}
                "
            >`;

        if (this.drawHeader) {
            s += this.drawHeader();
        }
        if (this.drawBody) {
            s += this.drawBody();
        }
        if (this.drawFooter) {
            s += this.drawFooter();
        }

        if (!this.opt.isOverlay && this.opt.resizable != false) {
            s += `<div wnd-rsz="${this.id}-y"
                style="position: absolute;left: -1px;bottom: -6px;cursor: s-resize;height: 12px;width: ${this.opt.pos.w - 10}px;z-index: ${this.opt.zInd + 5};">
                </div>
            <div wnd-rsz="${this.id}-x"
                style="position: absolute;right: -6px;top: -1px;cursor: e-resize;height: ${this.opt.pos.h - 10}px;width: 12px;z-index: ${this.opt.zInd + 5};">
                </div>
            <div wnd-rsz="${this.id}-xy"
                style="position: absolute;right: -5px;bottom: -5px;cursor: se-resize;height: 16px;width: 16px;z-index: ${this.opt.zInd + 5};">
                </div>`;
        }


        s += `</div>`;

        div.innerHTML = s;

        document.body.append(div)
    }

    drawHeader = function () {
        let headerClass = this.opt.headerClass || '';

        return `<div class="${headerClass}" style="display: flex;flex-wrap: nowrap;justify-content: space-between;align-items: center;">
        <h4>${this.opt.title || ''}</h4>
        <button wnd-btn="close_${this.id}_" type="button" class="close" style="color: black;">×</button>
        </div>`;
    }

    drawFooter = function () {
        return ``;
    }

    close = function () {
        delete window._wndDict[this.id];

        let elem = document.getElementById(`window_${this.id}_`);
        elem.setAttribute('display', 'none');

        setTimeout(function () {
            elem.remove();
        }, 10);
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
                    wnd.overlay.close();
                }

                if (wnd.owner) {
                    wnd.owner.close();
                }

                wnd.close();
            }
            break;
        case 'close':
            if (wnd.overlay) {
                wnd.overlay.close();
            }

            wnd.close();
            break;
    }

});