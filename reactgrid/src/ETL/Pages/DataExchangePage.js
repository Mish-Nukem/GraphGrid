import { useState, useEffect } from 'react';
import { BaseComponent } from '../../Grid/Base';
import { ModalClass } from '../../Grid/Modal';

// ==================================================================================================================================================================
export function DataExchangePage(props) {
    let de = null;

    const [pageState, setState] = useState({ de: de, ind: 0 });

    de = pageState.de;
    if (!de) {
        de = de || new DataExchangePageClass(props);
    }

    if (props.init) {
        props.init(de);
    }

    de.refreshState = function () {
        setState({ de: de, ind: de.stateind++ });
    }

    useEffect(() => {
        return () => {
        }
    }, [de])

    return (de.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class DataExchangePageClass extends ModalClass {
    constructor(props) {
        super(props);

        const de = this;
        de.renderContent = de.renderDataExchangePage;

        de.visible = props.visible !== undefined ? props.visible : false;

        de.edId = props.edId;
        de.edType = props.edType;
        de.nameExchange = props.nameExchange;

        de.opt.title = (+de.edType === 2 ? 'Импорт' : 'Экспорт') + '. ' + de.nameExchange;

        de.opt.closeWhenEscape = true;
        de.opt.resizable = false;
        de.opt.isModal = true;
        de.opt.dimensionsByContent = true;

        de.buttons = de.getButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        super.close();
    }
    //render() {
    //    return super.render();
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getButtons() {
        const de = this;
        const res = [
            {
                title: 'Продолжить',
                onclick: (e) => de.runExchange(e),
            },
            {
                title: 'Отменить',
                onclick: (e) => { de.close(e) },
            },
        ];

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    runExchange(e) {
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderDataExchangePage() {
        return (
            <div>
                <h5>{"Имя файла для импорта:"}</h5>
                <input id="ImpotrFile" className="form-control-file" type="file" style={{ width: "440px" }} />
                <div id="progress0" className="upload-percent" hidden style={{ marginTop: "5px" }}>
                    <>{"Передача файла на сервер: "}</><span className="percent">0%</span>
                </div>
                <div id="progress1" className="progress" hidden style={{ marginTop: "5px", width: "525px" }}>
                    <div className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{ width: "0%" }}></div>
                </div>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}