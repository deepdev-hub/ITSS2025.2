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
};

export default function CompanyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [quoteForm, setQuoteForm] = useState(initialQuote);
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '' });
  const [busyAction, setBusyAction] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const statusOptions = useMemo(
    () => getAllowedStatusOptions('RESCUE_COMPANY', detail?.status),
    [detail?.status],
  );

  const loadWorkspace = async (preferredRequestId = activeRequestId) => {
    setLoading(true);
    setError('');
    try {
      const [requestList, staffList, vehicleList] = await Promise.all([
        companyApi.getRequests(),
        companyApi.getStaff(),
        companyApi.getVehicles(),
      ]);

      setRequests(requestList);
      setStaff(staffList);
      setVehicles(vehicleList);

      const nextRequestId = preferredRequestId && requestList.some((item) => item.id === preferredRequestId)
        ? preferredRequestId
        : (requestList[0]?.id ?? null);

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
    if (!requestId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      setDetail(await companyApi.getRequestDetail(requestId));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (activeRequestId) {
      loadRequestDetail(activeRequestId);
    } else {
      setDetail(null);
    }
  }, [activeRequestId]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    const editableQuote = detail.quotes?.find((item) => item.status === 'DRAFT' || item.status === 'SENT') || detail.quotes?.[0];
    const nextStatusOptions = getAllowedStatusOptions('RESCUE_COMPANY', detail.status);

    setAssignmentForm({
      staffId: detail.currentAssignment?.staffId ? String(detail.currentAssignment.staffId) : '',
      vehicleId: detail.currentAssignment?.vehicleId ? String(detail.currentAssignment.vehicleId) : '',
      note: '',
    });
    setQuoteForm({
      staffId: editableQuote?.staffId ? String(editableQuote.staffId) : '',
      estimatedAmount: editableQuote?.estimatedAmount ?? '',
      finalAmount: editableQuote?.finalAmount ?? '',
      serviceName: editableQuote?.serviceName || detail.serviceType?.name || '',
      quantity: editableQuote?.quantity ?? 1,
      unitPrice: editableQuote?.unitPrice ?? '',
      subtotal: editableQuote?.subtotal ?? '',
      expiresAt: toDateTimeInputValue(editableQuote?.expiresAt),
    });
    setStatusForm((previous) => ({
      status: nextStatusOptions.includes(previous.status) ? previous.status : (nextStatusOptions[0] || previous.status),
      note: previous.note,
    }));
  }, [detail]);

  const reloadActiveData = async () => {
    const nextRequestId = await loadWorkspace(activeRequestId);
    if (nextRequestId) {
      await loadRequestDetail(nextRequestId);
    }
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
    if (!activeRequestId) {
      return;
    }
    await runAction(
      'assignment',
      () => companyApi.createAssignment(activeRequestId, {
        staffId: Number(assignmentForm.staffId),
        vehicleId: Number(assignmentForm.vehicleId),
        note: assignmentForm.note,
      }),
      'Assignment updated successfully.',
    );
  };

  const handleQuote = async (sendImmediately = false) => {
    if (!activeRequestId) {
      return;
    }
    await runAction(
      sendImmediately ? 'quote-send' : 'quote-save',
      async () => {
        const quote = await companyApi.createQuote(activeRequestId, {
          staffId: quoteForm.staffId ? Number(quoteForm.staffId) : null,
          estimatedAmount: quoteForm.estimatedAmount ? Number(quoteForm.estimatedAmount) : null,
          finalAmount: quoteForm.finalAmount ? Number(quoteForm.finalAmount) : null,
          serviceName: quoteForm.serviceName,
          quantity: quoteForm.quantity ? Number(quoteForm.quantity) : null,
          unitPrice: quoteForm.unitPrice ? Number(quoteForm.unitPrice) : null,
          subtotal: quoteForm.subtotal ? Number(quoteForm.subtotal) : null,
          expiresAt: quoteForm.expiresAt || null,
        });

        if (sendImmediately) {
          await companyApi.sendQuote(quote.id);
        }
      },
      sendImmediately ? 'Quote created and sent successfully.' : 'Quote saved as draft successfully.',
    );
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    if (!activeRequestId) {
      return;
    }
    await runAction(
      'status',
      () => requestApi.updateStatus(activeRequestId, statusForm),
      'Request status updated successfully.',
    );
  };

  if (loading) {
    return <Loader label="Loading dispatch workspace..." />;
  }

  return (
    <>
      <PageHeader
        title="Assigned Requests"
        subtitle="Select a request, dispatch staff and vehicles, prepare the quote, and update rescue progress in one place."
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
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
                    <th>Countdown</th>
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
                        <Countdown expiresAt={request.expiresAt} status={request.assignmentStatus} label="" />
                      </td>
                      <td>
                        <div className="actions-row">
                          <button className="button button-secondary" type="button" onClick={() => setActiveRequestId(request.id)}>
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

        <div className="card">
          <h2>Dispatch Workspace</h2>
          {detailLoading ? <Loader label="Loading selected request..." /> : null}

          {!detailLoading && !detail ? <p>Select a request to continue.</p> : null}

          {!detailLoading && detail ? (
            <>
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
                <Countdown
                  expiresAt={detail.currentAssignment?.expiresAt}
                  status={detail.currentAssignment?.status}
                />
              </div>

              <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={handleAssignment}>
                <h3>Assign Staff & Vehicle</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select
                      value={assignmentForm.staffId}
                      onChange={(event) => setAssignmentForm((previous) => ({ ...previous, staffId: event.target.value }))}
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
                      onChange={(event) => setAssignmentForm((previous) => ({ ...previous, vehicleId: event.target.value }))}
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
                  <label>Assignment Note</label>
                  <input
                    value={assignmentForm.note}
                    onChange={(event) => setAssignmentForm((previous) => ({ ...previous, note: event.target.value }))}
                    placeholder="Optional note for dispatch"
                  />
                </div>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={busyAction === 'assignment' || !assignmentForm.staffId || !assignmentForm.vehicleId}
                >
                  {busyAction === 'assignment' ? 'Saving...' : 'Save assignment'}
                </button>
              </form>

              {statusOptions.length > 0 ? (
                <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={handleStatusUpdate}>
                  <h3>Update Request Progress</h3>
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
                      <label>Progress Note</label>
                      <input
                        value={statusForm.note}
                        onChange={(event) => setStatusForm((previous) => ({ ...previous, note: event.target.value }))}
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
                  <p className="muted-line">This request is already finalized, so no more company-side status change is needed.</p>
                </div>
              )}

              <div className="card card-muted" style={{ marginTop: '1rem' }}>
                <h3>Create or Update Quote</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Staff</label>
                    <select
                      value={quoteForm.staffId}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, staffId: event.target.value }))}
                    >
                      <option value="">Optional</option>
                      {staff.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Service Name</label>
                    <input
                      value={quoteForm.serviceName}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, serviceName: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Estimated Amount</label>
                    <input
                      value={quoteForm.estimatedAmount}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, estimatedAmount: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Final Amount</label>
                    <input
                      value={quoteForm.finalAmount}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, finalAmount: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quoteForm.quantity}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, quantity: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Unit Price</label>
                    <input
                      value={quoteForm.unitPrice}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, unitPrice: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Subtotal</label>
                    <input
                      value={quoteForm.subtotal}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, subtotal: event.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label>Expires At</label>
                    <input
                      type="datetime-local"
                      value={quoteForm.expiresAt}
                      onChange={(event) => setQuoteForm((previous) => ({ ...previous, expiresAt: event.target.value }))}
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
                    {busyAction === 'quote-send' ? 'Sending...' : 'Create & send'}
                  </button>
                </div>
              </div>

              <div className="card card-muted" style={{ marginTop: '1rem' }}>
                <h3>Quote History</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Quote</th>
                        <th>Service</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.quotes || []).length === 0 ? (
                        <tr>
                          <td colSpan="5">No quotes created yet.</td>
                        </tr>
                      ) : (
                        detail.quotes.map((quote) => (
                          <tr key={quote.id}>
                            <td>{quote.quoteCode}</td>
                            <td>{quote.serviceName}</td>
                            <td>{formatCurrency(quote.finalAmount ?? quote.estimatedAmount ?? quote.subtotal)}</td>
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
