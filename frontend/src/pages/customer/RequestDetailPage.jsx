import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Countdown from '../../components/common/Countdown';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import {
  canCustomerCancel,
  formatCurrency,
  formatDateTime,
  getAllowedStatusOptions,
} from '../../utils/requestUi';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getQuoteAmount(quote) {
  return quote?.finalAmount ?? quote?.estimatedAmount ?? quote?.subtotal ?? null;
}

/**
 * Shown to the customer while status = MATCHED (company assigned but not yet confirmed).
 * Uses currentAssignment.expiresAt from the DETAIL response (nested object).
 */
function AssignmentCountdownBanner({ assignment }) {
  if (!assignment?.expiresAt) return null;

  const isExpired = new Date(assignment.expiresAt).getTime() <= Date.now();

  return (
    <div
      className="card card-muted"
      style={{
        marginBottom: '1rem',
        borderLeft: `3px solid ${isExpired ? 'var(--danger)' : 'var(--warning)'}`,
        padding: '0.9rem 1.1rem',
      }}
    >
      {isExpired ? (
        <>
          <strong style={{ color: 'var(--danger)' }}>Company did not respond in time</strong>
          <p className="muted-line" style={{ marginTop: '0.3rem' }}>
            No company accepted this assignment. Please wait — the admin will reassign to another company shortly.
          </p>
        </>
      ) : (
        <>
          <strong>Waiting for company to confirm:</strong>
          <div style={{ marginTop: '0.4rem' }}>
            <Countdown expiresAt={assignment.expiresAt} label="Company will respond in:" />
          </div>
          <p className="muted-line" style={{ marginTop: '0.3rem' }}>
            If the company does not respond in time, the admin will reassign your request automatically.
          </p>
        </>
      )}
    </div>
  );
}

const defaultPaymentForm = {
  amount: '',
  paymentMethod: 'CASH',
  paymentStatus: 'PAID',
};

