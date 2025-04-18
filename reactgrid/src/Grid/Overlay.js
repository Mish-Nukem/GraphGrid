import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useState, useEffect } from 'react';
// ==================================================================================================================================================================
export default function Overlay(props) {
    window._wndSeq = window._wndSeq || 0;
    window._wndZInd = window._wndZInd || 999;

    let ovl = null;

    const [ovlState, setState] = useState({ ovl: ovl, ind: 0 });

    ovl = ovlState.ovl || new OverlayClass(props);

    if (props.init) {
        props.init(ovl);
    }

    if (!ovl.refreshState) {
        ovl.refreshState = function () {
            log('refreshState ' + ovl.stateind);
            setState({ ovl: ovl, ind: ovl.stateind++ });
        }
    }

    return (ovl.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
function log(message) {
    if (!window._logEnabled) return;

    console.log(message);
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------

export class OverlayClass {
    constructor(props) {

        this.opt = {};

        this.id = window._wndSeq++;

        this.opt.zInd = props.zInd || (window._wndZInd ? ++window._wndZInd : 999) || 999;

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

        this.setupOverlayEvents();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render = function () {
        const ovl = this;
        if (!ovl.visible) return;

        return (
            <>
            <div
                id={`overlay_${ovl.id}_`}
                style={
                    {
                        width: ovl.opt.pos.w,
                        height: ovl.opt.pos.h,
                        top: ovl.opt.pos.y,
                        bottom: ovl.opt.pos.x,
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
    setupOverlayEvents = function () {
        const ovl = this;
        document.addEventListener('click', function (e) {
            if (!e.target) return;

            const [entity, ovlId] = e.target.id.split('_');
            if (!ovlId) return;

            if (entity !== 'overlay') return;

            if (ovl.opt.closeWhenClick) {
                ovl.visible = false;
                ovl.refreshState();
            }
        });
        document.addEventListener('keydown', function (e) {
            const key = e && e.key ? e.key.toLowerCase() : '';

            if ((key === 'esc' || key === 'escape') && ovl.opt.closeWhenEscape) {
                ovl.visible = false;
                ovl.refreshState();
            }
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}