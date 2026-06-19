import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Truck,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { formatDateTime, getAllowedStatusOptions } from '../../utils/requestUi';

function AssignmentCard({ assignment, onQuickAction, busyAction, activeAssignmentId, setActiveAssignmentId }) {
  const { requestDetail } = assignment;

  const plateNumber = assignment.vehiclePlateNumber || requestDetail?.vehicle?.plateNumber || 'N/A';
  const customerName = requestDetail?.customer?.fullName || 'N/A';
  const incidentName = requestDetail?.incidentType?.name || 'N/A';
  const location = requestDetail?.location?.fullAddress || 'No location data provided.';
  const isExpanded = assignment.id === activeAssignmentId;
  const isPending = assignment.status === 'PENDING';
  const isBusyQuick = busyAction === 'quick-' + assignment.id;


  return (
    <div className={`premium-assignment-card ${isExpanded ? 'expanded' : ''} ${isPending ? 'pending' : ''}`}>
      <div className="pac-header" onClick={() => setActiveAssignmentId(isExpanded ? null : assignment.id)}>
        <div className="pac-header-left">
          <div className="pac-icon">
            <Truck size={24} />
          </div>
          <div className="pac-info-grid">
            <div className="pac-info-item">
              <h3>{plateNumber}</h3>
              <span className="pac-date"><Clock size={14} /> {formatDateTime(assignment.assignedAt)}</span>
            </div>
            <div className="pac-info-item">
              <label>Customer</label>
              <strong>{customerName}</strong>
            </div>
            <div className="pac-info-item">
              <label>Incident</label>
              <strong>{incidentName}</strong>
            </div>
          </div>
        </div>
        <div className="pac-header-right" onClick={(e) => e.stopPropagation()}>
          <StatusBadge value={assignment.status} />
          {assignment.status !== 'REJECTED' && (
            <Link className="button pac-btn-outline" to={`/requests/${assignment.requestId}`}>
              Open Detail <ArrowRight size={14} />
            </Link>
          )}
          <div className={`pac-expand-icon ${isExpanded ? 'rotated' : ''}`} onClick={() => setActiveAssignmentId(isExpanded ? null : assignment.id)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="pac-body">
          <div className="pac-body-grid">
            <div className="pac-location-section">
              <label><MapPin size={16} /> Incident Location</label>
              <div className="pac-location-box">
                {location}
              </div>

            </div>

            {isPending && (
              <div className="pac-action-section">
                <div className="pac-alert-box">
                  <h4><Clock size={18} /> NEW DISPATCH</h4>
                  <p>You have been assigned a new rescue request. Confirm before the timer runs out.</p>
                  <div className="pac-countdown">
                    <Countdown expiresAt={assignment.expiresAt} status={assignment.status} />
                  </div>
                  <div className="pac-action-buttons">
                    <button className="button pac-btn-accept" disabled={isBusyQuick} onClick={() => onQuickAction(assignment, 'ACCEPTED')}>
                      <CheckCircle size={18} /> Accept
                    </button>
                    <button className="button pac-btn-reject" disabled={isBusyQuick} onClick={() => onQuickAction(assignment, 'REJECTED')}>
                      <XCircle size={18} /> Reject
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const assignmentList = await companyApi.getMyAssignments();
      
      const detailedAssignments = await Promise.all(
        assignmentList.map(async (assignment) => {
          if (assignment.status === 'REJECTED') {
            return assignment;
          }
          try {
            const reqDetail = await requestApi.getRequestDetail(assignment.requestId);
            return { ...assignment, requestDetail: reqDetail };
          } catch (err) {
            if (err?.response?.status !== 403) {
              console.error('Failed to load detail for request', assignment.requestId, err);
            }
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

  const handleQuickAction = async (assignment, statusAction) => {
    if (!assignment?.id) return;
    setBusyAction(`quick-${assignment.id}`);
    setNotice('');
    setError('');
    try {
      if (statusAction === 'ACCEPTED') {
        await companyApi.acceptAssignment(assignment.id);
        setNotice('Request accepted successfully. Please proceed to the location.');
      } else {
        await companyApi.rejectAssignment(assignment.id);
        setNotice('You have rejected the request.');
      }
      await loadAssignments();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [assignments]);

  if (loading) return <Loader label="Loading your assignments..." />;

  const totalPages = Math.ceil(assignments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAssignments = assignments.slice(startIndex, startIndex + pageSize);

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
            {paginatedAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment} 
                onQuickAction={handleQuickAction}
                busyAction={busyAction}
                activeAssignmentId={activeAssignmentId}
                setActiveAssignmentId={setActiveAssignmentId}
              />
            ))}
            {assignments.length > 0 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            )}
          </div>
        )}
      </div>

      <style>{`
        .premium-assignment-card {
          padding: 0;
          overflow: hidden;
          margin-bottom: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .premium-assignment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }
        .premium-assignment-card.expanded {
          border: 1px solid rgba(102, 126, 234, 0.3);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
        }
        .premium-assignment-card.pending {
          border: 1px solid rgba(255, 193, 7, 0.4);
        }
        
        .pac-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .premium-assignment-card.expanded .pac-header {
          background: linear-gradient(to right, rgba(248, 250, 255, 0.8), rgba(255, 255, 255, 1));
        }
        .premium-assignment-card.pending .pac-header {
          background: linear-gradient(to right, rgba(255, 252, 242, 0.8), rgba(255, 255, 255, 1));
        }
        .pac-header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }
        .pac-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .premium-assignment-card.pending .pac-icon {
          background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
          box-shadow: 0 4px 15px rgba(253, 160, 133, 0.3);
          color: white;
        }
        .pac-info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2.5rem;
          flex: 1;
          align-items: center;
        }
        .pac-info-item h3 {
          margin: 0 0 0.4rem 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -0.02em;
        }
        .pac-date {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          font-weight: 500;
        }
        .pac-info-item label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 0.3rem;
          font-weight: 600;
        }
        .pac-info-item strong {
          font-size: 0.95rem;
          color: #334155;
          font-weight: 600;
        }
        
        .pac-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .pac-btn-outline {
          background: transparent !important;
          border: 1px solid #e2e8f0 !important;
          color: #475569 !important;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .pac-btn-outline:hover {
          background: #f8fafc !important;
          border-color: #cbd5e1 !important;
          color: #0f172a !important;
        }
        .pac-expand-icon {
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .pac-expand-icon:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .pac-expand-icon.rotated {
          transform: rotate(180deg);
        }
        
        .pac-body {
          border-top: 1px solid #f1f5f9;
          padding: 1.5rem;
          background: #fafafc;
          animation: slideDown 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pac-body-grid {
          display: grid;
          gap: 1.5rem;
        }
        .premium-assignment-card.pending .pac-body-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        
        .pac-location-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .pac-location-section > label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #334155;
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .pac-location-box {
          color: #475569;
          line-height: 1.6;
          font-size: 0.95rem;
          background: rgba(102, 126, 234, 0.05);
          padding: 1rem 1.25rem;
          border-radius: 8px;
          border-left: 3px solid #667eea;
        }
        
        .pac-quick-note {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          border: 1px solid #f1f5f9;
        }
        .pac-quick-note h4 {
          font-size: 0.9rem;
          color: #334155;
          margin: 0 0 0.3rem 0;
          font-weight: 600;
        }
        .pac-quick-note p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }
        
        .pac-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
          color: white !important;
          transition: all 0.3s ease !important;
        }
        .pac-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(102, 126, 234, 0.4) !important;
          color: white !important;
        }
        
        .pac-alert-box {
          background: linear-gradient(145deg, #fffcf2 0%, #fff9e6 100%);
          border: 1px solid #ffecb3;
          border-left: 4px solid #f6d365;
          padding: 1.5rem;
          border-radius: 12px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(246, 211, 101, 0.1);
        }
        .pac-alert-box h4 {
          margin: 0 0 0.5rem 0;
          color: #b07d12;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }
        .pac-alert-box p {
          color: #8c6d1f;
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .pac-countdown {
          font-size: 1.2rem;
          font-weight: bold;
          color: #e11d48;
          margin-bottom: 1.25rem;
          background: #fff;
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #ffe4e6;
          box-shadow: 0 2px 4px rgba(225, 29, 72, 0.05);
        }
        .pac-action-buttons {
          display: flex;
          gap: 1rem;
        }
        .pac-btn-accept {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
          padding: 0.75rem !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          border: none !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
          transition: all 0.2s ease !important;
        }
        .pac-btn-accept:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4) !important;
          color: white !important;
        }
        .pac-btn-reject {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: transparent !important;
          border: 1px solid #e11d48 !important;
          color: #e11d48 !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .pac-btn-reject:hover {
          background: #fff1f2 !important;
        }

        @media (max-width: 768px) {
          .pac-header-left {
            flex-direction: column;
            align-items: flex-start;
          }
          .pac-info-grid {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .pac-header-right {
            flex-direction: column;
            align-items: flex-end;
          }
          .pac-action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
