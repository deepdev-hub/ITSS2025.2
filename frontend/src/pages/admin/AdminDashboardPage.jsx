import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [assignForm, setAssignForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

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
      setCompanies(companyList.filter((company) => company.status === 'APPROVED'));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recentRequests = useMemo(() => requests.slice(0, 8), [requests]);
  const snapshotDateLabel = dashboard?.statDate || 'N/A';
  const averageRatingLabel = dashboard?.averageRating ?? 'N/A';

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
        note: 'Assigned from admin dashboard',
      });
      setNotice('Company assigned successfully.');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setAssigningId(null);
    }
  };

  const handleRefreshDashboard = async () => {
    setRefreshing(true);
    setNotice('');
    setError('');
    try {
      const [dashboardData, requestList, companyList] = await Promise.all([
        adminApi.refreshDashboard(),
        adminApi.getRequests(),
        adminApi.getCompanies(),
      ]);
      setDashboard(dashboardData);
      setRequests(requestList);
      setCompanies(companyList.filter((company) => company.status === 'APPROVED'));
      setNotice('Dashboard information updated successfully.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor saved daily statistics, refresh the snapshot on demand, and assign a company without leaving the dashboard."
        actions={(
          <div className="actions-row">
            <button
              className="button button-primary"
              type="button"
              disabled={loading || refreshing}
              onClick={handleRefreshDashboard}
            >
              {refreshing ? 'Updating...' : 'Update information'}
            </button>
            <Link className="button button-secondary" to="/admin/requests">Open request management</Link>
          </div>
        )}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading admin dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="card">
            <div className="section-header">
              <div>
                <h2>Statistics Snapshot</h2>
                <p>The dashboard reads from the latest row in `daily_statistics`. Use update when you want to recalculate and persist a fresh snapshot.</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span>Snapshot Date</span>
                <strong>{snapshotDateLabel}</strong>
              </div>
              <div className="info-item">
                <span>Calculated At</span>
                <strong>{formatDateTime(dashboard?.calculatedAt)}</strong>
              </div>
              <div className="info-item">
                <span>Total Accounts</span>
                <strong>{dashboard?.totalAccounts ?? 0}</strong>
              </div>
              <div className="info-item">
                <span>Pending Requests</span>
                <strong>{dashboard?.pendingRequests ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard label="Requests" value={dashboard?.requestCount ?? 0} />
            <StatCard label="Completed Requests" value={dashboard?.completedRequestCount ?? 0} />
            <StatCard label="Canceled Requests" value={dashboard?.canceledRequestCount ?? 0} />
            <StatCard label="In Progress Requests" value={dashboard?.inProgressRequestCount ?? 0} />
            <StatCard label="Paid Payments" value={dashboard?.paidPaymentCount ?? 0} />
            <StatCard label="Revenue" value={formatCurrency(dashboard?.revenue ?? 0)} />
            <StatCard label="Reviews" value={dashboard?.reviewCount ?? 0} />
            <StatCard label="Average Rating" value={averageRatingLabel} />
            <StatCard label="Customers" value={dashboard?.customerCount ?? 0} />
            <StatCard label="Staff" value={dashboard?.staffCount ?? 0} />
            <StatCard label="Companies" value={dashboard?.companyCount ?? 0} />
            <StatCard label="Approved Companies" value={dashboard?.approvedCompanyCount ?? 0} />
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
                        <td><StatusBadge value={request.status} /></td>
                        <td>{formatDateTime(request.createdAt)}</td>
                        <td>{request.assignedCompany?.companyName || 'Not assigned'}</td>
                        <td>
                          <div className="actions-stack">
                            {!request.assignedCompany && !['COMPLETED', 'CANCELED'].includes(request.status) ? (
                              <>
                                <select
                                  value={assignForm[request.id] || ''}
                                  onChange={(event) => setAssignForm((previous) => ({
                                    ...previous,
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
                                  className="button button-primary"
                                  type="button"
                                  disabled={assigningId === request.id}
                                  onClick={() => handleAssign(request.id)}
                                >
                                  {assigningId === request.id ? 'Assigning...' : 'Assign company'}
                                </button>
                              </>
                            ) : (
                              <span className="muted-line">Assignment already handled</span>
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
