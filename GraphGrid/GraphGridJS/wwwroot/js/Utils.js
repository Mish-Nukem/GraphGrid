export default class Utils {
    constructor() {
    }

    isInt = function (n) {
        return isNaN(n) ? !1 : n % 1 === 0;
    }

    getMousePos = function (pageX, pageY, ctrl, noOffset) {
        pageX = pageX || 0;
        pageY = pageY || 0;

        let rect = { left: 0, top: 0 };
        if (ctrlId) {
            let elem = typeof ctrl == 'object' ? ctrl : document.getElementById(ctrl);
            rect = elem ? elem.getBoundingClientRect() : rect;
        }

        let res = { x: pageX - rect.left - (noOffset ? 0 : window.scrollX), y: pageY - rect.top - (noOffset ? 0 : window.scrollY) };

        //if (ctrlId) {
        //    let par = ctrl;
        //    while (par.length) {
        //        if (par.prop('innerHTML') && par.prop('tagName') != 'HTML') {
        //            res.x += par.scrollLeft();
        //            res.y += par.scrollTop();
        //        }
        //        par = par.parent();
        //    }
        //}

        return res;
    }

    getControlPos = function (ctrl) {

        let elem = typeof ctrl == 'object' ? ctrl : document.getElementById(ctrl);
        let box = elem.getBoundingClientRect();

        return {
            x: box.left + window.scrollX,
            y: box.top + window.scrollY,
            w: box.width,
            h: box.height
        }
    }

    //document.body.appendChild

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------

}