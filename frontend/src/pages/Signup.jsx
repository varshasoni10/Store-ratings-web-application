import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Field from '../components/Field';
import { rules, validate } from '../validation';

const schema = { name: rules.name, email: rules.email, address: rules.address, password: rules.password };

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setError('');
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setError(err.message);
      setErrors(err.errors);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={onSubmit} noValidate>
        <h1>Sign up</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <Field label="Full name (10–60 characters)" name="name" value={form.name} onChange={onChange} error={errors.name} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
        <Field
          label="Address (max 400 characters)"
          name="address"
          as="textarea"
          rows={3}
          value={form.address}
          onChange={onChange}
          error={errors.address}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />
        <small className="muted">8–16 characters, one uppercase letter and one special character.</small>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
