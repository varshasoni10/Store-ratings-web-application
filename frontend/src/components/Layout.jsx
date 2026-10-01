import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LINKS = {
  ADMIN: [
    ['/admin', 'Dashboard'],
    ['/admin/users', 'Users'],
    ['/admin/stores', 'Stores'],
  ],
  USER: [['/stores', 'Stores']],
  STORE_OWNER: [['/owner', 'Dashboard']],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <span className="brand">Store Ratings</span>
        <nav>
          {LINKS[user.role].map(([to, label]) => (
            <NavLink key={to} to={to} end>
              {label}
            </NavLink>
          ))}
          {user.role !== 'ADMIN' && <NavLink to="/password">Change Password</NavLink>}
        </nav>
        <div className="nav-user">
          <span>{user.name}</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
