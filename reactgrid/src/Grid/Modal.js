import { useState, useEffect } from 'react';
import { BaseComponent, log } from './Base';
import { Overlay } from './Overlay';
import { renderToStaticMarkup } from 'react-dom/server';
// ==================================================================================================================================================================
export function Modal(props) {
    let wnd = null;

    const [wndState, setState] = useState({ wnd: wnd, ind: 0 });

    const oldWnd = wndState.wnd;

    wnd = oldWnd && oldWnd.uid === props.uid ? oldWnd : new ModalClass(props);

    if (props.init) {
        props.init(wnd);
    }

    wnd.refreshState = function () {
        setState({ wnd: wnd, ind: wnd.stateind++ });
    }

    useEffect(() => {
        wnd.setupEvents();

        return () => {
            //log(' 0.11 Clear ModalEvents');

            wnd.clearEvents();
        }
    }, [wnd])

    return (wnd.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class ModalClass extends BaseComponent {
    constructor(props) {
        super(props);

        const wnd = this;
        wnd.uid = props.uid;

        wnd.opt = {};

        wnd.id = window._wndSeq++;

        wnd.opt.zInd = props.zInd || ++window._wndZInd;

        wnd.opt.pos = props.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        wnd.opt.closeWhenClick = props.closeWhenClick;
        wnd.opt.closeWhenEscape = props.closeWhenEscape;
        wnd.opt.isModal = props.isModal !== undefined ? props.isModal : true;
        wnd.opt.closeWhenMiss = props.closeWhenMiss;
        wnd.opt.resizable = props.resizable !== undefined ? props.resizable : true;
        wnd.opt.draggable = props.draggable !== undefined ? props.draggable : true;

        wnd.opt.hiddenOverlay = props.hiddenOverlay;

        wnd.opt.noHeader = props.noHeader;
        wnd.opt.noFooter = props.noFooter;
        wnd.opt.noPadding = props.noPadding;

        wnd.opt.margin = props.margin;
        wnd.opt.padding = props.padding;

        wnd.opt.bodyClass = props.bodyClass || BaseComponent.theme.modalBodyClass || 'modal-window-body';
        wnd.opt.headerClass = props.headerClass || BaseComponent.theme.modalHeaderClass || 'modal-window-header';
        wnd.opt.footerClass = props.footerClass || BaseComponent.theme.modalFooterClass || 'modal-window-footer';
        wnd.opt.footerButtonClass = props.footerButtonClass || BaseComponent.theme.modalFooterButtonClass || 'modal-window-footer-button'
        wnd.opt.titleClass = props.titleClass || BaseComponent.theme.modalTitleClass || 'modal-window-header-title';
        wnd.opt.title = props.title;

        wnd.opt.pos.x = !isNaN(wnd.opt.pos.x) ? wnd.opt.pos.x + 'px' : wnd.opt.pos.x;
        wnd.opt.pos.y = !isNaN(wnd.opt.pos.y) ? wnd.opt.pos.y + 'px' : wnd.opt.pos.y;
        wnd.opt.pos.w = !isNaN(wnd.opt.pos.w) ? wnd.opt.pos.w + 'px' : wnd.opt.pos.w;
        wnd.opt.pos.h = !isNaN(wnd.opt.pos.h) ? wnd.opt.pos.h + 'px' : wnd.opt.pos.h;

        wnd.onClose = props.onClose;

        wnd.opt.dimensionsByContent = props.dimensionsByContent;

        wnd.renderContent = props.renderContent || function () { return null };

        wnd.buttons = [];
        if (props.footerButtons) {
            wnd.buttonsDict = {};
            let seq = 0;
            for (let btn of props.footerButtons) {
                btn._ind = seq++;
                wnd.buttonsDict[btn._ind] = btn;
                wnd.buttons.push(btn);
            }
        }

        wnd.visible = props.visible !== undefined ? props.visible : true;

        wnd.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _isFake = false;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const wnd = this;
        if (!wnd.visible) {
            return <></>;
        }

        if (wnd.opt.dimensionsByContent) {
            const rect = wnd.getDimensionsByContent(wnd.opt.margin, wnd.opt.padding);
            wnd.opt.pos.w = rect.w || wnd.opt.pos.w;
            wnd.opt.pos.h = rect.h || wnd.opt.pos.h;
        }

        if (wnd.opt.isModal || wnd.opt.closeWhenMiss) {
            return (
                <>
                    <Overlay
                        renderChild={(zInd) => { return wnd.renderSelf(zInd++) }} closeWhenClick={wnd.opt.closeWhenMiss}
                        init={(ovl) => ovl.visible = wnd.visible}
                        onClose={() => wnd.close()}
                        isHidden={wnd.opt.hiddenOverlay}
                    >
                    </Overlay>
                </>
            )
        }

        return wnd.renderSelf();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelf(zInd) {
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
                        key={`window_${wnd.id}_body_`}
                        wnd-body={1}
                        className={wnd.opt.bodyClass}
                        style={{ padding: wnd.opt.noPadding ? '0' : '' }}
                    >
                        {wnd.renderContent(wnd)}
                    </div>
                    {wnd.opt.noFooter ? <></> : wnd.renderFooter()}
                    {!wnd.opt.resizable ? <></> : wnd.renderResizables()}
                </div>
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderHeader() {
        const wnd = this;
        return (
            <div
                key={`window_${wnd.id}_header_`}
                wnd-header={1}
                className={wnd.opt.headerClass}
                onMouseDown={(e) => wnd.mouseDownDrag(e)}
            >
                <h4 className={wnd.opt.titleClass}>
                    {wnd.opt.title || ''}
                </h4>
                <button wnd-btn={`close_${wnd.id}_`} type="button" className="close" style={{ color: "black" }} onClick={(e) => wnd.close()}>×</button>
            </div>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderFooter() {
        const wnd = this;
        return (
            <div
                key={`window_${wnd.id}_footer_`}
                wnd-footer={1}
                className={wnd.opt.footerClass}
                onMouseDown={(e) => wnd.mouseDownDrag(e)}
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
                            key={`window_${wnd.id}_${btn._ind}_${ind}_button_`}
                            wnd-btn={`button_${wnd.id}_${btn._ind}_`}
                            className={wnd.opt.footerButtonClass}
                            title={btn.title}
                            onClick={btn.onclick ? (e) => btn.onclick(e) : null}
                            disabled={btn.getDisabled ? btn.getDisabled() : false}
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
    renderResizables() {
        const wnd = this;

        return (
            <>
                <div wnd-rsz-y={wnd.id}
                    key={`wnd-rsz-y_${wnd.id}_`}
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
                    onMouseDown={(e) => wnd.mouseDownResize(e)}
                >
                </div>
                <div wnd-rsz-x={wnd.id}
                    key={`wnd-rsz-x_${wnd.id}_`}
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
                    }
                    onMouseDown={(e) => wnd.mouseDownResize(e)}
                >
                </div>
                <div wnd-rsz-xy={wnd.id}
                    key={`wnd-rsz-xy_${wnd.id}_`}
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
                    }
                    onMouseDown={(e) => wnd.mouseDownResize(e)}
                >
                </div>
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        const wnd = this;
        wnd.visible = false;

        if (wnd.onClose) {
            wnd.onClose();
        }

        wnd.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    show(e) {
        const wnd = this;
        wnd.visible = true;

        if (e) {
            wnd.opt.pos.x = e.clientX;
            wnd.opt.pos.y = e.clientY;
        }

        wnd.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getDimensionsByContent(margin, padding) {
        const wnd = this;
        const renderFake = function () {
            return (
                <div>
                    {wnd.opt.noHeader ? <></> : wnd.renderHeader()}
                    <div
                        key={`window_${wnd.id}_body_`}
                        wnd-body={1}
                        className={wnd.opt.bodyClass}
                        style={{ padding: wnd.opt.noPadding ? '0' : '' }}
                    >
                        {wnd.renderContent(wnd, 'fake')}
                    </div>
                    {wnd.opt.noFooter ? <></> : wnd.renderFooter()}
                    {!wnd.opt.resizable ? <></> : wnd.renderResizables()}
                </div>
            )
        }

        const res = { w: 0, h: 0 };

        ModalClass._isFake = true;

        const fakeDiv = document.createElement('div');
        fakeDiv.style.opacity = 0;
        fakeDiv.style.position = 'fixed';
        fakeDiv.style.height = 'auto';
        fakeDiv.style.margin = margin || '';
        fakeDiv.style.padding = padding || '';
        fakeDiv.innerHTML = renderToStaticMarkup(renderFake());
        document.body.append(fakeDiv);
        const rect = getComputedStyle(fakeDiv);
        res.w = parseInt(rect.width) + 2;
        res.h = parseInt(rect.height) + 2;
        fakeDiv.remove();

        ModalClass._isFake = false;

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents() {
        const wnd = this;

        function onKeyDown(e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            if ((key === 'esc' || key === 'escape') && wnd.opt.closeWhenEscape === true) {
                wnd.close();
            }
        }

        document.addEventListener('keydown', onKeyDown);

        wnd.clearEvents = function () {
            document.removeEventListener('keydown', onKeyDown);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseDownDrag(e) {
        const wnd = this;
        if (!wnd.visible || !wnd.opt.draggable) return;

        if (e.target.tagName !== 'DIV') return;

        const pos = wnd.opt.pos;

        const elem = document.getElementById(`window_${wnd.id}_`);
        if (!elem) {
            log(`Elem window_${wnd.id}_  not found!`);
            return;
        }

        const rect = elem.getBoundingClientRect();
        const shiftX = e.pageX - rect.left;
        const shiftY = e.pageY - rect.top;

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
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    mouseDownResize(e) {
        const wnd = this;
        if (!wnd.visible || !wnd.opt.resizable) return;

        const pos = wnd.opt.pos;

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
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}
// ==================================================================================================================================================================