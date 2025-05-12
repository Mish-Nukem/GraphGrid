import { useState, useEffect } from 'react';
import { BaseComponent/*, log*/ } from './Base';
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

    if (!ovl.refreshState) {
        ovl.refreshState = function () {
            setState({ ovl: ovl, ind: ovl.stateind++ });
        }
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

        this.opt = {};

        this.id = window._wndSeq++;
        this.uid = props.uid;

        this.opt.zInd = props.zInd || ++window._wndZInd;

        this.opt.pos = props.pos || { x: 0, y: 0, w: '100%', h: '100%' };

        this.opt.isHidden = props.isHidden;
        this.opt.closeWhenClick = props.closeWhenClick;
        this.opt.closeWhenEscape = props.closeWhenEscape;

        this.opt.pos.x = !isNaN(this.opt.pos.x) ? this.opt.pos.x + 'px' : this.opt.pos.x;
        this.opt.pos.y = !isNaN(this.opt.pos.y) ? this.opt.pos.y + 'px' : this.opt.pos.y;
        this.opt.pos.w = !isNaN(this.opt.pos.w) ? this.opt.pos.w + 'px' : this.opt.pos.w;
        this.opt.pos.h = !isNaN(this.opt.pos.h) ? this.opt.pos.h + 'px' : this.opt.pos.h;

        this.renderChild = props.renderChild || function () { return null };

        this.visible = props.visible !== undefined ? props.visible : true;

        this.stateind = 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const ovl = this;
        if (!ovl.visible) return <></>;

        return (
            <>
                <div
                    id={`overlay_${ovl.id}_`}
                    key={`overlay_${ovl.id}_${ovl.stateind}_`}
                    onClick={(e) => ovl.onClick(e)}
                    style={
                        {
                            width: ovl.opt.pos.w,
                            height: ovl.opt.pos.h,
                            top: ovl.opt.pos.y,
                            left: ovl.opt.pos.x,
                            opacity: ovl.opt.opacity ? ovl.opt.opacity : ovl.opt.isHidden ? 0 : 0.2,
                            zIndex: ovl.opt.zInd,
                            backgroundColor: !ovl.opt.isHidden ? 'black' : ''
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
    onClick(e) {
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