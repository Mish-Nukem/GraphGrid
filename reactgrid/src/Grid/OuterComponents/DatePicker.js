import { useState } from "react";
import DatePicker from "react-datepicker";
import { format, isValid, parse } from "date-fns";
import { ru } from "react-day-picker/locale";
import "react-day-picker/style.css";
export function DatePickerNew(props) {
    const date = props.date || new Date().toLocaleDateString();

    //const inputId = useId();

    const dateFormat = props.dateFormat || 'dd.MM.yyyy';

    let parsedDate = parse(date, dateFormat, new Date());

    //let translate = props.translate || ((text) => { return text; });

    if (!isValid(parsedDate)) {
        parsedDate = parse(new Date().toLocaleDateString(), dateFormat, new Date());
    }

    const [month, setMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(parsedDate);
    //const [inputValue, setInputValue] = useState(format(parsedDate, dateFormat));

    const handleDayPickerSelect = (date) => {
        if (!date) {
            setSelectedDate("");
            setSelectedDate(undefined);
        } else {
            setSelectedDate(date);
            setMonth(date);
            setSelectedDate(format(date, dateFormat));
            if (props.onSelect) props.onSelect(format(date, dateFormat));
        }
    };

    //const handleInputChange = (e) => {
    //    setInputValue(e.target.value); // Keep the input value in sync

    //    const parsedDate = parse(e.target.value, dateFormat, new Date());

    //    if (isValid(parsedDate)) {
    //        setSelectedDate(parsedDate);
    //        setMonth(parsedDate);
    //    } else {
    //        setSelectedDate(undefined);
    //    }
    //};
    //const parsedDate = parse(e.target.value, dateFormat, new Date());
    //if (isValid(parsedDate)) {

    //selectedDate.toLocaleDateString()}
    //    footer = {
    //        selectedDate? `Selected: ${selectedDate.toString()}` : "Pick a day."
    //}

    //<div style={{ whiteSpace: 'nowrap' }}>
    //    <label htmlFor={inputId}>
    //        <strong>{translate('Date') + ': '}</strong>
    //    </label>
    //    <input
    //        style={{ fontSize: "inherit" }}
    //        id={inputId}
    //        type="text"
    //        value={inputValue}
    //        placeholder={dateFormat}
    //        onChange={handleInputChange}
    //    />
    //</div>


    return (
        <div className='datepicker-div'>

            <DatePicker //onSelect={(date) => { setSelected(date); if (props.onSelect) props.onSelect(format(date, dateFormat)); }}
                month={month}
                onMonthChange={setMonth}
                animate
                mode="single"
                selected={selectedDate}
                onSelect={handleDayPickerSelect}
                locale={ru}
            />
        </div>
    );
}