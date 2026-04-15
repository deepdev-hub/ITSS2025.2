import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

/**
 * Whether the admin should see an assign / reassign control.
 *
 * Show when:
 *   - Request is not terminal (COMPLETED / CANCELED)
 *   - AND either: no company assigned yet
 *               OR: MATCHED + no live pending assignment (expiresAt = null → timed out)
 */
function canAdminAssign(request) {
  if (['COMPLETED', 'CANCELED'].includes(request.status)) return false;
  if (!request.assignedCompany) return true;
  // Timed out: company was assigned but did not accept in time
  if (request.status === 'MATCHED' && !request.expiresAt) return true;
  return false;
}

export default function AdminRequestsPage() {
  const [requests, setRequests]     = useState([]);
  const [companies, setCompanies]   = useState([]);
  const [assignForm, setAssignForm] = useState({});
  const [notice, setNotice]         = useState('');
  const [error, setError]           = useState('');

  const loadData = async () => {
    try {
      const [requestList, companyList] = await Promise.all([
        adminApi.getRequests(),
        adminApi.getCompanies(),
      ]);
      setRequests(requestList);
      setCompanies(companyList.filter((c) => c.status === 'APPROVED'));
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (requestId) => {
    const companyId = assignForm[requestId];
    if (!companyId) {
      setError('Please select a company before assigning.');
      return;
    }
    setNotice('');
    setError('');
    try {
      await adminApi.assignCompany(requestId, {
        companyId: Number(companyId),
        note:      'Assigned from admin request page',
      });
      setNotice('Company assigned successfully.');
      // Reset the dropdown for this row
      setAssignForm((prev) => ({ ...prev, [requestId]: '' }));
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader
        title="All Requests"
        subtitle="Review every request and manually assign or reassign a rescue company. Timed-out assignments are highlighted."
      />
      {notice ? <div className="notice">{notice}</div>       : null}
      {error  ? <div className="notice error">{error}</div>  : null}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Incident</th>
                <th>Priority</th>
                <th>Status</th>
                {/* Acceptance window countdown / expiry indicator */}
                <th>Acceptance Window</th>
                <th>Assigned Company</th>
                <th>Assign / Reassign</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const timedOut  = request.status === 'MATCHED' && !request.expiresAt && !!request.assignedCompany;
                const isLive    = request.status === 'MATCHED' && !!request.expiresAt;
                const assignable = canAdminAssign(request);

                return (
                  <tr
                    key={request.id}
                    style={timedOut ? { background: 'rgba(185,61,50,0.04)' } : undefined}
                  >
                    <td>
                      <strong>{request.requestCode}</strong>
                    </td>
                    <td>{request.customerName}</td>
                    <td>{request.incidentTypeName}</td>
                    <td><StatusBadge value={request.priorityLevel} /></td>
                    <td><StatusBadge value={request.status} /></td>

                    {/* Acceptance window column */}
                    <td>
                      {isLive ? (
                        /* Live countdown — company still has time to accept */
                        <Countdown expiresAt={request.expiresAt} />
                      ) : timedOut ? (
                        /* Assignment timed out — needs reassignment */
                        <span
                          style={{
                            color:      'var(--danger)',
                            fontWeight: 700,
                            fontSize:   '0.82rem',
                          }}
                        >
                          Expired
                        </span>
                      ) : (
                        <span className="muted-line">—</span>
                      )}
                    </td>

                    {/* Assigned company */}
                    <td>
                      {request.assignedCompany ? (
                        <>
                          {request.assignedCompany.companyName}
                          {timedOut ? (
                            <div className="muted-line" style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
                              did not accept
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className="muted-line">Not assigned</span>
                      )}
                    </td>

                    {/* Assign / reassign control */}
                    <td>
                      {assignable ? (
                        <div style={{ display: 'grid', gap: '0.5rem', minWidth: '220px' }}>
                          {timedOut ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--danger)' }}>
                              Reassign to new company:
                            </span>
                          ) : null}
                          <select
                            value={assignForm[request.id] || ''}
                            onChange={(event) =>
                              setAssignForm((prev) => ({ ...prev, [request.id]: event.target.value }))
                            }
                          >
                            <option value="">Select company</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.companyName} (#{company.id})
                              </option>
                            ))}
                          </select>
                          <button
                            className={`button ${timedOut ? 'button-danger' : 'button-primary'}`}
                            type="button"
                            onClick={() => handleAssign(request.id)}
                          >
                            {timedOut ? 'Reassign company' : 'Assign company'}
                          </button>
                        </div>
                      ) : (
                        <span className="muted-line">
                          {isLive ? 'Waiting for company' : '—'}
                        </span>
                      )}
                    </td>

                    <td>
                      <Link className="button button-secondary" to={`/requests/${request.id}`}>
                        View detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}