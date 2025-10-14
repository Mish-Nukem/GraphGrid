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

    fe.column = props.column;
    fe.selfEntity = props.entity;

    fe.noCache = props.noCache;

    fe.value = props.value || '';
    fe.text = props.text || '';

    fe.getFilters = props.getFilters;

    fe._selectedOptions = props.selectedOptions || [];

    fe.multi = props.multi;

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
    fe.h = props.h || '1.6em';
    fe.selectH = props.selectH || '';
    fe.textareaH = props.textareaH || '2.1em';

    if (props.init) {
        props.init(fe);
    }

    if (fe.multi) {
        if ((fe.value === undefined || fe.value === '') && fe._selectedOptions && fe._selectedOptions.length > 0) {
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

        if (props.comboboxValues && props.comboboxValues.length > 0) {
            fe.comboboxValues = props.comboboxValues;
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
                    key={`fieldEditDiv_${fe.id}_${fe.column.id}_`}
                    className={fe.divContainerClass ? fe.divContainerClass : fe.large ? 'field-edit' : isLookup || isDate ? 'grid-cell-lookup' : 'grid-cell-edit'}
                    style={{
                        border: 'none',
                        height: !fe.inputClass ? fe.h : '',
                        display: 'grid',
                        gridColumn: fe.gridColumn || '',
                        gridTemplateColumns: fe.large ? (isDate ? 'calc(100% - 2.2em) 2.2em' : 'calc(100% - 4.4em) 2.2em 2.2em') : (isDate ? 'calc(100% - 1.4em) 1.4em' : 'calc(100% - 2.8em) 1.4em 1.4em'), //calc(100% - 2.8em)
                        maxWidth: fe.maxW ? fe.maxW : '',
                        minHeight: fe.large ? '2.5em' : '',
                        columnGap: fe.large ? '4px' : '2px',
                        alignItems: 'center',
                        //width: fe.w ? fe.w : `calc(100% - ${isDate ? '2' : '4'}px)`,
                    }}
                >
                    {
                        isLookup ?
                            <>
                                {
                                    !allowCombobox ?
                                        <input
                                            key={`fieldLookupTitle_${fe.id}_${fe.column.id}_`}
                                            style={{//width: 'calc(100% - 4px)',
                                                gridColumn: noClear ? !fe.comboboxValues ? 'span 2' : 'span 3' : 'span 1',
                                                overflowX: 'hidden',
                                                height: !fe.large ? '1.6em' : '2.2em',
                                                //minHeight: !fe.inputClass ? fe.h : '',
                                                minHeight: !fe.inputClass ? fe.textareaH : fe.h,
                                                boxSizing: 'border-box',
                                            }}
                                            disabled={true}
                                            className={fe.large ? fe.inputClassLG : fe.inputClass || ''}
                                            value={fe.value === undefined || fe.value === '' ? '' : fe.text !== undefined && fe.text !== '' ? fe.text : fe.value}
                                        >
                                        </input>
                                        :
                                        <Select
                                            key={`fieldLookupSelect_${fe.id}_${fe.column.id}_`}
                                            inputClass={fe.inputClass || ''}
                                            className={fe.selectClass || ''}
                                            value={fe._selectedOptions}
                                            getOptions={(filter, pageNum) => fe.getLookupValues(filter, pageNum)}
                                            height={fe.selectH}
                                            gridColumn={noClear ? !fe.comboboxValues ? 'span 2' : 'span 3' : 'span 1'}
                                            isMulti={fe.multi}
                                            required={noClear}
                                            cache={fe.noCache ? [FieldEditClass._seq++] : []}
                                            onChange={(e) => {
                                                if (e === null) {
                                                    fe.onChange({ value: '', text: '', fe: fe });
                                                    fe.refreshState();
                                                    return;
                                                }

                                                fe._selectedOptions = fe.multi ? e : [e];
                                                const texts = [];
                                                fe.value = fe.getValueFromCombobox(texts);
                                                const ev = { value: fe.value, text: texts.join(', '), fe: fe };
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
                                            key={`fieldLookupButton_${fe.id}_${fe.column.id}_`}
                                            className={`${fe.large ? 'graph-filter-button' : 'grid-cell-button'} ${/*fe.large ?*/ fe.clearButtonClass /*: ''*/}`}
                                            style={{ width: !fe.large ? '1.6em' : '', height: !fe.large ? '1.6em' : '' }}
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
                                        key={`fieldDateDiv_${fe.id}_${fe.column.id}_`}
                                        style={{
                                            width: '100%',
                                            height: !fe.inputClass ? fe.h : '',
                                            minHeight: !fe.inputClass ? fe.h : '',
                                            padding: !fe.large ? '0' : '',
                                            //gridColumn: noClear ? 'span 3' : 'span 2',
                                            gridColumn: noClear ? 'span 2' : 'span 1',
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
                                                e.fe = fe;
                                                fe.onChange(e);
                                            }}
                                            disabled={fe.disabled}
                                            portalId="root-portal"
                                        ></DatePicker>
                                    </div>
                                </>
                                :
                                <textarea
                                    key={`fieldTextarea_${fe.id}_${fe.column.id}_`}
                                    className={`${fe.large ? fe.inputClassLG : fe.inputClass}`}
                                    value={fe.value || ''}
                                    style={{
                                        width: '100%',
                                        //height: !fe.inputClass ? fe.textareaH : fe.h,
                                        minHeight: !fe.inputClass ? fe.textareaH : fe.h,
                                        height: !fe.large ? '1.8em' : '2.2em',
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
                                        fe.refreshState();
                                    }}
                                    disabled={fe.disabled || fe.column.readonly}
                                >
                                </textarea>
                    }
                    {
                        noClear || fe.column.readonly ? <></>
                            :
                            <button
                                key={`fieldClearButton_${fe.id}_${fe.column.id}_`}
                                className={`${fe.large ? 'graph-filter-clear' : 'grid-cell-button'} ${fe.clearButtonClass || ''}`}
                                style={{ width: !fe.large ? '1.6em' : '', height: !fe.large ? '1.6em' : '' }}
                                onClick={(e) => {
                                    e.value = e.text = '';
                                    fe.value = fe.text = '';
                                    fe._selectedOptions = [];

                                    e.fe = fe;
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
                                if (fe.ownerGrid) {
                                    fe.ownerGrid._clicksDisabled = false;
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
                        fe.value = e.value;
                        fe._selectedOptions = e.values;
                        fe.text = e.text;

                        e.fe = fe;

                        fe.lookupIsShowing = false;
                        if (fe.ownerGrid) {
                            fe.ownerGrid._clicksDisabled = false;
                        }

                        fe.onChange(e);
                    }}
                    //getColumns={info.columns ? () => { return info.columns; } : null}
                    init={(lookupGrid) => {
                        if (!lookupGrid.value || fe.value && fe.value !== lookupGrid.value) {
                            fe.onLookupGridInit(lookupGrid);

                            delete lookupGrid._selectedRows;
                            if (fe.value) {
                                lookupGrid._selectedRowsDict = {};
                                for (let opt of fe._selectedOptions) {
                                    let fakeRow = {};
                                    fakeRow[fe.column.refKeyField] = opt.value;
                                    fakeRow[fe.column.refNameField] = opt.label;
                                    lookupGrid._selectedRowsDict[opt.value] = fakeRow;
                                }
                            }
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
        fe.popupPos = fe.popupPos || { x: 100, y: 100, w: 1700, h: 900 };

        fe.lookupIsShowing = true;
        if (fe.ownerGrid) {
            fe.ownerGrid._clicksDisabled = true;
        }

        fe.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    getValueFromCombobox(texts, changeGridValue) {
        const fe = this;

        texts = texts || [];
        changeGridValue = changeGridValue && fe.grid;

        fe._selectedOptions = fe._selectedOptions || [];
        let arr = [];
        if (changeGridValue) {
            fe.grid._selectedRowsDict = {}
        }

        for (let opt of fe._selectedOptions) {
            arr.push(opt.value);
            texts.push(opt.label);

            if (changeGridValue) {
                let fakeRow = {};
                fakeRow[fe.grid.keyField] = opt.value;
                fakeRow[fe.grid.nameField] = opt.label;
                fe.grid._selectedRowsDict[opt.value] = fakeRow;
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

        return fe.column.name && !fe.getFilters ?
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

                if (fe.getFilters) {
                    const filters = fe.getFilters();

                    let i = 0, j = 0;
                    for (let cond of filters) {
                        if (cond.type === 'column') {
                            params.push({ key: 'f' + i++, value: cond.filter });
                        }
                        else if (cond.type === 'graphLink') {
                            params.push({ key: 'c' + j++, value: cond.filter });
                        }
                    }
                }

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