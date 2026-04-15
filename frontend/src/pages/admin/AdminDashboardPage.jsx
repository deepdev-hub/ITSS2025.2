import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

/**
 * Returns true when the admin should see an assign/reassign control for a request.
 *
 * Cases:
 *  A) No company assigned yet → always show assign control.
 *  B) Company assigned (MATCHED) but no active pending assignment (expiresAt=null)
 *     → assignment expired and was auto-rejected; admin must reassign to another company.
 *
 * Cases where we do NOT show the control:
 *  - Request is COMPLETED or CANCELED (terminal states).
 *  - Request is MATCHED and still has a live pending assignment (expiresAt != null,
 *    meaning the countdown is still running — company still has time to accept).
 *  - Request is ACCEPTED, IN_PROGRESS (company already confirmed).
 */
function canAdminAssign(request) {
  if (['COMPLETED', 'CANCELED'].includes(request.status)) return false;

  // No company assigned yet
  if (!request.assignedCompany) return true;

  // Company is assigned and MATCHED but the pending assignment window has closed
  // (expiresAt is null = no active PENDING assignment exists for this request)
  if (request.status === 'MATCHED' && !request.expiresAt) return true;

  return false;
}

/**
 * Returns true when the request is MATCHED with an active pending window
 * (countdown is ticking — company still has time to accept).
 */
function isPendingAcceptance(request) {
  return request.status === 'MATCHED' && !!request.expiresAt;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard]     = useState(null);
  const [requests, setRequests]       = useState([]);
  const [companies, setCompanies]     = useState([]);
  const [assignForm, setAssignForm]   = useState({});
  const [loading, setLoading]         = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [notice, setNotice]           = useState('');
  const [error, setError]             = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, requestList, companyList] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRequests(),
        adminApi.getCompanies(),
      ]);
      setDashboard(dashboardData);
      setRequests(requestList);
      setCompanies(companyList.filter((c) => c.status === 'APPROVED'));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const recentRequests = useMemo(() => requests.slice(0, 8), [requests]);

  const handleAssign = async (requestId) => {
    const companyId = assignForm[requestId];
    if (!companyId) {
      setError('Please select a rescue company before assigning.');
      return;
    }

    setAssigningId(requestId);
    setNotice('');
    setError('');
    try {
      await adminApi.assignCompany(requestId, {
        companyId: Number(companyId),
        note:      'Assigned from admin dashboard',
      });
      setNotice('Company assigned successfully.');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor system health, review recent rescue requests, and assign or reassign companies without leaving the dashboard."
        actions={<Link className="button button-secondary" to="/admin/requests">Open request management</Link>}
      />

      {notice ? <div className="notice">{notice}</div>        : null}
      {error  ? <div className="notice error">{error}</div>   : null}

      {loading ? <Loader label="Loading admin dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="stats-grid">
            <StatCard label="Total Accounts"   value={dashboard?.totalAccounts   ?? 0} />
            <StatCard label="Customers"        value={dashboard?.totalCustomers  ?? 0} />
            <StatCard label="Total Companies"  value={dashboard?.totalCompanies  ?? 0} />
            <StatCard label="Total Requests"   value={dashboard?.totalRequests   ?? 0} />
            <StatCard label="Pending Requests" value={dashboard?.pendingRequests ?? 0} />
            <StatCard label="Total Payments"   value={dashboard?.totalPayments   ?? 0} />
            <StatCard label="Paid Payments"    value={dashboard?.paidPayments    ?? 0} />
            <StatCard label="Total Reviews"    value={dashboard?.totalReviews    ?? 0} />
          </div>

          <div className="card">
            <h2>Recent Requests</h2>
            {recentRequests.length === 0 ? (
              <p>No rescue requests found yet.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Request</th>
                      <th>Customer</th>
                      <th>Incident / Service</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Assigned Company</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((request) => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.requestCode}</strong>
                          <div className="muted-line">ID #{request.id}</div>
                        </td>
                        <td>{request.customerName}</td>
                        <td>
                          <strong>{request.incidentTypeName}</strong>
                          <div className="muted-line">{request.serviceTypeName || 'Service not selected'}</div>
                        </td>
                        <td>{getRequestLocationLabel(request)}</td>
                        <td>
                          <StatusBadge value={request.status} />
                          {/* Countdown while waiting for company to accept */}
                          {isPendingAcceptance(request) ? (
                            <div style={{ marginTop: '0.3rem' }}>
                              <Countdown expiresAt={request.expiresAt} />
                            </div>
                          ) : null}
                          {/* Expired badge when assignment timed out and needs reassignment */}
                          {request.status === 'MATCHED' && !request.expiresAt && request.assignedCompany ? (
                            <div
                              className="muted-line"
                              style={{ marginTop: '0.3rem', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              ⚠ Timed out — reassign needed
                            </div>
                          ) : null}
                        </td>
                        <td>{formatDateTime(request.createdAt)}</td>
                        <td>
                          {request.assignedCompany
                            ? request.assignedCompany.companyName
                            : 'Not assigned'}
                          {/* Show "timed out" note under company name when expired */}
                          {request.status === 'MATCHED' && !request.expiresAt && request.assignedCompany ? (
                            <div className="muted-line" style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                              did not accept
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <div className="actions-stack">
                            {canAdminAssign(request) ? (
                              <>
                                {/* Label differs: first-time assign vs reassign after expiry */}
                                {request.assignedCompany ? (
                                  <span
                                    style={{
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      color: 'var(--danger)',
                                      marginBottom: '0.2rem',
                                    }}
                                  >
                                    Reassign to new company:
                                  </span>
                                ) : null}
                                <select
                                  value={assignForm[request.id] || ''}
                                  onChange={(event) => setAssignForm((prev) => ({
                                    ...prev,
                                    [request.id]: event.target.value,
                                  }))}
                                >
                                  <option value="">Select company</option>
                                  {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                      {company.companyName} (#{company.id})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className={`button ${request.assignedCompany ? 'button-danger' : 'button-primary'}`}
                                  type="button"
                                  disabled={assigningId === request.id}
                                  onClick={() => handleAssign(request.id)}
                                >
                                  {assigningId === request.id
                                    ? 'Assigning...'
                                    : request.assignedCompany
                                      ? 'Reassign company'
                                      : 'Assign company'}
                                </button>
                              </>
                            ) : (
                              <span className="muted-line">
                                {isPendingAcceptance(request)
                                  ? 'Waiting for company'
                                  : 'Assignment handled'}
                              </span>
                            )}
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
        </>
      ) : null}
    </>
  );
}