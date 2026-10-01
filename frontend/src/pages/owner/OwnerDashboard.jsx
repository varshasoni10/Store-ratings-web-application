import { useEffect, useState } from 'react';
import { api, toQuery } from '../../api';
import SortableTable from '../../components/SortableTable';
import Stars from '../../components/Stars';

export default function OwnerDashboard() {
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/owner/dashboard${toQuery(sort)}`).then(setData).catch((e) => setError(e.message));
  }, [sort]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p>Loading…</p>;
  if (!data.store) {
    return (
      <div className="card narrow">
        <h2>No store assigned</h2>
        <p className="muted">An administrator hasn't linked a store to your account yet.</p>
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'value', label: 'Rating', sortable: true, render: (r) => <Stars value={r.value} size="sm" /> },
    { key: 'updatedAt', label: 'Rated on', sortable: true, render: (r) => new Date(r.updatedAt).toLocaleDateString() },
  ];

  return (
    <>
      <h2>{data.store.name}</h2>
      <p className="muted">{data.store.address}</p>
      <div className="stats">
        <div className="card stat">
          <div className="stat-value">{data.averageRating ?? '—'}</div>
          <div className="stat-label">Average rating</div>
          {data.averageRating != null && <Stars value={data.averageRating} />}
        </div>
        <div className="card stat">
          <div className="stat-value">{data.raters.length}</div>
          <div className="stat-label">Total ratings</div>
        </div>
      </div>
      <h3>Users who rated your store</h3>
      <SortableTable
        columns={columns}
        rows={data.raters}
        sort={sort}
        onSort={setSort}
        rowKey="ratingId"
        emptyText="No one has rated your store yet"
      />
    </>
  );
}
