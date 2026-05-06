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

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const activeAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === activeAssignmentId) || null,
    [assignments, activeAssignmentId],
  );

  const statusOptions = useMemo(
    () => getAllowedStatusOptions('RESCUE_STAFF', requestDetail?.status),
    [requestDetail?.status],
  );

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const assignmentList = await companyApi.getMyAssignments();
      setAssignments(assignmentList);
      setActiveAssignmentId((previous) => {
        if (previous && assignmentList.some((item) => item.id === previous)) {
          return previous;
        }
        return assignmentList[0]?.id ?? null;
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetail = async (requestId) => {
    if (!requestId) {
      setRequestDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      setRequestDetail(await requestApi.getRequestDetail(requestId));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (activeAssignment?.requestId) {
      loadRequestDetail(activeAssignment.requestId);
    } else {
      setRequestDetail(null);
    }
  }, [activeAssignment?.requestId]);

  useEffect(() => {
    if (!requestDetail) {
      return;
    }
    const nextStatusOptions = getAllowedStatusOptions('RESCUE_STAFF', requestDetail.status);
    setStatusForm((previous) => ({
      status: nextStatusOptions.includes(previous.status) ? previous.status : (nextStatusOptions[0] || previous.status),
      note: previous.note,
    }));
  }, [requestDetail]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!activeAssignment?.requestId) {
      return;
    }
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

  if (loading) {
    return <Loader label="Loading your assignments..." />;
  }

  return (
    <>
      <PageHeader title="My Assignments" subtitle="Review assigned jobs, update field progress, and jump to the request detail for full chat and history." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
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
                    <th>Countdown</th>
                    <th>Assigned At</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.companyName}</td>
                      <td>{assignment.vehicleCode || 'N/A'}</td>
                      <td><StatusBadge value={assignment.status} /></td>
                      <td>
                        <Countdown expiresAt={assignment.expiresAt} status={assignment.status} label="" />
                      </td>
                      <td>{formatDateTime(assignment.assignedAt)}</td>
                      <td>
                        <button className="button button-secondary" type="button" onClick={() => setActiveAssignmentId(assignment.id)}>
                          {activeAssignmentId === assignment.id ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                  <Countdown expiresAt={activeAssignment.expiresAt} status={activeAssignment.status} />
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

                  {statusOptions.length > 0 ? (
                    <form className="card card-muted" onSubmit={handleStatusUpdate}>
                      <h3>Update Task Progress</h3>
                      <div className="form-grid">
                        <div className="field">
                          <label>Status</label>
                          <select
                            value={statusForm.status}
                            onChange={(event) => setStatusForm((previous) => ({ ...previous, status: event.target.value }))}
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
                            onChange={(event) => setStatusForm((previous) => ({ ...previous, note: event.target.value }))}
                            placeholder="Optional field update"
                          />
                        </div>
                      </div>
                      <button className="button button-primary" type="submit" disabled={busyAction === 'status'}>
                        {busyAction === 'status' ? 'Updating...' : 'Update progress'}
                      </button>
                    </form>
                  ) : (
                    <p className="muted-line">This request is already finalized, so no further status change is available.</p>
                  )}

                  <div className="actions-row" style={{ marginTop: '1rem' }}>
                    <Link className="button button-secondary" to={`/requests/${activeAssignment.requestId}`}>
                      Open request detail
                    </Link>
                    <span className="muted-line">Use request detail for chat, quote, payment, and full history.</span>
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
