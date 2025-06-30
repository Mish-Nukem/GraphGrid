import { useState, useEffect, useRef } from 'react';
//import { BaseComponent } from '../../Grid/Base';
import { ModalClass } from '../../Grid/Modal';
import { FileManager } from '../../Grid/Utils/FileManager';
// режим пока один ImportRegims.InsertUpdate "Вставка с заменой"
// ==================================================================================================================================================================
export function DataExchangePage(props) {
    let de = null;

    const [pageState, setState] = useState({ de: de, ind: 0 });
    const inputRef = useRef(null);

    de = pageState.de;
    if (!de) {
        de = de || new DataExchangePageClass(props);
    }

    de.inputRef = inputRef;

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

        de.dataGetter = props.dataGetter;

        de.percent = '0%';
        de.continue = ' ';
        de.enableRun = false;

        de.buttons = de.getButtons();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderDataExchangePage() {
        const de = this;
        return (
            <div>
                {
                    +de.edType === 2 ?
                        // импорт
                        <>
                            <h5>{"Имя файла для импорта:"}</h5>
                            <input
                                className="form-control-file"
                                type="file"
                                style={{ width: "440px" }}
                                onChange={(e) => { de.fileName = e.target.value; de.enableRun = true; de.refreshState(); }}
                                disabled={de.isRunning ? true : false}
                                ref={de.inputRef}
                            />
                            <div id="progress0" className="upload-percent" style={{ marginTop: "5px" }}>
                                <span>{"Передача файла на сервер: "}</span><span className="percent">{de.percent}</span>
                                <br></br>
                                <div className="percent" style={{ height: "22px" }}>{de.continue}</div>
                            </div>
                            <div className="progress" style={{ marginTop: "5px", width: "525px", height: '22px' }}>
                                <div className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{ width: de.percent, height: '22px' }}></div>
                            </div>
                        </>
                        :
                        // экспорт
                        <div id="SetExportFile"> <h5>{"Сохранить файл экспорта как: "}</h5>
                            <input
                                className="form-control-file"
                                type="text"
                                style={{ width: "440px" }}
                                onChange={(e) => { de.fileName = e.target.value; de.enableRun = true; de.refreshState(); }}
                                disabled={de.isRunning ? true : false}
                            />
                        </div>
                }
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        const de = this;
        de.fileImport = '';
        de.percent = '0%';
        de.continue = ' ';
        de.fileName = '';
        de.enableRun = false;

        super.close();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getButtons() {
        const de = this;
        const res = [
            {
                title: 'Продолжить',
                onclick: (e) => de.runExchange(e),
                getDisabled: () => { return !de.enableRun; },
            },
            {
                title: 'Отменить',
                onclick: (e) => { de.isRunning = false; de.close(e); },
            },
        ];

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    runExchange() {
        const de = this;
        if (!de.fileName) {
            alert('Не определен файл обмена.');
            return;
        }

        de.percent = '0%';
        de.continue = ' ';
        de.isRunning = true;
        de.enableRun = false;
        de.refreshState();

        if (+de.edType === 2 && !de.fileImport) {
            const ImpotrFile0 = de.inputRef.current.files[0];
            de.formData = new FormData();
            de.formData.append("ImpotrFile", ImpotrFile0);

            // 1. Создаём новый XMLHttpRequest-объект
            let xhr = new XMLHttpRequest();

            // отслеживаем процесс отправки
            xhr.upload.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    let percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);
                    de.percent = percentComplete + '%';
                    de.refreshState();
                }
            };

            // Ждём завершения: неважно, успешного или нет
            xhr.onloadend = function (data) {
                if (xhr.status === 200) {
                    if (data) {
                        de.percent = 'Успешно.';
                        de.continue = 'Для запуска импорта нажмите кнопку "Продолжить"';
                        de.isRunning = false;
                        de.fileImport = data.target.responseText;
                        de.enableRun = true;
                        de.refreshState();
                    }
                } else {
                    console.log("Ошибка " + this.status);
                    de.isRunning = false;
                    de.continue = "Ошибка " + this.status;
                    de.refreshState();
                }
            };

            // 2. Настраиваем его: POST-запрос по URL
            xhr.open('POST', de.dataGetter.APIurl + 'system/DataExchange/UploadFile?SetUniqueTempFileName=true');

            // 3. Отсылаем запрос
            xhr.send(de.formData);

            xhr.onerror = function () {
                alert("Запрос не удался");
            };

            //de.dataGetter.get({ url: 'system/DataExchange/UploadFile?SetUniqueTempFileName=true', data: de.formData, contentType: null, type: 'text' }).then(
            //    (data) => {
            //        if (data) {
            //            de.percent = 'Успешно.';
            //            de.continue = 'Для запуска импорта нажмите кнопку "Продолжить"';
            //            de.isRunning = false;
            //            de.fileImport = data;
            //            de.refreshState();
            //        }
            //    }
            //).catch();
            return;
        }

        de.continueDataExchange({ ZipFileName: de.fileImport });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    continueDataExchange(e) {
        const de = this;
        de.enableRun = false;

        setTimeout(function () {
            const params = [];

            params.push({ key: 'ID_teaa', value: de.edId });
            params.push({ key: 'FileName', value: de.fileName });
            params.push({ key: 'url', value: document.URL });
            if (e.uploadDate)
                params.push({ key: 'UploadDate', value: e.uploadDate });
            if (e.ZipFileName)
                params.push({ key: 'ZipFileName', value: e.ZipFileName });

            de.dataGetter.get({ url: 'system/DataExchange/RunDataExchange', params: params }).then(
                (data) => {
                    if (!data) return;

                    if (+de.edType === 3) {
                        if (data.result === true && data.exchangecontent) {
                            const fm = new FileManager();
                            fm.SaveToFile(data.exchangecontent, (data.filename ? data.filename : de.edType + "-ID=" + de.edId) + ".zip", "zip");
                        }
                        //baseGraph.hideGridOverlay(baseNode);
                        setTimeout(function () {
                            alert(data.protokol);
                        }, 100);
                    }
                    else if (+de.edType === 2) { //импорт, протокол
                        if (data.protokolImp) {
                            de.showProtocol(data.protokolImp);
                        }
                        else if (data.protokol) {//импорт завершился аварийно, полноценного протокола нет, просто сообщение об ошибке
                            alert(data.protokol);
                        }
                        else {
                            alert('Импорт. Ошибка протокола.');
                        }
                    }

                    de.refreshState();
                }
            ).catch();
        }, 500);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}