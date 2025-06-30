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
        { id: -1, text: 'Logout' },
        { id: 0, text: 'Import ETL' },
        { id: 1, text: 'PM Grids' },
        { id: 2, text: 'Two PM Grids', parent: 1 },
        { id: 3, text: 'Graph PM, handmade', parent: 1 },
        { id: 4, text: 'Graph PM, Remarks_scheme', parent: 1 },
        {
            id: 5, text: 'Change Theme', onClick: (e, item) => {
                //BaseComponent.theme = null;
                //BaseComponent.useBootstrap = !BaseComponent.useBootstrap;

                e.skipActivate = true;

                BaseComponent.changeTheme().then(() => {

                    setState({ menuObj: { id: state.dataGetter.menuId/*menuObj.id*/ }, dataGetter: dataGetter, gridCreator: gridCreator });
                });
            }
        },
        //{ id: 6, text: 'Submenu test 1', parent: 5 },
        //{ id: 7, text: 'Submenu test', parent: 6 },
        { id: 8, text: 'Tuning List', parent: 0 },
    ];
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuObj.id);
        switch (state.menuObj.id) {
            case -1:
                setState({ menuObj: { id: - 2 }, dataGetter: null, gridCreator: null });

                //    return (
                //        <></>
                //    )
                break;
            case 0:
                return <></>
            case 2:
                return (
                    <>
                        <div className="div-with-grid">
                            <GridINU uid="proj" entity="SrRProjectEntity" dataGetter={dataGetter} keyField='ID_SR_R_PROJECT_SRPJ'></GridINU>
                        </div>
                        < div className="div-with-grid">
                            <GridINU parentGrids="proj" uid="rem" entity="SrRemarkEntity" dataGetter={dataGetter}></GridINU>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="testGraph" graph={new PMTest().getTestGraph()} dataGetter={dataGetter}></GraphComponent>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PM" schemeName="Remarks_scheme" dataGetter={dataGetter} gridCreator={gridCreator}></GraphComponent>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <button onClick={(e) => { TEST(e); }} className="modal-window-footer-button">TEST</button>
                    </>
                );
            case 8:
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

                        setState({ menuObj: { id: item.id }, dataGetter: dataGetter, gridCreator: gridCreator });
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