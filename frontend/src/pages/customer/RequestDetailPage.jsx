import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  resolveRequestImageUrl,
  addRequestImageCacheKey,
  getRequestImageUrlFromUploadResponse,
} from '../../utils/requestImage';

const ACTIVE_POLL_INTERVAL = 5000;
const STABLE_POLL_INTERVAL = 10000;
const BACKGROUND_POLL_INTERVAL = 15000;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

const defaultPaymentForm = {
  amount: '',
  paymentMethod: 'CASH',
  paymentStatus: 'PAID',
};

const defaultReviewForm = {
  ratingScore: 5,
  comment: '',
};

function getCurrentPollMode() {
  if (typeof document === 'undefined') {
    return 'active';
  }
  return document.visibilityState === 'hidden' ? 'background' : 'active';
}

function getQuoteAmount(quote) {
  return quote?.finalAmount ?? quote?.estimatedAmount ?? quote?.subtotal ?? null;
}

function normalizeMessages(items = []) {
  const byId = new Map();
  [...items]
    .sort((left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime())
    .forEach((item) => {
      byId.set(item.id, item);
    });
  return Array.from(byId.values());
}

function getProgressTitle(roleName) {
  switch (roleName) {
    case 'ADMIN':
      return 'Admin Progress Control';
    case 'RESCUE_COMPANY':
      return 'Company Progress Control';
    case 'RESCUE_STAFF':
      return 'Staff Progress Control';
    default:
      return 'Progress Control';
  }
}

function SectionHeader({ title, subtitle, aside }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {aside}
    </div>
  );
}

// Displays the request image with broken-image fallback and cache busting
function RequestImage({ imageUrl, updatedAt }) {
  const [imageError, setImageError] = useState(false);

  const resolvedUrl = resolveRequestImageUrl(imageUrl || '');
  const displayUrl = imageError ? null : addRequestImageCacheKey(resolvedUrl, updatedAt);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="request-image-empty">
        <p className="muted-line">No image has been attached to this request.</p>
      </div>
    );
  }

  if (!displayUrl) {
    return (
      <div className="request-image-empty">
        <p className="muted-line">Image could not be loaded.</p>
      </div>
    );
  }

  return (
    <img
      src={displayUrl}
      alt="Request"
      className="request-image-display"
      onError={() => setImageError(true)}
    />
  );
}

