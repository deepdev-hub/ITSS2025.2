import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime, getAllowedStatusOptions } from '../../utils/requestUi';

/**
 * An assignment is expired (from the staff's perspective) when:
 *  - It is still PENDING (company hasn't confirmed with staff yet)
 *  - AND the expiresAt timestamp has passed
 *
 * Once status = ACCEPTED the countdown is irrelevant — staff can act normally.
 */
function isAssignmentExpired(assignment) {
  if (!assignment?.expiresAt) return false;
  if (assignment.status !== 'PENDING') return false;
  return new Date(assignment.expiresAt).getTime() <= Date.now();
}

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments]           = useState([]);
  const [activeAssignmentId, setActiveId]       = useState(null);
  const [requestDetail, setRequestDetail]       = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [detailLoading, setDetailLoading]       = useState(false);
  const [busyAction, setBusyAction]             = useState('');
  const [statusForm, setStatusForm]             = useState({ status: 'IN_PROGRESS', note: '' });
  const [notice, setNotice]                     = useState('');
  const [error, setError]                       = useState('');

  const activeAssignment = useMemo(
    () => assignments.find((a) => a.id === activeAssignmentId) || null,
    [assignments, activeAssignmentId],
  );

  // Re-evaluated every render so the countdown drives the disabled state in real time
  const activeExpired = isAssignmentExpired(activeAssignment);

  const statusOptions = useMemo(
    () => getAllowedStatusOptions('RESCUE_STAFF', requestDetail?.status),
    [requestDetail?.status],
  );

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await companyApi.getMyAssignments();
      setAssignments(list);
      setActiveId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetail = async (requestId) => {
    if (!requestId) { setRequestDetail(null); return; }
    setDetailLoading(true);
    try {
      setRequestDetail(await requestApi.getRequestDetail(requestId));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadAssignments(); }, []);

  useEffect(() => {
    if (activeAssignment?.requestId) loadRequestDetail(activeAssignment.requestId);
    else setRequestDetail(null);
  }, [activeAssignment?.requestId]);

  useEffect(() => {
    if (!requestDetail) return;
    const options = getAllowedStatusOptions('RESCUE_STAFF', requestDetail.status);
    setStatusForm((prev) => ({
      status: options.includes(prev.status) ? prev.status : (options[0] || prev.status),
      note:   prev.note,
    }));
  }, [requestDetail]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!activeAssignment?.requestId) return;

    setBusyAction('status');
    setNotice('');
    setError('');
    try {
      await requestApi.updateStatus(activeAssignment.requestId, statusForm);
      setNotice('Task progress updated successfully.');
      await loadAssignments();
      await loadRequestDetail(activeAssignment.requestId);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <Loader label="Loading your assignments..." />;

  return (
    <>
      <PageHeader
        title="My Assignments"
        subtitle="Review assigned jobs, update field progress, and open the request for full chat and history."
      />
      {notice ? <div className="notice">{notice}</div>       : null}
      {error  ? <div className="notice error">{error}</div>  : null}

      <div className="grid-two">

        {/* ── Assignment List ────────────────────────────────────────────── */}
        <div className="card">
          <h2>Assigned Tasks</h2>
          {assignments.length === 0 ? (
            <p>No assignments available.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    {/*
                      Time Left column: countdown only while assignment is PENDING.
                      Once ACCEPTED the company has confirmed — no countdown needed.
                    */}
                    <th>Time Left</th>
                    <th>Assigned At</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => {
                    const expired = isAssignmentExpired(assignment);
                    return (
                      <tr key={assignment.id}>
                        <td>{assignment.companyName}</td>
                        <td>{assignment.vehicleCode || 'N/A'}</td>
                        <td><StatusBadge value={assignment.status} /></td>
                        <td>
                          {assignment.status === 'PENDING' && assignment.expiresAt ? (
                            expired ? (
                              <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.82rem' }}>
                                Expired
                              </span>
                            ) : (
                              <Countdown expiresAt={assignment.expiresAt} />
                            )
                          ) : (
                            <span className="muted-line">—</span>
                          )}
                        </td>
                        <td>{formatDateTime(assignment.assignedAt)}</td>
                        <td>
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => setActiveId(assignment.id)}
                          >
                            {activeAssignmentId === assignment.id ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Task Detail ────────────────────────────────────────────────── */}
        <div className="card">
          <h2>Task Detail</h2>
          {detailLoading ? <Loader label="Loading task detail..." /> : null}
          {!detailLoading && !activeAssignment ? <p>Select an assignment to continue.</p> : null}

          {!detailLoading && activeAssignment ? (
            <>
              <div className="info-grid">
                <div className="info-item">
                  <span>Company</span>
                  <strong>{activeAssignment.companyName}</strong>
                </div>
                <div className="info-item">
                  <span>Assignment Status</span>
                  <strong><StatusBadge value={activeAssignment.status} /></strong>
                </div>
                <div className="info-item">
                  <span>Vehicle</span>
                  <strong>{activeAssignment.vehicleCode || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Plate Number</span>
                  <strong>{activeAssignment.vehiclePlateNumber || 'N/A'}</strong>
                </div>
              </div>

              {/*
                Countdown banner — only while the assignment is PENDING.
                This means the company hasn't yet confirmed with staff.
                Once ACCEPTED (company selected staff) the banner is hidden.
              */}
              {activeAssignment.status === 'PENDING' && activeAssignment.expiresAt ? (
                <div
                  className="card card-muted"
                  style={{
                    marginBottom: '0.75rem',
                    borderLeft: `3px solid ${activeExpired ? 'var(--danger)' : 'var(--warning)'}`,
                  }}
                >
                  <div className="actions-row" style={{ alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Acceptance deadline:</span>
                    {activeExpired ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Expired</span>
                    ) : (
                      <Countdown expiresAt={activeAssignment.expiresAt} />
                    )}
                  </div>
                  {activeExpired ? (
                    <p className="muted-line" style={{ marginTop: '0.4rem', color: 'var(--danger)' }}>
                      This assignment has expired. The company did not confirm in time. No further action is needed from you.
                    </p>
                  ) : (
                    <p className="muted-line" style={{ marginTop: '0.4rem' }}>
                      The company must confirm your assignment before this timer expires. Once confirmed, you can update progress.
                    </p>
                  )}
                </div>
              ) : null}

              {requestDetail ? (
                <>
                  <div className="field">
                    <label>Request Code</label>
                    <input value={requestDetail.requestCode} disabled />
                  </div>
                  <div className="field">
                    <label>Current Request Status</label>
                    <input value={requestDetail.status} disabled />
                  </div>
                  <div className="field">
                    <label>Breakdown Location</label>
                    <textarea value={requestDetail.location?.fullAddress || 'No location available.'} disabled />
                  </div>

                  {/*
                    Progress update form.
                    Blocked when the assignment is PENDING AND has already expired —
                    staff should not act on unconfirmed expired assignments.
                    Once status = ACCEPTED (company confirmed) this block is lifted.
                  */}
                  {statusOptions.length > 0 ? (
                    <form className="card card-muted" onSubmit={handleStatusUpdate}>
                      <h3>Update Task Progress</h3>

                      {activeExpired && activeAssignment.status === 'PENDING' ? (
                        <div className="notice error" style={{ marginBottom: '0.75rem' }}>
                          Assignment expired — cannot update an unconfirmed task. Wait for the admin to reassign.
                        </div>
                      ) : null}

                      <div className="form-grid">
                        <div className="field">
                          <label>Status</label>
                          <select
                            value={statusForm.status}
                            disabled={activeExpired && activeAssignment.status === 'PENDING'}
                            onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field">
                          <label>Note</label>
                          <input
                            value={statusForm.note}
                            disabled={activeExpired && activeAssignment.status === 'PENDING'}
                            onChange={(e) => setStatusForm((p) => ({ ...p, note: e.target.value }))}
                            placeholder="Optional field update"
                          />
                        </div>
                      </div>
                      <button
                        className="button button-primary"
                        type="submit"
                        disabled={
                          busyAction === 'status' ||
                          (activeExpired && activeAssignment.status === 'PENDING')
                        }
                        title={
                          activeExpired && activeAssignment.status === 'PENDING'
                            ? 'Assignment expired — cannot update'
                            : undefined
                        }
                      >
                        {busyAction === 'status' ? 'Updating...' : 'Update progress'}
                      </button>
                    </form>
                  ) : (
                    <p className="muted-line">This request is already finalized.</p>
                  )}

                  <div className="actions-row" style={{ marginTop: '1rem' }}>
                    <Link className="button button-secondary" to={`/requests/${activeAssignment.requestId}`}>
                      Open request detail
                    </Link>
                    <span className="muted-line">Chat, quote, payment, and full history available in request detail.</span>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}