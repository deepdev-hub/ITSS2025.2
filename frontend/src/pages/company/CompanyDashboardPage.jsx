import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function CompanyDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, reviewList] = await Promise.all([
          companyApi.getDashboard(),
          companyApi.getReviews(),
        ]);
        setDashboard(dashboardData);
        setReviews(reviewList);
      } catch (err) {
        setError(getApiError(err));
      }
    }
    loadData();
  }, []);

  return (
    <>
      <PageHeader
        title="Company Dashboard"
        subtitle="High-level overview for assigned requests, staff, vehicles, quotes, and reviews."
      />

      {error ? <div className="notice error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Assigned Requests" value={dashboard?.assignedRequests ?? 0} />
        <StatCard label="In Progress" value={dashboard?.inProgressRequests ?? 0} />
        <StatCard label="Staff" value={dashboard?.totalStaff ?? 0} />
        <StatCard label="Vehicles" value={dashboard?.totalVehicles ?? 0} />
        <StatCard label="Quotes" value={dashboard?.totalQuotes ?? 0} />
        <StatCard label="Pending Quotes" value={dashboard?.pendingQuotes ?? 0} />
        <StatCard label="Reviews" value={dashboard?.totalReviews ?? 0} />
      </div>

      <div className="card">
        <h2>Recent Reviews</h2>
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
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.requestId}</td>
                  <td>{review.customerName}</td>
                  <td><StatusBadge value={`${review.ratingScore}/5`} /></td>
                  <td>{review.comment || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
