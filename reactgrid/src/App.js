import './css/default.css';
import { useState } from 'react';
import TestData from './Tests/TestData';
import { ReactGrid } from './Grid/ReactGrid';
import { Overlay } from './Grid/Overlay';
import { Modal } from './Grid/Modal';
import { Dropdown } from './Grid/Dropdown';
import { GridInGraph } from './Grid/GridInGraph';
import { GridDB } from './Grid/GridDB';
import { GridFL } from './Grid/GridFL';

function App() {
    const [state, setState] = useState(0);

    window._logEnabled = true;

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
                <ReactGrid getRows={GetFamily} init={(grid) => { window.gridComponent = grid }}></ReactGrid>
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
        console.log('state == ' + state);
        switch (state) {
            case 0:
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
                        <ReactGrid getRows={GetFamily} init={(grid) => { window.gridComponent = grid; }}></ReactGrid>
                    </>
                )
            case 1:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>

                        <Overlay init={(ovl) => { window.overlayComponent = ovl }} closeWhenEscape={true} closeWhenClick={true}></Overlay>
                    </>
                )
            case 2:
                return (
                    <>
                        <Modal uid="m01" isModal={true} renderContent={() => { return drawGridInModal() }} closeWhenEscape={true} pos={{ x: 100, y: 100, w: 300, h: 250 }}></Modal>
                    </>
                )
            case 3:
                return (
                    <>
                        <Modal uid="m02" isModal={true} renderContent={() => { return drawDropdownInModal() }} closeWhenEscape={true} pos={{ x: 100, y: 100, w: 300, h: 250 }}></Modal>
                    </>
                )
            case 4:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>
                        <div style={{ padding: "5px" }}>
                            <GridInGraph uid="people" getRows={GetFamily}></GridInGraph>
                        </div>
                        <div style={{ padding: "5px" }}>
                            <GridInGraph parentGrids="people" getRows={GetCities} getColumns={GetCityColumns}></GridInGraph>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        <div style={{ padding: "5px" }}>
                            <GridDB getRows={GetFamily} buttons={GetButtons()} getColumns={GetFamilyColumns}></GridDB>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        <div style={{ padding: "5px" }}>
                            <GridFL getRows={GetFamily} buttons={GetButtons()} getColumns={GetFamilyColumns}></GridFL>
                        </div>
                    </>
                );
            case 7:
                return (
                    <>
                        <div style={{ padding: "5px" }}>
                            <GridFL getRows={GetFamily} buttons={GetButtons()} getColumns={GetFamilyColumns}></GridFL>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
        <div >
            <select onChange={(e) => {
                //console.log('this == ' + e);
                setState(e.target.selectedIndex);
            }}>
                <option>1. Test ReactGrid</option>
                <option>2. Test Overlay</option>
                <option>3. Test Modal</option>
                <option>4. Test Dropdown</option>
                <option>5. Two Grids</option>
                <option>6. Test GridDB</option>
                <option>7. Test GridFL</option>
            </select>
            <div className="div-on-menu">
                {getTestApp()}
            </div>
        </div>
    );
}

export default App;