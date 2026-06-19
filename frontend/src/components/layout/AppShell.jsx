import { Link, NavLink, Outlet } from 'react-router-dom';
import { LifeBuoy, Menu, PhoneCall, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/roles';
import { getMenuIcon } from '../../utils/menuIcons';
import { addAvatarCacheKey, getAvatarUrl, resolveAvatarUrl } from '../../utils/avatar';
import NotificationBell from './NotificationBell';

function getInitials(fullName) {
  if (typeof fullName !== 'string') return '?';

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word?.charAt(0)?.toUpperCase())
    .filter(Boolean)
    .join('');

  return initials || '?';
}

function UserAvatar({ user, size = 46 }) {
  const [imageError, setImageError] = useState(false);
  const rawAvatar = getAvatarUrl(user);

  useEffect(() => {
    setImageError(false);
  }, [rawAvatar]);

  const initials = useMemo(() => getInitials(user?.fullName), [user?.fullName]);
  const avatarSrc = useMemo(() => {
    const resolvedUrl = resolveAvatarUrl(rawAvatar);
    return addAvatarCacheKey(resolvedUrl, user?.avatarUpdatedAt);
  }, [rawAvatar, user?.avatarUpdatedAt]);
  const shouldShowImage = avatarSrc && !imageError;

  if (shouldShowImage) {
    return (
      <img
        src={avatarSrc}
        alt={user?.fullName || 'Avatar'}
        className="topbar-avatar"
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <span
      className="topbar-avatar topbar-avatar-initials"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initials}
    </span>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const menuItems = getMenuItems(user?.roleName);
  const notificationsEnabled = ['CUSTOMER', 'RESCUE_STAFF'].includes(user?.roleName);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [user?.roleName]);

  return (
    <div className="app-shell">
      {sidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span><LifeBuoy size={20} aria-hidden="true" /></span>
          <div className="sidebar-brand-copy">
            <strong>VBAS Rescue</strong>
            <p>24/7 vehicle rescue</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = getMenuIcon(item.label);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {user?.roleName === 'CUSTOMER' ? (
          <div className="sidebar-footer">
            <Link className="sidebar-sos-link" to="/customer/requests/new" onClick={() => setSidebarOpen(false)}>
              <PhoneCall size={18} aria-hidden="true" />
              SOS - Rescue Now
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="app-shell-content">
        <header className="topbar">
          <div className="topbar-user">
            <button
              type="button"
              className="sidebar-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
              <UserAvatar user={user} size={46} />
              <div className="topbar-user-info">
                <strong>{user?.fullName}</strong>
                <p>{user?.roleName}</p>
              </div>
            </Link>
          </div>
          <div className="topbar-actions">
            <NotificationBell enabled={notificationsEnabled} />
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
