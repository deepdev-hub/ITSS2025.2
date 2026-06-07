import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import Modal from './Modal';
import './ChatModal.css';

export default function ChatModal({ isOpen, onClose, requestId, companyName, staffName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate loading messages for the request
  useEffect(() => {
    if (isOpen && requestId) {
      // In a real app, you would load messages from the API
      setMessages([
        {
          id: 1,
          sender: 'You',
          text: 'Xin chào, tôi cần hỗ trợ cứu hộ khẩn cấp',
          timestamp: new Date(Date.now() - 5 * 60000),
          isCustomer: true,
        },
        {
          id: 2,
          sender: staffName || 'Đội cứu hộ',
          text: 'Chúng tôi đã nhận được yêu cầu của bạn. Chúng tôi sẽ có mặt trong 15 phút.',
          timestamp: new Date(Date.now() - 4 * 60000),
          isCustomer: false,
        },
        {
          id: 3,
          sender: staffName || 'Đội cứu hộ',
          text: 'Hiện tại chúng tôi đang trên đường. Vui lòng đứng yên chờ đợi.',
          timestamp: new Date(Date.now() - 2 * 60000),
          isCustomer: false,
        },
      ]);
    }
  }, [isOpen, requestId, staffName]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    // Add message to local state
    const userMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: newMessage.trim(),
      timestamp: new Date(),
      isCustomer: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // Simulate API call
    setTimeout(() => {
      const replyMessages = [
        'Cảm ơn bạn đã thông báo. Chúng tôi sẽ xử lý ngay.',
        'Chúng tôi đang kiểm tra thông tin của bạn.',
        'Có gì tôi có thể giúp thêm không?',
        'Chúng tôi sẽ liên lạc với bạn ngay.',
      ];
      const randomReply =
        replyMessages[Math.floor(Math.random() * replyMessages.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: staffName || 'Đội cứu hộ',
          text: randomReply,
          timestamp: new Date(),
          isCustomer: false,
        },
      ]);
      setSending(false);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chat với ${companyName || 'Đội cứu hộ'}`}
      size="medium"
      footer={null}
    >
      <div className="chat-modal-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message-row ${msg.isCustomer ? 'own' : ''}`}
            >
              <div className={`chat-bubble ${msg.isCustomer ? 'own' : ''}`}>
                <div className="chat-sender">{msg.sender}</div>
                <div className="chat-text">{msg.text}</div>
                <div className="chat-time">
                  {msg.timestamp.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="chat-input"
            disabled={sending}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={sending || !newMessage.trim()}
            style={{ borderRadius: '12px', padding: '0.6rem 1rem' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </Modal>
  );
}
