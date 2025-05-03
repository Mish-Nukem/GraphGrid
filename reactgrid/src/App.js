import './css/default.css';
import { useState } from 'react';
import TestData from './Tests/TestData';
import { ReactGrid } from './Grid/ReactGrid';
import { Overlay } from './Grid/Overlay';
import { Modal } from './Grid/Modal';
import { Dropdown } from './Grid/Dropdown';
import { GridInGraph } from './Grid/GridInGraph';

function App() {
    const [state, setState] = useState(0);

    window._logEnabled = true;

    const GetRows = function (e) {
        return new Promise(function (resolve, reject) {

            const rows = new TestData().getFamily(e);

            if (rows != null) {
                resolve(rows);
            } else {
                reject(Error("Error getting rows"));
            }
        });
    };

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
                { id: 1, text: 'test 01' },
                { id: 2, text: 'test 02' },
                { id: 3, text: 'test 03' },
                { id: 4, text: 'test 04' },
                { id: 5, text: 'test 05' }
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
                <ReactGrid getRows={GetRows} init={(grid) => { window.gridComponent = grid }}></ReactGrid>
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
                <Dropdown init={(dd) => { window.ddComponent = dd; }} getItems={GetPopupItems} onItemClick={(e) => console.log('Item clicked: ' + e.itemId)}></Dropdown >
            </>
        )
    }

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
                            <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
                        </div>
                        <ReactGrid getRows={GetRows} init={(grid) => { window.gridComponent = grid; }}></ReactGrid>
                    </>
                )
            case 1:
                return (
                    <>
                        <div className="div-on-menu">
                            <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
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
                            <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
                        </div>
                        <div style={{ padding: "5px" }}>
                            <GridInGraph getRows={GetRows} uid="people"></GridInGraph>
                        </div>
                        <div style={{ padding: "5px" }}>
                            <GridInGraph getRows={GetCities} parentGrids="people"></GridInGraph>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

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
            </select>
            <div className="div-on-menu">
                {getTestApp()}
            </div>
        </div>
    );
}

export default App;