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
import { PMMainMenu } from './Pages/MainMenu';
import { GLObject } from '../Grid/GLObject';
import { ReportParamsPage } from '../Reports/Pages/ReportParamsPage';
import { GLSettings } from '../Grid/Pages/GLSettings';
function PMApp() {
    const [state, setState] = useState({ menuObj: { id: - 2 } });

    window._logEnabled = true;

    document.title = 'Управление проектом';

    //"APIurl": "http://m2.infomega.local:5152/api/",
    //"PostgreSQLAPIurl": "http://m2.infomega.local:5152/api/"
    //"DebugAPIurl": "http://localhost:5152/api/",
    //"localAPIurl": "http://localhost/api/"

    appSettings.APIurl = GLObject.serverType !== 0 ? appSettings.MSSQLAPIurl : appSettings.PostgreSQLAPIurl;

    // !!! раскомментрировать для отладки локально !!!
    if (GLObject.isDebug) {
        appSettings.APIurl = appSettings.DebugAPIurl;
    }
    // !!! раскомментрировать для отладки локально !!!

    GLObject.dataGetter = GLObject.dataGetter || new DataGetter(appSettings);
    GLObject.gridCreator = GLObject.gridCreator || new PMGridCreator();

    GLObject.dataGetter.APIurl = appSettings.APIurl;
    GLObject.appSettings = appSettings;

    GLObject.menuId = state.menuObj.id;

    GLObject.changeAPIurl = GLObject.changeAPIurl || function (serverType) {
        GLObject.serverType = serverType;
        if (GLObject.isDebug) {
            GLObject.dataGetter.APIurl = appSettings.DebugAPIurl;
        }
        else {
            GLObject.dataGetter.APIurl = appSettings.APIurl = GLObject.serverType !== 0 ? appSettings.MSSQLAPIurl : appSettings.PostgreSQLAPIurl;
        }
    };

    //const testMenuItems = [
    //    { id: -1, text: 'Выход' },
    //    { id: 0, text: 'Управление проектами' },
    //    { id: 1, text: 'Управление проектами', parent: 0 },
    //    { id: 2, text: 'Заказчики', parent: 0 },
    //    { id: 3, text: 'Исполнители', parent: 0 },
    //    { id: 4, text: 'Физические лица', parent: 0 },
    //    { id: 5, text: 'Отчеты' },
    //    { id: 6, text: 'Примеры отчетов', parent: 5 },
    //    { id: 7, text: 'Карточка исполнителя.xls', parent: 6 },
    //    { id: 8, text: 'Список выполненных заданий.xls', parent: 6 },
    //    { id: 9, text: 'Список настроек обмена.xls', parent: 6 },
    //    { id: 10, text: 'Карточка настройки обмена.xls', parent: 6 },
    //    { id: 21, text: '1.xls', parent: 6 },
    //    { id: 11, text: 'Обмен данными' },
    //    { id: 12, text: 'Список настроек обмена данными', parent: 11 },
    //    { id: 13, text: 'Управление системой' },
    //    { id: 14, text: 'Справочники', parent: 13 },
    //    { id: 16, text: 'Единицы измерения', parent: 14, entity: 'SEiEntity' },
    //    { id: 17, text: 'Проект', parent: 14, entity: 'SrRProjectEntity' },
    //    { id: 18, text: 'Статус', parent: 14, entity: 'SrRStatusEntity' },
    //    { id: 19, text: 'Срочность', parent: 14, entity: 'SrRPromptnessEntity' },
    //];

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getPMApp = () => {
        console.log('state == ' + state.menuObj.id);

        const menuItem = state.menuObj.menuItem || {};
        const entity = menuItem.entity || '';
        //const parent = menuItem.parent || '';

        const parentItem = state.menuObj.menu && state.menuObj.menu.menuItems ? state.menuObj.menu.menuItems.find(function (item) {
            return item.id === menuItem.parent;
        }) : null;

        if (entity) {
            return (
                <>
                    <div className="div-on-menu">
                        <h3>{menuItem.text}</h3>
                    </div>

                    <div className="div-with-grid">
                        <GridINU uid={entity + '_dictionary'} entity={entity} controller={'dictionary'}></GridINU>
                    </div>
                </>
            );
        }

        if (state.menuObj.menuItem && state.menuObj.menuItem.action === 'acReports') {
            menuItem._reportParamsVisible = state.menuObj.id !== parentItem._lastItemId || menuItem._reportParamsVisible;
            parentItem._lastItemId = menuItem.id;

            parentItem.frmPos = parentItem.frmPos || { x: 210, y: 210 };

            return (
                <ReportParamsPage
                    nameReport={menuItem.text}
                    pos={parentItem.frmPos}
                    visible={menuItem._reportParamsVisible}
                    onClose={() => {
                        menuItem._reportParamsVisible = false;
                        setState({ menuObj: { id: GLObject.menuId } });
                    }}
                ></ReportParamsPage>
            );
        }

        switch (state.menuObj.id) {
            case 'logout':
                setState({ menuObj: { id: - 2 } });

                GLObject.user = '';
                break;
            case 0:
                return <></>
            case 'acProjectManagement':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PM" schemeName="Remarks_scheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acClients':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Clients" schemeName="ClientsScheme"></GraphComponent>
                        </div>
                    </>
                );
            case 'acExecutors':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Executors" schemeName="Executors"></GraphComponent>
                        </div>
                    </>
                );
            case 'acPhysPersons':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PhysPers" schemeName="PhysPers"></GraphComponent>
                        </div>
                    </>
                );
            case 'acReports':
                return (
                    <>
                    </>
                );
            case 'acDataExchangeTuning':
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="TEAA" schemeName="TuningListScheme"></GraphComponent>
                        </div>
                    </>
                );
            //case 21:
            //    menuItem._settingsVisible = parentItem && state.menuObj.id !== parentItem._lastItemId || menuItem._settingsVisible;
            //    if (parentItem) {
            //        parentItem._lastItemId = state.menuObj.id;
            //    }

            //    menuItem.frmPos = menuItem.frmPos || { x: 210, y: 210, w: 400, h: 310 };

            //    return (
            //        <GLSettings
            //            pos={menuItem.frmPos}
            //            visible={menuItem._settingsVisible}
            //            onClose={() => {
            //                menuItem._settingsVisible = false;
            //                setState({ menuObj: { id: GLObject.menuId } });
            //            }}
            //        ></GLSettings>

            //    );
            default:
                return (
                    <h2>
                        {state.menuObj.id + ". Не реализовано!"}
                    </h2>
                );
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
        state.menuObj.id < -1 ?
            <LoginPage
                afterLogin={(tokens) => {
                    if (!tokens) return;

                    setState({ menuObj: { id: 0 } });
                }}>
            </LoginPage> :
            <div >
                <PMMainMenu
                    //menuItems={testMenuItems}
                    onMenuItemClick={(e, item, menu) => {
                        if (item.onClick) {
                            item.onClick(e, item, menu);
                            return;
                        }

                        setState({ menuObj: { id: item.action, menuItem: item, menu: menu } });
                    }}
                >
                </PMMainMenu>
                <div className="div-on-menu">
                    {getPMApp()}
                </div>
            </div>
    );
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}

export default PMApp;