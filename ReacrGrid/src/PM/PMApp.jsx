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
function PMApp() {
    const [state, setState] = useState({ menuObj: { id: - 2 }, dataGetter: null, gridCreator: null });

    window._logEnabled = true;

    const dataGetter = state.dataGetter || new DataGetter(appSettings, () => setState({ menuObj: { id: - 2 }, dataGetter: null, gridCreator: null }));
    const gridCreator = state.gridCreator || new PMGridCreator();

    dataGetter.menuId = state.menuObj.id;

    const TEST = function (e) {

        //BaseComponent.theme = null;
        //BaseComponent.useBootstrap = !BaseComponent.useBootstrap;

        BaseComponent.changeTheme();

        e.skipActivate = true;

        setState({ menuObj: { id: state.dataGetter.menuId/*state.menuObj.id*/ }, dataGetter: dataGetter, gridCreator: gridCreator });
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
        { id: 7, text: 'Карточка исполнителя', parent: 6 },
        { id: 8, text: 'Список выполненных заданий', parent: 6 },
        { id: 9, text: 'Список настроек обмена', parent: 6 },
        { id: 10, text: 'Карточка настройки обмена', parent: 6 },
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

                    setState({ menuObj: { id: state.dataGetter.menuId/*menuObj.id*/ }, dataGetter: dataGetter, gridCreator: gridCreator });
                });
            }
        },
    ];
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuObj.id);

        const entity = state.menuObj.menuItem ? state.menuObj.menuItem.entity : '';

        if (entity) {
            return (
                <div className="div-with-grid">
                    <GridINU uid={entity + '_dictionary'} entity={entity} dataGetter={dataGetter}></GridINU>
                </div>
            );
        }

        switch (state.menuObj.id) {
            case -1:
                setState({ menuObj: { id: - 2 }, dataGetter: null, gridCreator: null });

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
                            <GraphComponent uid="PM" schemeName="Remarks_scheme" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Clients" schemeName="ClientsScheme" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="Executors" schemeName="Executors" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PhysPers" schemeName="PhysPers" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
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
                            <GraphComponent uid="TEAA" schemeName="TuningListScheme" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
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
                    setState({ menuItem: e.target.selectedIndex - 1, dataGetter: dataGetter, gridCreator: gridCreator });
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
                dataGetter={dataGetter}
                afterLogin={(tokens) => {
                    if (!tokens) return;

                    setState({ menuObj: { id: 0 }, dataGetter: dataGetter, gridCreator: gridCreator });
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

                        setState({ menuObj: { id: item.id, menuItem: item }, dataGetter: dataGetter, gridCreator: gridCreator });
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