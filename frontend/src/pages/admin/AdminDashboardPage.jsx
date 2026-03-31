import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [assignForm, setAssignForm] = useState({});
  const [loading, setLoading] = useState(true);
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

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor system health, review recent rescue requests, and assign a company without leaving the dashboard."
        actions={<Link className="button button-secondary" to="/admin/requests">Open request management</Link>}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading admin dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="stats-grid">
            <StatCard label="Total Accounts" value={dashboard?.totalAccounts ?? 0} />
            <StatCard label="Customers" value={dashboard?.totalCustomers ?? 0} />
            <StatCard label="Total Companies" value={dashboard?.totalCompanies ?? 0} />
            <StatCard label="Total Requests" value={dashboard?.totalRequests ?? 0} />
            <StatCard label="Pending Requests" value={dashboard?.pendingRequests ?? 0} />
            <StatCard label="Total Payments" value={dashboard?.totalPayments ?? 0} />
            <StatCard label="Paid Payments" value={dashboard?.paidPayments ?? 0} />
            <StatCard label="Total Reviews" value={dashboard?.totalReviews ?? 0} />
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
