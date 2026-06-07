import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FilePlus2,
  History,
  MapPin,
  PhoneCall,
  MessageCircle,
  Truck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Alert from '../../components/common/Alert';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import ChatModal from '../../components/common/ChatModal';
import { canCustomerCancel, formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionId, setActionId] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await requestApi.getMyRequests());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId) => {
    setActionId(requestId);
    setError('');
    setNotice('');
    try {
      await requestApi.cancelRequest(requestId, { note: 'Canceled by customer from My Requests page' });
      setNotice('Đã hủy yêu cầu thành công.');
      await loadRequests();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const handleOpenChat = (request) => {
    setChatRequest(request);
    setIsChatOpen(true);
  };

  const activeCount = requests.filter((r) => !['COMPLETED', 'CANCELED'].includes(r.status)).length;

  return (
    <>
      <PageHeader
        title="Lịch sử yêu cầu cứu hộ"
        subtitle="Theo dõi các yêu cầu đang xử lý và xem lại lịch sử cứu hộ trước đây."
        actions={
          <Link className="button button-sos" to="/customer/requests/new">
            <PhoneCall size={18} aria-hidden="true" />
            SOS — Tạo yêu cầu
          </Link>
        }
      />

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card stat-card-info">
          <Clock size={18} style={{ marginRight: '8px' }} />
          <div>
            <span className="stat-card-label">Đang xử lý</span>
            <strong className="stat-card-value">{activeCount}</strong>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle size={18} style={{ marginRight: '8px' }} />
          <div>
            <span className="stat-card-label">Tổng yêu cầu</span>
            <strong className="stat-card-value">{requests.length}</strong>
          </div>
        </div>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Có lỗi xảy ra">{error}</Alert> : null}

      {loading ? <Loader label="Đang tải lịch sử yêu cầu..." /> : null}

      {!loading ? (
        <div className="history-list">
          {requests.length === 0 ? (
            <div className="card empty-state">
              <History size={32} color="var(--primary)" aria-hidden="true" />
              <h2>Chưa có yêu cầu cứu hộ</h2>
              <p className="muted-line">Khi gặp sự cố, nhấn SOS để gửi yêu cầu hỗ trợ ngay.</p>
              <Link className="button button-sos" to="/customer/requests/new">
                <FilePlus2 size={18} aria-hidden="true" />
                Tạo yêu cầu đầu tiên
              </Link>
            </div>
          ) : (
            requests.map((request) => (
              <article key={request.id} className="history-card">
                <div className="history-card-header">
                  <div>
                    <strong>{request.requestCode}</strong>
                    <div className="muted-line">
                      ID #{request.id} · {formatDateTime(request.createdAt)}
                    </div>
                  </div>
                  <div className="history-card-meta">
                    <StatusBadge value={request.priorityLevel} />
                    <StatusBadge value={request.status} />
                  </div>
                </div>

                <div className="wizard-review-grid">
                  <div className="wizard-review-item">
                    <span>
                      <AlertCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Sự cố / Dịch vụ
                    </span>
                    <strong>{request.incidentTypeName}</strong>
                    <div className="muted-line">{request.serviceTypeName || 'Chưa chọn dịch vụ'}</div>
                  </div>
                  <div className="wizard-review-item">
                    <span>
                      <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Vị trí
                    </span>
                    <strong>{getRequestLocationLabel(request)}</strong>
                  </div>
                  <div className="wizard-review-item">
                    <span>
                      <Truck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Đội cứu hộ
                    </span>
                    <strong>{request.assignedCompany?.companyName || 'Đang chờ phân công'}</strong>
                    <Countdown
                      expiresAt={request.expiresAt}
                      status={request.assignmentStatus}
                      label="Còn lại"
                    />
                  </div>
                </div>

                <div className="history-card-actions">
                  <Link className="button button-primary" to={`/requests/${request.id}`}>
                    Theo dõi tiến trình
                  </Link>

                  {request.assignedCompany && (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => handleOpenChat(request)}
                      title="Chat với đội cứu hộ"
                    >
                      <MessageCircle size={16} />
                      Chat
                    </button>
                  )}

                  {canCustomerCancel(request.status) ? (
                    <button
                      className="button button-danger"
                      type="button"
                      disabled={actionId === request.id}
                      onClick={() => handleCancel(request.id)}
                    >
                      {actionId === request.id ? 'Đang hủy...' : 'Hủy yêu cầu'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}

      {chatRequest && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatRequest(null);
          }}
          requestId={chatRequest.id}
          companyName={chatRequest.assignedCompany?.companyName}
          staffName={chatRequest.assignedStaff?.fullName}
        />
      )}
    </>
  );
}
