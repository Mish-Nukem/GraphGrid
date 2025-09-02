/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { Select } from './OuterComponents/Select';
import { Modal } from './Modal';
import { GridINU } from './GridINU';
import { Images } from './Themes/Images';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ru from "date-fns/locale/ru";
import Moment from 'moment';
import { GLObject } from './GLObject';

registerLocale("ru", ru);
// ==================================================================================================================================================================
export function FieldEdit(props) {
    let fe = null;

    const [feState, setState] = useState({ fe: fe, ind: 0 });

    fe = feState.fe;
    if (!fe) {
        if (props.findFieldEdit) {
            fe = props.findFieldEdit();
        }
        fe = fe || new FieldEditClass(props);
    }

    fe.id = props.keyPref || FieldEditClass._seq++;

    fe.disabled = props.disabled;

    BaseComponent.theme = BaseComponent.theme || {};

    fe.buttonClass = props.buttonClass || BaseComponent.theme.filterButtonClass || '';
    fe.inputClass = props.inputClass || BaseComponent.theme.inputClass || '';
    fe.inputClassLG = props.inputClassLG || BaseComponent.theme.inputClassLG || '';
    fe.clearButtonClass = props.clearButtonClass || BaseComponent.theme.clearButtonClass || '';
    fe.selectClass = props.selectClass || BaseComponent.theme.selectClass || '';
    fe.datePickerDateFormat = props.datePickerDateFormat || 'dd.MM.yyyy';
    fe.divContainerClass = props.divContainerClass || '';

    fe.w = props.w;
    fe.maxW = props.maxW;
    fe.h = props.h || '1.7em';
    fe.selectH = props.selectH || '';
    fe.textareaH = props.textareaH || '2.1em';
    //fe.margin = props.margin;

    if (props.init) {
        props.init(fe);
    }

    if (fe.multi) {
        if (fe.value !== undefined && fe.value !== null && typeof (fe.value) === 'object' && fe.value !== '' && fe._selectedOptions.length <= 0) {
            fe._selectedOptions = fe.value || [];
            const texts = [];
            fe.value = fe.getValueFromCombobox(texts);
            fe.text = texts.join(', ');
        }
    }
    else if (fe.value !== undefined && fe.value !== '' && (!fe._selectedOptions || fe._selectedOptions.length <= 0 || fe._selectedOptions[0].value !== fe.value)) {
        fe._selectedOptions = [{ value: fe.value, label: fe.text }];
    }

    fe.refreshState = function () {
        setState({ fe: fe, ind: fe.stateind++ });
    }

    useEffect(() => {
        return () => {
        }
    }, [fe])

    return (fe.render());
}

// ==================================================================================================================================================================
export class FieldEditClass extends BaseComponent {

