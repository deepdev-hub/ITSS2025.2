import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import {
  formatCurrency,
  formatDateTime,
  getAllowedStatusOptions,
  toDateTimeInputValue,
} from '../../utils/requestUi';

const initialAssignment = { staffId: '', vehicleId: '', note: '' };
const initialQuote = {
  staffId: '',
  estimatedAmount: '',
  finalAmount: '',
  serviceName: '',
  quantity: 1,
  unitPrice: '',
  subtotal: '',
  expiresAt: '',
  note: '',
};

function hasAssignedStaff(assignment) {
  return Boolean(assignment?.staffId || assignment?.staffName);
}

function isPendingAssignment(assignment) {
  return assignment?.status === 'PENDING' && !hasAssignedStaff(assignment);
}

function isAssignmentExpired(assignment, now = Date.now()) {
  if (!assignment?.expiresAt) return false;
  if (!isPendingAssignment(assignment)) return false;

  const expiresAtMs = new Date(assignment.expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return false;

  return expiresAtMs <= now;
}

function normalizeRequestSummary(request) {
  const assignmentStatus = request.assignmentStatus
    ?? request.currentAssignment?.status
    ?? null;

  return {
    ...request,
    assignmentStatus,
    expiresAt: request.expiresAt ?? request.currentAssignment?.expiresAt ?? null,
  };
}

function normalizeRequestDetail(request) {
  if (!request) return null;

  return {
    ...request,
    currentAssignment: request.currentAssignment
      ? {
          ...request.currentAssignment,
          status: request.currentAssignment.status ?? request.assignmentStatus ?? null,
          expiresAt: request.currentAssignment.expiresAt ?? request.expiresAt ?? null,
        }
      : null,
    quotes: request.quotes ?? [],
  };
}

export default function CompanyRequestsPage() {
  const [requests, setRequests]               = useState([]);
  const [staff, setStaff]                     = useState([]);
  const [vehicles, setVehicles]               = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [detail, setDetail]                   = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [detailLoading, setDetailLoading]     = useState(false);
  const [assignmentForm, setAssignmentForm]   = useState(initialAssignment);
  const [quoteForm, setQuoteForm]             = useState(initialQuote);
  const [statusForm, setStatusForm]           = useState({ status: 'IN_PROGRESS', note: '' });
  const [busyAction, setBusyAction]           = useState('');
  const [notice, setNotice]                   = useState('');
  const [error, setError]                     = useState('');
  const [now, setNow]                         = useState(() => Date.now());

  const statusOptions = useMemo(
    () => getAllowedStatusOptions('RESCUE_COMPANY', detail?.status),
    [detail?.status],
  );

  const assignmentExpired = useMemo(
    () => isAssignmentExpired(detail?.currentAssignment, now),
    [detail?.currentAssignment, now],
  );

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadWorkspace = async (preferredRequestId = activeRequestId) => {
    setLoading(true);
    setError('');
    try {
      const [requestList, staffList, vehicleList] = await Promise.all([
        companyApi.getRequests(),
        companyApi.getStaff(),
        companyApi.getVehicles(),
      ]);

      const normalizedRequests = (requestList ?? []).map(normalizeRequestSummary);

      setRequests(normalizedRequests);
      setStaff(staffList ?? []);
      setVehicles(vehicleList ?? []);

      const nextRequestId =
        preferredRequestId && normalizedRequests.some((item) => item.id === preferredRequestId)
          ? preferredRequestId
          : (normalizedRequests[0]?.id ?? null);

      setActiveRequestId(nextRequestId);
      return nextRequestId;
    } catch (err) {
      setError(getApiError(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadRequestDetail = async (requestId) => {
    if (!requestId) { setDetail(null); return; }
    setDetailLoading(true);
    try {
      setDetail(normalizeRequestDetail(await companyApi.getRequestDetail(requestId)));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { loadWorkspace(); }, []);

  useEffect(() => {
    if (activeRequestId) loadRequestDetail(activeRequestId);
    else setDetail(null);
  }, [activeRequestId]);

  useEffect(() => {
    if (!isPendingAssignment(detail?.currentAssignment)) return undefined;

    setNow(Date.now());

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [detail?.currentAssignment]);

  // Sync form state when the selected request detail changes
  useEffect(() => {
    if (!detail) return;

    const editableQuote      = detail.quotes?.find((q) => q.status === 'DRAFT' || q.status === 'SENT') || detail.quotes?.[0];
    const nextStatusOptions  = getAllowedStatusOptions('RESCUE_COMPANY', detail.status);

    setAssignmentForm({
      staffId:   detail.currentAssignment?.staffId   ? String(detail.currentAssignment.staffId)   : '',
      vehicleId: detail.currentAssignment?.vehicleId ? String(detail.currentAssignment.vehicleId) : '',
      note:      '',
    });
    setQuoteForm({
      staffId:         editableQuote?.staffId ? String(editableQuote.staffId) : '',
      estimatedAmount: editableQuote?.estimatedAmount ?? '',
      finalAmount:     editableQuote?.finalAmount     ?? '',
      serviceName:     editableQuote?.serviceName || detail.serviceType?.name || '',
      quantity:        editableQuote?.quantity    ?? 1,
      unitPrice:       editableQuote?.unitPrice   ?? '',
      subtotal:        editableQuote?.subtotal    ?? '',
      expiresAt:       toDateTimeInputValue(editableQuote?.expiresAt),
      note:            editableQuote?.note        ?? '',
    });
    setStatusForm((prev) => ({
      status: nextStatusOptions.includes(prev.status) ? prev.status : (nextStatusOptions[0] || prev.status),
      note:   prev.note,
    }));
  }, [detail]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const reloadActiveData = async () => {
    const nextRequestId = await loadWorkspace(activeRequestId);
    if (nextRequestId) await loadRequestDetail(nextRequestId);
  };

  const runAction = async (actionKey, action, successMessage) => {
    setBusyAction(actionKey);
    setNotice('');
    setError('');
    try {
      await action();
      setNotice(successMessage);
      await reloadActiveData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  const handleAssignment = async (event) => {
    event.preventDefault();
    if (!activeRequestId) return;

    // Client-side expiry check — backend will validate again server-side
    if (assignmentExpired) {
      setError('This assignment has expired. The acceptance window is closed. Please wait for the admin to reassign the request.');
      return;
    }

    await runAction(
      'assignment',
      async () => {
        const savedAssignment = await companyApi.createAssignment(activeRequestId, {
          staffId:   Number(assignmentForm.staffId),
          vehicleId: Number(assignmentForm.vehicleId),
          note:      assignmentForm.note,
        });

        setDetail((previous) => previous
          ? normalizeRequestDetail({ ...previous, currentAssignment: savedAssignment })
          : previous);
        setRequests((previous) => previous.map((item) => (item.id === activeRequestId
          ? {
              ...item,
              assignmentStatus: savedAssignment?.status ?? item.assignmentStatus,
              expiresAt: savedAssignment?.expiresAt ?? item.expiresAt,
            }
          : item)));
      },
      'Assignment saved successfully. Staff and vehicle have been confirmed.',
    );
  };

  const handleQuote = async (sendImmediately = false) => {
    if (!activeRequestId) return;
    await runAction(
      sendImmediately ? 'quote-send' : 'quote-save',
      async () => {
        const quote = await companyApi.createQuote(activeRequestId, {
          staffId:         quoteForm.staffId         ? Number(quoteForm.staffId)         : null,
          estimatedAmount: quoteForm.estimatedAmount  ? Number(quoteForm.estimatedAmount)  : null,
          finalAmount:     quoteForm.finalAmount      ? Number(quoteForm.finalAmount)      : null,
          serviceName:     quoteForm.serviceName,
          quantity:        quoteForm.quantity         ? Number(quoteForm.quantity)         : null,
          unitPrice:       quoteForm.unitPrice        ? Number(quoteForm.unitPrice)        : null,
          subtotal:        quoteForm.subtotal         ? Number(quoteForm.subtotal)         : null,
          expiresAt:       quoteForm.expiresAt || null,
          note:            quoteForm.note,
        });
        if (sendImmediately) await companyApi.sendQuote(quote.id);
      },
      sendImmediately
        ? 'Quote created and sent to customer.'
        : 'Quote saved as draft.',
    );
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!activeRequestId) return;
    await runAction(
      'status',
      () => requestApi.updateStatus(activeRequestId, statusForm),
      'Request status updated successfully.',
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <Loader label="Loading dispatch workspace..." />;

  return (
    <>
      <PageHeader
        title="Assigned Requests"
        subtitle="Select a request, confirm staff and vehicle, prepare a quote, and update rescue progress."
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error  ? <div className="notice error">{error}</div>  : null}

      <div className="grid-two">

        {/* ── Request Queue ──────────────────────────────────────────────── */}
        <div className="card">
          <h2>Request Queue</h2>
          {requests.length === 0 ? (
            <p>No requests are assigned to this company yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Incident</th>
                    <th>Priority</th>
                    <th>Status</th>
                    {/* Time Left column: shows countdown from top-level expiresAt
                        in RequestSummaryResponse (set only when a PENDING assignment exists) */}
                    <th>Time Left</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.requestCode}</strong>
                        <div className="muted-line">{request.customerName}</div>
                      </td>
                      <td>{request.incidentTypeName}</td>
                      <td><StatusBadge value={request.priorityLevel} /></td>
                      <td><StatusBadge value={request.status} /></td>
                      <td>
                        {/*
                          request.expiresAt is populated by the backend only when
                          a PENDING assignment exists for this request (via pendingAssignment).
                          It is null once the company has accepted or the assignment expired.
                        */}
                        {request.expiresAt && request.assignmentStatus === 'PENDING' ? (
                          <Countdown expiresAt={request.expiresAt} status={request.assignmentStatus} />
                        ) : (
                          <span className="muted-line">—</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-row">
                          <button
                            className="button button-secondary"
                            type="button"
                            onClick={() => setActiveRequestId(request.id)}
                          >
                            {activeRequestId === request.id ? 'Selected' : 'Select'}
                          </button>
                          <Link className="button button-secondary" to={`/requests/${request.id}`}>
                            Detail
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

        {/* ── Dispatch Workspace ─────────────────────────────────────────── */}
        <div className="card">
          <h2>Dispatch Workspace</h2>
          {detailLoading ? <Loader label="Loading selected request..." /> : null}
          {!detailLoading && !detail ? <p>Select a request to continue.</p> : null}

          {!detailLoading && detail ? (
            <>
              {/* Overview */}
              <div className="info-grid">
                <div className="info-item">
                  <span>Request</span>
                  <strong>{detail.requestCode}</strong>
                </div>
                <div className="info-item">
                  <span>Status</span>
                  <strong><StatusBadge value={detail.status} /></strong>
                </div>
                <div className="info-item">
                  <span>Customer</span>
                  <strong>{detail.customer?.fullName || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Incident</span>
                  <strong>{detail.incidentType?.name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Service</span>
                  <strong>{detail.serviceType?.name || 'N/A'}</strong>
                </div>
                <div className="info-item">
                  <span>Created</span>
                  <strong>{formatDateTime(detail.createdAt)}</strong>
                </div>
              </div>

              {/*
                Acceptance window countdown.
                Only shown while the current assignment is PENDING (not yet confirmed).
                Once accepted (status → ACCEPTED) this banner disappears because
                isAssignmentExpired() returns false for non-PENDING assignments.
              */}
              {detail.currentAssignment?.expiresAt &&
               isPendingAssignment(detail.currentAssignment) ? (
                <div
                  className="card card-muted"
                  style={{
                    marginBottom: '0.75rem',
                    borderLeft: `3px solid ${assignmentExpired ? 'var(--danger)' : 'var(--warning)'}`,
                  }}
                >
                  <div className="actions-row" style={{ alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Acceptance window:</span>
                    <Countdown expiresAt={detail.currentAssignment.expiresAt} status={detail.currentAssignment.status} />
                  </div>
                  {assignmentExpired ? (
                    <p className="muted-line" style={{ marginTop: '0.4rem', color: 'var(--danger)' }}>
                      The acceptance window has closed. You can no longer confirm this assignment.
                      The admin will be able to reassign the request to another company.
                    </p>
                  ) : (
                    <p className="muted-line" style={{ marginTop: '0.4rem' }}>
                      Assign a staff member and vehicle before the timer expires to confirm your company's acceptance.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="field">
                <label>Breakdown Location</label>
                <textarea value={detail.location?.fullAddress || 'No location available.'} disabled />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea value={detail.description || 'No description provided.'} disabled />
              </div>

              <div className="field">
                <label>Customer Vehicle</label>
                <input
                  value={
                    detail.vehicle
                      ? `${detail.vehicle.brand} ${detail.vehicle.model} - ${detail.vehicle.plateNumber}`
                      : 'No linked customer vehicle'
                  }
                  disabled
                />
              </div>

              <div className="card card-muted">
                <h3>Current Assignment</h3>
                <p><strong>Staff:</strong> {detail.currentAssignment?.staffName || 'Not assigned yet'}</p>
                <p><strong>Vehicle:</strong> {detail.currentAssignment?.vehicleCode || 'Not assigned yet'}</p>
                <p><strong>Assignment Status:</strong> {detail.currentAssignment?.status || 'Pending'}</p>
              </div>

              {/* ── Assign Staff & Vehicle ──────────────────────────────── */}
              <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={handleAssignment}>
                <h3>Confirm Staff & Vehicle</h3>

                {assignmentExpired ? (
                  <div className="notice error" style={{ marginBottom: '0.75rem' }}>
                    The acceptance window has expired. Confirming staff is no longer possible for this assignment.
                  </div>
                ) : null}

                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select
                      value={assignmentForm.staffId}
                      disabled={assignmentExpired}
                      onChange={(e) => setAssignmentForm((p) => ({ ...p, staffId: e.target.value }))}
                    >
                      <option value="">Select staff</option>
                      {staff.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.fullName} ({item.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Vehicle</label>
                    <select
                      value={assignmentForm.vehicleId}
                      disabled={assignmentExpired}
                      onChange={(e) => setAssignmentForm((p) => ({ ...p, vehicleId: e.target.value }))}
                    >
                      <option value="">Select vehicle</option>
                      {vehicles.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.vehicleCode} - {item.plateNumber} ({item.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Dispatch Note</label>
                  <input
                    value={assignmentForm.note}
                    disabled={assignmentExpired}
                    onChange={(e) => setAssignmentForm((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Optional note"
                  />
                </div>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={
                    busyAction === 'assignment' ||
                    !assignmentForm.staffId       ||
                    !assignmentForm.vehicleId     ||
                    assignmentExpired
                  }
                  title={assignmentExpired ? 'Acceptance window has expired' : undefined}
                >
                  {assignmentExpired
                    ? 'Expired — cannot confirm'
                    : busyAction === 'assignment'
                      ? 'Saving...'
                      : 'Confirm assignment (accept)'}
                </button>
              </form>

              {/* ── Status Update ───────────────────────────────────────── */}
              {statusOptions.length > 0 ? (
                <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={handleStatusUpdate}>
                  <h3>Update Request Progress</h3>
                  <div className="form-grid">
                    <div className="field">
                      <label>Status</label>
                      <select
                        value={statusForm.status}
                        onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Progress Note</label>
                      <input
                        value={statusForm.note}
                        onChange={(e) => setStatusForm((p) => ({ ...p, note: e.target.value }))}
                        placeholder="Optional progress note"
                      />
                    </div>
                  </div>
                  <button className="button button-secondary" type="submit" disabled={busyAction === 'status'}>
                    {busyAction === 'status' ? 'Updating...' : 'Update progress'}
                  </button>
                </form>
              ) : (
                <div className="card card-muted" style={{ marginTop: '1rem' }}>
                  <h3>Update Request Progress</h3>
                  <p className="muted-line">This request is already finalized.</p>
                </div>
              )}

              {/* ── Quote ───────────────────────────────────────────────── */}
              <div className="card card-muted" style={{ marginTop: '1rem' }}>
                <h3>Create or Update Quote</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select
                      value={quoteForm.staffId}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, staffId: e.target.value }))}
                    >
                      <option value="">Optional</option>
                      {staff.map((item) => (
                        <option key={item.id} value={item.id}>{item.fullName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Service Name</label>
                    <input
                      value={quoteForm.serviceName}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, serviceName: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Estimated Amount</label>
                    <input
                      value={quoteForm.estimatedAmount}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, estimatedAmount: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Final Amount</label>
                    <input
                      value={quoteForm.finalAmount}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, finalAmount: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quoteForm.quantity}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Unit Price</label>
                    <input
                      value={quoteForm.unitPrice}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, unitPrice: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Subtotal</label>
                    <input
                      value={quoteForm.subtotal}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, subtotal: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Expires At</label>
                    <input
                      type="datetime-local"
                      value={quoteForm.expiresAt}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, expiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Deal Note</label>
                    <input
                      value={quoteForm.note}
                      onChange={(e) => setQuoteForm((p) => ({ ...p, note: e.target.value }))}
                      placeholder="Included fees, night surcharge, or other deal terms"
                    />
                  </div>
                </div>
                <div className="actions-row">
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={busyAction === 'quote-save'}
                    onClick={() => handleQuote(false)}
                  >
                    {busyAction === 'quote-save' ? 'Saving...' : 'Save draft'}
                  </button>
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={busyAction === 'quote-send'}
                    onClick={() => handleQuote(true)}
                  >
                    {busyAction === 'quote-send' ? 'Sending...' : 'Create & send to customer'}
                  </button>
                </div>
              </div>

              {/* ── Quote History ────────────────────────────────────────── */}
              <div className="card card-muted" style={{ marginTop: '1rem' }}>
                <h3>Quote History</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Quote</th>
                        <th>Service</th>
                        <th>Total</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.quotes || []).length === 0 ? (
                        <tr><td colSpan="6">No quotes created yet.</td></tr>
                      ) : (
                        detail.quotes.map((quote) => (
                          <tr key={quote.id}>
                            <td>{quote.quoteCode}</td>
                            <td>{quote.serviceName}</td>
                            <td>{formatCurrency(quote.finalAmount ?? quote.estimatedAmount ?? quote.subtotal)}</td>
                            <td>{quote.note || 'N/A'}</td>
                            <td><StatusBadge value={quote.status} /></td>
                            <td>{formatDateTime(quote.expiresAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="actions-row" style={{ marginTop: '1rem' }}>
                <Link className="button button-secondary" to={`/requests/${detail.id}`}>
                  Open full request detail
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
