import { useState, useEffect, useRef } from 'react';
import { ModalClass } from '../../Grid/Modal';
import { Select } from '../../Grid/OuterComponents/Select';
import { FieldEdit } from '../../Grid/FieldEdit';
import { BaseComponent } from '../../Grid/Base';
import { Images } from '../../Grid/Themes/Images';
import Moment from 'moment';
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

    de.visible = props.visible != null ? props.visible : de.visible;

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

        de.visible = props.visible != null ? props.visible : false;

        de.nameReport = props.nameReport;
        de.reportParams = [];
        de.opt.title = props.title || de.nameReport;

        const parts = de.nameReport.split('.');
        if (parts[parts.length - 1] !== 'xls') {
            de.nameReport = de.nameReport + '.xls';
        }

        de.outerParamValues = props.outerParamValues;

        de.opt.closeWhenEscape = true;
        de.opt.resizable = true;
        de.opt.isModal = true;
        de.opt.dimensionsByContent = true;

        de.percent = '0%';
        de.continue = ' ';
        de.isRunning = false;

        de._fakePrevGraph = {
            nodeByEntity: {}
        };

        de.buttons = de.getButtons();

        //de.edId = props.edId;
        //de.edType = props.edType;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderReportParamsPage() {
        const de = this;
        const canDelete = de._selectedConfig != null && de._selectedConfig.value;
        const canSave = de._selectedConfig == null || !de._selectedConfig.saved || de._selectedConfig.changed;
        return (
            <div>
                {
                    !de.reportParams || de.reportParams.length <= 0 ?
                        <></>
                        :
                        <>
                            <div className="graph-card-field">
                                <span>{"Конфигурация:"}</span>
                                <div
                                    className="field-edit"
                                    style={{ gridTemplateColumns: 'calc(100% - 5.2em) 2.2em 2.2em', columnGap: '4px' }}
                                >
                                    <Select
                                        key={`configSelect_${de.id}_${de._selectedConfig ? de._selectedConfig.value : ''}_`}
                                        inputClass={de.inputClass || ''}
                                        className={de.selectClass || ''}
                                        value={de._selectedConfig}
                                        getOptions={(filter, pageNum) => de.getConfigList(filter, pageNum)}
                                        height={de.selectH}
                                        required={false}
                                        //gridColumn={noClear ? 'span 2' : 'span 1'}
                                        onChange={(e) => {
                                            de._selectedConfig = e || { value: null, label: de.translate('New configuration') };
                                            if (de._selectedConfig.value) {
                                                de.getConfig();
                                                de.refreshState();
                                            }
                                            else {
                                                de.refreshState();
                                            }
                                        }}
                                        disabled={de.disabled}
                                        gridColumn={!canDelete ? 'span 2' : 'span 1'}
                                    >
                                    </Select>
                                    <button
                                        className="graph-filter-button"
                                        onClick={() => de.saveConfig()}
                                        disabled={de.disabled || !canSave}
                                    >
                                        {Images.images.save()}
                                    </button>
                                    {
                                        !canDelete ?
                                            <></>
                                            :
                                            <button
                                                className="graph-filter-button"
                                                onClick={() => de.deleteConfig()}
                                                disabled={de.disabled || de._selectedConfig == null}
                                            >
                                                {Images.images.deleteRecord()}
                                            </button>
                                    }
                                </div>
                            </div>
                            <div className="report-params-header">
                                {"Параметры отчета"}
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
                    selectedOptions={param.values}
                    entity={param.entity}
                    findFieldEdit={() => { return param._fieldEditObj; }}
                    large={true}
                    comboboxValues={param.comboboxValues}
                    required={param.required}
                    multi={param.multi}
                    level={de.level}
                    init={
                        (fe) => {
                            param._fieldEditObj = fe;

                            if (param.multi) {
                                fe.selectedOptions = param.values || [];
                                const arr = [];
                                for (let so of fe.selectedOptions) {
                                    arr.push(so.value);
                                }
                                fe.value = arr.join(',');
                                fe.text = param.text;
                            }
                            else {
                                fe.value = param.value != null ? param.value : '';
                                fe.text = param.text;
                            }
                        }
                    }
                    onChange={(e) => {
                        param.value = e.value;
                        param.text = e.text;
                        param.values = e.values || [];

                        const fakeNode = de._fakePrevGraph.nodeByEntity[param.entity];
                        if (fakeNode) {
                            fakeNode.value = param.value;
                            fakeNode.text = param.text;
                            if (param.value == null || param.value === '') {
                                fakeNode._selectedOptions = [];
                            }
                            else {
                                fakeNode._selectedOptions = param.values.length > 0 ? param.values : [{ value: param.value, label: param.text || param.value }];
                            }
                        }

                        de._selectedConfig = de._selectedConfig == null ? { value: -1, label: de.translate('New configuration') } : de._selectedConfig;
                        de._selectedConfig.changed = true;

                        de.clearChildrenParams(param.id);

                        de.refreshState();
                    }}
                >
                </FieldEdit>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    clearChildrenParams(paramId) {
        const de = this;
        for (let param of de.reportParams) {
            if (!param.parentParams || !param.parentParams.length) continue;

            if (param.parentParams.indexOf(paramId) >= 0) {
                param.value = param.text = '';
                param.values = [];
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    close() {
        const de = this;
        de.fileImport = '';
        de.percent = '0%';
        de.continue = ' ';
        de.fileName = '';
        de.isRunning = false;

        super.close();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getButtons() {
        const de = this;
        const res = [
            {
                title: 'Запуск отчета',
                onclick: (e) => de.runReport(e),
                getDisabled: () => { return de.isRunning; },
            },
            {
                title: 'Отменить',
                onclick: (e) => { de.close(e); },
            },
        ];

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getConfigList(/*filter, pageNum*/) {
        const de = this;
        const params = [];

        params.push({ key: 'reportName', value: de.nameReport });

        return new Promise((resolve) => {
            GLObject.dataGetter.get({ url: 'reports/configList', params: params }).then(
                (data) => {
                    const res = [];
                    for (let cfg of data) {
                        if (cfg === '' || cfg == null) continue;

                        if (de._selectedConfig && de._selectedConfig.value == cfg) continue;

                        res.push({ value: cfg, label: cfg });
                    }

                    resolve({
                        options: res,
                        hasMore: false,
                        additional: {
                            page: 1
                        },
                    });
                }
            );
        });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    deleteConfig() {
        const de = this;
        if (de._selectedConfig == null || !de._selectedConfig.saved) return;

        const params = [];
        params.push({ key: 'reportName', value: de.nameReport });
        params.push({ key: 'configName', value: de._selectedConfig.label });

        GLObject.dataGetter.get({ url: 'reports/deleteConfig', params: params }).then(
            () => {
                delete de._selectedConfig;
                de.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    saveConfig() {
        const de = this;
        if (de._selectedConfig == null) return;

        if (!de._selectedConfig.saved) {
            de._selectedConfig.label = prompt(de.translate('Enter configuration name')) || de._selectedConfig.label;
        }

        const paramsValues = {};
        for (let param of de.reportParams) {
            if (!param.multi) {
                paramsValues[param.id] = [{ value: param.value, label: param.text }];
            }
            else {
                paramsValues[param.id] = param.values;
            }
        }

        const params = [];
        params.push({ key: 'reportName', value: de.nameReport });
        params.push({ key: 'configName', value: de._selectedConfig.label });
        params.push({ key: 'paramsValues', value: paramsValues });

        GLObject.dataGetter.get({ url: 'reports/saveConfig', params: params }).then(
            () => {
                delete de._selectedConfig.changed;
                de._selectedConfig.saved = true;
                de._selectedConfig.value = de._selectedConfig.label;
                de.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getConfig() {
        const de = this;
        if (de._selectedConfig == null || !de._selectedConfig.label) return;

        const params = [];
        params.push({ key: 'reportName', value: de.nameReport });
        params.push({ key: 'configName', value: de._selectedConfig.label });

        GLObject.dataGetter.get({ url: 'reports/getConfig', params: params }).then(
            (data) => {
                delete de._selectedConfig.changed;

                de._selectedConfig.saved = true;

                for (let param of de.reportParams) {
                    let savedParam = data[param.id];
                    param.values = savedParam || [];
                    if (!savedParam || savedParam.length <= 0) continue;

                    if (!param.multi) {
                        if (Array.isArray(param.values)) {
                            param.value = param.values[0].value;
                            param.text = param.values[0].label;
                        }
                        else if (typeof param.values === 'object') {
                            param.value = param.values.value;
                            param.text = param.values.label;
                        }
                        param.values = [{ value: param.value, label: param.text }];
                    }
                    else {
                        param.value = [];
                        const varr = [];
                        const tarr = [];
                        if (Array.isArray(param.values)) {
                            for (let itm of param.values) {
                                varr.push(itm.value);
                                tarr.push(itm.label);

                                param.value = varr.join(',');
                                param.text = tarr.join(', ');
                            }
                        }
                        else if (typeof param.values === 'object') {
                            param.value = param.values.value;
                            param.text = param.values.label;
                            param.values = [{ value: param.value, label: param.text }];
                        }
                    }

                    const fakeNode = de._fakePrevGraph.nodeByEntity[param.entity];
                    if (!fakeNode) continue;

                    fakeNode.value = param.value;
                    fakeNode.text = param.text;
                    fakeNode._selectedOptions = param.values || [{ value: param.value, label: param.text }];
                }

                de.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getReportParams(/*filter, pageNum*/) {
        const de = this;
        if (de.reportParams.length > 0) return;

        const params = [];
        params.push({ key: 'reportName', value: de.nameReport });

        GLObject.dataGetter.get({ url: 'reports/paramsList', params: params }).then(
            (data) => {
                de.reportParams = data;
                if (de.reportParams.length > 0) {
                    de.opt.title = 'Параметры отчета - ' + de.nameReport;

                    if (de.outerParamValues) {
                        de.applyOuterParamsValues();
                    }

                    for (let rp of de.reportParams) {
                        if (!rp.entity) continue;

                        rp.schemeInfo = GLObject.gridCreator.GetSchemeInfo(rp.entity, '');

                        de._fakePrevGraph.nodeByEntity[rp.entity] = { };
                        rp.prevGraph = de._fakePrevGraph;
                    }
                }
                de.refreshState();
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    applyOuterParamsValues() {
        const de = this;
        for (let op of de.outerParamValues) {
            if (!op.entity || !op.value) continue;

            let rp = de.reportParams.find((item) => { return item.entity === op.entity; })
            if (!rp) continue;

            rp.value = op.value;
            rp.text = op.text || op.value;
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    checkReportParams() {
        const de = this;
        let errorParams = [];
        for (let param of de.reportParams) {
            if (param.required && param.value == null) {
                errorParams.push(param.name);
            }
        }

        if (errorParams.length > 0) {
            alert('Не заполнены обязательные параметры: ' + errorParams.join(', '))
        }

        return errorParams.length === 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    runReport() {
        const de = this;
        if (!de.checkReportParams()) return;

        de.isRunning = true;

        const paramsDict = {};
        for (let param of de.reportParams) {
            paramsDict[param.title] = param.value;
        }

        const params = [];
        params.push({ key: 'reportName', value: de.nameReport });
        params.push({ key: 'reportParams', value: paramsDict });

        GLObject.dataGetter.get({ url: 'reports/executeReport', params: params }).then(
            (data) => {
                de.isRunning = false;

                if (data.reportStr) {
                    const fm = new FileManager();
                    fm.SaveToFile(data.reportStr, ("reportResult_" + String(Moment().format(BaseComponent.dateFormat))) + ".xls", "excel");
                }
                else {
                    alert("Ошибка: " + data.error);
                }
                de.refreshState();
            }
        );

        de.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}