    constructor(props) {
        super(props);

        const fe = this;

        fe.stateind = 0;
        fe.id = props.keyPref || FieldEditClass._seq++;

        fe.column = props.column;
        fe.selfEntity = props.entity;

        fe.value = props.value || '';
        fe.text = props.text || '';

        fe.multi = props.multi;

        if (props.comboboxValues && props.comboboxValues.length > 0) {
            fe.comboboxValues = props.comboboxValues;
        }

        if (fe.multi) {
            fe._selectedOptions = [];
            if (fe.value !== undefined && fe.value !== null && typeof (fe.value) === 'object') {
                fe._selectedOptions = fe.value;
            }
            else {
                const texts = [];
                fe.value = fe.getValueFromCombobox(texts);
                fe.text = texts.join(', ');
            }
        }
        else {
            fe._selectedOptions = [];
            if (fe.value !== undefined && fe.value !== '') {
                fe._selectedOptions.push({ value: fe.value, label: fe.text });
            }
        }

        fe.onChange = props.onChange || (() => { });

        fe.large = props.large;

        fe.dateFormat = props.dateFormat || BaseComponent.dateFormat;

        // просто разметка 'span 2' etc.
        fe.gridColumn = props.gridColumn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static _seq = 0;
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    render() {
        const fe = this;

        const isLookup = fe.column.type === 'lookup' && !fe.column.readonly;
        const isDate = fe.column.type === 'date' && !fe.column.readonly;
        const noClear = fe.column.required || fe.column.readonly || (fe.multi ? fe._selectedOptions.length <= 0 : fe.value === undefined || fe.value === '');
        const allowCombobox = fe.column.allowCombobox;

        let parsedDate;
        if (isDate && fe.value) {
            parsedDate = Moment(fe.value, fe.dateFormat);
            if (!parsedDate.isValid()) {
                parsedDate = '';
                fe.value = '';
            }
        }

        return (
            <>
                <div
                    key={`fieldeditdiv_${fe.id}_${fe.column.id}_`}
                    className={fe.divContainerClass ? fe.divContainerClass : fe.large ? 'field-edit' : isLookup || isDate ? 'grid-cell-lookup' : 'grid-cell-edit'}
                    style={{
                        border: 'none',
                        height: !fe.inputClass ? fe.h : '',
                        gridColumn: fe.gridColumn || '',
                        width: fe.w ? fe.w : '',
                        maxWidth: fe.maxW ? fe.maxW : '',
                        margin: fe.margin,
                        minHeight: fe.large ? '2.5em' : '',
                    }}
                >
                    {
                        isLookup ?
                            <>
                                {
                                    !allowCombobox ?
                                        <input
                                            key={`fieldlookuptitle_${fe.id}_${fe.column.id}_`}
                                            style={{//width: 'calc(100% - 4px)',
                                                
                                                gridColumn: noClear ? !fe.comboboxValues ? 'span 2' : 'span 3' : 'span 1',
                                                overflowX: 'hidden',
                                                height: !fe.inputClass ? fe.h : '',
                                                minHeight: !fe.inputClass ? fe.h : '',
                                                boxSizing: 'border-box',
                                            }}
                                            disabled={true}
                                            className={fe.large ? fe.inputClassLG : fe.inputClass || ''}
                                            value={fe.text !== undefined ? fe.text : fe.value}
                                        >
                                        </input>
                                        :
                                        <Select
                                            key={`fieldlookupselect_${fe.id}_${fe.column.id}_`}
                                            inputClass={fe.inputClass || ''}
                                            className={fe.selectClass || ''}
                                            value={fe._selectedOptions}
                                            getOptions={(filter, pageNum) => fe.getLookupValues(filter, pageNum)}
                                            height={fe.selectH}
                                            gridColumn={noClear ? !fe.comboboxValues ? 'span 2' : 'span 3' : 'span 1'}
                                            isMulti={fe.multi}
                                            required={noClear}
                                            onChange={(e) => {
                                                if (e === null) {
                                                    fe.onChange({ value: '', text: '' });
                                                    fe.refreshState();
                                                    return;
                                                }

                                                fe._selectedOptions = fe.multi ? e : [e];
                                                const texts = [];
                                                fe.value = fe.getValueFromCombobox(texts);
                                                const ev = { value: fe.value, text: texts.join(', ') };
                                                fe.onChange(ev);
                                                fe.refreshState();
                                            }}
                                            disabled={fe.disabled}
                                        >
                                        </Select>
                                }
                                {
                                    !fe.comboboxValues ?
                                        <button
                                            key={`fieldlookupbtn_${fe.id}_${fe.column.id}_`}
                                            className={`${fe.large ? 'graph-filter-button' : 'grid-cell-button'} ${fe.large ? fe.buttonClass : ''}`}
                                            onClick={(e) => {
                                                fe.openLookupField(e);
                                            }}
                                            disabled={fe.disabled}
                                        >
                                            {!fe.large ? '...' : Images.images.filterSelect()}
                                        </button>
                                        :
                                        <></>
                                }
                            </>
                            :
                            isDate ?
                                <>
                                    <div
                                        key={`fielddatediv_${fe.id}_${fe.column.id}_`}
                                        style={{
                                            width: '100%',
                                            height: !fe.inputClass ? fe.h : '',
                                            minHeight: !fe.inputClass ? fe.h : '',
                                            padding: !fe.large ? '0' : '',
                                            gridColumn: noClear ? 'span 3' : 'span 2',
                                            overflowX: 'hidden',
                                        }}
                                        className={fe.large ? 'datepicker-input-lg' : 'datepicker-input'}
                                    >
                                        <DatePicker
                                            selected={parsedDate}
                                            className={fe.inputClass || ''}
                                            style={{ height: fe.textareaH }}
                                            locale="ru"
                                            dateFormat={fe.datePickerDateFormat}
                                            showMonthDropdown
                                            showYearDropdown
                                            onSelect={(date) => {
                                                const e = {};
                                                fe.value = fe.text = Moment(date, fe.datePickerDateFormat).format(fe.dateFormat);
                                                e.value = e.text = Moment(date, fe.datePickerDateFormat).format(fe.dateFormat);
                                                fe.onChange(e);
                                            }}
                                            disabled={fe.disabled}
                                            portalId="root-portal"
                                        ></DatePicker>
                                    </div>
                                </>
                                :
                                <textarea
                                    key={`fieldtextarea_${fe.id}_${fe.column.id}_`}
                                    className={`${fe.large ? fe.inputClassLG : fe.inputClass}`}
                                    value={fe.value || ''}
                                    style={{
                                        width: '100%',
                                        //height: !fe.inputClass ? fe.textareaH : fe.h,
                                        minHeight: !fe.inputClass ? fe.textareaH : fe.h,
                                        padding: '0',
                                        boxSizing: 'border-box',
                                        gridColumn: noClear ? 'span 3' : 'span 2',
                                        resize: 'vertical',
                                        overflowX: 'hidden',
                                    }}
                                    onChange={(e) => {
                                        e.value = e.text = e.target.value;
                                        fe.value = fe.text = e.target.value;
                                        e.fe = fe;
                                        fe.onChange(e);
                                    }}
                                    disabled={fe.disabled || fe.column.readonly}
                                >
                                </textarea>
                    }
                    {
                        noClear || fe.column.readonly ? <></>
                            :
                            <button
                                key={`fieldclear_${fe.id}_${fe.column.id}_`}
                                className={`${fe.large ? 'graph-filter-clear' : 'grid-cell-button'} ${fe.clearButtonClass || ''}`}
                                onClick={(e) => {
                                    e.value = e.text = '';
                                    fe.value = fe.text = '';
                                    fe._selectedOptions = [];

                                    fe.onChange(e);
                                    fe.refreshState();
                                }}
                                disabled={fe.disabled}
                            >
                                {!fe.large ? '×' : Images.images.filterClear()}
                            </button>

                    }
                </div >
                {
                    fe.lookupIsShowing ?
                        <Modal
                            title={fe.column.title}
                            renderContent={() => { return fe.renderLookupGrid(); }}
                            pos={fe.popupPos}
                            onClose={(e) => {
                                fe.lookupIsShowing = false;
                                if (fe.grid) {
                                    delete fe.grid.value;
                                }
                                fe.refreshState();
                            }}
                        >
                        </Modal>
                        :
                        <></>
                }
            </>
        )
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderLookupGrid() {
        const fe = this;

        return (
            //fe.column.renderLookup ?
            //    fe.column.renderLookup(fe)
            fe.column.schemeInfo ?
                GLObject.gridCreator.renderSelectingGraph(fe.column)
                :
                <GridINU
                    entity={fe.column.entity}
                    controller={GLObject.gridCreator.GetEntityController(fe.column)}
                    keyField={fe.column.refKeyField}
                    nameField={fe.column.refNameField}
                    activeRow={fe.value}
                    multi={fe.multi}
                    findGrid={() => { return fe.grid; }}
                    onSelectValue={(e) => {
                        if (fe.multi) {
                            const texts = [];
                            fe._selectedOptions = e.value;

                            fe.value = fe.getValueFromCombobox(texts);
                            fe.text = texts.join(', ');
                        }
                        else {
                            fe.value = e.value;
                            fe.text = e.text;
                            fe._selectedOptions = [{ value: fe.value, label: fe.text }];
                        }

                        e.value = fe.value;
                        e.text = fe.text;

                        fe.lookupIsShowing = false;
                        fe.onChange(e);
                    }}
                    //getColumns={info.columns ? () => { return info.columns; } : null}
                    init={(lookupGrid) => {
                        if (!lookupGrid.value || fe.value && fe.value !== lookupGrid.value) {
                            fe.onLookupGridInit(lookupGrid);
                        }

                        for (let opt of fe._selectedOptions) {
                            let fakeRow = {};
                            fakeRow[fe.column.refKeyField] = opt.value;
                            fakeRow[fe.column.refNameField] = opt.label;
                            lookupGrid._selectedRows[opt.value] = fakeRow;
                        }

                    }}
                    onClose={() => {
                        if (fe.ownerGrid) {
                            fe.ownerGrid._clicksDisabled = false;
                        }
                    }}
                >
                </GridINU>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    openLookupField(e) {
        const fe = this;
        fe.popupPos = fe.popupPos || { x: 100, y: 100, w: 1600, h: 900 };

        fe.lookupIsShowing = true;
        if (fe.ownerGrid) {
            fe.ownerGrid._clicksDisabled = true;
        }

        fe.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getValueFromCombobox(texts, changeGridValue) {
        const fe = this;
        //if (!fe.grid) return;

        texts = texts || [];
        changeGridValue = changeGridValue && fe.grid;

        fe._selectedOptions = fe._selectedOptions || [];
        let arr = [];
        if (changeGridValue) {
            fe.grid._selectedRows = {}
        }

        for (let opt of fe._selectedOptions) {
            arr.push(opt.value);
            texts.push(opt.label);

            if (changeGridValue) {
                let fakeRow = {};
                fakeRow[fe.grid.keyField] = opt.value;
                fakeRow[fe.grid.nameField] = opt.label;
                fe.grid._selectedRows[opt.value] = fakeRow;
            }
        }

        const res = arr.join(',');
        if (changeGridValue) {
            fe.grid.value = res;
        }

        return res;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onLookupGridInit(grid) {
        const fe = this;
        fe.grid = grid;
        grid.value = fe.value;
        grid.getSelectedRowIndex();

        if (grid._lookupPrepared) return;

        grid._lookupPrepared = true;

        grid.visible = true;
        grid.title = fe.column.title;
        grid.isSelecting = true;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getLookupValues(filter, pageNum) {
        const fe = this;

        if (fe.comboboxValues) {
            return new Promise((resolve) => {
                const result = {
                    options: fe.comboboxValues,
                    hasMore: false,
                    additional: {
                        page: pageNum + 1,
                    },
                };

                resolve(result);
            });
        }

        const params = [
            { key: 'filter', value: filter },
            { key: 'pageNumber', value: pageNum },
            { key: 'entity', value: fe.selfEntity }
        ];

        return fe.column.name ?
            new Promise((resolve) => {
                params.push({ key: 'columns', value: fe.column.name });

                GLObject.dataGetter.get({ url: 'system/getLookupValues', params: params }).then(
                    (res) => {

                        const result = {
                            options: res,
                            hasMore: false,
                            additional: {
                                page: pageNum + 1,
                            },
                        };

                        resolve(result);
                    });
            })
            :
            new Promise(function (resolve, reject) {
                params.push({ key: 'pageSize', value: 100 });
                params.push({ key: 'columns', value: fe.column.refNameField });

                GLObject.dataGetter.get({ url: /*fe.selfEntity*/'dictionary' + '/list', params: params }).then(
                    (res) => {
                        if (res != null) {

                            const result = {
                                options: [],
                                hasMore: false,
                                additional: {
                                    page: pageNum + 1,
                                },
                            };
                            for (let row of res.rows) {
                                result.options.push({ value: row[fe.column.refKeyField], label: row[fe.column.refNameField] });
                            }
                            result.hasMore = 100 * res.pageNum < res.count;

                            resolve(result);
                        } else {
                            reject(Error("Error getting rows"));
                        }
                    }
                );
            });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}