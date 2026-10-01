import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <p>Loading…</p>;

  const tiles = [
    ['Total users', stats.totalUsers, '/admin/users'],
    ['Total stores', stats.totalStores, '/admin/stores'],
    ['Total ratings', stats.totalRatings, null],
  ];

  return (
    <>
      <h2>Dashboard</h2>
      <div className="stats">
        {tiles.map(([label, value, to]) => {
          const body = (
            <>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </>
          );
          return to ? (
            <Link key={label} to={to} className="card stat">
              {body}
            </Link>
          ) : (
            <div key={label} className="card stat">
              {body}
            </div>
          );
        })}
      </div>
    </>
  );
}
