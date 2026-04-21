const Input = ({ type, placeholder, onChange, value, required = false }) => (
  <input
    className="control"
    type={type}
    placeholder={placeholder}
    onChange={onChange} 
    value={value}
    required={required}
  />
);
export default Input;