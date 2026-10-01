import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import Stars from '../../components/Stars';
import { ROLE_LABELS } from './AdminUsers';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/admin/users/${id}`).then((d) => setUser(d.user)).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!user) return <p>Loading…</p>;

  return (
    <>
      <Link to="/admin/users" className="back">
        ← Back to users
      </Link>
      <div className="card narrow">
        <h2>{user.name}</h2>
        <dl className="details">
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Address</dt>
          <dd>{user.address}</dd>
          <dt>Role</dt>
          <dd>
            <span className={`badge badge-${user.role}`}>{ROLE_LABELS[user.role]}</span>
          </dd>
          {user.role === 'STORE_OWNER' && (
            <>
              <dt>Store rating</dt>
              <dd>
                {user.rating != null ? (
                  <>
                    <Stars value={user.rating} /> {user.rating} / 5
                  </>
                ) : (
                  'No ratings yet'
                )}
              </dd>
            </>
          )}
        </dl>
      </div>
    </>
  );
}
