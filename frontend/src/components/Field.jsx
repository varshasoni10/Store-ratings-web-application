export default function Field({ label, name, value, onChange, error, as = 'input', className = '', children, ...rest }) {
  const Tag = as;
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <Tag name={name} value={value} onChange={onChange} className={error ? 'invalid' : ''} {...rest}>
        {children}
      </Tag>
      {error && <small className="error">{error}</small>}
    </label>
  );
}
