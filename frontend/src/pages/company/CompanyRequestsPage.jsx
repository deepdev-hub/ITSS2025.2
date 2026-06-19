import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';

function normalizeRequestSummary(request) {
  const assignmentStatus = request.assignmentStatus
    ?? request.currentAssignment?.status
    ?? null;

  return {
    ...request,
    assignmentStatus,
    expiresAt: request.expiresAt ?? request.currentAssignment?.expiresAt ?? null,
  };
}

export default function CompanyRequestsPage() {
  const [requests, setRequests]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const pageSize = 15;

  const loadWorkspace = async () => {
    setLoading(true);
    setError('');
    try {
      const requestList = await companyApi.getRequests();
      setRequests((requestList ?? []).map(normalizeRequestSummary));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Data loading

  useEffect(() => { loadWorkspace(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  // Render

  if (loading) return <Loader label="Loading dispatch workspace..." />;

  const totalPages = Math.ceil(requests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRequests = requests.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <PageHeader
        title="Company Requests"
        subtitle="Manage requests that have been handled by your rescue staff."
      />
      {error  ? <div className="notice error">{error}</div>  : null}

      <div className="card">
          <h2>Request Queue</h2>
          {requests.length === 0 ? (
            <p>No requests are assigned to this company yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Incident</th>
                    <th>Priority</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.requestCode}</strong>
                        <div className="muted-line">{request.customerName}</div>
                      </td>
                      <td>{request.incidentTypeName}</td>
                      <td><StatusBadge value={request.priorityLevel} /></td>
                      <td>{request.staffName || <span className="muted-line">N/A</span>}</td>
                      <td><StatusBadge value={request.status} /></td>
                      <td>
                        <div className="actions-row">
                          <Link className="button button-secondary" to={`/requests/${request.id}`}>
                            Detail
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {requests.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}
        </div>
    </>
  );
}
