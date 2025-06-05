import React, { useState } from 'react';
//import AsyncSelect from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
export function Select(props) {
    const [value, onChange] = useState(props.value);

    if (props.init) {
        props.init({
            setComboboxValue: function (newValue) {
                onChange(newValue);
            },
            refreshState: function () {
                onChange(value);
            }
        });
    }

    const getOptions = props.getOptions;

    const loadOptions = async (inputValue, loadedOptions, { page }) => {

        if (getOptions && !props.disabled) {
            const res = await getOptions(inputValue, page);
            return res;
        }
    };

    const height = props.height || '30px';

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: '#fff',
            borderColor: '#9e9e9e',
            minHeight: height,
            height: height,
            gridColumn: props.gridColumn,
            boxShadow: state.isFocused ? null : null,
        }),

        valueContainer: (provided, state) => ({
            ...provided,
            height: height,
            padding: '0 6px'
        }),

        input: (provided, state) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: state => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: height,
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#3699FF' : null,
            color: state.isFocused ? 'white' : null,
        }),
    };

    return (
        <>
            <AsyncPaginate
                key={value}
                value={value}
                isMulti={props.isMulti}
                cacheOptions
                loadOptions={loadOptions}
                additional={{
                    page: 1,
                }}
                onChange={(e) => { props.onChange(e); onChange(e); }}
                placeholder=""
                styles={customStyles}
                isDisabled={props.disabled ? true : false}
                style={props.style}
            >
            </AsyncPaginate >
        </>
    );
};