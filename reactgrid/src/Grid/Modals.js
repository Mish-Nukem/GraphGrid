import React from 'react';
import Overlay from './Overlay';
import { renderToStaticMarkup } from 'react-dom/server';
import { useState, useEffect } from 'react';
// ==================================================================================================================================================================
export default function Modal(props) {
    window._wndSeq = window._wndSeq || 0;
    window._wndZInd = window._wndZInd || 999;

    let wnd = null;

    const [wndState, setState] = useState({ wnd: wnd, ind: 0 });

    wnd = wndState.wnd || new ModalClass(props);

    if (props.init) {
        props.init(wnd);
    }

    if (!wnd.refreshState) {
        wnd.refreshState = function () {
            log('refreshState ' + wnd.stateind);
            setState({ wnd: wnd, ind: wnd.stateind++ });
        }
    }

    return (wnd.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
function log(message) {
    if (!window._logEnabled) return;

    console.log(message);
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------

export class ModalClass {
    constructor(props) {

        this.opt = {};

        this.id = window._wndSeq++;

        this.opt.zInd = props.zInd || (window._wndZInd ? ++window._wndZInd : 999) || 999;

        this.opt.pos = props.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        this.opt.closeWhenClick = props.closeWhenClick;
        this.opt.closeWhenEscape = props.closeWhenEscape;
        this.opt.isModal = props.isModal !== undefined ? props.isModal : true;
        this.opt.closeWhenMiss = props.closeWhenMiss;
        this.opt.resizable = props.resizable !== undefined ? props.resizable : true;

        //this.opt.isModal = false;

        this.opt.bodyClass = props.bodyClass || 'modal-window-body';
        this.opt.headerClass = props.headerClass || 'modal-window-header';
        this.opt.footerClass = props.footerClass || 'modal-window-footer';
        this.opt.footerButtonClass = props.footerButtonClass || 'modal-window-footer-button'
        this.opt.titleClass = props.titleClass || 'modal-window-header-title';

        this.opt.pos.x = !isNaN(this.opt.pos.x) ? this.opt.pos.x + 'px' : this.opt.pos.x;
        this.opt.pos.y = !isNaN(this.opt.pos.y) ? this.opt.pos.y + 'px' : this.opt.pos.y;
        this.opt.pos.w = !isNaN(this.opt.pos.w) ? this.opt.pos.w + 'px' : this.opt.pos.w;
        this.opt.pos.h = !isNaN(this.opt.pos.h) ? this.opt.pos.h + 'px' : this.opt.pos.h;

        this.renderContent = props.renderContent || function () { return null };

        this.buttons = [];
        if (props.footerButtons) {
            this.buttonsDict = {};
            let seq = 0;
            for (let btn of props.footerButtons) {
                btn._ind = seq++;
                this.buttonsDict[btn._ind] = btn;
                this.buttons.push(btn);
            }
        }

        this.visible = props.visible !== undefined ? props.visible : true;

        this.setupWindowEvents();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelf = function (zInd) {
        const wnd = this;
        return (
            <>
                <div
                    id={`window_${wnd.id}_`}
                    style={
                        {
                            width: wnd.opt.pos.w,
                            height: wnd.opt.pos.h,
                            top: wnd.opt.pos.y,
                            left: wnd.opt.pos.x,
                            zIndex: zInd || wnd.opt.zInd,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "fixed"
                        }
                    }
                    className="modal-window-wnd"
                >
                    {wnd.renderHeader()}
                    <div wnd-body className={this.opt.bodyClass}>
                        {wnd.renderContent()}
                    </div>
                    {wnd.renderFooter()}
                    {wnd.renderResizables()}
                </div>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeader = function () {
        const wnd = this;
        return (
            <div wnd-header className={wnd.opt.headerClass}
            >
                <h4 className={wnd.opt.titleClass}>
                    {wnd.opt.title || ''}
                </h4>
                <button wnd-btn={`"close_${wnd.id}_"`} type="button" className="close" style={{ color: "black" }} >×</button>
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFooter = function () {
        const wnd = this;
        return (
            <div wnd-footer className={wnd.opt.footerClass}
                style={
                    {
                        display: "flex",
                        flexWrap: "nowrap",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }
                } >
                {wnd.buttons.map((btn, ind) => {
                    return (
                        <button wnd-btn={`button_${wnd.id}_${btn._ind}_`} className={wnd.opt.footerButtonClass} title={btn.title}>
                            <i className={btn.imageClass}></i>
                            {btn.title}
                        </button>
                    )
                })}
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderResizables = function () {
        const wnd = this;
        if (!wnd.opt.resizable) return;

        return (
            <>
                <div wnd-rsz-y
                    style={
                        {
                            position: "absolute",
                            left: "-1px",
                            bottom: "-6px",
                            cursor: "s-resize",
                            height: "12px",
                            width: "calc(100% - 10px)",
                            zIndex: wnd.opt.zInd + 5
                        }
                    }
                >
                </div>
                <div wnd-rsz-x
                    style={
                        {
                            position: "absolute",
                            right: "-6px",
                            top: "-1px",
                            cursor: "e-resize",
                            height: "calc(100% - 10px)",
                            width: "12px",
                            zIndex: wnd.opt.zInd + 5
                        }
                    } >
                </div>
                <div wnd-rsz-xy
                    style={
                        {
                            position: "absolute",
                            right: "-5px",
                            bottom: "-5px",
                            cursor: "se-resize",
                            height: "16px",
                            width: "16px",
                            zIndex: wnd.opt.zInd + 5
                        }
                    } >
                </div>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render = function () {
        const wnd = this;
        if (!wnd.visible) return;

        if (wnd.opt.isModal || wnd.opt.closeWhenMiss) {
            return (
                <>
                    <Overlay renderChild={(zInd) => { return wnd.renderSelf(zInd++) }} closeWhenClick={wnd.opt.closeWhenMiss}>
                    </Overlay>
                </>
            )
        }

        return wnd.renderSelf();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupWindowEvents = function () {
        const wnd = this;

        wnd.setupDrag();
        wnd.setupResize();

        document.addEventListener('click', function (e) {
            if (!e.target) return;

            const wndAttr = e.target.getAttribute('wnd-btn') || e.target.id;
            if (!wndAttr) return;

            const [entity, wndId, buttonId] = wndAttr.split('_');
            if (!wndId) return;

            switch (entity) {
                case 'window':
                    if (wnd.opt.closeWhenClick) {
                        wnd.visible = false;
                        wnd.refreshState();
                    }
                    break;
                case 'close':
                    wnd.visible = false;
                    wnd.refreshState();
                    break;
                case 'button':
                    const button = wnd.buttonsDict[buttonId];
                    if (!button || !button.onclick) return;

                    e.modal = wnd;

                    button.onclick(e);
                    break;
                default:
            }
        });

        document.addEventListener('keydown', function (e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            if ((key === 'esc' || key === 'escape') && wnd.opt.closeWhenEscape === true) {
                wnd.visible = false;
                wnd.refreshState();
            }
        })
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupDrag = function (elem) {
        return;
        const pos = this.opt.pos;
        const mouseDown = function (e) {
            if (e.target.tagName != 'DIV') return;

            const rect = elem.getBoundingClientRect();
            const shiftX = e.clientX - rect.left;
            const shiftY = e.clientY - rect.top;

            moveAt(e.pageX, e.pageY);

            // переносит окно на координаты (pageX, pageY), дополнительно учитывая изначальный сдвиг относительно указателя мыши
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
            document.addEventListener('mouseup', onMouseUp);
            // отпустить окно, удалить ненужные обработчики
            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

        };

        const header = elem.querySelector('div[wnd-header]');
        const footer = elem.querySelector('div[wnd-footer]');

        if (header) {
            header.addEventListener('mousedown', mouseDown);
        }
        if (footer) {
            //footer.onmousedown = mouseDown;
            footer.addEventListener('mousedown', mouseDown);
        }
        elem.ondragstart = function () {
            return false;
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupResize = function (elem) {
        return;
        const pos = this.opt.pos;
        const mouseDown = function (e) {

            const cs = getComputedStyle(elem);
            const [initW, initH] = [parseInt(cs.width), parseInt(cs.height)];

            const shiftX = e.target.hasAttribute('wnd-rsz-x') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientX : -1;
            const shiftY = e.target.hasAttribute('wnd-rsz-y') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientY : -1;

            resize(e.pageX, e.pageY);

            function resize(pageX, pageY) {
                if (shiftX > 0) {
                    const w = initW + pageX - shiftX;

                    pos.w = (!pos.maxW || w <= pos.maxW) && (!pos.minW || w >= pos.minW) ? w : pos.w;
                    elem.style.width = pos.w + 'px';
                }
                if (shiftY > 0) {
                    const h = initH + pageY - shiftY;

                    pos.h = (!pos.maxH || h <= pos.maxH) && (!pos.minH || h >= pos.minH) ? h : pos.h;
                    elem.style.height = pos.h + 'px';
                }
            }

            function onMouseMove(e) {
                resize(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
        };

        elem.querySelector('div[wnd-rsz-y]').addEventListener('mousedown', mouseDown);
        elem.querySelector('div[wnd-rsz-x]').addEventListener('mousedown', mouseDown);
        elem.querySelector('div[wnd-rsz-xy]').addEventListener('mousedown', mouseDown);

        elem.ondragstart = function () {
            return false;
        };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}
// ==================================================================================================================================================================
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------------------------------------------