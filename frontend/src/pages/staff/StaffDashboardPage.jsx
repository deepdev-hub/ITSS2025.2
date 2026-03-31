import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
        subtitle="Track your own assignments, open task detail quickly, and continue rescue communication from the linked request."
        actions={<Link className="button button-secondary" to="/staff/assignments">Open all assignments</Link>}
      />
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading staff dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="stats-grid">
            <StatCard label="Total Assignments" value={dashboard?.totalAssignments ?? 0} />
            <StatCard label="Active Assignments" value={dashboard?.activeAssignments ?? 0} />
            <StatCard label="Completed Assignments" value={dashboard?.completedAssignments ?? 0} />
            <StatCard label="Handling Requests" value={dashboard?.handlingRequests ?? 0} />
          </div>

          <div className="card">
            <h2>Recent Tasks</h2>
            {activeAssignments.length === 0 ? (
              <p>No assignments found yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th>Assigned At</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {activeAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>{assignment.companyName}</td>
                        <td>{assignment.vehicleCode || 'N/A'}</td>
                        <td><StatusBadge value={assignment.status} /></td>
                        <td>{formatDateTime(assignment.assignedAt)}</td>
                        <td>
                          <div className="actions-row">
                            <Link className="button button-secondary" to="/staff/assignments">
                              Open task board
                            </Link>
                            <Link className="button button-secondary" to={`/requests/${assignment.requestId}`}>
                              Request detail
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}
