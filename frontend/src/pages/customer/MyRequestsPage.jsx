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
import Pagination from '../../components/common/Pagination';
import { canCustomerCancel, formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionId, setActionId] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  const handleCancel = async (requestId) => {
    setActionId(requestId);
    setError('');
    setNotice('');
    try {
      await requestApi.cancelRequest(requestId, { note: 'Canceled by customer from My Requests page' });
      setNotice('Request canceled successfully.');
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

  const totalPages = Math.ceil(requests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = requests.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <PageHeader
        icon={<History size={22} />}
        eyebrow="Customer"
        title="Rescue Request History"
        subtitle="Track active requests and review your previous rescue history."
        actions={
          <Link className="button button-sos" to="/customer/requests/new">
            <PhoneCall size={18} aria-hidden="true" />
            SOS - Create Request
          </Link>
        }
      />

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card stat-card-info">
          <Clock size={18} style={{ marginRight: '8px' }} />
          <div>
            <span className="stat-card-label">Active</span>
            <strong className="stat-card-value">{activeCount}</strong>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle size={18} style={{ marginRight: '8px' }} />
          <div>
            <span className="stat-card-label">Total Requests</span>
            <strong className="stat-card-value">{requests.length}</strong>
          </div>
        </div>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Something went wrong">{error}</Alert> : null}

      {loading ? <Loader label="Loading request history..." /> : null}

      {!loading ? (
        <div className="history-list">
          {requests.length === 0 ? (
            <div className="card empty-state">
              <History size={32} color="var(--primary)" aria-hidden="true" />
              <h2>No rescue requests yet</h2>
              <p className="muted-line">When you have a vehicle issue, press SOS to request support right away.</p>
              <Link className="button button-sos" to="/customer/requests/new">
                <FilePlus2 size={18} aria-hidden="true" />
                Create first request
              </Link>
            </div>
          ) : (
            paginatedRequests.map((request) => (
              <article key={request.id} className="history-card">
                <div className="history-card-header">
                  <div>
                    <strong>{request.requestCode}</strong>
                    <div className="muted-line">
                      ID #{request.id} - {formatDateTime(request.createdAt)}
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
                      Incident / Service
                    </span>
                    <strong>{request.incidentTypeName}</strong>
                    <div className="muted-line">{request.serviceTypeName || 'No service selected'}</div>
                  </div>
                  <div className="wizard-review-item">
                    <span>
                      <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Location
                    </span>
                    <strong>{getRequestLocationLabel(request)}</strong>
                  </div>
                  <div className="wizard-review-item">
                    <span>
                      <Truck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Rescue Team
                    </span>
                    <strong>{request.assignedCompany?.companyName || 'Waiting for assignment'}</strong>
                    <Countdown
                      expiresAt={request.expiresAt}
                      status={request.assignmentStatus}
                      label="Remaining"
                    />
                  </div>
                </div>

                <div className="history-card-actions">
                  <Link className="button button-primary" to={`/requests/${request.id}`}>
                    Track progress
                  </Link>

                  {request.assignedCompany && (
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => handleOpenChat(request)}
                      title="Chat with rescue team"
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
                      {actionId === request.id ? 'Canceling...' : 'Cancel request'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          )}
          {requests.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
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
