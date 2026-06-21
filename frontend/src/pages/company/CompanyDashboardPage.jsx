import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Star,
  Truck,
  Users,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

function WorkloadChart({ dashboard }) {
  const assigned = dashboard?.assignedRequests ?? 0;
  const inProgress = dashboard?.inProgressRequests ?? 0;
  const total = assigned + inProgress;

  const data = total > 0 ? [
    { name: 'Assigned', value: assigned, color: '#f59e0b' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
  ] : [
    { name: 'No active requests', value: 1, color: '#e2e8f0' }
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '350px' }}>
      <div style={{ marginBottom: '1rem' }}>
         <h2 style={{ margin: 0 }}>Active Workload</h2>
         <p className="muted-line" style={{ margin: 0 }}>Requests currently active: {total}</p>
      </div>
      <div style={{ flex: 1, minHeight: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={total > 0 ? ({ name, value }) => `${name}: ${value}` : false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {total > 0 && <RechartsTooltip />}
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CompanyDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, reviewList, requestList] = await Promise.all([
        companyApi.getDashboard(),
        companyApi.getReviews(),
        companyApi.getRequests(),
      ]);
      setDashboard(dashboardData);
      setReviews(reviewList);
      setRequests(requestList);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const highlightedRequests = useMemo(() => requests.slice(0, 8), [requests]);
  const highlightedReviews = useMemo(() => reviews.slice(0, 5), [reviews]);

  return (
    <>
      <PageHeader
        icon={<LayoutDashboard size={22} />}
        eyebrow="Rescue Company"
        title="Company Dashboard"
        subtitle="Track assigned rescue work, dispatch resources quickly, and review customer feedback from one place."
      />

      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading company dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="grid-two" style={{ marginBottom: '1.5rem', alignItems: 'stretch' }}>
            <WorkloadChart dashboard={dashboard} />
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <h2 style={{ marginBottom: '1rem' }}>Quick Stats</h2>
               <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  <StatCard label="Total Quotes" value={dashboard?.totalQuotes ?? 0} icon={<FileText size={20} />} variant="info" />
                  <StatCard label="Pending Quotes" value={dashboard?.pendingQuotes ?? 0} icon={<FileText size={20} />} variant="warning" />
                  <StatCard label="Total Reviews" value={dashboard?.totalReviews ?? 0} icon={<Star size={20} />} variant="success" />
                  <StatCard label="Staff" value={dashboard?.totalStaff ?? 0} icon={<Users size={20} />} />
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <h2>Assigned Requests</h2>
              {highlightedRequests.length === 0 ? (
                <p>No requests have been assigned to this company yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Incident / Service</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {highlightedRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <strong>{request.requestCode}</strong>
                            <div className="muted-line">{request.customerName}</div>
                          </td>
                          <td>
                            <strong>{request.incidentTypeName}</strong>
                            <div className="muted-line">{request.serviceTypeName || 'Service not selected'}</div>
                          </td>
                          <td>{getRequestLocationLabel(request)}</td>
                          <td><StatusBadge value={request.status} /></td>
                          <td>{formatDateTime(request.createdAt)}</td>
                          <td>
                            <div className="actions-row">
                              <Link className="button button-secondary" to={`/requests/${request.id}`}>
                                View detail
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

            <div className="card">
              <h2>Recent Reviews</h2>
              {highlightedReviews.length === 0 ? (
                <p>No customer reviews yet.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highlightedReviews.map((review) => (
                        <tr key={review.id}>
                          <td>#{review.requestId}</td>
                          <td>{review.customerName}</td>
                          <td><StatusBadge value={`${review.ratingScore}/5`} /></td>
                          <td>{review.comment || 'No comment provided'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
