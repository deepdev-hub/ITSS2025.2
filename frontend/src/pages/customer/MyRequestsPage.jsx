import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      try {
        setRequests(await requestApi.getMyRequests());
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  return (
    <>
      <PageHeader
        title="My Rescue Requests"
        subtitle="Track every rescue request you have created, along with quote, payment, and completion status."
        actions={<Link className="button button-primary" to="/customer/requests/new">Create request</Link>}
      />

      {error ? <div className="notice error">{error}</div> : null}

      <div className="card">
        {loading ? <p>Loading requests...</p> : null}
        {!loading && requests.length === 0 ? <p>No requests found yet.</p> : null}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Request Code</th>
                <th>Incident</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned Company</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.requestCode}</td>
                  <td>{request.incidentTypeName}</td>
                  <td><StatusBadge value={request.status} /></td>
                  <td><StatusBadge value={request.priorityLevel} /></td>
                  <td>{request.assignedCompany?.companyName || 'Waiting for assignment'}</td>
                  <td>
                    <Link className="button button-secondary" to={`/requests/${request.id}`}>
                      View detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
