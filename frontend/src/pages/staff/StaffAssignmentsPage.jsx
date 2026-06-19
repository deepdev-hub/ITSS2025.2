import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  User,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getAllowedStatusOptions } from '../../utils/requestUi';

function AssignmentCard({ assignment, onReload, busyAction, setBusyAction, setNotice, setError, activeAssignmentId, setActiveAssignmentId }) {
  const { requestDetail } = assignment;
  const statusOptions = requestDetail ? getAllowedStatusOptions('RESCUE_STAFF', requestDetail.status) : [];
  


  const plateNumber = assignment.vehiclePlateNumber || requestDetail?.vehicle?.plateNumber || 'N/A';
  const customerName = requestDetail?.customer?.fullName || 'N/A';
  const incidentName = requestDetail?.incidentType?.name || 'N/A';
  const location = requestDetail?.location?.fullAddress || 'No location data provided.';
  const isExpanded = assignment.id === activeAssignmentId;
  const isPending = assignment.status === 'PENDING';
  const isBusyQuick = busyAction === 'quick-' + assignment.id;
  const isBusyStatus = busyAction === 'status-' + assignment.id;

  return (
    <div className={`card assignment-accordion-card ${isExpanded ? 'expanded' : ''}`} style={{ padding: '0', overflow: 'hidden', marginBottom: '1rem', transition: 'all 0.3s ease', border: isExpanded ? '1px solid var(--primary, #667eea)' : '1px solid #e0e0e0' }}>
      
      {/* Accordion Header (Always visible) */}
      <div 
        className="accordion-header" 
        onClick={() => setActiveAssignmentId(isExpanded ? null : assignment.id)}
        style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: isPending ? '#fffcf2' : (isExpanded ? '#f8faff' : '#ffffff') }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: isPending ? '#ffc107' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPending ? '#856404' : 'white', flexShrink: 0 }}>
            <Truck size={22} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', flex: 1, alignItems: 'center' }}>
            <div style={{ minWidth: '150px' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#333' }}>{plateNumber}</h3>
              <div className="muted-line" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', margin: 0 }}>
                <Clock size={14} /> {formatDateTime(assignment.assignedAt)}
              </div>
            </div>
            <div style={{ minWidth: '150px' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Customer</span>
              <strong style={{ fontSize: '0.95rem', color: '#333' }}>{customerName}</strong>
            </div>
            <div style={{ minWidth: '150px' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '0.2rem' }}>Incident</span>
              <strong style={{ fontSize: '0.95rem', color: '#333' }}>{incidentName}</strong>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={(e) => e.stopPropagation()}>
          <StatusBadge value={assignment.status} />
          {assignment.status !== 'REJECTED' && (
            <Link className="button button-secondary" to={`/requests/${assignment.requestId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}>
              Open Detail <ArrowRight size={14} />
            </Link>
          )}
          <div 
            onClick={() => setActiveAssignmentId(isExpanded ? null : assignment.id)}
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: '#666', cursor: 'pointer', padding: '0.25rem' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {/* Accordion Body (Collapsible) */}
      {isExpanded && (
        <div className="accordion-body" style={{ borderTop: '1px solid #eee', padding: '1.5rem', backgroundColor: '#fafafa', animation: 'fadeIn 0.3s ease' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: isPending ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '1.5rem' }}>
            
            {/* Location Section */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                <MapPin size={16} /> Incident Location
              </label>
              <div style={{ color: '#444', lineHeight: '1.5', fontSize: '0.95rem', background: '#f8faff', padding: '1rem', borderRadius: '6px', borderLeft: '3px solid #667eea' }}>
                {location}
              </div>
              {!isPending && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0.25rem 0' }}>Quick Note</h4>
                    <p className="muted-line" style={{ fontSize: '0.85rem', margin: 0 }}>To view full details, update progress, or chat with the customer, please open the full detail page.</p>
                  </div>
                  {assignment.status !== 'REJECTED' && (
                    <Link className="button button-primary" to={`/requests/${assignment.requestId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '6px' }}>
                      Open Full Detail <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Actions Section */}
            {isPending && (
              <div>
                <div className="alert-box" style={{ background: '#fff3cd', border: '1px solid #ffeeba', borderLeft: '4px solid #ffc107', padding: '1.25rem', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} />NEW DISPATCH</h4>
                  <p style={{ color: '#664d03', margin: '0 0 0.75rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>You have been assigned a new rescue request. Confirm before the timer runs out.</p>
                  <div className="countdown-highlight" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc3545', margin: '0.5rem 0' }}>
                    <Countdown expiresAt={assignment.expiresAt} status={assignment.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="button button-primary" style={{ flex: 1, padding: '10px' }} disabled={isBusyQuick} onClick={() => handleQuickAction('ACCEPTED')}>
                      <CheckCircle size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Accept
                    </button>
                    <button className="button button-danger" style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={isBusyQuick} onClick={() => handleQuickAction('REJECTED')}>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const assignmentList = await companyApi.getMyAssignments();
      
      const detailedAssignments = await Promise.all(
        assignmentList.map(async (assignment) => {
          try {
            const reqDetail = await requestApi.getRequestDetail(assignment.requestId);
            return { ...assignment, requestDetail: reqDetail };
          } catch (err) {
            console.error('Failed to load detail for request', assignment.requestId, err);
            return assignment;
          }
        })
      );
      setAssignments(detailedAssignments);
      // Auto expand first one if none selected
      setActiveAssignmentId((prev) => {
        if (prev && detailedAssignments.some(a => a.id === prev)) return prev;
        return detailedAssignments[0]?.id || null;
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  if (loading) return <Loader label="Loading your assignments..." />;

  return (
    <>
      <PageHeader title="My Assignments" subtitle="Check assigned requests, confirm attendance, and update rescue progress." />

      {notice && <div className="notice success">{notice}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="assignments-container" style={{ marginTop: '1.5rem' }}>
        {assignments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ClipboardList size={48} style={{ color: '#ccc', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#666', margin: '0 0 0.5rem' }}>No Assignments</h3>
            <p className="muted-line">You have no assigned rescue requests at the moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {assignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                onReload={loadAssignments}
                busyAction={busyAction}
                setBusyAction={setBusyAction}
                setNotice={setNotice}
                setError={setError}
                activeAssignmentId={activeAssignmentId}
                setActiveAssignmentId={setActiveAssignmentId}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .button-danger:hover { background-color: #c82333; }
        .button-danger:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 768px) {
          .assignment-detail-header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .assignment-detail-header > div:last-child {
            text-align: left;
            margin-top: 1rem;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .assignment-detail-footer {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .assignment-detail-footer .button {
            width: 100%;
            justify-content: center;
            margin-top: 1rem;
          }
        }
      `}</style>
    </>
  );
}
