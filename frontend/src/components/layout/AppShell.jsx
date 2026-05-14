import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems } from '../../utils/roles';
import { useEffect, useMemo, useState } from 'react';
import { addAvatarCacheKey, getAvatarUrl, resolveAvatarUrl } from '../../utils/avatar';

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
          <div className="topbar-user">
            <UserAvatar user={user} size={46} />
            <div className="topbar-user-info">
              <strong>{user?.fullName}</strong>
              <p>{user?.roleName}</p>
            </div>
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
