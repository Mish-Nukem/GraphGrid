import { useState, useEffect, useRef } from 'react';
import { ModalClass } from '../../Grid/Modal';
import { Select } from '../../Grid/OuterComponents/Select';
import { FieldEdit } from '../../Grid/FieldEdit';

import { GLObject } from '../../Grid/GLObject';
import { FileManager } from '../../Grid/Utils/FileManager';
// ==================================================================================================================================================================
export function ReportParamsPage(props) {
    let de = null;

    const [pageState, setState] = useState({ de: de, ind: 0 });
    const inputRef = useRef(null);

    de = pageState.de;
    if (!de) {
        de = de || new ReportParamsPageClass(props);
    }

    de.inputRef = inputRef;

    de.visible = props.visible !== undefined ? props.visible : de.visible;

    if (props.init) {
        props.init(de);
    }

    de.refreshState = function () {
        setState({ de: de, ind: de.stateind++ });
    }

    useEffect(() => {
        if (de.reportParams.length <= 0) {
            de.getReportParams();
        }

        return () => {
        }
    }, [de])

    return (de.render());
}
// -------------------------------------------------------------------------------------------------------------------------------------------------------------
export class ReportParamsPageClass extends ModalClass {
    constructor(props) {
        super(props);

        const de = this;
        de.renderContent = de.renderReportParamsPage;

        de.visible = props.visible !== undefined ? props.visible : false;

        de.nameReport = props.nameReport;
        de.reportParams = [];
        de.opt.title = 'Параметры отчета - ' + de.nameReport;


        de.opt.closeWhenEscape = true;
        de.opt.resizable = true;
        de.opt.isModal = true;
        de.opt.dimensionsByContent = true;

        de.percent = '0%';
        de.continue = ' ';
        de.enableRun = false;

        de.buttons = de.getButtons();

        //de.edId = props.edId;
        //de.edType = props.edType;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderReportParamsPage() {
        const de = this;
        return (
            <div>
                {
                    <>
                        <div className="graph-card-field">
                            <span>{"Конфигурация:"}</span>
                            <Select
                                key={`configselect_${de.id}_`}
                                inputClass={de.inputClass || ''}
                                className={de.selectClass || ''}
                                value={de._selectedConfig}
                                getOptions={(filter, pageNum) => de.getConfigList(filter, pageNum)}
                                height={de.selectH}
                                //gridColumn={noClear ? 'span 2' : 'span 1'}
                                onChange={(e) => {
                                    de._selectedConfig = [e];
                                }}
                                init={(e) => { de.setComboboxValue = e.setComboboxValue; }}
                                disabled={de.disabled}
                            >
                            </Select>
                        </div>
                        <div>
                            {
                                de.reportParams.map((param) => { return de.renderParam(param) })
                            }
                        </div>
                        <div style={{ display: 'none' }}>
                            <div id="progress0" className="upload-percent" style={{ marginTop: "5px" }}>
                                <span>{"Формирование отчета: "}</span><span className="percent">{de.percent}</span>
                                <br></br>
                                <div className="percent" style={{ height: "22px" }}>{de.continue}</div>
                            </div>
                            <div className="progress" style={{ marginTop: "5px", width: "525px", height: '22px' }}>
                                <div className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{ width: de.percent, height: '22px' }}></div>
                            </div>
                        </div>
                    </>
                }
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderParam(param) {
        const de = this;
        return (
            <div className="graph-card-field"
                key={`reportparamdiv_${de.id}_${param.id}_`}
            >
                <span
                    key={`reportParamTitle_${de.id}_${param.id}_`}
                    style={{ gridColumn: 'span 3', width: 'calc(100% - 4px)' }}
                >
                    {param.title || param.name}
                </span>
                <FieldEdit
                    keyPref={de.id + '_reportParam_'}
                    column={param}
                    value={param.value}
                    text={param.text}
                    entity={param.entity}
                    findFieldEdit={() => { return param._fieldEditObj; }}
                    large={true}
                    init={
                        (fe) => {
                            param._fieldEditObj = fe;
                            fe.value = param.value !== undefined ? param.value : '';
                            fe.text = param.text;
                        }
                    }
                    onChange={(e) => {
                        param.value = e.value;
                        param.text = e.text;
                        if (param.type === 'lookup') {
                            if (param.setComboboxValue) {
                                param.setComboboxValue({ value: e.value, label: e.text });
                            }
                        }
                        de.refreshState();
                    }}
                >
                </FieldEdit>
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
                title: 'Запуск отчета',
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
    getConfigList(/*filter, pageNum*/) {
        const de = this;
        const params = [];

        params.push({ key: 'reportName', value: de.fileName });

        return new Promise((resolve) => {
            GLObject.dataGetter.get({ url: 'reports/configList', params: params }).then(
                (data) => {
                    resolve(data);
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getReportParams(/*filter, pageNum*/) {
        const de = this;
        if (de.reportParams.length > 0) return;

        // TODO:
        de.reportParams.push({
            id: 0,
            title: 'Исполнитель',
            entity: 'SrRExecutiveEntity',
            type: 'lookup',
            allowCombobox: true,
            refKeyField: 'ID_SR_R_EXECUTIVE_SREX',
            refNameField: 'FIO_SREX',
        });
        de.refreshState();
        return;
        // end TODO


        const params = [];
        params.push({ key: 'reportName', value: de.fileName });

        GLObject.dataGetter.get({ url: 'reports/paramsList', params: params }).then(
            (data) => {
                de.reportParams = data;
                de.refreshState();
            }
        );
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
            xhr.open('POST', GLObject.dataGetter.APIurl + 'system/DataExchange/UploadFile?SetUniqueTempFileName=true');

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

            GLObject.dataGetter.get({ url: 'system/DataExchange/RunDataExchange', params: params }).then(
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