export default function Input({ label, id, className = '', ...props }) {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <input id={id} className="input-field" {...props} />
        </div>
    );
}
