import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
// ==================================================================================================================================================================
export function Overlay(props) {
    let ovl = null;

    const [ovlState, setState] = useState({ ovl: ovl, ind: 0 });

    if (ovlState.ovl && ovlState.ovl.closing) {
        ovl = ovlState.ovl;
        ovl.closing = false;
    }
    else {
        ovl = new OverlayClass(props);
    }

    ovl.onClose = props.onClose;

    if (props.init) {
        props.init(ovl);
    }

    ovl.refreshState = function () {
        setState({ ovl: ovl, ind: ovl.stateind++ });
    }

    useEffect(() => {
        ovl.setupEvents();

        return () => {
            ovl.clearEvents();
        }
    }, [ovl])

    return (ovl.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class OverlayClass extends BaseComponent {
    constructor(props) {
        super(props);

        const ovl = this;
        ovl.opt = {};

        ovl.id = OverlayClass._seq++;
        ovl.uid = props.uid;

        ovl.opt.zInd = props.zInd || ++OverlayClass._zInd;

        ovl.opt.pos = props.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        ovl.opt.isHidden = props.isHidden;
        ovl.opt.closeWhenClick = props.closeWhenClick;
        ovl.opt.closeWhenEscape = props.closeWhenEscape;

        ovl.opt.pos.x = !isNaN(ovl.opt.pos.x) ? ovl.opt.pos.x + 'px' : ovl.opt.pos.x;
        ovl.opt.pos.y = !isNaN(ovl.opt.pos.y) ? ovl.opt.pos.y + 'px' : ovl.opt.pos.y;
        ovl.opt.pos.w = !isNaN(ovl.opt.pos.w) ? ovl.opt.pos.w + 'px' : ovl.opt.pos.w;
        ovl.opt.pos.h = !isNaN(ovl.opt.pos.h) ? ovl.opt.pos.h + 'px' : ovl.opt.pos.h;

        ovl.renderChild = props.renderChild || function () { return null };

        ovl.visible = props.visible != null ? props.visible : true;

        ovl.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _seq = 0;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _zInd = 999;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const ovl = this;
        if (!ovl.visible) return <></>;

        return (
            <>
                <div
                    key={`overlay_${ovl.id}_`}
                    onClick={(e) => ovl.onClick(e)}
                    style={
                        {
                            width: ovl.opt.pos.w,
                            height: ovl.opt.pos.h,
                            top: ovl.opt.pos.y,
                            left: ovl.opt.pos.x,
                            opacity: ovl.opt.opacity ? ovl.opt.opacity : ovl.opt.isHidden ? 0 : 0.2,
                            zIndex: ovl.opt.zInd,
                            backgroundColor: !ovl.opt.isHidden ? 'black' : '',
                            display: 'flex',
                            position: 'fixed',
                        }
                    }
                    className="overlay-default"
                >
                </div>
                {ovl.renderChild(ovl.opt.zInd + 1)}
            </>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        const ovl = this;
        ovl.visible = false;
        if (ovl.onClose) {
            ovl.onClose();
        }
        ovl.closing = true;

        ovl.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClick() {
        const ovl = this;

        if (ovl.opt && ovl.opt.closeWhenClick) {
            ovl.close();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    setupEvents = function () {
        const ovl = this;
        function onKeyDown(e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            if ((key === 'esc' || key === 'escape') && ovl.opt && ovl.opt.closeWhenEscape) {
                ovl.close();
            }
        }

        document.addEventListener('keydown', onKeyDown);

        ovl.clearEvents = function () {
            document.removeEventListener('keydown', onKeyDown);
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}