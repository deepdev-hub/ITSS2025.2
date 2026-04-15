import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { canCustomerCancel, formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

/**
 * Shows a countdown or expiry message while the assigned company has not yet
 * confirmed (status = MATCHED).
 *
 * NOTE: RequestSummaryResponse exposes `expiresAt` at the TOP level —
 *       it is NOT nested inside currentAssignment for summary responses.
 *       Only RequestDetailResponse has the nested currentAssignment object.
 */
function AssignmentCountdown({ request }) {
  // expiresAt lives at the top level of RequestSummaryResponse
  const expiresAt = request?.expiresAt;
  const status    = request?.status;

  // Only relevant while waiting for the assigned company to confirm
  if (status !== 'MATCHED' || !expiresAt) return null;

  const isExpired = new Date(expiresAt).getTime() <= Date.now();

  if (isExpired) {
    return (
      <div className="muted-line" style={{ marginTop: '0.3rem', color: 'var(--danger)', fontSize: '0.82rem' }}>
        No company accepted (timed out)
      </div>
    );
  }

  return (
    <div className="muted-line" style={{ marginTop: '0.3rem' }}>
      <Countdown expiresAt={expiresAt} label="Company responds in:" />
    </div>
  );
}

export default function MyRequestsPage() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [notice, setNotice]       = useState('');
  const [actionId, setActionId]   = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await requestApi.getMyRequests());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId) => {
    setActionId(requestId);
    setError('');
    setNotice('');
    try {
      await requestApi.cancelRequest(requestId, { note: 'Canceled by customer from My Requests page' });
      setNotice('Request canceled successfully.');
      await loadRequests();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="My Rescue Requests"
        subtitle="Review everything you have reported, then continue the flow with quote, payment, and review actions."
        actions={<Link className="button button-primary" to="/customer/requests/new">Create request</Link>}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error  ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading your rescue requests..." /> : null}

      {!loading ? (
        <div className="card">
          {requests.length === 0 ? (
            <p>No rescue requests found yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Incident / Service</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Assigned Company</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.requestCode}</strong>
                        <div className="muted-line">ID #{request.id}</div>
                      </td>
                      <td>
                        <strong>{request.incidentTypeName}</strong>
                        <div className="muted-line">{request.serviceTypeName || 'Service not selected'}</div>
                      </td>
                      <td>{getRequestLocationLabel(request)}</td>
                      <td><StatusBadge value={request.priorityLevel} /></td>
                      <td>
                        {/* Status badge + assignment countdown beneath it */}
                        <StatusBadge value={request.status} />
                        <AssignmentCountdown request={request} />
                      </td>
                      <td>{formatDateTime(request.createdAt)}</td>
                      <td>{request.assignedCompany?.companyName || 'Waiting for assignment'}</td>
                      <td>
                        <div className="actions-row">
                          <Link className="button button-secondary" to={`/requests/${request.id}`}>
                            Open detail
                          </Link>
                          {canCustomerCancel(request.status) ? (
                            <button
                              className="button button-danger"
                              type="button"
                              disabled={actionId === request.id}
                              onClick={() => handleCancel(request.id)}
                            >
                              {actionId === request.id ? 'Canceling...' : 'Cancel'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
}