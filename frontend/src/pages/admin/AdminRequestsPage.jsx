import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [assignForm, setAssignForm] = useState({});
  const [filters, setFilters] = useState({ search: '', status: 'ALL', assignment: 'ALL' });
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [requestList, companyList] = await Promise.all([
        adminApi.getRequests(),
        adminApi.getCompanies(),
      ]);
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

  const filteredRequests = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch = keyword === ''
        || [
          request.requestCode,
          request.customerName,
          request.incidentTypeName,
          request.serviceTypeName,
          getRequestLocationLabel(request),
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesStatus = filters.status === 'ALL' || request.status === filters.status;
      const matchesAssignment = filters.assignment === 'ALL'
        || (filters.assignment === 'ASSIGNED' && Boolean(request.assignedCompany))
        || (filters.assignment === 'UNASSIGNED' && !request.assignedCompany);

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [filters, requests]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
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
        note: 'Assigned from admin requests page',
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
      <PageHeader title="All Requests" subtitle="Review every rescue request, filter the queue, and assign or reassign a rescue company quickly." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-title">
            <h2>Request Queue</h2>
            <p>{filteredRequests.length} request(s) matched</p>
          </div>
          <div className="toolbar-filters">
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by code, customer, incident, service, location"
            />
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="ALL">All statuses</option>
              <option value="CREATED">CREATED</option>
              <option value="SEARCHING">SEARCHING</option>
              <option value="MATCHED">MATCHED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
            <select name="assignment" value={filters.assignment} onChange={handleFilterChange}>
              <option value="ALL">All assignment states</option>
              <option value="UNASSIGNED">Unassigned</option>
              <option value="ASSIGNED">Assigned</option>
            </select>
          </div>
        </div>

        {loading ? <Loader label="Loading requests..." /> : null}

        {!loading ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Customer</th>
                  <th>Incident / Service</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                  <th>Company</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="9">No requests matched the current filters.</td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
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
                      <td><StatusBadge value={request.priorityLevel} /></td>
                      <td>{formatDateTime(request.createdAt)}</td>
                      <td>
                        <div className="actions-stack">
                          <span>{request.assignedCompany?.companyName || 'Not assigned'}</span>
                          {!['COMPLETED', 'CANCELED'].includes(request.status) ? (
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
                                    {company.companyName}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="button button-primary"
                                type="button"
                                disabled={assigningId === request.id}
                                onClick={() => handleAssign(request.id)}
                              >
                                {assigningId === request.id
                                  ? 'Saving...'
                                  : request.assignedCompany ? 'Reassign' : 'Assign'}
                              </button>
                            </>
                          ) : (
                            <span className="muted-line">Closed request</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Link className="button button-secondary" to={`/requests/${request.id}`}>
                          View detail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  );
}
