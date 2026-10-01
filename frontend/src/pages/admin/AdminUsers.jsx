import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import Field from '../../components/Field';
import SortableTable from '../../components/SortableTable';
import { useListQuery } from '../../hooks';
import { rules, validate } from '../../validation';

export const ROLE_LABELS = { ADMIN: 'Admin', USER: 'Normal User', STORE_OWNER: 'Store Owner' };

const EMPTY = { name: '', email: '', password: '', address: '', role: 'USER' };
const schema = { name: rules.name, email: rules.email, password: rules.password, address: rules.address };

function AddUserForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/users', form);
      onCreated();
    } catch (err) {
      setError(err.message);
      setErrors(err.errors);
    }
  };

  return (
    <form className="card form-grid" onSubmit={onSubmit} noValidate>
      <h3>Add user</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <Field label="Name (10–60 characters)" name="name" value={form.name} onChange={onChange} error={errors.name} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
      <Field label="Role" name="role" as="select" value={form.role} onChange={onChange}>
        {Object.entries(ROLE_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Field>
      <Field
        label="Address (max 400 characters)"
        name="address"
        as="textarea"
        rows={2}
        value={form.address}
        onChange={onChange}
        error={errors.address}
        className="span-2"
      />
      <div className="form-actions span-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary">Create user</button>
      </div>
    </form>
  );
}

export default function AdminUsers() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [adding, setAdding] = useState(false);
  const { data: users, error, reload } = useListQuery('/admin/users', filters, sort, (d) => d.users);

  const onFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const columns = [
    { key: 'name', label: 'Name', sortable: true, render: (u) => <Link to={`/admin/users/${u.id}`}>{u.name}</Link> },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: (u) => <span className={`badge badge-${u.role}`}>{ROLE_LABELS[u.role]}</span> },
    { key: 'rating', label: 'Rating', render: (u) => (u.role === 'STORE_OWNER' ? u.rating ?? 'No ratings' : '—') },
  ];

  return (
    <>
      <div className="page-head">
        <h2>Users</h2>
        {!adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            + Add user
          </button>
        )}
      </div>

      {adding && (
        <AddUserForm
          onCancel={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      <div className="filters">
        <input name="name" placeholder="Filter by name" value={filters.name} onChange={onFilter} />
        <input name="email" placeholder="Filter by email" value={filters.email} onChange={onFilter} />
        <input name="address" placeholder="Filter by address" value={filters.address} onChange={onFilter} />
        <select name="role" value={filters.role} onChange={onFilter}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {users ? <SortableTable columns={columns} rows={users} sort={sort} onSort={setSort} /> : <p>Loading…</p>}
    </>
  );
}
