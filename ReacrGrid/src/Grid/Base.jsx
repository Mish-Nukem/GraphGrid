import { DefaultGridTheme as Theme } from './Themes/DefaultGridTheme';
//import { BootstrapTheme as NewTheme } from './Themes/BootstrapGridTheme';
//import { DefaultGridTheme as NewTheme } from './Themes/DefaultGridTheme';
import { Translate } from './Themes/Translate';
//import { Images } from './Themes/Images';
export class BaseComponent {

    constructor() {
        window._gridSeq = window._gridSeq || 0;
        window._wndSeq = window._wndSeq || 0;
        window._wndZInd = window._wndZInd || 999;
        window._seq = window._seq || 0;

        //window._logEnabled = true;
        //this.images = Images.getImages();
        if (!BaseComponent.theme) {
            BaseComponent.theme = /*NewTheme !== undefined ? new NewTheme() :*/ new Theme();

            if (BaseComponent.useBootstrap) {
                import('./Themes/BootstrapGridTheme.jsx').then(({ BootstrapTheme }) => { BaseComponent.theme = new BootstrapTheme(); });
            }
            //    else {
            //        BaseComponent.theme = /*NewTheme !== undefined ? new NewTheme() :*/ new Theme();
            //    }
        }

    }

    translate(text, context) {
        return Translate.translate(text, context);
    }

    static _lookupEntityInfo = {};
    static defaultDateFormat = 'dd.MM.yyyy';

    static theme = null;
    static useBootstrap = false;
    static changeTheme = (val) => {
        return new Promise(function (resolve) {
            if (val !== undefined) {
                BaseComponent.useBootstrap = val;
            }
            else {
                BaseComponent.useBootstrap = !BaseComponent.useBootstrap;
            }

            //if (document.BootstrapStyleSheets) {
            //    for (let styleSheet of document.BootstrapStyleSheets) {
            //        styleSheet.disabled = !BaseComponent.useBootstrap;
            //    }
            //}

            //if (document.BootstrapRules) {
            //    for (let rule of document.BootstrapRules) {
            //        rule.disabled = !BaseComponent.useBootstrap;
            //    }
            //}
            

            if (BaseComponent.useBootstrap) {
                import('./Themes/BootstrapGridTheme.jsx').then(({ BootstrapTheme }) => {
                    BaseComponent.theme = new BootstrapTheme();
                    resolve();
                });
            }
            else {
                BaseComponent.theme = new Theme();
                resolve();
            }
        })
    };
}

export function log(message) {
    if (!window._logEnabled) return;

    console.log(message);
}

export class NodeStatus {
    static grid = 0;
    static hidden = 1;
    static filter = 2;
    static lookup = 3;
    static custom = 4;
};

export class FilterType {
    static combobox = 0;
    static date = 1;
    static input = 2;
    static custom = 3;
};