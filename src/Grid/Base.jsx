import { DefaultGridTheme as Theme } from './Themes/DefaultGridTheme';
import { Translate } from './Themes/Translate';
import { ClipLoader } from 'react-spinners';
export class BaseComponent {

    constructor(props) {

        this.level = props.level || 0;

        //window._logEnabled = true;
        if (!BaseComponent.theme) {
            BaseComponent.theme = new Theme();

            if (BaseComponent.useBootstrap) {
                import('./Themes/BootstrapGridTheme.jsx').then(({ BootstrapTheme }) => { BaseComponent.theme = new BootstrapTheme(); });
            }
        }
    }

    translate(text, context) {
        return Translate.translate(text, context);
    }

    Spinner(id = -1, minW = -1, maxW = -1) {
        return (
            <div key={`loader_${id}_`}
                className='grid-loader'
                style={{ minWidth: minW ? minW + "px" : "", maxWidth: maxW ? maxW + "px" : "" }}
            >
                <ClipLoader size={15}></ClipLoader>
            </div>
        )
    }

    static dateFormat = 'DD.MM.YYYY';

    static theme = null;
    static useBootstrap = false;
    static changeTheme = (val) => {
        return new Promise(function (resolve) {
            if (val != null) {
                BaseComponent.useBootstrap = val;
            }
            else {
                BaseComponent.useBootstrap = !BaseComponent.useBootstrap;
            }

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