import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";
import "react-day-picker/style.css";
export function DatePicker(props) {
    const date = props.date || Date();

    const [selectedDate, setSelected] = useState(date);

    //selectedDate.toLocaleDateString()}
//    footer = {
//        selectedDate? `Selected: ${selectedDate.toString()}` : "Pick a day."
//}

    return (
        <DayPicker
            animate
            mode="single"
            selected={selectedDate}
            onSelect={(date) => { setSelected(date); if (props.onSelect) props.onSelect(date); }}
            locale={ru}
        />
    );
}