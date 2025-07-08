import '../Grid/css/default.css';
import { useState } from 'react';
import PMTest from './PMTest';
import { GridINU } from '../Grid/GridINU';
import { GraphComponent } from '../Grid/GraphComponent';
import { LoginPage } from '../PM/Pages/LoginPage';
import appSettings from '../PM/PMSettings';
import { DataGetter } from '../Grid/Utils/DataGetter';
import { BaseComponent } from '../Grid/Base';
import { PMGridCreator } from './PMGridClassCreator'
import { MainMenu } from './Pages/MainMenu';
import { GLObject } from '../Grid/GLObject';
import { ReportParamsPage } from '../Reports/Pages/ReportParamsPage';
function PMApp() {
    const [state, setState] = useState({ menuObj: { id: - 2 } });

    window._logEnabled = true;

    GLObject.dataGetter = GLObject.dataGetter || new DataGetter(appSettings);
    GLObject.gridCreator = GLObject.gridCreator || new PMGridCreator();

    GLObject.menuId = state.menuObj.id;

    const TEST = function (e) {
        BaseComponent.changeTheme();

        e.skipActivate = true;

        setState({ menuObj: { id: GLObject.menuId } });
    }

    const testMenuItems = [
        { id: -1, text: 'Выход' },
        { id: 0, text: 'Управление проектами' }, //Import ETL
        { id: 1, text: 'Управление проектами', parent: 0 },
        { id: 2, text: 'Заказчики', parent: 0 },
        { id: 3, text: 'Исполнители', parent: 0 },
        { id: 4, text: 'Физические лица', parent: 0 },
        { id: 5, text: 'Отчеты' },
        { id: 6, text: 'Примеры отчетов', parent: 5 },
        { id: 7, text: 'Карточка исполнителя.xls', parent: 6 },
        { id: 8, text: 'Список выполненных заданий.xls', parent: 6 },
        { id: 9, text: 'Список настроек обмена.xls', parent: 6 },
        { id: 10, text: 'Карточка настройки обмена.xls', parent: 6 },
        { id: 11, text: 'Обмен данными' },
        { id: 12, text: 'Список настроек обмена данными', parent: 11 },
        { id: 13, text: 'Управление системой' },
        { id: 14, text: 'Справочники', parent: 13 },
        { id: 16, text: 'Единицы измерения', parent: 14, entity: 'SEiEntity' },
        { id: 17, text: 'Проект', parent: 14, entity: 'SrRProjectEntity' },
        { id: 18, text: 'Статус', parent: 14, entity: 'SrRStatusEntity' },
        { id: 19, text: 'Срочность', parent: 14, entity: 'SrRPromptnessEntity' },
        {
            id: 15, text: 'Сменить тему', parent: 13, onClick: (e) => {
                //BaseComponent.theme = null;
                //BaseComponent.useBootstrap = !BaseComponent.useBootstrap;

                e.skipActivate = true;

                BaseComponent.changeTheme().then(() => {

                    setState({ menuObj: { id: GLObject.menuId } });
                });
            }
        },
    ];
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuObj.id);

        const menuItem = state.menuObj.menuItem || {};
        const entity = menuItem.entity || '';
        const parent = menuItem.parent || '';

        if (entity) {
            return (
                <div className="div-with-grid">
                    <GridINU uid={entity + '_dictionary'} entity={entity}></GridINU>
                </div>
            );
        }

        if (parent === 6) {
            const parentItem = testMenuItems.find(function (item) {
                return item.id === 6;
            });

            menuItem._reportParamsVisible = state.menuObj.id !== parentItem._lastItemId || menuItem._reportParamsVisible;
            parentItem._lastItemId = state.menuObj.id;

            parentItem.frmPos = parentItem.frmPos || { x: 210, y: 210 };

            return (
                <ReportParamsPage
                    nameReport={menuItem.text}
                    pos={parentItem.frmPos}
                    visible={menuItem._reportParamsVisible}
                    init={(de) => {
                        //de.visible = true;
                    }}
                    onClose={() => {
                        menuItem._reportParamsVisible = false;
                        setState({ menuObj: { id: GLObject.menuId } });
                    }}
                ></ReportParamsPage>
            );
        }

        switch (state.menuObj.id) {
            case -1:
                setState({ menuObj: { id: - 2 } });

                //    return (
                //        <></>
                //    )
                break;
            case 0:
                return <></>
            case 1:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PM" schemeName="Remarks_scheme"></GraphComponent>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Clients" schemeName="ClientsScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Executors" schemeName="Executors"></GraphComponent>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PhysPers" schemeName="PhysPers"></GraphComponent>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                    </>
                );
            case 12:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="TEAA" schemeName="TuningListScheme"></GraphComponent>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    /*
                <select onChange={(e) => {
                    //console.log('this == ' + e);
                    setState({ menuItem: e.target.selectedIndex - 1 });
                }}>
                    <option>Logout</option>
                    <option>0. None</option>
                    <option>1. Two PM Grids</option>
                    <option>2. Graph PM, handmade</option>
                    <option>3. Graph PM, Remarks_scheme</option>
                    <option>4. TEST</option>
                </select>

    */
    return (
        state.menuObj.id < -1 ?
            <LoginPage
                afterLogin={(tokens) => {
                    if (!tokens) return;

                    setState({ menuObj: { id: 0 } });
                }}>
            </LoginPage> :
            <div >
                <MainMenu
                    menuItems={testMenuItems}
                    onMenuItemClick={(e, item) => {
                        if (item.onClick) {
                            item.onClick(e, item);
                            return;
                        }

                        setState({ menuObj: { id: item.id, menuItem: item } });
                    }}
                >
                </MainMenu>
                <div className="div-on-menu">
                    {getTestApp()}
                </div>
            </div>
    );
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}

export default PMApp;