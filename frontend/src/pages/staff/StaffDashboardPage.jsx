import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/requestUi';
import { useAuth } from '../../context/AuthContext';

function getAssignmentDisplayStatus(assignment) {
  return assignment?.requestDetail?.status || assignment?.status;
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashboardData, assignmentList] = await Promise.all([
          companyApi.getStaffDashboard(),
          companyApi.getMyAssignments(),
        ]);
        const detailedAssignments = await Promise.all(
          assignmentList.map(async (assignment) => {
            if (assignment.status === 'REJECTED') {
              return assignment;
            }
            try {
              const requestDetail = await companyApi.getRequestDetail(assignment.requestId);
              return { ...assignment, requestDetail };
            } catch {
              return assignment;
            }
          }),
        );
        setDashboard(dashboardData);
        setAssignments(detailedAssignments);
      } catch {
        // Keep the dashboard shell rendered even if the data is temporarily unavailable.
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const activeAssignments = useMemo(() => assignments.slice(0, 6), [assignments]);

  return (
    <>
      {!loading ? (
        <>
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <div className="welcome-content">
              <h1>Welcome back, {user?.fullName || 'Staff'}! 👋</h1>
              <p>Here is what's happening with your rescue tasks today.</p>
            </div>
            <div className="welcome-illustration">
              <div className="pulse-ring"></div>
              <ClipboardList size={48} className="illustration-icon" />
            </div>
          </div>

          {/* Stats Overview */}
          <div className="premium-stats-grid">
            <StatCard className="stat-card-custom stat-total" label="Total Assignments" value={dashboard?.totalAssignments ?? 0} icon={<ClipboardList size={22} />} />
            <StatCard className="stat-card-custom stat-active" label="Active Assignments" value={dashboard?.activeAssignments ?? 0} icon={<Clock size={22} />} />
            <StatCard className="stat-card-custom stat-completed" label="Completed Assignments" value={dashboard?.completedAssignments ?? 0} icon={<CheckCircle size={22} />} />
            <StatCard className="stat-card-custom stat-handling" label="Handling Requests" value={dashboard?.handlingRequests ?? 0} icon={<AlertCircle size={22} />} />
          </div>

          {/* Recent Tasks */}
          <div className="premium-section-card">
            <div className="section-header">
              <h2>Recent Tasks</h2>
              <Link className="view-all-link" to="/staff/assignments">View all <ArrowRight size={16} /></Link>
            </div>
            {activeAssignments.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={40} className="empty-icon" />
                <p>No assignments found yet. You are all caught up!</p>
              </div>
            ) : (
              <div className="premium-assignments-list">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="premium-assignment-item">
                    <div className="assignment-left">
                      <div className="assignment-item-icon">
                        <ClipboardList size={22} />
                      </div>
                      <div className="assignment-item-content">
                        <strong>{assignment.requestDetail?.requestCode || `REQ-${assignment.requestId}`}</strong>
                        <div className="assignment-meta">
                          <span>{assignment.companyName}</span>
                          <span className="dot-separator">•</span>
                          <span>{formatDateTime(assignment.assignedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="assignment-right">
                      <StatusBadge value={getAssignmentDisplayStatus(assignment)} />
                      {assignment.status !== 'REJECTED' && (
                        <Link className="view-details-btn" to={`/requests/${assignment.requestId}`}>
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      <style>{`
        /* Welcome Banner */
        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          border-radius: 20px;
          padding: 2.5rem 3rem;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: -50%; right: -10%;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
        }

        .welcome-content {
          position: relative;
          z-index: 1;
        }

        .welcome-content h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .welcome-content p {
          margin: 0;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .welcome-illustration {
          position: relative;
          width: 80px; height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          z-index: 1;
        }

        .illustration-icon {
          color: white;
        }

        .pulse-ring {
          position: absolute;
          width: 100%; height: 100%;
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          animation: pulseBanner 2s infinite;
        }

        @keyframes pulseBanner {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        /* Premium Stats Grid */
        .premium-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card-custom {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .stat-card-custom:hover {
          transform: translateY(-3px);
        }

        .stat-card-custom .stat-card-label {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 0.5rem;
          z-index: 1;
        }

        .stat-card-custom .stat-card-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          z-index: 1;
        }

        .stat-card-custom .stat-card-icon-wrap {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          padding: 0.5rem;
          border-radius: 12px;
          background: #f8fafc;
          color: #94a3b8;
          z-index: 1;
        }

        .stat-total .stat-card-icon-wrap { color: #3b82f6; background: #eff6ff; }
        .stat-active .stat-card-icon-wrap { color: #f59e0b; background: #fffbeb; }
        .stat-completed .stat-card-icon-wrap { color: #10b981; background: #ecfdf5; }
        .stat-handling .stat-card-icon-wrap { color: #ef4444; background: #fef2f2; }

        /* Recent Tasks Section */
        .premium-section-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.75rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #2563eb;
        }

        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
          color: #64748b;
        }

        .empty-state .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .premium-assignments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .premium-assignment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background: #f8fafc;
          border-radius: 14px;
          border: 1px solid transparent;
          transition: all 0.3s ease;
        }

        .premium-assignment-item:hover {
          background: #ffffff;
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .assignment-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .assignment-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .assignment-item-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .assignment-item-content strong {
          display: block;
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.2rem;
        }

        .assignment-meta {
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dot-separator {
          color: #cbd5e1;
        }

        .view-details-btn {
          padding: 0.55rem 1.25rem;
          border-radius: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          color: #0f172a;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .view-details-btn:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        @media (max-width: 768px) {
          .premium-assignment-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .assignment-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
}
