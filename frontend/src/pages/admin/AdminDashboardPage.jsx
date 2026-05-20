import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

function toInputDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
}

function formatRating(value) {
  return value === null || value === undefined ? 'N/A' : `${Number(value).toFixed(2)}/5`;
}

function CompanyMetricChart({ title, items, valueKey, maxValue, formatValue, tone }) {
  const resolvedMax = maxValue ?? Math.max(...items.map((item) => Number(item[valueKey] || 0)), 0);

  return (
    <div className="chart-panel">
      <div className="section-header">
        <div>
          <h3>{title}</h3>
          <p>{items.length} company record(s)</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="muted-line">No company data found for this period.</p>
      ) : (
        <div className="bar-chart">
          {items.map((item) => {
            const rawValue = Number(item[valueKey] || 0);
            const width = resolvedMax > 0 ? Math.max((rawValue / resolvedMax) * 100, rawValue > 0 ? 3 : 0) : 0;
            return (
              <div className="bar-chart-row" key={`${valueKey}-${item.companyId}`}>
                <div className="bar-chart-label">
                  <strong>{item.companyName}</strong>
                  <span>{formatValue(item[valueKey])}</span>
                </div>
                <div className="bar-chart-track" aria-hidden="true">
                  <div className={`bar-chart-fill bar-chart-fill-${tone}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyPerformance, setCompanyPerformance] = useState(null);
  const [performanceFilters, setPerformanceFilters] = useState(getDefaultDateRange);
  const [assignForm, setAssignForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, requestList, companyList, performanceData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRequests(),
        adminApi.getCompanies(),
        adminApi.getCompanyPerformance(performanceFilters),
      ]);
      setDashboard(dashboardData);
      setRequests(requestList);
      setCompanies(companyList.filter((company) => company.status === 'APPROVED'));
      setCompanyPerformance(performanceData);
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
  const performanceCompanies = useMemo(() => companyPerformance?.companies ?? [], [companyPerformance]);
  const snapshotDateLabel = dashboard?.statDate || 'N/A';
  const averageRatingLabel = dashboard?.averageRating ?? 'N/A';

  const loadPerformance = async (event) => {
    event?.preventDefault();
    setPerformanceLoading(true);
    setError('');
    try {
      setCompanyPerformance(await adminApi.getCompanyPerformance(performanceFilters));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setPerformanceLoading(false);
    }
  };

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
      const [dashboardData, requestList, companyList, performanceData] = await Promise.all([
        adminApi.refreshDashboard(),
        adminApi.getRequests(),
        adminApi.getCompanies(),
        adminApi.getCompanyPerformance(performanceFilters),
      ]);
      setDashboard(dashboardData);
      setRequests(requestList);
      setCompanies(companyList.filter((company) => company.status === 'APPROVED'));
      setCompanyPerformance(performanceData);
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
            <div className="toolbar">
              <div className="toolbar-title">
                <h2>Company Sales & Rating</h2>
                <p>Revenue is calculated from paid payments linked to accepted company quotes.</p>
              </div>
              <form className="toolbar-filters" onSubmit={loadPerformance}>
                <input
                  type="date"
                  value={performanceFilters.startDate}
                  onChange={(event) => setPerformanceFilters((previous) => ({ ...previous, startDate: event.target.value }))}
                />
                <input
                  type="date"
                  value={performanceFilters.endDate}
                  onChange={(event) => setPerformanceFilters((previous) => ({ ...previous, endDate: event.target.value }))}
                />
                <button className="button button-secondary" type="submit" disabled={performanceLoading}>
                  {performanceLoading ? 'Loading...' : 'Apply range'}
                </button>
              </form>
            </div>

            <div className="grid-two">
              <CompanyMetricChart
                title="Revenue by Company"
                items={performanceCompanies}
                valueKey="revenue"
                formatValue={(value) => formatCurrency(value ?? 0)}
                tone="revenue"
              />
              <CompanyMetricChart
                title="Average Rating by Company"
                items={performanceCompanies}
                valueKey="averageRating"
                maxValue={5}
                formatValue={formatRating}
                tone="rating"
              />
            </div>

            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Revenue</th>
                    <th>Average Rating</th>
                    <th>Reviews</th>
                    <th>Paid Payments</th>
                    <th>Completed Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="6">No company performance data found for this period.</td>
                    </tr>
                  ) : (
                    performanceCompanies.map((company) => (
                      <tr key={company.companyId}>
                        <td>{company.companyName}</td>
                        <td>{formatCurrency(company.revenue ?? 0)}</td>
                        <td>{formatRating(company.averageRating)}</td>
                        <td>{company.reviewCount}</td>
                        <td>{company.paidPaymentCount}</td>
                        <td>{company.completedRequestCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
