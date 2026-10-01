const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']).{8,16}$/;

export const rules = {
  name: (v) => {
    const len = (v || '').trim().length;
    return len < 10 || len > 60 ? 'Name must be between 10 and 60 characters' : null;
  },
  storeName: (v) => (!v?.trim() || v.length > 60 ? 'Store name is required (max 60 characters)' : null),
  email: (v) => (!EMAIL_REGEX.test(v || '') ? 'Enter a valid email address' : null),
  address: (v) => {
    if (!v?.trim()) return 'Address is required';
    return v.length > 400 ? 'Address must be at most 400 characters' : null;
  },
  password: (v) =>
    !PASSWORD_REGEX.test(v || '')
      ? 'Password must be 8-16 characters with at least one uppercase letter and one special character'
      : null,
};

export function validate(values, schema) {
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const err = rule(values[field]);
    if (err) errors[field] = err;
  }
  return errors;
}
