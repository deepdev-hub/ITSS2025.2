import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : 'N/A';
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', paymentMethod: 'CASH', paymentStatus: 'PAID' });
  const [reviewForm, setReviewForm] = useState({ ratingScore: 5, comment: '' });

  const isCustomer = user?.roleName === 'CUSTOMER';
  const isOpsRole = ['ADMIN', 'RESCUE_COMPANY', 'RESCUE_STAFF'].includes(user?.roleName);

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
      const pending = requestDetail.payments?.find((item) => item.paymentStatus === 'PENDING');
      if (pending) {
        setPaymentForm((previous) => ({ ...previous, amount: pending.amount || '' }));
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const pendingPayment = useMemo(
    () => detail?.payments?.find((item) => item.paymentStatus === 'PENDING'),
    [detail],
  );

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) {
      return;
    }
    try {
      await requestApi.sendMessage(id, { content: messageInput });
      setMessageInput('');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const cancelRequest = async () => {
    try {
      await requestApi.cancelRequest(id, { note: 'Canceled by customer' });
      setNotice('Request canceled successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const updateStatus = async (event) => {
    event.preventDefault();
    try {
      await requestApi.updateStatus(id, statusForm);
      setNotice('Request status updated successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const decideQuote = async (quoteId, action) => {
    try {
      if (action === 'accept') {
        await requestApi.acceptQuote(quoteId);
        setNotice('Quote accepted successfully');
      } else {
        await requestApi.rejectQuote(quoteId);
        setNotice('Quote rejected successfully');
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const createPayment = async (event) => {
    event.preventDefault();
    try {
      await requestApi.createPayment(id, {
        amount: paymentForm.amount ? Number(paymentForm.amount) : null,
        paymentMethod: paymentForm.paymentMethod,
      });
      setNotice('Payment record created successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const payNow = async () => {
    if (!pendingPayment) {
      return;
    }
    try {
      await requestApi.pay(pendingPayment.id, { paymentStatus: paymentForm.paymentStatus });
      setNotice('Payment updated successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const createReview = async (event) => {
    event.preventDefault();
    try {
      await requestApi.createReview(id, {
        ratingScore: Number(reviewForm.ratingScore),
        comment: reviewForm.comment,
      });
      setNotice('Review submitted successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  if (loading) {
    return <div className="card">Loading request detail...</div>;
  }

  if (!detail) {
    return <div className="notice error">Request detail is unavailable.</div>;
  }

  return (
    <>
      <PageHeader
        title={`Request ${detail.requestCode}`}
        subtitle={`Created ${formatDate(detail.createdAt)}`}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <div className="card">
          <h2>Request Overview</h2>
          <div className="form-grid">
            <div><strong>Status</strong><div><StatusBadge value={detail.status} /></div></div>
            <div><strong>Priority</strong><div><StatusBadge value={detail.priorityLevel} /></div></div>
            <div><strong>Incident</strong><div>{detail.incidentType?.name || 'N/A'}</div></div>
            <div><strong>Service</strong><div>{detail.serviceType?.name || 'N/A'}</div></div>
            <div><strong>Customer</strong><div>{detail.customer?.fullName || 'N/A'}</div></div>
            <div><strong>Company</strong><div>{detail.assignedCompany?.companyName || 'Waiting for assignment'}</div></div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea value={detail.description || ''} disabled />
          </div>

          <div className="field">
            <label>Location</label>
            <textarea value={detail.location?.fullAddress || ''} disabled />
          </div>

          <div className="field">
            <label>Vehicle</label>
            <input
              value={
                detail.vehicle
                  ? `${detail.vehicle.brand} ${detail.vehicle.model} - ${detail.vehicle.plateNumber}`
                  : 'No linked vehicle'
              }
              disabled
            />
          </div>

          {detail.currentAssignment ? (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3>Current Assignment</h3>
              <p><strong>Staff:</strong> {detail.currentAssignment.staffName || 'Not assigned'}</p>
              <p><strong>Vehicle:</strong> {detail.currentAssignment.vehicleCode || 'Not assigned'}</p>
              <p><strong>Assignment Status:</strong> <StatusBadge value={detail.currentAssignment.status} /></p>
            </div>
          ) : null}

          {isCustomer && !['COMPLETED', 'CANCELED'].includes(detail.status) ? (
            <div className="actions-row" style={{ marginTop: '1rem' }}>
              <button className="button button-danger" type="button" onClick={cancelRequest}>
                Cancel Request
              </button>
            </div>
          ) : null}

          {isOpsRole ? (
            <form className="card" style={{ marginTop: '1rem' }} onSubmit={updateStatus}>
              <h3>Update Status</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(event) => setStatusForm((previous) => ({ ...previous, status: event.target.value }))}
                  >
                    <option value="MATCHED">MATCHED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELED">CANCELED</option>
                  </select>
                </div>
                <div className="field">
                  <label>Note</label>
                  <input
                    value={statusForm.note}
                    onChange={(event) => setStatusForm((previous) => ({ ...previous, note: event.target.value }))}
                  />
                </div>
              </div>
              <button className="button button-primary" type="submit">Update status</button>
            </form>
          ) : null}
        </div>

        <div className="card">
          <h2>Quotes</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(detail.quotes || []).map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.quoteCode}</td>
                    <td>{quote.companyName}</td>
                    <td><StatusBadge value={quote.status} /></td>
                    <td>{quote.finalAmount ?? quote.estimatedAmount ?? 'N/A'}</td>
                    <td>
                      {isCustomer && quote.status === 'SENT' ? (
                        <div className="actions-row">
                          <button className="button button-primary" type="button" onClick={() => decideQuote(quote.id, 'accept')}>
                            Accept
                          </button>
                          <button className="button button-danger" type="button" onClick={() => decideQuote(quote.id, 'reject')}>
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
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
                  <th>Paid At</th>
                </tr>
              </thead>
              <tbody>
                {(detail.payments || []).map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.amount}</td>
                    <td>{payment.paymentMethod}</td>
                    <td><StatusBadge value={payment.paymentStatus} /></td>
                    <td>{formatDate(payment.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isCustomer ? (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3>Payment Actions</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Amount</label>
                  <input
                    value={paymentForm.amount}
                    onChange={(event) => setPaymentForm((previous) => ({ ...previous, amount: event.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentMethod: event.target.value }))}
                  >
                    <option value="CASH">CASH</option>
                    <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                    <option value="MOMO">MOMO</option>
                    <option value="VNPAY">VNPAY</option>
                    <option value="ZALOPAY">ZALOPAY</option>
                  </select>
                </div>
                <div className="field">
                  <label>Mock Result</label>
                  <select
                    value={paymentForm.paymentStatus}
                    onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentStatus: event.target.value }))}
                  >
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="actions-row">
                <button className="button button-secondary" type="button" onClick={createPayment}>
                  Create payment
                </button>
                {pendingPayment ? (
                  <button className="button button-primary" type="button" onClick={payNow}>
                    Pay pending
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {isCustomer && detail.status === 'COMPLETED' && !detail.review ? (
            <form className="card" style={{ marginTop: '1rem' }} onSubmit={createReview}>
              <h3>Leave Review</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Rating</label>
                  <select
                    value={reviewForm.ratingScore}
                    onChange={(event) => setReviewForm((previous) => ({ ...previous, ratingScore: event.target.value }))}
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>
                <div className="field">
                  <label>Comment</label>
                  <input
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((previous) => ({ ...previous, comment: event.target.value }))}
                  />
                </div>
              </div>
              <button className="button button-primary" type="submit">Submit review</button>
            </form>
          ) : null}

          {detail.review ? (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3>Review</h3>
              <p><strong>Rating:</strong> {detail.review.ratingScore}/5</p>
              <p><strong>Comment:</strong> {detail.review.comment || 'N/A'}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>Chat</h2>
          <div className="message-list">
            {messages.map((message) => (
              <div key={message.id} className="message-bubble">
                <div className="message-meta">
                  <span>{message.senderName} ({message.senderRole})</span>
                  <span>{formatDate(message.sentAt)}</span>
                </div>
                <div>{message.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} style={{ marginTop: '1rem' }}>
            <div className="actions-row">
              <input
                style={{ flex: 1, padding: '0.9rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Send a message..."
              />
              <button className="button button-primary" type="submit">Send</button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Status History</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Old</th>
                  <th>New</th>
                  <th>Changed By</th>
                  <th>At</th>
                </tr>
              </thead>
              <tbody>
                {(detail.history || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.oldStatus || 'N/A'}</td>
                    <td><StatusBadge value={item.newStatus} /></td>
                    <td>{item.changedByUserName}</td>
                    <td>{formatDate(item.changedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
