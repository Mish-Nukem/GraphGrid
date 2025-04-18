import './css/default.css';
import TestData from './Tests/TestData';
import ReactGrid from './Grid/ReactGrid';
import Overlay from './Grid/Overlay';
import { useState, useEffect } from 'react';
import Modal from './Grid/Modals';

function App() {
    const [state, setState] = useState(0);

    window._logEnabled = true;

    let GetRows = function (e) {
        return new Promise(function (resolve, reject) {

            const rows = new TestData().getFamily();

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

    const drawInModal = function () {
        return (
            <ReactGrid getRows={GetRows} init={(grid) => { window.gridComponent = grid }}></ReactGrid>
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
                );
            case 1:
                return <Overlay init={(ovl) => { window.overlayComponent = ovl }} closeWhenEscape={true}></Overlay>;
            case 2:
                return <Modal isModal={true} renderContent={() => { return drawInModal() }} closeWhenEscape={true} pos={{ x: 100, y: 100, w: 300, h: 250 }}></Modal>;
            default:
                return null;
        }
    };

    return (
        <div >
            <select onChange={(e) => {
                console.log('this == ' + e);
                setState(e.target.selectedIndex);
            }}>
                <option>1. Test ReactGrid</option>
                <option>2. Test Overlay</option>
                <option>3. Test Modal</option>
            </select>
            <div className="div-on-menu">
                {getTestApp()}
            </div>
        </div>
    );
}

export default App;