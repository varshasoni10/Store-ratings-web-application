import { useState } from 'react';
import { api } from '../../api';
import SortableTable from '../../components/SortableTable';
import Stars from '../../components/Stars';
import { useListQuery } from '../../hooks';

function RatingControl({ store, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(store.myRating || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!value) return setError('Pick 1–5 stars');
    setSaving(true);
    setError('');
    try {
      await api.put(`/stores/${store.id}/rating`, { value });
      setEditing(false);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button className="btn btn-small" onClick={() => setEditing(true)}>
        {store.myRating ? 'Modify rating' : 'Submit rating'}
      </button>
    );
  }

  return (
    <div className="rating-edit">
      <Stars value={value} onChange={setValue} />
      <button className="btn btn-small btn-primary" onClick={save} disabled={saving}>
        Save
      </button>
      <button
        className="btn btn-small btn-outline"
        onClick={() => {
          setEditing(false);
          setValue(store.myRating || 0);
        }}
      >
        Cancel
      </button>
      {error && <small className="error">{error}</small>}
    </div>
  );
}

export default function UserStores() {
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const { data: stores, error, reload } = useListQuery('/stores', filters, sort, (d) => d.stores);

  const onFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const columns = [
    { key: 'name', label: 'Store name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'rating',
      label: 'Overall rating',
      sortable: true,
      render: (s) =>
        s.overallRating != null ? (
          <span className="rating-cell">
            <Stars value={s.overallRating} size="sm" /> {s.overallRating}
          </span>
        ) : (
          'No ratings'
        ),
    },
    {
      key: 'myRating',
      label: 'Your rating',
      render: (s) => (s.myRating ? <Stars value={s.myRating} size="sm" /> : <span className="muted">Not rated</span>),
    },
    { key: 'action', label: '', render: (s) => <RatingControl key={s.myRating} store={s} onSaved={reload} /> },
  ];

  return (
    <>
      <h2>Stores</h2>
      <div className="filters">
        <input name="name" placeholder="Search by name" value={filters.name} onChange={onFilter} />
        <input name="address" placeholder="Search by address" value={filters.address} onChange={onFilter} />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {stores ? <SortableTable columns={columns} rows={stores} sort={sort} onSort={setSort} /> : <p>Loading…</p>}
    </>
  );
}
