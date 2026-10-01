import { useState } from 'react';
import { api } from '../api';
import Field from '../components/Field';
import { rules } from '../validation';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    const pErr = rules.password(form.newPassword);
    if (pErr) errs.newPassword = pErr;
    if (form.newPassword !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      await api.put('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setStatus({ ok: true, msg: 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
      setErrors(err.errors);
    }
  };

  return (
    <form className="card narrow" onSubmit={onSubmit} noValidate>
      <h2>Change password</h2>
      {status && <div className={`alert ${status.ok ? 'alert-success' : 'alert-error'}`}>{status.msg}</div>}
      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        value={form.currentPassword}
        onChange={onChange}
        error={errors.currentPassword}
      />
      <Field
        label="New password"
        name="newPassword"
        type="password"
        value={form.newPassword}
        onChange={onChange}
        error={errors.newPassword}
      />
      <Field
        label="Confirm new password"
        name="confirm"
        type="password"
        value={form.confirm}
        onChange={onChange}
        error={errors.confirm}
      />
      <button className="btn btn-primary">Update password</button>
    </form>
  );
}
