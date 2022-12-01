
export const Button = ({submit, children, onClick, backgroundColor = "bg-teal-500", textColor = "text-white", hoverColor = "hover:bg-teal-600", className}) => (
        <button onClick={onClick} type={submit ? "submit" : "button"} className={`
            btn text-md rounded-md justify-center border border-transparent py-3 px-5 ${hoverColor} ${backgroundColor} ${textColor} ${className} focus:outline
            text-center`}>
            {children}
        </button>
)
export const OKButton = Button
export const DangerButton = (props) => <Button backgroundColor="bg-red-600" hoverColor="hover:bg-red-600" {...props}/>