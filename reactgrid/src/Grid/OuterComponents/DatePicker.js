import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isValid, parse } from "date-fns";
import { ru } from "react-day-picker/locale";
import "react-day-picker/style.css";
export function DatePicker(props) {
    const date = props.date || Date();

    const dateFormat = props.dateFormat || 'dd.MM.yyyy';
    let parsedDate = parse(date, dateFormat, new Date());

    if (!isValid(parsedDate)) {
        parsedDate = parse(Date(), dateFormat, new Date());
    }

    const [selectedDate, setSelected] = useState(parsedDate);


    //const parsedDate = parse(e.target.value, dateFormat, new Date());
    //if (isValid(parsedDate)) {

    //selectedDate.toLocaleDateString()}
//    footer = {
//        selectedDate? `Selected: ${selectedDate.toString()}` : "Pick a day."
//}

    return (
        <DayPicker
            animate
            mode="single"
            selected={selectedDate}
            onSelect={(date) => { setSelected(date); if (props.onSelect) props.onSelect(format(date, dateFormat)); }}
            locale={ru}
        />
    );
}