import '../Grid/css/default.css';
import { useState } from 'react';
import TestData from '../Tests/TestData';
import { Grid } from '../Grid/Grid';
import { Overlay } from '../Grid/Overlay';
import { Modal } from '../Grid/Modal';
import { Dropdown } from '../Grid/Dropdown';
import { GridGR } from '../Grid/GridGR';
import { GridDB } from '../Grid/GridDB';
import { GridFL } from '../Grid/GridFL';
import { GridINU } from '../Grid/GridINU';
import { GraphComponent } from '../Grid/GraphComponent';
import { LoginPage } from './LoginPage';
import appSettings from '../AppSettings';
import { DataGetter } from '../Grid/Utils/DataGetter';
import { Select } from '../Grid/OuterComponents/Select';
import DatePicker from "react-datepicker";

function DebugApp() {
    const [state, setState] = useState({ menuItem: - 2, dataGetter: null });

    window._logEnabled = true;

    const dataGetter = state.dataGetter || new DataGetter(appSettings/*, state.atoken, state.rtoken*/);

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

    const drawDropdownInModal = function (wnd) {
        return (
            <>
                <div className="div-on-menu">
                    <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
                    <button onClick={(e) => { wnd.ddComponent.popup(e); }} className="modal-window-footer-button">Show Dropdown</button>
                </div>
                <div>
                    {
                        wnd.ddComponent && wnd.ddComponent.clickedItem ? <span>{'Item Clicked : ' + wnd.ddComponent.clickedItem}</span> : <></>
                    }
                </div>
                <Dropdown init={(dd) => { wnd.ddComponent = dd; }} getItems={GetPopupItems}
                    onItemClick={(e) => { /*console.log('Item clicked: ' + e.itemId); */e.dropdown.clickedItem = e.itemId; wnd.refreshState(); }}
                >
                </Dropdown>
            </>
        )
    }

    const drawClearConsole = function () {
        return (
            <button onClick={() => { console.clear() }} className="modal-window-footer-button">Clear console</button>
        );
    }

    const drawTest = function () {
        const getOption = (filter, pageNum) => {

            const res = [];
            for (let i = 0; i < 10; i++) {
                res.push({ value: i, label: 'option ' + i });
            }
            const result = {
                options: res,
                hasMore: false,
                additional: {
                    page: pageNum + 1,
                },
            };

            return result;
        };
        //<button onClick={() => { TEST() }} className="modal-window-footer-button">TEST</button> style={{ overflowX: "auto" }}
        return (
            <>
                <div  className="graph-filter-line">
                    <Select
                        getOptions={getOption}
                        onChange={() => { }}
                        isMulti={true}
                        style={{ width: '200px' }}
                    >
                    </Select>
                </div >

                <div style={{ overflowX: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <td style={{ width: '150px' }}>h1</td>
                                <td style={{ width: '150px' }}>h2</td>
                                <td style={{ width: '150px' }}>h3</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>c11</td>
                                <td>
                                    <Select
                                        getOptions={getOption}
                                        onChange={() => { }}
                                        isMulti={true}
                                    >
                                    </Select>
                                </td>
                                <td>
                                    <DatePicker
                                        selected={new Date()}
                                        locale="ru"
                                        dateFormat={'dd.MM.yyyy'}
                                        showMonthDropdown
                                        showYearDropdown
                                        onSelect={(date) => {
                                        }}
                                    ></DatePicker>

                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div >
            </>
        );
    }

    const TEST = function () {
        /*
        let value;
    
        Moment.locale('ru');
    
        const d = '10.03.2011 0:00:00';
        const d2 = '19.03.2011 0:00:00';
    
        let date = new Date(d);
        let formattedDate = date.toDateString()
    
        date = new Date(d2);
        formattedDate = date.toDateString()
    
        date = Moment(d);
        date = date.format('DD.MM.YYYY')
        date = Moment(d2, 'DD.MM.YYYY');
        date = date.format('DD.MM.YYYY')
    
        value = format(d, "dd.MMM.yyyy HH:mm:ss");
        value = formatDate(d, "dd.MMM.yyyy");
        value = formatDate(d2, "dd.MMM.yyyy");
        value = format(d2, "dd.MMM.yyyy HH:mm:ss");
        */
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    const getTestApp = () => {
        console.log('state == ' + state.menuItem);
        switch (state.menuItem) {
            case -1:
                setState({ menuItem: -2, dataGetter: null });

                //    return (
                //        <></>
                //    )
                break;
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
                        <Modal uid="m01" isModal={true} renderContent={() => { return drawGridInModal() }} closeWhenEscape={true}
                            pos={{ x: 100, y: 100, w: 600, h: 450 }} title='Modal Grid'></Modal>
                    </>
                )
            case 4:
                return (
                    <>
                        <Modal uid="m02" isModal={true} renderContent={(wnd) => { return drawDropdownInModal(wnd) }} closeWhenEscape={true}
                            dimensionsByContent={true}
                            pos={{ x: 100, y: 100, w: 300, h: 250 }}></Modal>
                    </>
                )
            case 5:
                return (
                    <>
                        <div className="div-on-menu">
                            {drawClearConsole()}
                        </div>
                        <div className="div-with-grid">
                            <GridGR uid="people" getRows={GetFamily}></GridGR>
                        </div>
                        <div className="div-with-grid">
                            <GridGR uid="cities" parentGrids="people" getRows={GetCities} getColumns={GetCityColumns}></GridGR>
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
                            <GridINU uid="proj" entity="SrRProjectEntity" dataGetter={dataGetter} keyField='ID_SR_R_PROJECT_SRPJ'></GridINU>
                        </div>
                        < div className="div-with-grid">
                            <GridINU parentGrids="proj" uid="rem" entity="SrRemarkEntity" dataGetter={dataGetter}></GridINU>
                        </div>
                    </>
                );
            case 9:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="testGraph" graph={new TestData().getTestGraph()} dataGetter={dataGetter}></GraphComponent>
                        </div>
                    </>
                );
            case 10:
                return (
                    <>
                        <div className="div-with-grid">
                            <GraphComponent uid="PM" schemeName="Remarks_scheme" dataGetter={dataGetter}></GraphComponent>
                        </div>
                    </>
                );
            case 11:
                return (
                    <>
                        {drawTest()}
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
                    if (!tokens) return;

                    setState({ menuItem: 0, dataGetter: dataGetter/*atoken: dataGetter.atoken, rtoken: dataGetter.rtoken*/ });
                }}>
            </LoginPage> :
            <div >
                <select onChange={(e) => {
                    //console.log('this == ' + e);
                    setState({ menuItem: e.target.selectedIndex - 1, dataGetter: dataGetter/*, atoken: dataGetter.atoken, rtoken: dataGetter.rtoken*/ });
                }}>
                    <option>Logout</option>
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
                    <option>11. TEST</option>
                </select>
                <div className="div-on-menu">
                    {getTestApp()}
                </div>
            </div>
    );
}

export default DebugApp;