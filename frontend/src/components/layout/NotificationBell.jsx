import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CreditCard, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { getApiError } from '../../api/client';
import { notificationApi } from '../../api/notificationApi';

const POLL_INTERVAL_MS = 10000;

function formatNotificationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function BellIcon() {
  return (
    <svg className="notification-bell-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22a2.5 2.5 0 0 0 2.4-1.8H9.6A2.5 2.5 0 0 0 12 22Z" />
      <path d="M19 17.5 17.6 15V9.8A5.7 5.7 0 0 0 13 4.2V3a1 1 0 0 0-2 0v1.2a5.7 5.7 0 0 0-4.6 5.6V15L5 17.5a1 1 0 0 0 .9 1.5h12.2a1 1 0 0 0 .9-1.5ZM8.4 17l.8-1.4a1 1 0 0 0 .2-.5V9.8a3.6 3.6 0 1 1 7.2 0v5.3a1 1 0 0 0 .2.5l.8 1.4H8.4Z" />
    </svg>
  );
}

function getNotificationIcon(type) {
  switch (type) {
    case 'PAYMENT_COMPLETED':
      return <div className="notif-icon-circle payment"><CreditCard size={18} /></div>;
    case 'ASSIGNMENT_PENDING':
      return <div className="notif-icon-circle assignment"><AlertTriangle size={18} /></div>;
    case 'REQUEST_COMPLETED':
      return <div className="notif-icon-circle success"><CheckCircle size={18} /></div>;
    default:
      return <div className="notif-icon-circle default"><Bell size={18} /></div>;
  }
}

function resolveNotificationTarget(notification) {
  if (!notification) return null;
  if (notification.type === 'ASSIGNMENT_PENDING') {
    return '/staff/assignments';
  }
  if (notification.requestId) {
    return `/requests/${notification.requestId}`;
  }
  return null;
}

export default function NotificationBell({ enabled }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUnreadCount = useCallback(async () => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    try {
      const result = await notificationApi.getUnreadCount();
      setUnreadCount(result?.unreadCount ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  const loadNotifications = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      const list = await notificationApi.getNotifications();
      setNotifications(list || []);
      await loadUnreadCount();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [enabled, loadUnreadCount]);

  useEffect(() => {
    loadUnreadCount();
    if (!enabled) return undefined;
    const intervalId = window.setInterval(loadUnreadCount, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [enabled, loadUnreadCount]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationApi.markAsRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id
            ? { ...item, read: true, readAt: new Date().toISOString() }
            : item
        )));
        await loadUnreadCount();
      }
      setOpen(false);
      const target = resolveNotificationTarget(notification);
      if (target) {
        navigate(target);
      }
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleMarkAllRead = async () => {
    setError('');
    try {
      await notificationApi.markAllAsRead();
      setNotifications((current) => current.map((item) => ({
        ...item,
        read: true,
        readAt: item.readAt || new Date().toISOString(),
      })));
      setUnreadCount(0);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        className={`notification-bell-button${open ? ' active' : ''}`}
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              Mark all as read
            </button>
          </div>

          {loading ? <div className="notification-state"><div className="loading-spinner-small" /> Loading...</div> : null}
          {error ? <div className="notification-state notification-error">{error}</div> : null}
          {!loading && !error && notifications.length === 0 ? (
            <div className="notification-state empty">
              <Bell size={32} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p>You have no new notifications.</p>
            </div>
          ) : null}

          {!loading && !error && notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-item-content">
                    <span className="notification-item-title">{notification.title}</span>
                    <span className="notification-item-message">{notification.message}</span>
                    <span className="notification-item-time">{formatNotificationTime(notification.createdAt)}</span>
                  </div>
                  {!notification.read && <div className="notification-item-dot" />}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
