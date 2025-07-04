/* eslint-disable no-mixed-operators */
import { useState, useEffect } from 'react';
import { BaseComponent } from './Base';
import { Select } from './OuterComponents/Select';
import { Modal } from './Modal';
import { GridINU/*, GridINUClass*/ } from './GridINU';
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
    fe.clearButtonClass = props.clearButtonClass || BaseComponent.theme.clearButtonClass || '';
    fe.selectClass = props.selectClass || BaseComponent.theme.selectClass || '';
    fe.datePickerDateFormat = props.datePickerDateFormat || 'dd.MM.yyyy';
    fe.divContainerClass = props.divContainerClass || '';

    fe.w = props.w;
    fe.h = props.h || '1.7em';
    fe.selectH = props.selectH || '';
    fe.textareaH = props.textareaH || '2.1em';
    //fe.margin = props.margin || '0 2px 2px 2px';

    const prevValue = fe.value;
    if (props.init) {
        props.init(fe);
    }

    fe.refreshState = function () {
        setState({ fe: fe, ind: fe.stateind++ });
    }

    useEffect(() => {
        if (prevValue !== fe.value && fe.setComboboxValue) {
            fe.setComboboxValue({ value: fe.value, label: fe.text });
        }

        return () => {
        }
    }, [fe, prevValue])

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

        if (fe.multi) {
            fe._selectedOptions = fe.value || [];
            const texts = [];
            fe.value = fe.getValueFromCombobox(texts);
            fe.text = texts.join(', ');
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

        fe.gridColumn = props.gridColumn;
    //    fe.buttonClass = props.buttonClass || BaseComponent.theme.filterButtonClass || '';
    //    fe.inputClass = props.inputClass || BaseComponent.theme.inputClass || '';
    //    fe.clearButtonClass = props.clearButtonClass || BaseComponent.theme.clearButtonClass || '';
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
            parsedDate = Moment(fe.value, fe.datePickerDateFormat);
            if (parsedDate.isValid()) {
                fe.value = parsedDate.format(fe.dateFormat);
            }
            else {
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
                        margin: fe.margin,
                    }}
                >
                    {
                        isLookup ?
                            <>
                                {
                                    !allowCombobox ?
                                        <input
                                            key={`fieldlookuptitle_${fe.id}_${fe.column.id}_`}
                                            style={{
                                                width: 'calc(100% - 4px)',
                                                gridColumn: noClear ? 'span 2' : 'span 1',
                                                overflowX: 'hidden',
                                                height: !fe.inputClass ? fe.h : '',
                                                minHeight: !fe.inputClass ? fe.h : '',
                                                boxSizing: 'border-box',
                                            }}
                                            disabled={true}
                                            className={fe.inputClass || ''}
                                            value={fe.value}
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
                                            gridColumn={noClear ? 'span 2' : 'span 1'}
                                            isMulti={fe.multi}
                                            onChange={(e) => {
                                                fe._selectedOptions = fe.multi ? e : [e];
                                                const texts = [];
                                                fe.value = fe.getValueFromCombobox(texts);
                                                const ev = {};
                                                ev.text = texts.join(', ');
                                                ev.value = fe.value;
                                                fe.onChange(ev);
                                            }}
                                            init={(e) => { fe.setComboboxValue = e.setComboboxValue; }}
                                            disabled={fe.disabled}
                                        >
                                        </Select>
                                }
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
                                            padding: '0',
                                            gridColumn: noClear ? 'span 3' : 'span 2',
                                            overflowX: 'hidden',
                                        }}
                                        className="datepicker-input"
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
                                                //const e = { value: Moment(date, fe.dateFormat) };
                                                const e = {};
                                                fe.value = fe.text = Moment(date, fe.datePickerDateFormat).format(fe.dateFormat);//.format(fe.dateFormat);
                                                e.value = e.text = Moment(date, fe.datePickerDateFormat).format(fe.dateFormat);//.format(fe.dateFormat);
                                                fe.onChange(e);
                                            }}
                                            disabled={fe.disabled}
                                        ></DatePicker>
                                    </div>
                                </>
                                :
                                <textarea
                                    key={`fieldtextarea_${fe.id}_${fe.column.id}_`}
                                    className={`${fe.inputClass || ''}`}
                                    value={fe.value || ''}
                                    style={{
                                        width: '100%',
                                        height: !fe.inputClass ? fe.textareaH : fe.h,
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
                                className={`${fe.large ? 'graph-filter-button' : 'grid-cell-button'} ${fe.clearButtonClass || ''}`}
                                onClick={(e) => {
                                    e.value = e.text = '';
                                    fe.value = fe.text = '';
                                    fe._selectedOptions = [];
                                    if (fe.setComboboxValue) {
                                        fe.setComboboxValue([]);
                                    }

                                    fe.onChange(e);
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
        //const info = GLObject.entityInfo[fe.column.entity];

        return (
            fe.column.renderLookup ?
                fe.column.renderLookup(fe)
                :
                <GridINU
                    entity={fe.column.entity}
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

                            if (fe.setComboboxValue) {
                                fe.setComboboxValue(e.value);
                            }
                        }
                        else {
                            fe.value = e.value;
                            fe.text = e.text;

                            if (fe.setComboboxValue) {
                                fe._selectedOptions = [{ value: fe.value, label: fe.text }];
                                fe.setComboboxValue(fe._selectedOptions);
                            }
                        }

                        e.value = fe.value;
                        e.text = fe.text;

                        fe.lookupIsShowing = false;
                        fe.onChange(e);
                    }}
                    //getColumns={info.columns ? () => { return info.columns; } : null}
                    init={(lookupGrid) => {
                        fe.onLookupGridInit(lookupGrid);

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
        fe.popupPos = fe.popupPos || { x: 100, y: 100, w: 800, h: 600 };

        fe.lookupIsShowing = true;
        if (fe.ownerGrid) {
            fe.ownerGrid._clicksDisabled = true;
        }

        fe.refreshState();

    //    if (!GLObject.entityInfo[fe.column.entity]) {
    //        const params = [
    //            { key: 'entity', value: fe.column.entity },
    //            { key: 'configUid', value: fe.column.entity + '_' },
    //        ];

    //        GLObject.dataGetter.get({ url: 'system/entityInfo', params: params }).then(
    //            (eInfo) => {
    //                GLObject.entityInfo[fe.column.entity] = eInfo;
    //                fe.refreshState();
    //            }
    //        );
    //    }
    //    else {
    //        fe.refreshState();
    //    }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getValueFromCombobox(texts, changeGridValue) {
        const fe = this;
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

        const params = [
            { key: 'filter', value: filter },
            { key: 'pageNumber', value: pageNum },
            { key: 'entity', value: fe.selfEntity },

        ];

        return fe.column.name ? new Promise((resolve) => {
            params.push({ key: 'columns', value: fe.column.name });

            GLObject.dataGetter.get({ url: 'system/getLookupValues', params: params }).then(
                (res) => {

                    const result = {
                        options: res,
                        hasMore: false,
                        additional: {
                            page: pageNum + 1,
                            //node: fe
                        },
                    };

                    resolve(result);
                });
        })
            :
            new Promise(function (resolve, reject) {
                params.push({ key: 'pageSize', value: 100 });

                GLObject.dataGetter.get({ url: fe.selfEntity + '/list', params: params }).then(
                    (res) => {
                        if (res != null) {

                            const result = {
                                options: [],
                                hasMore: false,
                                additional: {
                                    page: pageNum + 1,
                                    //node: node
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
            })
            ;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}