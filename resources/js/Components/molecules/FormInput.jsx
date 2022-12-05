import { useState } from "react";
import { useCallback } from "react";
import InputLabel from "@/Components/InputLabel";

export default function FormInput({dataName, setData, label, defaultValue }) {
    const [value, setValue] = useState(defaultValue ?? '')
    const onChange = useCallback((v) => {
        setData(dataName, v.target.value)
        setValue(v.target.value)
    }, [setData, dataName])
    return (
        <div className="flex-col gap-2">
            {label && <InputLabel htmlFor={dataName}>{label}</InputLabel>}
            <input name={dataName} onChange={onChange} value={value} className="
                px-5 py-2
            "/>
        </div>
    )
}