// Upload widget for customers to attach/change image on existing request
function RequestImageUpload({ requestId, currentImageUrl, onUploadSuccess, onError }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const rawUrl = previewUrl || currentImageUrl || '';
  const resolvedUrl = resolveRequestImageUrl(rawUrl);
  const displayUrl = imageError ? null : resolvedUrl;

  useEffect(() => {
    setImageError(false);
  }, [rawUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError('Please select a valid image file (JPEG, PNG, WebP, or GIF).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setImageError(false);
    onError('');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await requestApi.uploadRequestImage(requestId, formData);
      const newUrl = getRequestImageUrlFromUploadResponse(result);
      setPreviewUrl((previous) => {
        if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
        return null;
      });
      onUploadSuccess('Request image updated successfully.', newUrl);
    } catch (err) {
      setPreviewUrl((previous) => {
        if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
        return null;
      });
      onError(getApiError(err));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="avatar-upload-block" style={{ marginTop: '1rem' }}>
      <div className="avatar-preview-wrap">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Request"
            className="request-image-thumb"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="avatar-preview avatar-initials-lg" style={{ fontSize: '1.2rem' }}>📷</span>
        )}
        {uploading && (
          <div className="avatar-overlay">
            <div className="avatar-spinner" />
          </div>
        )}
      </div>
      <div className="avatar-upload-info">
        <p className="avatar-upload-hint">
          JPEG, PNG, WebP or GIF — Max {MAX_FILE_SIZE_MB}MB
        </p>
        <button
          type="button"
          className="button button-secondary"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : (currentImageUrl ? 'Change image' : 'Upload image')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pollMode, setPollMode] = useState(getCurrentPollMode);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [statusForm, setStatusForm] = useState({ status: 'IN_PROGRESS', note: '' });
  const [paymentForm, setPaymentForm] = useState(defaultPaymentForm);
  const [reviewForm, setReviewForm] = useState(defaultReviewForm);
  const refreshInFlightRef = useRef(false);
  const messageListRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);

  const isCustomer = user?.roleName === 'CUSTOMER';
  const isOpsRole = ['ADMIN', 'RESCUE_COMPANY', 'RESCUE_STAFF'].includes(user?.roleName);

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

  const sentQuote = useMemo(
    () => detail?.quotes?.find((item) => item.status === 'SENT') ?? null,
    [detail],
  );

  const canLeaveReview = isCustomer && detail?.status === 'COMPLETED' && !detail?.review;
  const stableRequest = useMemo(
    () => ['COMPLETED', 'CANCELED'].includes(detail?.status)
      && !pendingPayment
      && (detail?.status === 'CANCELED' || Boolean(detail?.review)),
    [detail?.review, detail?.status, pendingPayment],
  );

  const pollIntervalMs = pollMode === 'background'
    ? BACKGROUND_POLL_INTERVAL
    : (stableRequest ? STABLE_POLL_INTERVAL : ACTIVE_POLL_INTERVAL);

  const pollLabel = pollMode === 'background'
    ? 'Background refresh every 15s'
    : (stableRequest ? 'Auto refresh every 10s' : 'Auto refresh every 5s');

  const refreshData = useCallback(async ({
    silent = false,
    showError = !silent,
    force = false,
  } = {}) => {
    if (refreshInFlightRef.current && !force) {
      return;
    }

    refreshInFlightRef.current = true;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      if (showError) {
        setError('');
      }
    }

    try {
      const [requestDetail, requestMessages] = await Promise.all([
        requestApi.getRequestDetail(id),
        requestApi.getMessages(id),
      ]);
      setDetail(requestDetail);
      setMessages(normalizeMessages(requestMessages));
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      if (showError) {
        setError(getApiError(err));
      }
    } finally {
      refreshInFlightRef.current = false;
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [id]);

  const scrollToLatestMessage = useCallback((behavior = 'smooth') => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  useEffect(() => {
    refreshData({ force: true });
  }, [refreshData]);

  useEffect(() => {
    const onVisibilityChange = () => {
      setPollMode(getCurrentPollMode());
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (busyAction) {
        return;
      }
      refreshData({ silent: true, showError: false });
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [busyAction, pollIntervalMs, refreshData]);

  useEffect(() => {
    if (!detail) {
      return;
    }

    const nextStatusOptions = getAllowedStatusOptions(user?.roleName, detail.status);
    const acceptedAmount = getQuoteAmount(detail.quotes?.find((item) => item.status === 'ACCEPTED'));
    const resolvedAmount = pendingPayment?.amount ?? acceptedAmount ?? '';

    setStatusForm((previous) => ({
      status: nextStatusOptions.includes(previous.status) ? previous.status : (nextStatusOptions[0] || previous.status),
      note: previous.note,
    }));

    setPaymentForm((previous) => ({
      ...previous,
      amount: pendingPayment
        ? (pendingPayment.amount ?? '')
        : (previous.amount !== '' ? previous.amount : resolvedAmount),
    }));
  }, [detail, pendingPayment, user?.roleName]);

  useEffect(() => {
    const latestMessageId = messages[messages.length - 1]?.id ?? null;
    const firstSync = lastMessageIdRef.current === null;
    const hasNewMessage = latestMessageId !== null && latestMessageId !== lastMessageIdRef.current;

    if (firstSync || busyAction === 'message' || (hasNewMessage && shouldStickToBottomRef.current)) {
      requestAnimationFrame(() => {
        scrollToLatestMessage(firstSync ? 'auto' : 'smooth');
      });
    }

    lastMessageIdRef.current = latestMessageId;
  }, [busyAction, messages, scrollToLatestMessage]);

  const handleMessageScroll = () => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldStickToBottomRef.current = distanceToBottom < 96;
  };

  const runAction = async (actionKey, action, successMessage) => {
    setBusyAction(actionKey);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await refreshData({ silent: true, force: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyAction('');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!messageInput.trim()) {
      return;
    }
    shouldStickToBottomRef.current = true;
    await runAction(
      'message',
      async () => {
        await requestApi.sendMessage(id, { content: messageInput.trim() });
        setMessageInput('');
      },
      'Message sent successfully.',
    );
  };

  const cancelRequest = async () => runAction(
    'cancel',
    () => requestApi.cancelRequest(id, { note: 'Canceled by customer from request detail' }),
    'Request canceled successfully.',
  );

  const updateStatus = async (event) => {
    event.preventDefault();
    await runAction(
      'status',
      () => requestApi.updateStatus(id, statusForm),
      'Request status updated successfully.',
    );
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
    if (!pendingPayment) {
      return;
    }
    await runAction(
      'pay',
      () => requestApi.pay(pendingPayment.id, { paymentStatus: paymentForm.paymentStatus }),
      'Payment updated successfully.',
    );
  };

  const createReview = async (event) => {
    event.preventDefault();
    await runAction(
      'review',
      async () => {
        await requestApi.createReview(id, {
          ratingScore: Number(reviewForm.ratingScore),
          comment: reviewForm.comment,
        });
        setReviewForm(defaultReviewForm);
      },
      'Review submitted successfully.',
    );
  };

  if (loading) {
    return <Loader label="Loading request detail..." />;
  }

  if (!detail) {
    return <div className="notice error">Request detail is unavailable.</div>;
  }

  return (
    <>
      <PageHeader
        title={`Request ${detail.requestCode}`}
        subtitle={`Created ${formatDateTime(detail.createdAt)}`}
        actions={(
          <div className="actions-row">
            <div className="sync-pill">
              <strong>{refreshing ? 'Refreshing…' : pollLabel}</strong>
              <span>{lastSyncedAt ? `Last sync ${formatDateTime(lastSyncedAt)}` : 'Waiting for first sync'}</span>
            </div>
            <button className="button button-secondary" type="button" onClick={() => refreshData({ silent: true, force: true })}>
              Refresh now
            </button>
          </div>
        )}
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <div className="card">
          <SectionHeader
            title="Request Overview"
            subtitle="Core request data and active rescue assignment. Updates are refreshed automatically while you stay on this page."
            aside={<StatusBadge value={detail.status} />}
          />

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

          {/* ── Request Image ─────────────────────────────── */}
          <div className="card card-muted" style={{ marginTop: '1rem' }}>
            <h3>Incident Image</h3>
            <RequestImage imageUrl={detail.imageUrl} updatedAt={detail.updatedAt} />
            {isCustomer && (
              <RequestImageUpload
                requestId={id}
                currentImageUrl={detail.imageUrl}
                onUploadSuccess={(msg) => {
                  setNotice(msg);
                  setError('');
                  refreshData({ silent: true, force: true });
                }}
                onError={(msg) => { setError(msg); setNotice(''); }}
              />
            )}
          </div>

          <div className="grid-three" style={{ marginTop: '1rem' }}>
            <div className="card card-muted">
              <h3>Company</h3>
              <p>{detail.assignedCompany?.companyName || 'Not assigned yet'}</p>
              <p className="muted-line">{detail.assignedCompany?.phone || detail.assignedCompany?.email || 'Waiting for dispatch'}</p>
            </div>
            <div className="card card-muted">
              <h3>Assigned Staff</h3>
              <p>{detail.currentAssignment?.staffName || 'Not assigned yet'}</p>
              <p className="muted-line">{detail.currentAssignment?.status || 'Pending assignment'}</p>
              <Countdown
                expiresAt={detail.currentAssignment?.expiresAt}
                status={detail.currentAssignment?.status}
              />
            </div>
            <div className="card card-muted">
              <h3>Rescue Vehicle</h3>
              <p>{detail.currentAssignment?.vehicleCode || 'Not assigned yet'}</p>
              <p className="muted-line">{detail.currentAssignment?.vehiclePlateNumber || 'No plate information'}</p>
            </div>
          </div>

          {isCustomer && canCustomerCancel(detail.status) ? (
            <div className="card card-muted" style={{ marginTop: '1rem' }}>
              <h3>Customer Actions</h3>
              <p className="muted-line">You can still cancel while the request is waiting, matching, or already accepted.</p>
              <div className="actions-row">
                <button
                  className="button button-danger"
                  type="button"
                  disabled={busyAction === 'cancel'}
                  onClick={cancelRequest}
                >
                  {busyAction === 'cancel' ? 'Canceling...' : 'Cancel Request'}
                </button>
              </div>
            </div>
          ) : null}

          {isOpsRole && statusOptions.length > 0 ? (
            <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={updateStatus}>
              <h3>{getProgressTitle(user?.roleName)}</h3>
              <p className="muted-line">Only the allowed status options for your role are shown here.</p>
              <div className="form-grid">
                <div className="field">
                  <label>Next Status</label>
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

        <div className="card">
          <SectionHeader
            title="Quote, Payment & Review"
            subtitle="Commercial and completion states for this request. These sections stay up to date automatically."
          />

          {isCustomer && sentQuote ? (
            <div className="section-banner section-banner-warning">
              A quote is waiting for your response. Accept or reject it below.
            </div>
          ) : null}

          {isCustomer && pendingPayment ? (
            <div className="section-banner section-banner-info">
              A payment record is pending. You can complete the mock payment flow below.
            </div>
          ) : null}

          {detail.review ? (
            <div className="section-banner section-banner-success">
              Review already submitted for this request.
            </div>
          ) : null}

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
                  <tr>
                    <td colSpan="7">No quote has been created yet.</td>
                  </tr>
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
                  <tr>
                    <td colSpan="5">No payment record has been created yet.</td>
                  </tr>
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
                Accepted quote amount: {acceptedQuote ? formatCurrency(getQuoteAmount(acceptedQuote)) : 'No accepted quote yet'}
              </p>
              <div className="form-grid">
                <div className="field">
                  <label>Amount</label>
                  <input
                    value={paymentForm.amount}
                    onChange={(event) => setPaymentForm((previous) => ({ ...previous, amount: event.target.value }))}
                    placeholder="Leave blank to use accepted quote amount"
                  />
                </div>
                <div className="field">
                  <label>Payment Method</label>
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
                  <label>Mock Payment Result</label>
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

          {canLeaveReview ? (
            <form className="card card-muted" style={{ marginTop: '1rem' }} onSubmit={createReview}>
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
                    placeholder="Share your rescue experience"
                  />
                </div>
              </div>
              <button className="button button-primary" type="submit" disabled={busyAction === 'review'}>
                {busyAction === 'review' ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          ) : null}

          {isCustomer && !canLeaveReview && !detail.review ? (
            <div className="card card-muted" style={{ marginTop: '1rem' }}>
              <h3>Review</h3>
              <p className="muted-line">
                {detail.status === 'COMPLETED'
                  ? 'A review can be added once the page sync completes.'
                  : 'You can leave a review after the request is marked COMPLETED.'}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid-two">
        <div className="card">
          <SectionHeader
            title="Chat"
            subtitle="Messages refresh automatically while this page is open."
            aside={<span className="muted-line">{messages.length} message(s)</span>}
          />

          <div ref={messageListRef} className="message-list" onScroll={handleMessageScroll}>
            {messages.length === 0 ? (
              <div className="message-empty">
                <p>No messages yet.</p>
                <p className="muted-line">Start the conversation to coordinate dispatch, quote, and progress updates.</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const isOwnMessage = message.senderId === user?.id;
                const startsGroup = !previousMessage || previousMessage.senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`message-row ${isOwnMessage ? 'message-row-own' : ''} ${startsGroup ? '' : 'message-row-compact'}`}
                  >
                    <div className={`message-bubble ${isOwnMessage ? 'message-bubble-own' : ''}`}>
                      {startsGroup ? (
                        <div className="message-meta">
                          <span className="message-sender">
                            {isOwnMessage ? 'You' : message.senderName}
                          </span>
                          <span className="message-role-pill">{message.senderRole}</span>
                        </div>
                      ) : null}
                      <div>{message.content}</div>
                      <div className="message-time">{formatDateTime(message.sentAt)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={sendMessage} style={{ marginTop: '1rem' }}>
            <div className="actions-row">
              <input
                style={{ flex: 1, padding: '0.9rem 1rem', borderRadius: '16px', border: '1px solid var(--border)' }}
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Send a message..."
                disabled={busyAction === 'message'}
              />
              <button className="button button-primary" type="submit" disabled={busyAction === 'message' || !messageInput.trim()}>
                {busyAction === 'message' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <SectionHeader
            title="Status History"
            subtitle="Each request state change is recorded in order and refreshed automatically."
          />

          {(detail.history || []).length === 0 ? (
            <p className="muted-line">No status history recorded yet.</p>
          ) : (
            <div className="timeline">
              {detail.history.map((item) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="timeline-status-line">
                      {item.oldStatus ? <StatusBadge value={item.oldStatus} /> : <span className="timeline-origin">NEW</span>}
                      <span className="timeline-arrow">{'->'}</span>
                      <StatusBadge value={item.newStatus} />
                    </div>
                    <div className="muted-line">
                      {item.changedByUserName} at {formatDateTime(item.changedAt)}
                    </div>
                    {item.note ? <div className="timeline-note">{item.note}</div> : null}
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