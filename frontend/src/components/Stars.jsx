export default function Stars({ value, onChange, size = 'md' }) {
  return (
    <span className={`stars stars-${size} ${onChange ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.round(value || 0) ? 'on' : ''}
          onClick={onChange ? () => onChange(n) : undefined}
          role={onChange ? 'button' : undefined}
          aria-label={onChange ? `Rate ${n}` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}
