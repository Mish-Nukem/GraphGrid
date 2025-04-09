import './css/default.css';
import TestData from './Tests/TestData';
import ReactGrid from './Grid/ReactGrid'

function App() {
    function GetRows(e) {
        e.resolve({ rows: new TestData().getFamily() });
    }

    const ResetColumnsOrder = function () {
        const grid = window._gridDict['guid_testGrid'];
        grid.resetColumnsOrderToDefault();
    }

    const ResetColumnsWidths = function () {
        const grid = window._gridDict['guid_testGrid'];
        grid.resetColumnsWidthsToDefault();
    }

    return (
        <div >
            <div className="div-on-menu">
                1. Drag column to reorder
                2. Doubleclick on divider to autowidth
            </div>
            <div className="div-on-menu">
                <ReactGrid getRows={GetRows} uid="testGrid"></ReactGrid>
            </div>
            <div className="div-on-menu">
                <button onClick={() => ResetColumnsOrder()} className="modal-window-footer-button">Reset columns order</button>
                <button onClick={() => ResetColumnsWidths()} className="modal-window-footer-button">Reset columns widths</button>
                <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
            </div>
        </div>
    );
}

export default App;