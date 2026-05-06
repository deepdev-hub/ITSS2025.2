import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/roles';

export default function AppShell() {
  const { user, logout } = useAuth();
  const menuItems = getMenuItems(user?.roleName);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>VBAS</span>
          <p>Vehicle Breakdown Assistance</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-shell-content">
        <header className="topbar">
          <div>
            <strong>{user?.fullName}</strong>
            <p>{user?.roleName}</p>
          </div>
          <div className="topbar-actions">
            <NavLink className="button button-secondary" to="/profile">
              Profile
            </NavLink>
            <button className="button button-secondary" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
