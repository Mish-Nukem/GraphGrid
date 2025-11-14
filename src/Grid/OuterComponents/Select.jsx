import React, { useState/*, useEffect*/ } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
export function Select(props) {
    const [value, setValue] = useState(props.value);

    //if (value !== props.value) {
    //    setValue(props.value);
    //}

    const getOptions = props.getOptions;

    const loadOptions =
        props.noAsync ? (inputValue, loadedOptions, { page }) => {
            if (getOptions && !props.disabled) {
                const res = getOptions(inputValue, page);
                return res;
            }
        }
            :
            async (inputValue, loadedOptions, { page }) => {

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
            overflow: 'hidden',
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
            className: className,
        }),

        indicatorSeparator: () => ({
            display: 'none',
            height: 'calc(' + height + ' - 4px)',
        }),

        indicatorsContainer: (base) => ({
            ...base,
            height: 'calc(' + height + ' - 4px)',
            //padding: '8px 0',
        }),

        dropdownIndicator: (base) => ({
            ...base,
            //height: 'calc(' + height + ' - 4px)',
            padding: '8px 0',
        }),

        clearIndicator: (base) => ({
            ...base,
            //height: 'calc(' + height + ' - 4px)',
            padding: '8px 0',
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

    //useEffect(() => {
    //    return () => {
    //    }
    //}, [props.parentFilters])

    return (
        <div
            style={{ gridColumn: props.gridColumn || '', width: '100%' }}
        >
            <AsyncPaginate
                value={!props.isMulti ? value : value && value.length > 0 ? value : ''}
                //defaultOptions={value && value.length > 0 ? value : undefined}
                isMulti={props.isMulti}
                isClearable={!props.required}
                cacheUniqs={props.cache}
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
                mapOptionsForMenu={(list) => {
                    if (value == null || value.length <= 0 || list.length <= 0) return list;

                    const vArr = Array.isArray(value) ? value : [value];

                    //const updatedList = list.map((itm) => {
                    //    if (itm.value === vArr[0].value) {
                    //        return vArr[0]; // Replace with the new object
                    //    }
                    //    return itm; // Keep the original object
                    //});

                    //return updatedList;

                    list = list.filter(
                        (option) => !vArr.some((selected) => selected.value === option.value)
                    );

                    list.unshift(...vArr);

                    return list;
                }}
            >
            </AsyncPaginate >
        </div>
    );
};