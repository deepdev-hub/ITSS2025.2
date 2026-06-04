import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiError } from '../../api/client';
import { notificationApi } from '../../api/notificationApi';

const POLL_INTERVAL_MS = 10000;

function formatNotificationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
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
      if (notification.requestId) {
        navigate(`/requests/${notification.requestId}`);
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
            <strong>Thông báo</strong>
            <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
              Đánh dấu đã đọc
            </button>
          </div>

          {loading ? <p className="notification-state">Đang tải...</p> : null}
          {error ? <p className="notification-state notification-error">{error}</p> : null}
          {!loading && !error && notifications.length === 0 ? (
            <p className="notification-state">Chưa có thông báo.</p>
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
                  <span className="notification-item-title">{notification.title}</span>
                  <span className="notification-item-message">{notification.message}</span>
                  <span className="notification-item-time">{formatNotificationTime(notification.createdAt)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
