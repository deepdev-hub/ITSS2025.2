import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [assignForm, setAssignForm] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadRequests = async () => {
    try {
      setRequests(await adminApi.getRequests());
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAssign = async (requestId) => {
    const companyId = assignForm[requestId];
    if (!companyId) {
      setError('Please enter company id before assigning.');
      return;
    }
    try {
      await adminApi.assignCompany(requestId, { companyId: Number(companyId), note: 'Assigned from admin request page' });
      setNotice('Company assigned successfully');
      await loadRequests();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="All Requests" subtitle="Admin can review every request and manually assign a rescue company." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Incident</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assign Company Id</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.requestCode}</td>
                  <td>{request.customerName}</td>
                  <td>{request.incidentTypeName}</td>
                  <td><StatusBadge value={request.status} /></td>
                  <td><StatusBadge value={request.priorityLevel} /></td>
                  <td>
                    <input
                      value={assignForm[request.id] || ''}
                      onChange={(event) => setAssignForm((previous) => ({ ...previous, [request.id]: event.target.value }))}
                      placeholder="Company id"
                    />
                  </td>
                  <td>
                    <div className="actions-row">
                      <button className="button button-primary" type="button" onClick={() => handleAssign(request.id)}>
                        Assign
                      </button>
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
      </div>
    </>
  );
}
