import { useState, useEffect } from 'react';
import { ModalClass } from '../Modal';
import { Select } from '../OuterComponents/Select';
import { GLObject } from '../GLObject';
import { BaseComponent } from '../Base';

export function GLSettings(props) {
    let sp = null;

    const [pageState, setState] = useState({ settings: sp, ind: 0 });

    sp = pageState.settings;
    if (!sp) {
        sp = sp || new SettingsPageClass(props);
    }

    sp.visible = props.visible !== undefined ? props.visible : sp.visible;

    sp._selectedTheme = sp._selectedTheme || { value: GLObject.gridSettings.themeId || 0, label: GLObject.gridSettings.themeName || 'Тема по умолчанию' };
    sp._selectedButtonSize = sp._selectedButtonSize || { value: GLObject.gridSettings.buttonSize || 0, label: GLObject.gridSettings.buttonSizeName || 'По умолчанию' };

    if (props.init) {
        props.init(sp);
    }

    sp.refreshState = function () {
        setState({ settings: sp, ind: sp.stateind++ });
    }

    useEffect(() => {
        return () => {
        }
    }, [sp])

    return (sp.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class SettingsPageClass extends ModalClass {
    constructor(props) {
        super(props);

        const sp = this;
        sp.renderContent = sp.renderSettingsPage;

        sp.visible = props.visible !== undefined ? props.visible : false;

        sp.opt.closeWhenEscape = true;
        sp.opt.resizable = true;
        sp.opt.isModal = true;
        //sp.opt.dimensionsByContent = true;

        sp.buttons = sp.getButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSettingsPage() {
        const sp = this;
        return (
            <div>

                <>
                    <div className="graph-card-field">
                        <span>{"Тема:"}</span>
                        <div className="field-edit">
                            <Select
                                key={`themeSelect_${sp.id}_`}
                                inputClass={sp.inputClass || ''}
                                className={sp.selectClass || ''}
                                value={sp._selectedTheme}
                                getOptions={(filter, pageNum) => sp.getThemesList(filter, pageNum)}
                                height={sp.selectH}
                                required={false}
                                onChange={(e) => {
                                    sp._selectedTheme = e || { value: 0, label: 'Тема по умолчанию' };
                                    sp.refreshState();
                                }}
                                disabled={sp.disabled}
                                gridColumn={'span 2'}
                            >
                            </Select>
                        </div>
                    </div>
                    <div className="graph-card-field">
                        <span>{"Размер кнопок:"}</span>
                        <div className="field-edit">
                            <Select
                                key={`buttSizeSelect_${sp.id}_`}
                                inputClass={sp.inputClass || ''}
                                className={sp.selectClass || ''}
                                value={sp._selectedButtonSize}
                                getOptions={(filter, pageNum) => sp.getButtonSizesList(filter, pageNum)}
                                height={sp.selectH}
                                required={false}
                                onChange={(e) => {
                                    sp._selectedButtonSize = e || { value: 0, label: 'По умолчанию' };
                                    sp.refreshState();
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
                        <span>{"Server type:"}</span>
                        <div className="field-edit">
                            <span>{GLObject.serverType !== 0 ? "MSSQL" : "PostgreSQL"}</span>
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
                title: 'Отменить',
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

        BaseComponent.changeTheme(isBootstrap).then(() => {
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
        });

        sp.close(e);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getThemesList() {
        return new Promise((resolve) => {
            const res = [
                { value: 0, label: 'Тема по умолчанию' },
                { value: 1, label: 'Bootstrap' },
            ];

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
    getButtonSizesList() {
        return new Promise((resolve) => {
            const res = [
                { value: 0, label: 'По умолчанию' },
                { value: 1, label: 'Средние' },
                { value: 2, label: 'Большие' },
            ];

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
}