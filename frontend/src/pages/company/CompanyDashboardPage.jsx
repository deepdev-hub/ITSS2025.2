import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function CompanyDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, []);

  const highlightedRequests = useMemo(() => requests.slice(0, 8), [requests]);
  const highlightedReviews = useMemo(() => reviews.slice(0, 5), [reviews]);

  return (
    <>
      <PageHeader
        title="Company Dashboard"
        subtitle="Track assigned rescue work, dispatch resources quickly, and review customer feedback from one place."
        actions={<Link className="button button-secondary" to="/company/requests">Open dispatch workspace</Link>}
      />

      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading company dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="stats-grid">
            <StatCard label="Assigned Requests" value={dashboard?.assignedRequests ?? 0} />
            <StatCard label="In Progress" value={dashboard?.inProgressRequests ?? 0} />
            <StatCard label="Staff" value={dashboard?.totalStaff ?? 0} />
            <StatCard label="Vehicles" value={dashboard?.totalVehicles ?? 0} />
            <StatCard label="Quotes" value={dashboard?.totalQuotes ?? 0} />
            <StatCard label="Pending Quotes" value={dashboard?.pendingQuotes ?? 0} />
            <StatCard label="Reviews" value={dashboard?.totalReviews ?? 0} />
          </div>

          <div className="grid-two">
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
                              <Link className="button button-secondary" to="/company/requests">
                                Dispatch
                              </Link>
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
