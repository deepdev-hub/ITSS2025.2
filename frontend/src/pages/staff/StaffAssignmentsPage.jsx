import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
  Truck,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getAllowedStatusOptions } from '../../utils/requestUi';

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const activeAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === activeAssignmentId) || null,
    [assignments, activeAssignmentId],
  );

  const statusOptions = useMemo(
    () => getAllowedStatusOptions('RESCUE_STAFF', requestDetail?.status),
    [requestDetail?.status],
  );

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const assignmentList = await companyApi.getMyAssignments();
      setAssignments(assignmentList);
      setActiveAssignmentId((previous) => {
        if (previous && assignmentList.some((item) => item.id === previous)) {
          return previous;
        }
        return assignmentList[0]?.id ?? null;
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetail = async (requestId) => {
    if (!requestId) {
      setRequestDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      setRequestDetail(await requestApi.getRequestDetail(requestId));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (activeAssignment?.requestId) {
      loadRequestDetail(activeAssignment.requestId);
    } else {
      setRequestDetail(null);
    }
  }, [activeAssignment?.requestId]);

  useEffect(() => {
    if (!requestDetail) return;
    const nextStatusOptions = getAllowedStatusOptions('RESCUE_STAFF', requestDetail.status);
    setStatusForm((previous) => ({
      status: nextStatusOptions.includes(previous.status) ? previous.status : (nextStatusOptions[0] || previous.status),
      note: previous.note,
    }));
  }, [requestDetail]);

  // --- QUICK ACTION LOGIC (ACCEPT / REJECT) ---
  const handleQuickAction = async (statusAction) => {
    // SỬ DỤNG ID CỦA ASSIGNMENT ĐỂ TRÁNH LỖI PHÂN QUYỀN
    if (!activeAssignment?.id) return;
    setBusyAction('quick');
    setNotice('');
    setError('');
    try {
      if (statusAction === 'ACCEPTED') {
        // Gọi API Accept dành riêng cho Assignment
        await companyApi.acceptAssignment(activeAssignment.id);
        setNotice('✅ Request accepted successfully! Please proceed to the location.');
      } else {
        // Gọi API Reject dành riêng cho Assignment
        await companyApi.rejectAssignment(activeAssignment.id);
        setNotice('❌ You have rejected the request.');
      }
      
      await loadAssignments();
      await loadRequestDetail(activeAssignment.requestId);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  // --- REGULAR STATUS UPDATE LOGIC ---
  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!activeAssignment?.requestId) return;
    setBusyAction('status');
    setNotice('');
    setError('');
    try {
      await requestApi.updateStatus(activeAssignment.requestId, statusForm);
      setNotice('Status updated successfully.');
      await loadAssignments();
      await loadRequestDetail(activeAssignment.requestId);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  if (loading) return <Loader label="Loading your assignments..." />;

  return (
    <>
      <PageHeader title="My Assignments" subtitle="Check assigned requests, confirm attendance, and update rescue progress." />

      {notice && <div className="notice success">{notice}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="grid-two">
        {/* LEFT COLUMN: ASSIGNMENT LIST */}
        <div className="card">
          <h2><ClipboardList size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Assigned Requests</h2>
          {assignments.length === 0 ? (
            <p className="muted-line">You have no assigned rescue requests at the moment.</p>
          ) : (
            <div className="assignments-list">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`assignment-card ${activeAssignmentId === assignment.id ? 'active' : ''}`}
                  style={{ background: assignment.status === 'PENDING' ? '#fff9e6' : '#f8f9fa' }}
                  onClick={() => setActiveAssignmentId(assignment.id)}
                >
                  <div className="assignment-card-header">
                    <div className="assignment-card-icon">
                      <Truck size={24} />
                    </div>
                    <div className="assignment-card-info">
                      <strong>{assignment.vehicleCode || 'Rescue Vehicle'}</strong>
                      <div className="muted-line">
                        {formatDateTime(assignment.assignedAt)}
                      </div>
                    </div>
                    <StatusBadge value={assignment.status} />
                  </div>
                  <div className="assignment-card-footer">
                    <Clock size={16} style={{ marginRight: '4px' }} />
                    <Countdown expiresAt={assignment.expiresAt} status={assignment.status} label="" />
                    <button
                      className={`button button-sm ${activeAssignmentId === assignment.id ? 'button-primary' : 'button-secondary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAssignmentId(assignment.id);
                      }}
                    >
                      {activeAssignmentId === assignment.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS & ACTIONS */}
        <div className="card">
          <h2><ClipboardList size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Request Detail</h2>
          {detailLoading ? <Loader label="Loading details..." /> : null}
          {!detailLoading && !activeAssignment ? <p className="muted-line">Please select an assignment from the left to view details.</p> : null}

          {!detailLoading && activeAssignment && requestDetail ? (
            <>
              {/* ALERT BOX FOR PENDING ASSIGNMENTS */}
              {activeAssignment.status === 'PENDING' && (
                <div className="alert-box">
                  <h3><Clock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />NEW RESCUE DISPATCH</h3>
                  <p>You have been assigned a new rescue request. Please confirm before the timer runs out, otherwise it will be automatically reassigned to another staff.</p>
                  <div className="countdown-highlight">
                    <Countdown expiresAt={activeAssignment.expiresAt} status={activeAssignment.status} />
                  </div>
                  <div className="actions-row" style={{ marginTop: '15px' }}>
                    <button
                      className="button button-primary"
                      style={{ flex: 1, padding: '12px', fontSize: '1.1rem' }}
                      disabled={busyAction === 'quick'}
                      onClick={() => handleQuickAction('ACCEPTED')}
                    >
                      <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      {busyAction === 'quick' ? 'Processing...' : 'Accept Request'}
                    </button>
                    <button
                      className="button button-danger"
                      disabled={busyAction === 'quick'}
                      onClick={() => handleQuickAction('REJECTED')}
                    >
                      <XCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* GENERAL INFO */}
              <div className="info-grid" style={{ marginTop: '20px' }}>
                <div className="info-item">
                  <span><User size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Customer</span>
                  <strong>{requestDetail.customer?.fullName || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Status</span>
                  <strong><StatusBadge value={activeAssignment.status} /></strong>
                </div>
                <div className="info-item">
                  <span>Incident Type</span>
                  <strong>{requestDetail.incidentType?.name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Plate Number</span>
                  <strong>{activeAssignment.vehiclePlateNumber || requestDetail.vehicle?.plateNumber || 'N/A'}</strong>
                </div>
              </div>

              <div className="field">
                <label><MapPin size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Incident Location</label>
                <textarea value={requestDetail.location?.fullAddress || 'No location data provided.'} disabled rows={2} />
              </div>

              {/* PROGRESS UPDATE FORM (HIDDEN IF PENDING) */}
              {activeAssignment.status !== 'PENDING' && (
                <>
                  {statusOptions.length > 0 ? (
                    <form className="card card-muted" onSubmit={handleStatusUpdate}>
                      <h3><CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Update Progress</h3>
                      <div className="form-grid">
                        <div className="field">
                          <label>Update Status</label>
                          <select
                            value={statusForm.status}
                            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Note</label>
                          <input
                            value={statusForm.note}
                            onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                            placeholder="Optional field update"
                          />
                        </div>
                      </div>
                      <button className="button button-primary" type="submit" disabled={busyAction === 'status'}>
                        {busyAction === 'status' ? 'Updating...' : 'Update progress'}
                      </button>
                    </form>
                  ) : (
                    <p className="muted-line">This request is already finalized, so no further status change is available.</p>
                  )}
                </>
              )}

              <div className="actions-row" style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <Link className="button button-secondary" to={`/requests/${activeAssignment.requestId}`}>
                  <ArrowRight size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Open request detail
                </Link>
                <span className="muted-line">Use request detail for chat, quote, payment, and full history.</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <style>{`
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .assignment-card {
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }
        .assignment-card:hover {
          background: #e9ecef !important;
        }
        .assignment-card.active {
          border-color: var(--primary, #667eea);
          background: white !important;
        }
        .assignment-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .assignment-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .assignment-card-info {
          flex: 1;
        }
        .assignment-card-info strong {
          display: block;
          margin-bottom: 0.25rem;
        }
        .assignment-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        .alert-box {
          background: #fff3cd;
          border-left: 5px solid #ffc107;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .alert-box h3 { margin-top: 0; color: #856404; font-size: 1.2rem; }
        .alert-box p { color: #664d03; margin-bottom: 10px; font-size: 0.95rem; line-height: 1.5; }
        .countdown-highlight { font-size: 1.2rem; font-weight: bold; color: #dc3545; background: white; padding: 5px 10px; border-radius: 4px; display: inline-block;}
        .button-danger { background-color: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;}
        .button-danger:hover { background-color: #c82333; }
        .button-danger:disabled { opacity: 0.6; cursor: not-allowed; }
        .button-sm { padding: 0.5rem 1rem; font-size: 0.9rem; }
      `}</style>
    </>
  );
}