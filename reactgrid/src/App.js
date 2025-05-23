import './css/default.css';
import { useState } from 'react';
import TestData from './Tests/TestData';
import { Grid } from './Grid/Grid';
import { Overlay } from './Grid/Overlay';
import { Modal } from './Grid/Modal';
import { Dropdown } from './Grid/Dropdown';
import { GridInGraph } from './Grid/GridInGraph';
import { GridDB } from './Grid/GridDB';
import { GridFL } from './Grid/GridFL';
import { GridINU } from './Grid/GridINU';
import { Graph } from './Grid/GraphComponent'; 
//import { BootstrapGrid } from './Grid/BootstrapGrid'; 
import { LoginPage } from './Pages/LoginPage';
import appSettings from './AppSettings';
import { DataGetter } from './Utils/DataGetter';


function App() {
    const [state, setState] = useState({ menuItem: - 2, atoken: '', rtoken: '' });

    window._logEnabled = true;

    const dataGetter = new DataGetter(appSettings);
    dataGetter.atoken = state.atoken;
    dataGetter.rtoken = state.rtoken;

    const GetFamily = function (e) {
        return new Promise(function (resolve, reject) {

            const rows = new TestData().getFamily(e);

            if (rows != null) {
                resolve(rows);
            } else {
                reject(Error("Error getting rows"));
            }
        });
    };

    const GetButtons = function () {
        return [
            {
                id: 1,
                name: 'info',
                title: 'Persone Info',
                label: 'Persone Info',
                click: function (e) {
                    const selRow = e.grid.selectedRowIndex >= 0 && e.grid.rows.length > 0 ? e.grid.rows[e.grid.selectedRowIndex] : null;
                    if (!selRow) return;

                    alert(`Persone Name = ${selRow.Name}, Persone Birth Day = ${selRow.Date}`);
                },
                getDisabled: function (e) {
                    return !e.grid.rows || e.grid.rows.length <= 0;
                }
            },
            {
                id: 2,
                name: 'clear',
                title: 'Clear console',
                label: 'Clear console',
                click: function (e) {
                    console.clear();
                },
            }
        ]
    }

    const GetCities = function (e) {
        return new Promise(function (resolve, reject) {

            const rows = new TestData().getCity(e);

            if (rows != null) {
                resolve(rows);
            } else {
                reject(Error("Error getting rows"));
            }
        });
    };

    const GetCityColumns = function () {
        return new TestData().GetCityColumns();
    }

    const GetFamilyColumns = function () {
        return new TestData().GetFamilyColumns();
    }

    const ResetColumnsOrder = function () {
        const grid = window.gridComponent;
        if (!grid) return;

        grid.resetColumnsOrderToDefault();
    }

    const ResetColumnsWidths = function () {
        const grid = window.gridComponent;
        if (!grid) return;

        grid.resetColumnsWidthsToDefault();
    }

    const GetPopupItems = function (e) {
        return new Promise(function (resolve, reject) {

            const items = [
                { id: 1, text: 'test 1 item' },
                { id: 2, text: 'test 2 item' },
                { id: 3, text: 'test 3 item' },
                { id: 4, text: 'test 4 item' },
                { id: 5, text: 'test 5 item' }
            ];
            resolve(items);
        });
    };

    const drawGridInModal = function () {
        return (
            <>
                <div className="div-on-menu">
                    <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
                </div>
                <Grid getRows={GetFamily} init={(grid) => { window.gridComponent = grid }}></Grid>
            </>
        )
    }

    const drawDropdownInModal = function () {
        return (
            <>
                <div className="div-on-menu">
                    <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
                    <button onClick={(e) => { window.ddComponent.popup(e); }} className="modal-window-footer-button">Show Dropdown</button>
                </div>
                <Dropdown init={(dd) => { window.ddComponent = dd; }} getItems={GetPopupItems} onItemClick={(e) => console.log('Item clicked: ' + e.itemId)}></Dropdown>
            </>
        )
    }

    const drawClearConsole = function () {
        return (
            <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuItem);
        switch (state.menuItem) {
            case -1:
                return (
                    <></>
                )
            case 0:
                return <></>
            case 1:
                return (
                    <>
                        <div className="div-on-menu">
                            1. Drag column to reorder
                            2. Doubleclick on divider to autowidth
                        </div>
                        <div className="div-on-menu">
                            <button onClick={() => ResetColumnsOrder()} className="modal-window-footer-button">Reset columns order</button>
                            <button onClick={() => ResetColumnsWidths()} className="modal-window-footer-button">Reset columns widths</button>
                            {drawClearConsole()}
                        </div>
                        <Grid getRows={GetFamily} init={(grid) => { window.gridComponent = grid; }}></Grid>
                    </>
                )
            case 2:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>

                        <Overlay init={(ovl) => { window.overlayComponent = ovl }} closeWhenEscape={true} closeWhenClick={true}></Overlay>
                    </>
                )
            case 3:
                return (
                    <>
                        <Modal uid="m01" isModal={true} renderContent={() => { return drawGridInModal() }} closeWhenEscape={true} pos={{ x: 100, y: 100, w: 300, h: 250 }} title='Modal Grid'></Modal>
                    </>
                )
            case 4:
                return (
                    <>
                        <Modal uid="m02" isModal={true} renderContent={() => { return drawDropdownInModal() }} closeWhenEscape={true} pos={{ x: 100, y: 100, w: 300, h: 250 }}></Modal>
                    </>
                )
            case 5:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>
                        <div className="div-with-grid">
                            <GridInGraph uid="people" getRows={GetFamily}></GridInGraph>
                        </div>
                        <div className="div-with-grid">
                            <GridInGraph parentGrids="people" getRows={GetCities} getColumns={GetCityColumns}></GridInGraph>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <div className="div-with-grid">
                            <GridDB getRows={GetFamily} buttons={GetButtons()} getColumns={GetFamilyColumns}></GridDB>
                        </div>
                    </>
                );
            case 7:
                return (
                    <>
                        <div className="div-with-grid">
                            <GridFL getRows={GetFamily} buttons={GetButtons()} getColumns={GetFamilyColumns}></GridFL>
                        </div>
                    </>
                );
            case 8:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>
                        <div className="div-with-grid">
                            <GridINU uid="proj" entity="SrRProjectEntity" dataGetter={dataGetter}></GridINU>
                        </div>
                        <div className="div-with-grid">
                            <GridINU parentGrids="proj" uid="rem" entity="SrRemarkEntity" dataGetter={dataGetter}></GridINU>
                        </div>
                    </>
                );
            case 9:
                return (
                    <>
                        <div className="div-with-grid">
                            <Graph uid="PM" graph={new TestData().getTestGraph()} dataGetter={dataGetter}></Graph>
                        </div>
                    </>
                );
            case 10:
                return (
                    <>
                        <div className="div-with-grid">
                            <Graph uid="PM" schemeName="Remarks_scheme" dataGetter={dataGetter}></Graph>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // init={(loginForm) => { loginForm.dataGetter = dataGetter }}
    return (
        state.menuItem < -1 ?
            <LoginPage
                dataGetter={dataGetter}
                afterLogin={(tokens) => {
                    const arr = tokens.split(';');
                    if (arr.length !== 2) return;

                    setState({ menuItem: -1, atoken: arr[0], rtoken: arr[1] });
                }}>
            </LoginPage> :
            <div >
                <select onChange={(e) => {
                    //console.log('this == ' + e);
                    setState({ menuItem: e.target.selectedIndex, atoken: state.atoken, rtoken: state.rtoken });
                }}>
                    <option>0. None</option>
                    <option>1. ReactGrid</option>
                    <option>2. Overlay</option>
                    <option>3. Modal</option>
                    <option>4. Dropdown</option>
                    <option>5. Two Grids</option>
                    <option>6. GridDB</option>
                    <option>7. GridFL</option>
                    <option>8. Two Grids (INU)</option>
                    <option>9. Graph (INU, handmade)</option>
                    <option>10. Graph (INU, Remarks_scheme)</option>
                </select>
                <div className="div-on-menu">
                    {getTestApp()}
                </div>
            </div>
    );
}

export default App;