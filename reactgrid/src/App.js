import './css/default.css';
import TestData from './Tests/TestData';
import ReactGrid from './Grid/ReactGrid'

function App() {
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
        grid.resetColumnsOrderToDefault();
    }

    const ResetColumnsWidths = function () {
        const grid = window.gridComponent;
        grid.resetColumnsWidthsToDefault();
    }

    return (
        <div >
            <div className="div-on-menu">
                1. Drag column to reorder
                2. Doubleclick on divider to autowidth
            </div>
            <div className="div-on-menu">
                <ReactGrid getRows={GetRows} init={(grid) => { window.gridComponent = grid }}></ReactGrid>
            </div>
            <div className="div-on-menu">
                <button onClick={() => ResetColumnsOrder()} className="modal-window-footer-button">Reset columns order</button>
                <button onClick={() => ResetColumnsWidths()} className="modal-window-footer-button">Reset columns widths</button>
                <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
            </div>
            {/*<Modal></Modal>*/}
        </div>
    );
}

export default App;