import { useEffect, useState } from 'react';
import { api } from '../../api';
import Field from '../../components/Field';
import SortableTable from '../../components/SortableTable';
import Stars from '../../components/Stars';
import { useListQuery } from '../../hooks';
import { rules, validate } from '../../validation';

const EMPTY = { name: '', email: '', address: '', ownerId: '' };
const schema = { name: rules.storeName, email: rules.email, address: rules.address };

function AddStoreForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    api.get('/admin/users?role=STORE_OWNER&sortBy=name').then((d) => setOwners(d.users));
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, schema);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId ? Number(form.ownerId) : null });
      onCreated();
    } catch (err) {
      setError(err.message);
      setErrors(err.errors);
    }
  };

  return (
    <form className="card form-grid" onSubmit={onSubmit} noValidate>
      <h3>Add store</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <Field label="Store name" name="name" value={form.name} onChange={onChange} error={errors.name} />
      <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <Field label="Owner (optional)" name="ownerId" as="select" value={form.ownerId} onChange={onChange}>
        <option value="">— No owner —</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name} ({o.email})
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
      />
      <div className="form-actions span-2">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary">Create store</button>
      </div>
    </form>
  );
}

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [adding, setAdding] = useState(false);
  const { data: stores, error, reload } = useListQuery('/admin/stores', filters, sort, (d) => d.stores);

  const onFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (s) =>
        s.rating != null ? (
          <span className="rating-cell">
            <Stars value={s.rating} size="sm" /> {s.rating}
          </span>
        ) : (
          'No ratings'
        ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <h2>Stores</h2>
        {!adding && (
          <button className="btn btn-primary" onClick={() => setAdding(true)}>
            + Add store
          </button>
        )}
      </div>

      {adding && (
        <AddStoreForm
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
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {stores ? <SortableTable columns={columns} rows={stores} sort={sort} onSort={setSort} /> : <p>Loading…</p>}
    </>
  );
}
