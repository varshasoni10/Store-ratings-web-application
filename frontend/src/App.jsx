import { Navigate, Route, Routes } from 'react-router-dom';
import { homePathFor, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStores from './pages/admin/AdminStores';
import UserStores from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <Layout />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Loading…</div>;

  const home = user ? homePathFor(user.role) : '/login';

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to={home} replace /> : <Signup />} />

      <Route element={<RequireRole roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/stores" element={<AdminStores />} />
      </Route>

      <Route element={<RequireRole roles={['USER']} />}>
        <Route path="/stores" element={<UserStores />} />
      </Route>

      <Route element={<RequireRole roles={['STORE_OWNER']} />}>
        <Route path="/owner" element={<OwnerDashboard />} />
      </Route>

      <Route element={<RequireRole roles={['USER', 'STORE_OWNER']} />}>
        <Route path="/password" element={<UpdatePassword />} />
      </Route>

      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  );
}
