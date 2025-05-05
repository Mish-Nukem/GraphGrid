import { useState, useEffect } from 'react';
import { BaseComponent, log } from './Base';
import { Overlay } from './Overlay';
// ==================================================================================================================================================================
export function Modal(props) {
    let wnd = null;

    const [wndState, setState] = useState({ wnd: wnd, ind: 0 });
    //const [wndState, setState] = useState(wnd);

    const oldWnd = wndState.wnd;
    //const hide = oldWnd && oldWnd.recreate;

    //wnd = oldWnd && !hide ? oldWnd : new ModalClass(props);
    //wnd = wndState && wndState.uid === props.uid ? wndState : new ModalClass(props);
    wnd = oldWnd && oldWnd.uid === props.uid ? oldWnd : new ModalClass(props);


    if (props.init) {
        props.init(wnd);
    }

    if (!wnd.refreshState) {
        wnd.refreshState = function (clear) {
            log('refreshState ' + wnd.stateind);
            //if (clear) wnd.recreate = true;
            setState({ wnd: wnd, ind: wnd.stateind++ });
            //setState(wnd);
        }
    }

    useEffect(() => {
        wnd.setupEvents();

        return () => {
            log(' 0.11 Clear ModalEvents');

            wnd.clearEvents();
        }
    }, [wnd])

    return (wnd.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class ModalClass extends BaseComponent {
    constructor(props) {
        super(props);

        this.uid = props.uid;

        this.opt = {};

        this.id = window._wndSeq++;

        this.opt.zInd = props.zInd || ++window._wndZInd;

        this.opt.pos = props.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        this.opt.closeWhenClick = props.closeWhenClick;
        this.opt.closeWhenEscape = props.closeWhenEscape;
        this.opt.isModal = props.isModal !== undefined ? props.isModal : true;
        this.opt.closeWhenMiss = props.closeWhenMiss;
        this.opt.resizable = props.resizable !== undefined ? props.resizable : true;
        this.opt.draggable = props.draggable !== undefined ? props.draggable : true;

        this.opt.hiddenOverlay = props.hiddenOverlay;

        this.opt.noHeader = props.noHeader;
        this.opt.noFooter = props.noFooter;
        this.opt.noPadding = props.noPadding;

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

        this.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render = function () {
        const wnd = this;
        if (!wnd.visible) {
            return <></>;
        }

        if (wnd.opt.isModal || wnd.opt.closeWhenMiss) {
            return (
                <>
                    <Overlay
                        renderChild={(zInd) => { return wnd.renderSelf(zInd++) }} closeWhenClick={wnd.opt.closeWhenMiss}
                        init={(ovl) => ovl.visible = wnd.visible}
                        onClose={() => wnd.visible = false}
                        isHidden={wnd.opt.hiddenOverlay}
                    >
                    </Overlay>
                </>
            )
        }

        return wnd.renderSelf();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelf = function (zInd) {
        const wnd = this;
        return (
            <>
                <div
                    id={`window_${wnd.id}_`}
                    key={`window_${wnd.id}_`}
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
                    {wnd.opt.noHeader ? <></> : wnd.renderHeader()}
                    <div
                        wnd-body={1}
                        className={wnd.opt.bodyClass}
                        style={{ padding: this.opt.noPadding ? '0' : '' }}
                    >
                        {wnd.renderContent()}
                    </div>
                    {wnd.opt.noFooter ? <></> : wnd.renderFooter()}
                    {!wnd.opt.resizable ? <></> : wnd.renderResizables()}
                </div>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeader = function () {
        const wnd = this;
        return (
            <div wnd-header={1} className={wnd.opt.headerClass}
            >
                <h4 className={wnd.opt.titleClass}>
                    {wnd.opt.title || ''}
                </h4>
                <button wnd-btn={`close_${wnd.id}_`} type="button" className="close" style={{ color: "black" }} onClick={(e) => wnd.close()}>×</button>
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFooter = function () {
        const wnd = this;
        return (
            <div wnd-footer={1} className={wnd.opt.footerClass}
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
                        <button
                            wnd-btn={`button_${wnd.id}_${btn._ind}_`}
                            className={wnd.opt.footerButtonClass}
                            title={btn.title}
                            onClick={btn.onclick ? (e) => btn.onclick(e) : null}
                        >
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
                <div wnd-rsz-y={wnd.id}
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
                <div wnd-rsz-x={wnd.id}
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
                <div wnd-rsz-xy={wnd.id}
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
    close = function () {
        const wnd = this;
        wnd.visible = false;

        wnd.clearDrag();

        wnd.refreshState(true);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents = function () {
        const wnd = this;
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        function onKeyDown(e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            if ((key === 'esc' || key === 'escape') && wnd.opt.closeWhenEscape === true) {
                wnd.close();
            }
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        //document.addEventListener('click', onClick);
        document.addEventListener('keydown', onKeyDown);

        if (wnd.opt.draggable) {
            wnd.setupDrag();
        }

        if (wnd.opt.resizable) {
            wnd.setupResize();
        }
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        wnd.clearEvents = function () {
            if (wnd.opt.resizable) {
                wnd.clearResize();
            }
            if (wnd.opt.draggable) {
                wnd.clearDrag();
            }

            //document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onKeyDown);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupDrag = function () {
        const wnd = this;
        const pos = wnd.opt.pos;
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseDown = function (e) {
            if (!wnd.visible) return;

            if (e.target.tagName !== 'DIV') return;

            if (!e.target.getAttribute('wnd-header') && !e.target.getAttribute('wnd-footer')) return;

            const elem = document.getElementById(`window_${wnd.id}_`);
            if (!elem) {
                log(`Elem window_${wnd.id}_  not found!`);
                return;
            }

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
                elem.ondragstart = null;
            };

            elem.ondragstart = function () {
                return false;
            };
        };
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        document.addEventListener('mousedown', mouseDown);

        wnd.clearDrag = function () {
            document.removeEventListener('mousedown', mouseDown);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupResize = function () {
        const wnd = this;
        const pos = this.opt.pos;
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        const mouseDown = function (e) {
            if (!wnd.visible) return;

            if (e.target.tagName !== 'DIV') return;

            const wndAttr = e.target.getAttribute('wnd-rsz-x') || e.target.getAttribute('wnd-rsz-y') || e.target.getAttribute('wnd-rsz-xy');
            if (wnd.id !== +wndAttr) return;

            //if (!e.target.hasAttribute('wnd-rsz-x') && !e.target.hasAttribute('wnd-rsz-y') && !e.target.hasAttribute('wnd-rsz-xy')) return;

            const elem = document.getElementById(`window_${wnd.id}_`);

            const cs = getComputedStyle(elem);
            const [initW, initH] = [parseInt(cs.width), parseInt(cs.height)];

            const shiftX = e.target.hasAttribute('wnd-rsz-x') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientX : -1;
            const shiftY = e.target.hasAttribute('wnd-rsz-y') || e.target.hasAttribute('wnd-rsz-xy') ? e.clientY : -1;

            resize(e.pageX, e.pageY);
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
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
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
            function onMouseMove(e) {
                resize(e.pageX, e.pageY);
            }
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
            elem.ondragstart = function () {
                return false;
            };
            // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
            function onMouseUp(e) {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                elem.ondragstart = null;
            };
        };
        // -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  
        document.addEventListener('mousedown', mouseDown);

        wnd.clearResize = function () {
            document.removeEventListener('mousedown', mouseDown);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}
// ==================================================================================================================================================================