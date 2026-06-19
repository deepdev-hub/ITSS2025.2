import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Image as ImageIcon, CreditCard, Clock, FileText, CheckCircle, ArrowRight, ChevronRight, MapPin, Tag } from 'lucide-react';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ChatModal from '../../components/common/ChatModal';
import RequestTrackingMap from '../../components/requests/RequestTrackingMap';
import RequestLifecycleStepper from '../../components/requests/RequestLifecycleStepper';
import Alert from '../../components/common/Alert';
import ImageUploadZone from '../../components/common/ImageUploadZone';
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

const defaultDealPriceForm = {
  dealPrice: '',
  note: '',
};

const defaultDecisionForm = {
  reason: '',
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

function isValidCoordinate(value, min, max) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max;
}

function getGoogleMapsDirectionsUrl(location) {
  if (!isValidCoordinate(location?.latitude, -90, 90) || !isValidCoordinate(location?.longitude, -180, 180)) {
    return null;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
}

function getPriceStatusLabel(quote, hasPaidPayment, requestStatus) {
  if (requestStatus === 'CANCELED') {
    return 'Canceled';
  }
  if (hasPaidPayment) {
    return 'Paid';
  }
  switch (quote?.status) {
    case 'SENT':
      return 'Waiting for customer price confirmation';
    case 'ACCEPTED':
      return 'Customer accepted the price';
    case 'REJECTED':
      return 'Customer requested a new deal';
    case 'DRAFT':
      return 'Preparing price';
    case 'EXPIRED':
      return 'Quote expired';
    default:
      return 'No deal price yet';
  }
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

function EstimatedQuotationPanel({ quotation, prominent = false }) {
  if (!quotation) {
    return (
      <div className={`estimated-quote-panel ${prominent ? 'estimated-quote-panel-prominent' : ''}`}>
        <div>
          <span>Estimated quotation</span>
          <strong>Not available</strong>
        </div>
        <p className="muted-line">Service price, auto travel cost, or coefficient data is missing for this request.</p>
      </div>
    );
  }

  return (
    <div className={`estimated-quote-panel ${prominent ? 'estimated-quote-panel-prominent' : ''}`}>
      <div>
        <span>Estimated quotation</span>
        <strong>{formatCurrency(quotation.estimatedAmount)}</strong>
      </div>
      <div className="estimated-quote-grid">
        <span>Service price {formatCurrency(quotation.servicePrice ?? 0)}</span>
        <span>Auto travel cost {formatCurrency(quotation.travelCost ?? 0)}</span>
        <span>Coefficient {quotation.coefficient}</span>
      </div>
    </div>
  );
}

function RequestImage({ imageUrl, updatedAt }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  const resolvedUrl = resolveRequestImageUrl(imageUrl || '');
  const imageSrc = addRequestImageCacheKey(resolvedUrl, updatedAt);
  const displayUrl = failedImageUrl === imageSrc ? null : imageSrc;

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
      onError={() => setFailedImageUrl(imageSrc)}
    />
  );
}

function RequestImageUpload({ requestId, currentImageUrl, imageUpdatedAt, onUploadSuccess, onError }) {
  const [uploading, setUploading] = useState(false);
  const previewSrc = currentImageUrl
    ? addRequestImageCacheKey(resolveRequestImageUrl(currentImageUrl), imageUpdatedAt)
    : null;

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await requestApi.uploadRequestImage(requestId, formData);
      const newUrl = getRequestImageUrlFromUploadResponse(result);
      onUploadSuccess('Request image updated successfully.', newUrl);
    } catch (err) {
      onError(getApiError(err));
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return (
    <ImageUploadZone
      previewSrc={previewSrc}
      label={currentImageUrl ? 'Change request image' : 'Upload image'}
      hint={`JPEG, PNG, WebP, GIF - up to ${MAX_FILE_SIZE_MB}MB`}
      accept={ACCEPTED_IMAGE_TYPES}
      maxSizeMb={MAX_FILE_SIZE_MB}
      uploading={uploading}
      onUpload={handleUpload}
      onError={onError}
    />
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
  const [dealPriceForm, setDealPriceForm] = useState(defaultDealPriceForm);
  const [rejectForm, setRejectForm] = useState(defaultDecisionForm);
  const [cancelForm, setCancelForm] = useState(defaultDecisionForm);
  const [reviewForm, setReviewForm] = useState(defaultReviewForm);
  const [activeModal, setActiveModal] = useState(null);
  const refreshInFlightRef = useRef(false);
  const messageListRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);

  const initialFetchRef = useRef(false);
  const [lastSeenMsgCount, setLastSeenMsgCount] = useState(0);

  useEffect(() => {
    if (!loading && !initialFetchRef.current) {
      setLastSeenMsgCount(messages.length);
      initialFetchRef.current = true;
    }
  }, [loading, messages.length]);

  useEffect(() => {
    if (activeModal === 'chat') {
      setLastSeenMsgCount(messages.length);
    }
  }, [activeModal, messages.length]);

  const hasUnreadChat = initialFetchRef.current && messages.length > lastSeenMsgCount;

  const isCustomer = user?.roleName === 'CUSTOMER';
  const isStaff = user?.roleName === 'RESCUE_STAFF';
  const isOpsRole = ['ADMIN', 'RESCUE_COMPANY', 'RESCUE_STAFF'].includes(user?.roleName);

  const statusOptions = useMemo(
    () => getAllowedStatusOptions(user?.roleName, detail?.status),
    [detail?.status, user?.roleName],
  );

  const acceptedQuote = useMemo(
    () => detail?.quotes?.find((item) => item.status === 'ACCEPTED') ?? null,
    [detail],
  );

  const latestQuote = useMemo(
    () => detail?.quotes?.[0] ?? null,
    [detail],
  );

  const waitingDealQuote = useMemo(
    () => detail?.quotes?.find((item) => item.status === 'SENT') ?? null,
    [detail],
  );

  const pendingPayment = useMemo(
    () => detail?.payments?.find((item) => item.paymentStatus === 'PENDING') ?? null,
    [detail],
  );

  const hasPaidPayment = useMemo(
    () => detail?.payments?.some((item) => item.paymentStatus === 'PAID') ?? false,
    [detail],
  );
  const currentAssignmentAccepted = ['ACCEPTED', 'COMPLETED'].includes(detail?.currentAssignment?.status);
  const assignedStaffPath = currentAssignmentAccepted && detail?.currentAssignment?.staffId
    ? `/staff/${detail.currentAssignment.staffId}/profile`
    : null;

  const requestCanceled = detail?.status === 'CANCELED';
  const requestFinalized = ['CANCELED', 'COMPLETED'].includes(detail?.status) || hasPaidPayment;
  const staffCheckedIn = isStaff && detail?.status === 'IN_PROGRESS';
  const canStaffCheckIn = isStaff
    && detail?.currentAssignment?.status === 'ACCEPTED'
    && !staffCheckedIn
    && !requestFinalized;
  const latestPriceStatus = getPriceStatusLabel(latestQuote, hasPaidPayment, detail?.status);
  const customerDirectionsUrl = getGoogleMapsDirectionsUrl(detail?.location);
  const canManageDealPrice = isStaff
    && currentAssignmentAccepted
    && !requestFinalized
    && !acceptedQuote
    && !hasPaidPayment;
  const canCustomerActOnPrice = isCustomer
    && Boolean(waitingDealQuote)
    && !requestCanceled
    && !hasPaidPayment;
  const canCustomerCreatePayment = isCustomer
    && Boolean(acceptedQuote)
    && !requestCanceled
    && !hasPaidPayment;

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

    const editableQuote = detail.quotes?.find((item) => item.status === 'SENT' || item.status === 'REJECTED' || item.status === 'DRAFT')
      ?? detail.quotes?.[0]
      ?? null;

    setDealPriceForm((previous) => ({
      dealPrice: previous.dealPrice !== '' ? previous.dealPrice : (getQuoteAmount(editableQuote) ?? ''),
      note: previous.note !== '' ? previous.note : (editableQuote?.note ?? ''),
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
    async () => {
      await requestApi.cancelRequest(id, {
        reason: cancelForm.reason.trim() || 'Canceled by customer from request detail',
      });
      setCancelForm(defaultDecisionForm);
    },
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

  const confirmStaffCheckIn = async () => runAction(
    'check-in',
    () => requestApi.updateStatus(id, {
      status: 'IN_PROGRESS',
      note: 'Staff checked in at customer location',
    }),
    'Check-in confirmed. Technician is working on the task.',
  );

  const updateDealPrice = async (event) => {
    event.preventDefault();
    await runAction(
      'deal-price',
      async () => {
        await requestApi.updateDealPrice(id, {
          dealPrice: Number(dealPriceForm.dealPrice),
          note: dealPriceForm.note,
        });
        setDealPriceForm((previous) => ({ ...previous, dealPrice: '' }));
      },
      'Deal price updated. Waiting for customer confirmation.',
    );
  };

  const acceptPrice = async () => runAction(
    'price-accept',
    () => requestApi.acceptPrice(id),
    'Deal price accepted. Payment is now available.',
  );

  const rejectPrice = async () => runAction(
    'price-reject',
    async () => {
      await requestApi.rejectPrice(id, { reason: rejectForm.reason.trim() || null });
      setRejectForm(defaultDecisionForm);
    },
    'Deal price rejected. Staff can update a new deal price.',
  );

  const createPayment = async () => runAction(
    'create-payment',
    () => requestApi.createPayment(id, {
      amount: null,
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
              <strong>{refreshing ? 'Refreshing...' : pollLabel}</strong>
              <span>{lastSyncedAt ? `Last sync ${formatDateTime(lastSyncedAt)}` : 'Waiting for first sync'}</span>
            </div>
            <button className="button button-secondary" type="button" onClick={() => refreshData({ silent: true, force: true })}>
              Refresh now
            </button>
          </div>
        )}
      />

      <RequestLifecycleStepper status={detail.status} hasPaidPayment={hasPaidPayment} />

      {isCustomer ? (
        <RequestTrackingMap
          requestId={id}
          requestStatus={detail.status}
          staffProfilePath={assignedStaffPath}
        />
      ) : null}

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Something went wrong">{error}</Alert> : null}

      {/* Ultra-Premium Single-Card Request Overview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        
        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #f1f5f9' }}>
          
          {/* Header & Compact Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.025em' }}>Request Overview</h2>
                <StatusBadge value={detail.status} />
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Comprehensive details and tracking for your rescue request.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="button" type="button" onClick={() => setActiveModal('chat')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '999px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', position: 'relative' }}>
                <MessageCircle size={18} style={{ marginRight: '8px', color: '#3b82f6' }} /> Chat
                {hasUnreadChat && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
                )}
              </button>
              <button className="button" type="button" onClick={() => setActiveModal('finances')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '999px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', position: 'relative' }}>
                <Tag size={18} style={{ marginRight: '8px', color: '#f59e0b' }} /> Deal Price
                {(canCustomerActOnPrice || (canManageDealPrice && latestQuote?.status === 'CUSTOMER_REJECTED')) && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
                )}
              </button>
              <button className="button" type="button" onClick={() => setActiveModal('timeline')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '999px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <Clock size={18} style={{ marginRight: '8px', color: '#8b5cf6' }} /> Timeline
              </button>
              {isOpsRole && !requestFinalized && (
                <button className="button button-primary" type="button" onClick={() => setActiveModal('progress')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', borderRadius: '999px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
                  <CheckCircle size={18} style={{ marginRight: '8px' }} /> Update Status
                </button>
              )}
              {isCustomer && canCustomerCancel(detail.status) && (
                <button className="button button-danger" type="button" onClick={() => setActiveModal('progress')} style={{ padding: '0.75rem 1.5rem', fontSize: '1.05rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '999px' }}>
                  <FileText size={18} style={{ marginRight: '8px' }} /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Staff Action area integrated neatly at TOP */}
          {!requestFinalized && (staffCheckedIn || canStaffCheckIn || (isStaff && customerDirectionsUrl)) && (
            <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              
              <div style={{ flex: '1 1 auto' }}>
                {staffCheckedIn ? (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '50%', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}>
                      <CheckCircle size={28} />
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.15rem', color: '#065f46', marginBottom: '0.25rem' }}>Technician is working</strong>
                      <span style={{ fontSize: '1rem', color: '#047857' }}>Staff has checked in at the rescue point.</span>
                    </div>
                  </div>
                ) : canStaffCheckIn ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: '#eff6ff', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #bfdbfe', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#1e40af', fontSize: '1.25rem', marginBottom: '0.35rem' }}>Check in after arrival</strong>
                      <span style={{ color: '#3b82f6', fontSize: '1.05rem' }}>Confirm to move request to in-progress.</span>
                    </div>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={busyAction === 'check-in'}
                      onClick={confirmStaffCheckIn}
                      style={{ padding: '0.85rem 2.5rem', fontSize: '1.1rem', borderRadius: '999px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)', fontWeight: 600 }}
                    >
                      {busyAction === 'check-in' ? 'Processing...' : 'Confirm Check-in'}
                    </button>
                  </div>
                ) : null}
              </div>

              {isStaff && customerDirectionsUrl && !staffCheckedIn ? (
                <a
                  className="button"
                  href={customerDirectionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.5rem', fontSize: '1.05rem', borderRadius: '999px', fontWeight: 600, background: '#fff', color: '#3b82f6', border: '1px solid #bfdbfe', textDecoration: 'none', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)', gap: '0.5rem' }}
                >
                  <MapPin size={20} />
                  Directions
                </a>
              ) : null}
            </div>
          )}

          {/* Main Content Grid: Image (Left) + Details (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
            
            {/* Left: Image & Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Image Section */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={20} color="#3b82f6" /> Incident Image
                </h3>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  {detail.imageUrl ? (
                    <RequestImage imageUrl={detail.imageUrl} updatedAt={detail.updatedAt} />
                  ) : (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                      <ImageIcon size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '1.05rem' }}>No image has been attached to this request.</p>
                    </div>
                  )}
                </div>
                {isCustomer && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <RequestImageUpload
                      requestId={id}
                      currentImageUrl={detail.imageUrl}
                      imageUpdatedAt={detail.updatedAt}
                      onUploadSuccess={(msg) => { setNotice(msg); setError(''); refreshData({ silent: true, force: true }); }}
                      onError={(msg) => { setError(msg); setNotice(''); }}
                    />
                  </div>
                )}
              </div>

              {/* Location & Vehicle Stack */}
              <div>
                 <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#8b5cf6" /> Breakdown Context
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</div>
                      <div style={{ color: '#0f172a', lineHeight: '1.5', fontSize: '1.05rem' }}>{detail.location?.fullAddress || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Not provided</span>}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Vehicle</div>
                      <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '1.05rem' }}>
                        {detail.vehicle ? `${detail.vehicle.brand} ${detail.vehicle.model} - ${detail.vehicle.plateNumber}` : <span style={{ fontStyle: 'italic', color: '#94a3b8', fontWeight: 400 }}>Not provided</span>}
                      </div>
                    </div>
                 </div>
              </div>

              {/* Payments Panel */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="#10b981" /> Payments
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {(detail.payments || []).length === 0 ? (
                    <div style={{ background: '#fff', padding: '3rem 2rem', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                      <CreditCard size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '1.05rem' }}>No payment record has been created yet.</p>
                    </div>
                  ) : (
                    detail.payments.map((payment) => (
                      <div key={payment.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                          <StatusBadge value={payment.paymentStatus} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ paddingRight: '100px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Amount</div>
                            <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.025em' }}>{formatCurrency(payment.amount)}</div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Method</div>
                              <div style={{ color: '#334155', fontWeight: 600, fontSize: '1.05rem' }}>{payment.paymentMethod}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Created</div>
                              <div style={{ color: '#334155', fontSize: '0.95rem' }}>{formatDateTime(payment.createdAt)}</div>
                            </div>
                            <div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Paid At</div>
                              <div style={{ color: '#334155', fontSize: '0.95rem' }}>{formatDateTime(payment.paidAt) || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Payment Actions */}
                  {isCustomer && canCustomerCreatePayment ? (
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px dashed #cbd5e1', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f172a' }}>Payment Actions</h4>
                      <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.95rem' }}>
                        Accepted quote amount: <strong style={{ color: '#0f172a' }}>{acceptedQuote ? formatCurrency(getQuoteAmount(acceptedQuote)) : 'No accepted quote yet'}</strong>
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Amount</label>
                          <input value={formatCurrency(getQuoteAmount(acceptedQuote))} disabled style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#f1f5f9', color: '#64748b' }} />
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Method</label>
                          <select
                            value={paymentForm.paymentMethod}
                            onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentMethod: event.target.value }))}
                            style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#fff' }}
                          >
                            <option value="CASH">CASH</option>
                            <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                            <option value="MOMO">MOMO</option>
                            <option value="VNPAY">VNPAY</option>
                            <option value="ZALOPAY">ZALOPAY</option>
                          </select>
                        </div>
                        <div className="field">
                          <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Mock Result</label>
                          <select
                            value={paymentForm.paymentStatus}
                            onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentStatus: event.target.value }))}
                            style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', background: '#fff' }}
                          >
                            <option value="PAID">PAID</option>
                            <option value="FAILED">FAILED</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          className="button button-secondary"
                          type="button"
                          disabled={busyAction === 'create-payment' || Boolean(pendingPayment)}
                          onClick={createPayment}
                          style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', fontWeight: 600 }}
                        >
                          {busyAction === 'create-payment' ? 'Creating...' : 'Create record'}
                        </button>
                        {pendingPayment ? (
                          <button
                            className="button button-primary"
                            type="button"
                            disabled={busyAction === 'pay'}
                            onClick={payNow}
                            style={{ padding: '0.75rem 1.25rem', borderRadius: '999px', fontWeight: 600 }}
                          >
                            {busyAction === 'pay' ? 'Processing...' : 'Pay pending record'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

            </div>

            {/* Right: Quotation & Key Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Quotation Panel */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
                <EstimatedQuotationPanel quotation={detail.estimatedQuotation} prominent={true} />
              </div>


              {/* Key Details Grid */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} color="#10b981" /> Assignment Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Priority</div>
                    <StatusBadge value={detail.priorityLevel} />
                  </div>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Incident Type</div>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{detail.incidentType?.name || 'N/A'}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Service</div>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{detail.serviceType?.name || 'N/A'}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Customer</div>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{detail.customer?.fullName || 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Assigned Company</div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>{detail.assignedCompany?.companyName || <span style={{ color: '#fb923c' }}>Waiting for assignment</span>}</div>
                  </div>
                  
                  {detail.currentAssignment?.staffName && (
                    <>
                      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Assigned Staff</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {detail.currentAssignment.staffAvatarUrl ? (
                              <img src={detail.currentAssignment.staffAvatarUrl} alt="Staff" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontWeight: 'bold', color: '#64748b' }}>{detail.currentAssignment.staffName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{detail.currentAssignment.staffName}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{detail.currentAssignment.staffJobTitle || 'Staff'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Rescue Vehicle</div>
                        {detail.currentAssignment.vehicleCode ? (
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>{detail.currentAssignment.vehicleCode}</div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Plate: {detail.currentAssignment.vehiclePlateNumber || 'N/A'}</div>
                          </div>
                        ) : (
                          <div style={{ color: '#64748b', fontStyle: 'italic' }}>No vehicle assigned</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '1rem' }}>Description</h3>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: '1.6', fontSize: '1.05rem' }}>
                  {detail.description || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>No description provided.</span>}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* --- MODALS START HERE --- */}

      {/* Details Modal */}
      <Modal isOpen={activeModal === 'details'} onClose={() => setActiveModal(null)} title="Incident Details" size="large">
        <div className="grid-two">
          <div className="card card-muted" style={{ margin: 0 }}>
            <h3>Incident Image</h3>
            <RequestImage imageUrl={detail.imageUrl} updatedAt={detail.updatedAt} />
            {isCustomer && (
              <RequestImageUpload
                requestId={id}
                currentImageUrl={detail.imageUrl}
                imageUpdatedAt={detail.updatedAt}
                onUploadSuccess={(msg) => {
                  setNotice(msg);
                  setError('');
                  refreshData({ silent: true, force: true });
                }}
                onError={(msg) => { setError(msg); setNotice(''); }}
              />
            )}
          </div>
          <div>
            <div className="card card-muted" style={{ marginBottom: '1rem', marginTop: 0 }}>
              <h3>Company</h3>
              <p>{currentAssignmentAccepted ? (detail.assignedCompany?.companyName || 'Not assigned yet') : 'Dang thong bao cho staff gan nhat'}</p>
              <p className="muted-line">
                {currentAssignmentAccepted
                  ? (detail.assignedCompany?.phone || detail.assignedCompany?.email || 'Waiting for dispatch')
                  : 'He thong dang gui yeu cau den cac staff phu hop va cho xac nhan.'}
              </p>
            </div>
            <div className="card card-muted" style={{ margin: 0 }}>
              <h3>Rescue Vehicle</h3>
              <p>{currentAssignmentAccepted ? (detail.currentAssignment?.vehicleCode || 'Not assigned yet') : 'Dang cho staff nhan yeu cau'}</p>
              <p className="muted-line">
                {currentAssignmentAccepted
                  ? (detail.currentAssignment?.vehiclePlateNumber || 'No plate information')
                  : 'Thong tin xe se hien sau khi mot staff chap nhan yeu cau.'}
              </p>
            </div>
          </div>

        </div>
      </Modal>

      {/* Finances Modal */}
      <Modal isOpen={activeModal === 'finances'} onClose={() => setActiveModal(null)} title="Deal Price Negotiation" size="large">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quotes Section */}
          <div className="card card-muted" style={{ margin: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag size={18} /> Current Deal</h3>
            <div className="info-grid">
              <div className="info-item">
                <span>Initial Estimated Price</span>
                <strong>{formatCurrency(latestQuote?.estimatedAmount)}</strong>
              </div>
              <div className="info-item">
                <span>Deal Price</span>
                <strong>{formatCurrency(getQuoteAmount(latestQuote))}</strong>
              </div>
              <div className="info-item">
                <span>Status</span>
                <strong>{latestPriceStatus}</strong>
              </div>
            </div>
            <div className="field">
              <label>Staff Note</label>
              <textarea value={latestQuote?.note || 'No deal price note yet.'} disabled />
            </div>
            {latestQuote?.customerNote ? (
              <div className="field">
                <label>Customer Rejection Reason</label>
                <textarea value={latestQuote.customerNote} disabled style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' }} />
              </div>
            ) : null}
            {canCustomerActOnPrice ? (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <div className="field">
                  <label>Reason if not accepted</label>
                  <input
                    value={rejectForm.reason}
                    onChange={(event) => setRejectForm({ reason: event.target.value })}
                    placeholder="Example: Price is too high, want to negotiate again"
                  />
                </div>
                <div className="actions-row" style={{ marginTop: '1rem' }}>
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={busyAction === 'price-accept'}
                    onClick={acceptPrice}
                    style={{ flex: 1 }}
                  >
                    {busyAction === 'price-accept' ? 'Accepting...' : 'Accept price'}
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={busyAction === 'price-reject'}
                    onClick={rejectPrice}
                    style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', background: '#fef2f2' }}
                  >
                    {busyAction === 'price-reject' ? 'Rejecting...' : 'Reject / Request new deal'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {canManageDealPrice ? (
            <form className="card card-muted" style={{ margin: 0 }} onSubmit={updateDealPrice}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Tag size={18} /> Update Deal Price</h3>
              <div className="form-grid">
                <div className="field">
                  <label>Deal Price</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={dealPriceForm.dealPrice}
                    onChange={(event) => setDealPriceForm((previous) => ({ ...previous, dealPrice: event.target.value }))}
                    placeholder="300000"
                  />
                </div>
                <div className="field">
                  <label>Deal Note</label>
                  <input
                    value={dealPriceForm.note}
                    onChange={(event) => setDealPriceForm((previous) => ({ ...previous, note: event.target.value }))}
                    placeholder="Price includes towing fee and night surcharge"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={busyAction === 'deal-price' || !dealPriceForm.dealPrice || Number(dealPriceForm.dealPrice) <= 0}
                  style={{ flex: 1 }}
                >
                  {busyAction === 'deal-price' ? 'Updating...' : 'Update deal price'}
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  disabled={busyAction === 'status'}
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to cancel this request due to failed negotiation?')) {
                      await runAction('status', () => requestApi.updateStatus(id, { status: 'CANCELED', note: 'Negotiation failed' }), 'Request canceled successfully.');
                      setActiveModal(null);
                    }
                  }}
                  style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                >
                  Cancel Request
                </button>
              </div>
            </form>
          ) : null}

          {/* Review Section */}
          {detail.review ? (
            <div className="card card-muted" style={{ margin: 0 }}>
              <h3>Review</h3>
              <p><strong>Rating:</strong> {detail.review.ratingScore}/5</p>
              <p><strong>Comment:</strong> {detail.review.comment || 'No comment provided'}</p>
              <p className="muted-line">Submitted {formatDateTime(detail.review.createdAt)}</p>
            </div>
          ) : null}

          {canLeaveReview ? (
            <form className="card card-muted" style={{ margin: 0 }} onSubmit={createReview}>
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
          
        </div>
      </Modal>

      {/* Timeline Modal */}
      <Modal isOpen={activeModal === 'timeline'} onClose={() => setActiveModal(null)} title="Processing Timeline" size="medium">
        {(detail.history || []).length === 0 ? (
          <p className="muted-line">No status history recorded yet.</p>
        ) : (
          <div className="timeline" style={{ padding: '1rem' }}>
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
      </Modal>

      {/* Progress / Status Update Modal */}
      <Modal isOpen={activeModal === 'progress'} onClose={() => setActiveModal(null)} title="Actions & Progress Control" size="medium">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {isCustomer && canCustomerCancel(detail.status) ? (
            <div className="card card-muted" style={{ margin: 0 }}>
              <h3>Cancel Request</h3>
              <p className="muted-line">You can cancel the request if price negotiation fails or you no longer need assistance.</p>
              <div className="field">
                <label>Cancellation Reason</label>
                <input
                  value={cancelForm.reason}
                  onChange={(event) => setCancelForm({ reason: event.target.value })}
                  placeholder="Example: Could not agree on the price"
                />
              </div>
              <div className="actions-row">
                <button
                  className="button button-danger"
                  type="button"
                  disabled={busyAction === 'cancel'}
                  onClick={async () => {
                    await cancelRequest();
                    setActiveModal(null);
                  }}
                >
                  {busyAction === 'cancel' ? 'Canceling...' : 'Cancel Request'}
                </button>
              </div>
            </div>
          ) : null}

          {isOpsRole && statusOptions.length > 0 ? (
            <form className="card card-muted" style={{ margin: 0 }} onSubmit={async (e) => {
              await updateStatus(e);
              setActiveModal(null);
            }}>
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
      </Modal>

      {/* Chat Modal */}
      <ChatModal
        isOpen={activeModal === 'chat'}
        onClose={() => setActiveModal(null)}
        size="large"
        requestId={detail.id}
        companyName={detail.assignedCompany?.companyName}
        staffName={detail.currentAssignment?.staff?.fullName || detail.currentAssignment?.staffName}
        customerName={detail.customer?.fullName}
        userRole={user?.roleName}
      />
    </>
  );
}
