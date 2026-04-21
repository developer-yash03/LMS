const Button = ({ text, onClick, type = 'button', variant = 'primary' }) => {
  const variantClass = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    outline: 'btn-soft',
  };

  return (
    <button type={type} onClick={onClick} className={`btn ${variantClass[variant] || 'btn-primary'}`}>
      {text}
    </button>
  );
};
export default Button;