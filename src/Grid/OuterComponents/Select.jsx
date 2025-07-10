import React, { useState/*, useEffect, useCallback*/ } from 'react';
//import AsyncSelect from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
export function Select(props) {
    const [value, setValue] = useState(props.value);

    //if (value && !props.value
    //    || !value && props.value
    //    || value && value.length >= 0 && props.value && props.value.length >= 0 && props.value.length !== value.length) {

    //    setValue(props.value);
    //}
    //else if (props.value && props.value.length > 0 && value && value.length > 0) {

    //    for (let i = 0; i < props.value.length; i++) {
    //        if (props.value[i].value !== value[i].value) {
    //            setValue(props.value);
    //            break;
    //        }
    //    }
    //}
    //else if (props.value && value && value.length > 0 && value[0] == null) {
    //    setValue(props.value);
    //}
    if (value !== props.value) {
        setValue(props.value);
    }

    const getOptions = props.getOptions;

    const loadOptions = async (inputValue, loadedOptions, { page }) => {

        if (getOptions && !props.disabled) {
            const res = await getOptions(inputValue, page);
            return res;
        }
    };

    const height = props.height || '30px';
    const className = props.className || '';

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: '#fff',
            borderColor: '#9e9e9e',
            minHeight: height,
            height: height,
            boxShadow: state.isFocused ? null : null,
            className: className,
            /*className: props.inputClass || '',*/
        }),

        valueContainer: (base) => ({
            ...base,
            height: 'calc(' + height + ' - 4px)',
            padding: '0 6px',
            className: className,
        }),

        input: (base) => ({
            ...base,
            margin: '0px',
            height: 'calc(' + height + ' - 4px)',
            /*className: props.inputClass || '',*/
            className: className,
        }),

        indicatorSeparator: () => ({
            display: 'none',
            height: 'calc(' + height + ' - 4px)',
        }),

        indicatorsContainer: (base) => ({
            ...base,
            height: 'calc(' + height + ' - 4px)',
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#3699FF' : null,
            color: state.isFocused ? 'white' : null,
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    if (props.init) {
        props.init();
    }

    return (
        <div
            style={{ gridColumn: props.gridColumn || '' }}
        >
            <AsyncPaginate
                key={value}
                value={!props.isMulti ? value : value && value.length > 0 ? value : ''}
                isMulti={props.isMulti}
                isClearable={!props.required}
                cacheOptions
                loadOptions={loadOptions}
                additional={{
                    page: 1,
                }}
                onChange={(e) => {
                    props.onChange(e);
                    setValue(props.isMulti ? e : [e]);
                }}
                placeholder=""
                styles={customStyles}
                isDisabled={props.disabled ? true : false}
                style={props.style}
                menuPortalTarget={document.body}
            >
            </AsyncPaginate >
        </div>
    );
};