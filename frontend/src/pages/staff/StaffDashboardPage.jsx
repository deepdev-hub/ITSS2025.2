import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  MapPin,
  User,
  MessageCircle,
  Settings,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/requestUi';

export default function StaffDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const [dashboardData, assignmentList] = await Promise.all([
          companyApi.getStaffDashboard(),
          companyApi.getMyAssignments(),
        ]);
        setDashboard(dashboardData);
        setAssignments(assignmentList);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const activeAssignments = useMemo(() => assignments.slice(0, 6), [assignments]);

  return (
    <>
      <PageHeader
        title="Staff Dashboard"
        subtitle="Quick access to your tasks and assignments"
      />
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading staff dashboard..." /> : null}

      {!loading ? (
        <>
          {/* Quick Action Cards */}
          <div className="quick-actions-grid">
            <Link className="action-card" to="/staff/assignments">
              <div className="action-card-icon">
                <ClipboardList size={32} />
              </div>
              <div className="action-card-content">
                <h3>My Assignments</h3>
                <p className="muted-line">View and manage your rescue tasks</p>
              </div>
              <ArrowRight className="action-card-arrow" size={20} />
            </Link>

            <Link className="action-card" to="/staff/location">
              <div className="action-card-icon">
                <MapPin size={32} />
              </div>
              <div className="action-card-content">
                <h3>Update Location</h3>
                <p className="muted-line">Set your current location</p>
              </div>
              <ArrowRight className="action-card-arrow" size={20} />
            </Link>

            <Link className="action-card" to="/profile">
              <div className="action-card-icon">
                <User size={32} />
              </div>
              <div className="action-card-content">
                <h3>My Profile</h3>
                <p className="muted-line">View and edit your profile</p>
              </div>
              <ArrowRight className="action-card-arrow" size={20} />
            </Link>

            <Link className="action-card" to="/profile?tab=security">
              <div className="action-card-icon">
                <Settings size={32} />
              </div>
              <div className="action-card-content">
                <h3>Settings</h3>
                <p className="muted-line">Configure your preferences</p>
              </div>
              <ArrowRight className="action-card-arrow" size={20} />
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="stats-grid">
            <StatCard label="Total Assignments" value={dashboard?.totalAssignments ?? 0} icon={<ClipboardList size={20} />} />
            <StatCard label="Active Assignments" value={dashboard?.activeAssignments ?? 0} icon={<Clock size={20} />} />
            <StatCard label="Completed Assignments" value={dashboard?.completedAssignments ?? 0} icon={<CheckCircle size={20} />} />
            <StatCard label="Handling Requests" value={dashboard?.handlingRequests ?? 0} icon={<AlertCircle size={20} />} />
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <h2>Recent Tasks</h2>
            {activeAssignments.length === 0 ? (
              <p className="muted-line">No assignments found yet.</p>
            ) : (
              <div className="assignments-list">
                {activeAssignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-item">
                    <div className="assignment-item-icon">
                      <ClipboardList size={24} />
                    </div>
                    <div className="assignment-item-content">
                      <strong>{assignment.vehicleCode || 'Rescue Vehicle'}</strong>
                      <div className="muted-line">
                        {assignment.companyName} - {formatDateTime(assignment.assignedAt)}
                      </div>
                      <StatusBadge value={assignment.status} />
                    </div>
                    <div className="assignment-item-actions">
                      <Link className="button button-secondary button-sm" to={`/requests/${assignment.requestId}`}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      <style>{`
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: var(--primary, #667eea);
        }
        .action-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .action-card-content {
          flex: 1;
        }
        .action-card-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          color: #333;
        }
        .action-card-content p {
          margin: 0;
          font-size: 0.9rem;
        }
        .action-card-arrow {
          color: #999;
          transition: transform 0.3s ease;
        }
        .action-card:hover .action-card-arrow {
          transform: translateX(4px);
          color: var(--primary, #667eea);
        }
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .assignment-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .assignment-item:hover {
          background: #e9ecef;
        }
        .assignment-item-icon {
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
        .assignment-item-content {
          flex: 1;
        }
        .assignment-item-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }
        .assignment-item-actions {
          flex-shrink: 0;
        }
        .button-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}
