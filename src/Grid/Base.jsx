import { DefaultGridTheme as Theme } from './Themes/DefaultGridTheme';
export class BaseComponent {

    constructor(props) {

        this.level = props.level || 0;

        //window._logEnabled = true;
        if (!BaseComponent.theme) {
            BaseComponent.theme = new Theme();

            if (BaseComponent.useBootstrap) {
                BaseComponent.changeTheme(true);
            }
        }
    }

    translate(text, context) {
        return BaseComponent.translate(text, context);
    }

    static translate(text/*, context*/) {
        return text;
    }

    Spinner(id = -1, minW = -1, maxW = -1) {
        return BaseComponent.Spinner ? BaseComponent.Spinner(id, minW, maxW) : <></>;
    }

    static Spinner(id = -1, minW = -1, maxW = -1) {
        return (
            <div key={`loader_${id}_`}
                className='grid-loader'
                style={{ minWidth: minW ? minW + "px" : "", maxWidth: maxW ? maxW + "px" : "" }}
            >
                <div>{BaseComponent.translate('Loading') + '...'}</div>
            </div>
        )
    }

    formatDate(text, dateFormat) {
        return BaseComponent.formatDate(text, dateFormat);
    }

    static formatDate(text) {
        return text;
    }

    static dateFormat = 'dd.MM.yyyy';
    static dateTimeFormat = 'dd.MM.yyyy HH:mm:ss';

    static theme = null;
    static useBootstrap = false;
    static changeTheme = () => {
        return new Promise(function (resolve) {
            BaseComponent.theme = new Theme();
            resolve();
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