const defaultReviewForm = {
  ratingScore: 5,
  comment: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const [detail, setDetail]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [notice, setNotice]         = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [statusForm, setStatusForm]     = useState({ status: 'IN_PROGRESS', note: '' });
  const [paymentForm, setPaymentForm]   = useState(defaultPaymentForm);
  const [reviewForm, setReviewForm]     = useState(defaultReviewForm);

  const isCustomer = user?.roleName === 'CUSTOMER';
  const isOpsRole  = ['ADMIN', 'RESCUE_COMPANY', 'RESCUE_STAFF'].includes(user?.roleName);

  const statusOptions = useMemo(
    () => getAllowedStatusOptions(user?.roleName, detail?.status),
    [detail?.status, user?.roleName],
  );

  const acceptedQuote = useMemo(
    () => detail?.quotes?.find((item) => item.status === 'ACCEPTED') ?? null,
    [detail],
  );

  const pendingPayment = useMemo(
    () => detail?.payments?.find((item) => item.paymentStatus === 'PENDING') ?? null,
    [detail],
  );

  // Show the countdown banner while the request is in MATCHED status
  // (company has been assigned but has not yet confirmed by selecting staff)
  const showAssignmentCountdown =
    detail?.status === 'MATCHED' &&
    detail?.currentAssignment?.status === 'PENDING' &&
    !!detail?.currentAssignment?.expiresAt;

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [requestDetail, requestMessages] = await Promise.all([
        requestApi.getRequestDetail(id),
        requestApi.getMessages(id),
      ]);
      setDetail(requestDetail);
      setMessages(requestMessages);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!detail) return;
    const nextStatusOptions    = getAllowedStatusOptions(user?.roleName, detail.status);
    const acceptedAmount       = getQuoteAmount(detail.quotes?.find((item) => item.status === 'ACCEPTED'));
    const nextPaymentAmount    = pendingPayment?.amount ?? acceptedAmount ?? '';

    setStatusForm((prev) => ({
      status: nextStatusOptions.includes(prev.status) ? prev.status : (nextStatusOptions[0] || prev.status),
      note:   prev.note,
    }));
    setPaymentForm((prev) => ({
      ...prev,
      amount: nextPaymentAmount === '' ? prev.amount : nextPaymentAmount,
    }));
  }, [detail, pendingPayment, user?.roleName]);

  const runAction = async (actionKey, action, successMessage) => {
    setBusyAction(actionKey);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) return;
    await runAction('message', async () => {
      await requestApi.sendMessage(id, { content: messageInput.trim() });
      setMessageInput('');
    }, 'Message sent successfully.');
  };

  const cancelRequest = async () => runAction(
    'cancel',
    () => requestApi.cancelRequest(id, { note: 'Canceled by customer from request detail' }),
    'Request canceled successfully.',
  );

  const updateStatus = async (event) => {
    event.preventDefault();
    await runAction('status', () => requestApi.updateStatus(id, statusForm), 'Request status updated successfully.');
  };

  const decideQuote = async (quoteId, action) => runAction(
    `quote-${action}`,
    () => (action === 'accept' ? requestApi.acceptQuote(quoteId) : requestApi.rejectQuote(quoteId)),
    `Quote ${action === 'accept' ? 'accepted' : 'rejected'} successfully.`,
  );

  const createPayment = async () => runAction(
    'create-payment',
    () => requestApi.createPayment(id, {
      amount: paymentForm.amount ? Number(paymentForm.amount) : null,
      paymentMethod: paymentForm.paymentMethod,
    }),
    'Payment record created successfully.',
  );

  const payNow = async () => {
    if (!pendingPayment) return;
    await runAction(
      'pay',
      () => requestApi.pay(pendingPayment.id, { paymentStatus: paymentForm.paymentStatus }),
      'Payment updated successfully.',
    );
  };

  const createReview = async (event) => {
    event.preventDefault();
    await runAction('review', async () => {
      await requestApi.createReview(id, {
        ratingScore: Number(reviewForm.ratingScore),
        comment:     reviewForm.comment,
      });
      setReviewForm(defaultReviewForm);
    }, 'Review submitted successfully.');
  };

  if (loading) return <Loader label="Loading request detail..." />;
  if (!detail)  return <div className="notice error">Request detail is unavailable.</div>;

  return (
    <>
      <PageHeader
        title={`Request ${detail.requestCode}`}
        subtitle={`Created ${formatDateTime(detail.createdAt)}`}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error  ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        {/* ── Left column: overview ───────────────────────────────────────── */}
        <div className="card">
          <h2>Request Overview</h2>

          {/* Assignment countdown — visible to all roles while company is pending */}
          {showAssignmentCountdown ? (
            <AssignmentCountdownBanner assignment={detail.currentAssignment} />
          ) : null}

          <div className="info-grid">
            <div className="info-item">
              <span>Status</span>
              <strong><StatusBadge value={detail.status} /></strong>
            </div>
            <div className="info-item">
              <span>Priority</span>
              <strong><StatusBadge value={detail.priorityLevel} /></strong>
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
              <span>Customer</span>
              <strong>{detail.customer?.fullName || 'N/A'}</strong>
            </div>
            <div className="info-item">
              <span>Assigned Company</span>
              <strong>{detail.assignedCompany?.companyName || 'Waiting for assignment'}</strong>
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={detail.description || 'No description provided.'} disabled />
          </div>

          <div className="field">
            <label>Breakdown Location</label>
            <textarea value={detail.location?.fullAddress || 'No location available.'} disabled />
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

          <div className="grid-three" style={{ marginTop: '1rem' }}>
            <div className="card card-muted">
              <h3>Company</h3>
              <p>{detail.assignedCompany?.companyName || 'Not assigned yet'}</p>
              <p className="muted-line">
                {detail.assignedCompany?.phone || detail.assignedCompany?.email || 'Waiting for dispatch'}
              </p>
            </div>
            <div className="card card-muted">
              <h3>Assigned Staff</h3>
              <p>{detail.currentAssignment?.staffName || 'Not assigned yet'}</p>
              <p className="muted-line">
                {detail.review?.staffName || detail.currentAssignment?.status || 'Pending assignment'}
              </p>
            </div>
            <div className="card card-muted">
              <h3>Rescue Vehicle</h3>
              <p>{detail.currentAssignment?.vehicleCode || 'Not assigned yet'}</p>
              <p className="muted-line">{detail.currentAssignment?.vehiclePlateNumber || 'No plate information'}</p>
            </div>
          </div>

          {/* Customer: cancel button */}
          {isCustomer && canCustomerCancel(detail.status) ? (
            <div className="actions-row" style={{ marginTop: '1rem' }}>
              <button
                className="button button-danger"
                type="button"
                disabled={busyAction === 'cancel'}
                onClick={cancelRequest}
              >
                {busyAction === 'cancel' ? 'Canceling...' : 'Cancel Request'}
              </button>
            </div>
          ) : null}

          {/* Ops roles: status update form */}
          {isOpsRole && statusOptions.length > 0 ? (
            <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={updateStatus}>
              <h3>Update Progress</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Next Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(event) => setStatusForm((prev) => ({ ...prev, status: event.target.value }))}
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
                    onChange={(event) => setStatusForm((prev) => ({ ...prev, note: event.target.value }))}
                    placeholder="Optional progress note"
                  />
                </div>
              </div>
              <button className="button button-primary" type="submit" disabled={busyAction === 'status'}>
                {busyAction === 'status' ? 'Updating...' : 'Update status'}
              </button>
            </form>
          ) : null}
        </div>

        {/* ── Right column: quote & payment ──────────────────────────────── */}
        <div className="card">
          <h2>Quote & Payment</h2>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Quote</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Total</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(detail.quotes || []).length === 0 ? (
                  <tr><td colSpan="7">No quote has been created yet.</td></tr>
                ) : (
                  detail.quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        <strong>{quote.quoteCode}</strong>
                        <div className="muted-line">{quote.companyName}</div>
                      </td>
                      <td>
                        <strong>{quote.serviceName || 'Breakdown Assistance'}</strong>
                        <div className="muted-line">
                          Qty {quote.quantity || 1}
                          {quote.unitPrice ? ` x ${formatCurrency(quote.unitPrice)}` : ''}
                        </div>
                      </td>
                      <td>{quote.staffName || 'Company dispatch team'}</td>
                      <td>{formatCurrency(getQuoteAmount(quote))}</td>
                      <td>{formatDateTime(quote.expiresAt)}</td>
                      <td><StatusBadge value={quote.status} /></td>
                      <td>
                        {isCustomer && quote.status === 'SENT' ? (
                          <div className="actions-row">
                            <button
                              className="button button-primary"
                              type="button"
                              disabled={busyAction === 'quote-accept'}
                              onClick={() => decideQuote(quote.id, 'accept')}
                            >
                              Accept
                            </button>
                            <button
                              className="button button-danger"
                              type="button"
                              disabled={busyAction === 'quote-reject'}
                              onClick={() => decideQuote(quote.id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: '1rem' }}>Payments</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {(detail.payments || []).length === 0 ? (
                  <tr><td colSpan="5">No payment record has been created yet.</td></tr>
                ) : (
                  detail.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{payment.paymentMethod}</td>
                      <td><StatusBadge value={payment.paymentStatus} /></td>
                      <td>{formatDateTime(payment.createdAt)}</td>
                      <td>{formatDateTime(payment.paidAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isCustomer ? (
            <div className="card card-muted" style={{ marginTop: '1rem' }}>
              <h3>Payment Actions</h3>
              <p className="muted-line">
                Accepted quote amount:{' '}
                {acceptedQuote ? formatCurrency(getQuoteAmount(acceptedQuote)) : 'No accepted quote yet'}
              </p>
              <div className="form-grid">
                <div className="field">
                  <label>Amount</label>
                  <input
                    value={paymentForm.amount}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                    placeholder="Leave blank to use accepted quote amount"
                  />
                </div>
                <div className="field">
                  <label>Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="MOMO">MOMO</option>
                    <option value="VNPAY">VNPAY</option>
                    <option value="ZALOPAY">ZALOPAY</option>
                  </select>
                </div>
                <div className="field">
                  <label>Mock Payment Result</label>
                  <select
                    value={paymentForm.paymentStatus}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentStatus: event.target.value }))}
                  >
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>
              <div className="actions-row">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={busyAction === 'create-payment'}
                  onClick={createPayment}
                >
                  {busyAction === 'create-payment' ? 'Creating...' : 'Create payment record'}
                </button>
                {pendingPayment ? (
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={busyAction === 'pay'}
                    onClick={payNow}
                  >
                    {busyAction === 'pay' ? 'Processing...' : 'Pay pending record'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {detail.review ? (
            <div className="card card-muted" style={{ marginTop: '1rem' }}>
              <h3>Review</h3>
              <p><strong>Rating:</strong> {detail.review.ratingScore}/5</p>
              <p><strong>Comment:</strong> {detail.review.comment || 'No comment provided'}</p>
              <p className="muted-line">Submitted {formatDateTime(detail.review.createdAt)}</p>
            </div>
          ) : null}

          {isCustomer && detail.status === 'COMPLETED' && !detail.review ? (
            <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={createReview}>
              <h3>Leave Review</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Rating</label>
                  <select
                    value={reviewForm.ratingScore}
                    onChange={(event) => setReviewForm((prev) => ({ ...prev, ratingScore: event.target.value }))}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Comment</label>
                  <input
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                    placeholder="Share your rescue experience"
                  />
                </div>
              </div>
              <button className="button button-primary" type="submit" disabled={busyAction === 'review'}>
                {busyAction === 'review' ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          ) : null}

          {isCustomer && detail.status !== 'COMPLETED' && !detail.review ? (
            <div className="card card-muted" style={{ marginTop: '1rem' }}>
              <h3>Review</h3>
              <p className="muted-line">You can leave a review after the request is marked COMPLETED.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Bottom row: chat + history ────────────────────────────────────── */}
      <div className="grid-two">
        <div className="card">
          <h2>Chat</h2>
          <div className="message-list">
            {messages.length === 0 ? (
              <p className="muted-line">No messages yet. Start the conversation here.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="message-bubble">
                  <div className="message-meta">
                    <span>{message.senderName} ({message.senderRole})</span>
                    <span>{formatDateTime(message.sentAt)}</span>
                  </div>
                  <div>{message.content}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={sendMessage} style={{ marginTop: '1rem' }}>
            <div className="actions-row">
              <input
                style={{
                  flex: 1,
                  padding: '0.9rem 1rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                }}
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Send a message..."
              />
              <button className="button button-primary" type="submit" disabled={busyAction === 'message'}>
                {busyAction === 'message' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Status History</h2>
          {(detail.history || []).length === 0 ? (
            <p className="muted-line">No status history recorded yet.</p>
          ) : (
            <div className="timeline">
              {detail.history.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-title">
                      <strong>{item.oldStatus || 'NEW'}</strong>
                      <span>{' -> '}</span>
                      <strong>{item.newStatus}</strong>
                    </div>
                    <div className="muted-line">
                      {item.changedByUserName} at {formatDateTime(item.changedAt)}
                    </div>
                    {item.note ? <div>{item.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}