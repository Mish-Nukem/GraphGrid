import '../Grid/css/default.css';
import { useState } from 'react';
import PMTest from './PMTest';
import { GridINU } from '../Grid/GridINU';
import { Graph } from '../Grid/GraphComponent';
import { LoginPage } from '../PM/Pages/LoginPage';
import appSettings from '../PM/PMSettings';
import { DataGetter } from '../Grid/Utils/DataGetter';
import { PMGridCreator } from './PMGridClassCreator'
import { MainMenu } from './Pages/MainMenu';
function PMApp() {
    const [state, setState] = useState({ menuItem: - 2, dataGetter: null, gridCreator: null });

    window._logEnabled = true;

    const dataGetter = state.dataGetter || new DataGetter(appSettings);
    const gridCreator = state.gridCreator || new PMGridCreator();

    const TEST = function () {
    }

    const testMenuItems = [
        { id: -1, text: 'Logout' },
        { id: 0, text: 'Empty' },
        { id: 1, text: 'PM Grids' },
        { id: 2, text: 'Two PM Grids', parent: 1 },
        { id: 3, text: 'Graph PM, handmade', parent: 1 },
        { id: 4, text: 'Graph PM, Remarks_scheme', parent: 1 },
        { id: 5, text: 'TEST' },
        //{ id: 6, text: '' }
    ];
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuItem);
        switch (state.menuItem) {
            case -1:
                setState({ menuItem: -2, dataGetter: null, gridCreator: null });

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
                            <Graph uid="testGraph" graph={new PMTest().getTestGraph()} dataGetter={dataGetter}></Graph>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        <div className="div-with-grid">
                            <Graph uid="PM" schemeName="Remarks_scheme" dataGetter={dataGetter} gridCreator={gridCreator}></Graph>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <button onClick={() => { TEST() }} className="modal-window-footer-button">TEST</button>
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
        state.menuItem < -1 ?
            <LoginPage
                dataGetter={dataGetter}
                afterLogin={(tokens) => {
                    if (!tokens) return;

                    setState({ menuItem: 0, dataGetter: dataGetter, gridCreator: gridCreator });
                }}>
            </LoginPage> :
            <div >
                <MainMenu
                    menuItems={testMenuItems}
                    onMenuItemClick={(e, item) => {
                        setState({ menuItem: item.id, dataGetter: dataGetter, gridCreator: gridCreator });
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