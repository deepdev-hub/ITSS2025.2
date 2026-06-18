import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';
import './ChatModal.css';

const CHAT_POLL_INTERVAL_MS = 2500;

function normalizeMessages(items = []) {
  const byId = new Map();
  [...items]
    .sort((left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime())
    .forEach((item) => {
      byId.set(item.id, item);
    });
  return Array.from(byId.values());
}

function formatMessageTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPeerName(staffName, companyName) {
  return staffName || companyName || 'Rescue Team';
}

export default function ChatModal({ isOpen, onClose, requestId, companyName, staffName }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const messagesEndRef = useRef(null);
  const refreshInFlightRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(async ({ silent = false } = {}) => {
    if (!isOpen || !requestId || refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    if (!silent) {
      setLoading(true);
    }
    setError('');

    try {
      const requestMessages = await requestApi.getMessages(requestId);
      setMessages(normalizeMessages(requestMessages));
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      refreshInFlightRef.current = false;
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isOpen, requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setNewMessage('');
    setError('');

    if (!requestId) {
      setMessages([]);
      setLoading(false);
      setLastSyncedAt(null);
      return undefined;
    }

    loadMessages();
    const intervalId = window.setInterval(() => {
      loadMessages({ silent: true });
    }, CHAT_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isOpen, loadMessages, requestId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!requestId || !content) return;

    setSending(true);
    setError('');

    try {
      const sentMessage = await requestApi.sendMessage(requestId, { content });
      setMessages((previous) => normalizeMessages([...previous, sentMessage]));
      setNewMessage('');
      setLastSyncedAt(new Date().toISOString());
      loadMessages({ silent: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSending(false);
    }
  };

  const peerName = getPeerName(staffName, companyName);
  const canSend = Boolean(requestId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chat with ${peerName}`}
      size="medium"
      footer={null}
    >
      <div className="chat-modal-container">
        <div className="chat-status">
          {requestId ? (
            <span>
              {loading ? 'Loading messages...' : `Live refresh every ${CHAT_POLL_INTERVAL_MS / 1000}s`}
              {lastSyncedAt ? ` - Last sync ${formatMessageTime(lastSyncedAt)}` : ''}
            </span>
          ) : (
            <span>Open an assigned rescue request to chat directly with the rescue staff.</span>
          )}
        </div>

        {error ? <div className="chat-error">{error}</div> : null}

        <div className="chat-messages">
          {!requestId ? (
            <div className="chat-empty">No active request selected.</div>
          ) : null}

          {requestId && !loading && messages.length === 0 ? (
            <div className="chat-empty">No messages yet. Start the conversation with the assigned rescue staff.</div>
          ) : null}

          {messages.map((msg) => {
            const isOwnMessage = msg.senderId === user?.id;
            const senderName = isOwnMessage ? 'You' : (msg.senderName || peerName);

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isOwnMessage ? 'own' : ''}`}
              >
                <div className={`chat-bubble ${isOwnMessage ? 'own' : ''}`}>
                  <div className="chat-sender">
                    <span>{senderName}</span>
                    {msg.senderRole ? <span className="chat-role-pill">{msg.senderRole}</span> : null}
                  </div>
                  <div className="chat-text">{msg.content}</div>
                  <div className="chat-time">
                    {formatMessageTime(msg.sentAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            disabled={sending || !canSend}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={sending || !canSend || !newMessage.trim()}
            style={{ borderRadius: '12px', padding: '0.6rem 1rem' }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
}
