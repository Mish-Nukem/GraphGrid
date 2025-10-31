import { useState/*, useEffect*/ } from 'react';
import { ModalClass } from '../Modal';
import { Select } from '../OuterComponents/Select';
import { GLObject } from '../GLObject';
import { BaseComponent } from '../Base';

export function GLSettings(props) {
    const [pageState, setState] = useState({ settings: null, ind: 0 });

    let sp = pageState.settings || new SettingsPageClass(props);

    sp.visible = props.visible != null ? props.visible : sp.visible;

    if (props.init) {
        props.init(sp);
    }

    sp.refreshState = function () {
        //++sp.stateind;
        setState({ settings: sp, ind: ++sp.stateind }); //{ settings: sp, ind: ++sp.stateind }
    }

    //useEffect(() => {
    //    return () => {
    //    }
    //}, [sp])

    return (sp.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class SettingsPageClass extends ModalClass {
    constructor(props) {
        super(props);

        const sp = this;
        sp.renderContent = sp.renderSettingsPage;

        sp.visible = props.visible != null ? props.visible : false;

        sp.opt.closeWhenEscape = true;
        sp.opt.resizable = true;
        sp.opt.isModal = true;

        sp.parent = props.parent;

        sp._selectedTheme = sp._selectedTheme || { value: GLObject.gridSettings.themeId || 0, label: GLObject.gridSettings.themeName || sp.translate('Default theme') };
        sp._selectedButtonSize = sp._selectedButtonSize || { value: GLObject.gridSettings.buttonSize || 0, label: GLObject.gridSettings.buttonSizeName || sp.translate('Small buttons') };

        sp.buttons = sp.getButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _seq = 0;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const sp = this;
        return sp.renderSettingsPage();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSettingsPage() {
        const sp = this;
        return (
            <div>
                <>
                    <div className="graph-card-field">
                        <span>{sp.translate('Theme') + ':'}</span>
                        <div className="field-edit">
                            <Select
                                key={`themeSelect_${sp.id}_${sp.stateind}_`}
                                inputClass={sp.inputClass || ''}
                                className={sp.selectClass || ''}
                                value={sp._selectedTheme}
                                getOptions={(filter, pageNum) => sp.getThemesList(filter, pageNum)}
                                height={sp.selectH}
                                required={false}
                                onChange={(e) => {
                                    sp._selectedTheme = e || { value: 0, label: sp.translate('Default theme') };
                                    const isBootstrap = sp._selectedTheme.value !== 0;

                                    if (sp.parent) {
                                        GLObject.gridSettings.themeId = sp._selectedTheme.value;
                                        GLObject.gridSettings.themeName = sp._selectedTheme.label;

                                        BaseComponent.changeTheme(isBootstrap).then(() => {
                                            sp.changeButtonSizes(isBootstrap);
                                        });

                                        //sp.parent.refreshState(true);
                                        setTimeout(() => {
                                            sp.refreshState();
                                            sp.parent.refreshState();
                                        }, 1000);
                                    }
                                    else {
                                        BaseComponent.changeTheme(isBootstrap).then(() => {
                                            sp.changeButtonSizes(isBootstrap);
                                        });

                                        sp.refreshState();
                                    }
                                }}
                                disabled={sp.disabled}
                                gridColumn={'span 2'}
                            >
                            </Select>
                        </div>
                    </div>
                    <div className="graph-card-field">
                        <span>{sp.translate('Buttons size') + ':'}</span>
                        <div className="field-edit">
                            <Select
                                key={`buttnSizeSelect_${sp.id}_${sp.parent ? sp.parent.stateind : sp.stateind}_`}
                                inputClass={sp.inputClass || ''}
                                className={sp.selectClass || ''}
                                value={sp._selectedButtonSize}
                                getOptions={(filter, pageNum) => sp.getButtonSizesList(filter, pageNum)}
                                height={sp.selectH}
                                required={false}
                                cacheUniq={sp.parent ? sp.parent.stateind : 0}
                                cache={[SettingsPageClass._seq++]}
                                onChange={(e) => {
                                    sp._selectedButtonSize = e || { value: 0, label: sp.translate('Small buttons') };
                                    if (sp.parent) {
                                        GLObject.gridSettings.buttonSize = sp._selectedButtonSize.value;
                                        GLObject.gridSettings.buttonSizeName = sp._selectedButtonSize.label;

                                        sp.changeButtonSizes(sp._selectedTheme.value !== 0);

                                        sp.refreshState();
                                        sp.parent.refreshState();
                                    }
                                    else {
                                        GLObject.gridSettings.buttonSize = sp._selectedButtonSize.value;
                                        GLObject.gridSettings.buttonSizeName = sp._selectedButtonSize.label;

                                        sp.changeButtonSizes(sp._selectedTheme.value !== 0);
                                        sp.refreshState();
                                    }
                                }}
                                disabled={sp.disabled}
                                gridColumn={'span 2'}
                            >
                            </Select>
                        </div>
                    </div>
                    <div className="graph-card-field">
                        <span>{"API:"}</span>
                        <div className="field-edit">
                            <span>{GLObject.dataGetter.APIurl}</span>
                        </div>
                    </div>
                    <div className="graph-card-field">
                        <span>{sp.translate('User') + ':'}</span>
                        <div className="field-edit">
                            <span>{GLObject.user}</span>
                        </div>
                    </div>
                    <div className="graph-card-field">
                        <span>{sp.translate('Database') + ':'}</span>
                        <div className="field-edit">
                            <span>{GLObject.DBInfo}</span>
                        </div>
                    </div>
                </>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getButtons() {
        const sp = this;
        const res = [
            {
                title: 'OK',
                onclick: (e) => sp.applySettings(e),
            },
            {
                title: sp.translate('Cancel'),
                onclick: (e) => { sp.close(e); },
            },
        ];

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    applySettings(e) {
        const sp = this;

        GLObject.gridSettings.themeId = sp._selectedTheme.value;
        GLObject.gridSettings.themeName = sp._selectedTheme.label;

        GLObject.gridSettings.buttonSize = sp._selectedButtonSize.value;
        GLObject.gridSettings.buttonSizeName = sp._selectedButtonSize.label;

        const isBootstrap = sp._selectedTheme.value !== 0;

        if (GLObject.changeImagesSizes) {
            GLObject.changeImagesSizes();
        }

        BaseComponent.changeTheme(isBootstrap).then(() => {
            sp.changeButtonSizes(isBootstrap);
        });

        sp.close(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    changeButtonSizes(isBootstrap) {
        if (isBootstrap) {
            switch (+GLObject.gridSettings.buttonSize) {
                case 0:
                    BaseComponent.theme.toolbarButtonsClass = 'btn btn-primary btn-sm';
                    break;
                case 1:
                    BaseComponent.theme.toolbarButtonsClass = 'btn btn-primary btn-md';
                    break;
                case 2:
                    BaseComponent.theme.toolbarButtonsClass = 'btn btn-primary btn-lg';
                    break;
            }
        }
        else {
            switch (+GLObject.gridSettings.buttonSize) {
                case 0:
                    BaseComponent.theme.toolbarButtonsClass = 'grid-toolbar-button';
                    break;
                case 1:
                    BaseComponent.theme.toolbarButtonsClass = 'grid-toolbar-button-md';
                    break;
                case 2:
                    BaseComponent.theme.toolbarButtonsClass = 'grid-toolbar-button-lg';
                    break;
            }
        }

        if (GLObject.changeImagesSizes) {
            GLObject.changeImagesSizes();
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getThemesList() {
        const sp = this;
        return new Promise((resolve) => {
            let res = [
                { value: 0, label: sp.translate('Default theme') },
                { value: 1, label: 'Bootstrap' },
            ];

            //res = res.filter(
            //    (option) => sp._selectedTheme.value !== option.value
            //);

            resolve({
                options: res,
                hasMore: false,
                additional: {
                    page: 1
                },
            });

        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getButtonSizesList(_, pageNum) {
        const sp = this;
        return new Promise((resolve) => {
            let res =[
                { value: 0, label: sp.translate('Small buttons') },
                { value: 1, label: sp.translate('Medium buttons') },
                { value: 2, label: sp.translate('Large buttons') },
            ];

            //res = res.filter(
            //    (option) => sp._selectedButtonSize.value !== option.value
            //);

            resolve({
                options: res,
                hasMore: false,
                additional: {
                    page: pageNum + 1
                },
            });

        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}