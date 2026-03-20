import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAdminSession, getAdminUser } from '../services/adminAuth.js';

const AdminLayout = () => {
  const navigate = useNavigate();
  const admin = getAdminUser();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/login');
  };

  return (
    <div className="page stack">
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1 className="title">Admin Console</h1>
          <p className="muted">Logged in as {admin?.email || 'admin'}</p>
        </div>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/appeals">Appeals</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/logs">Logs</NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
