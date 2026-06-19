import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Clock3,
  LocateFixed,
  MapPin,
  RefreshCw,
  Siren,
  Truck,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { useStaffAvailability } from '../../context/StaffAvailabilityContext';
import { formatDateTime, getRequestLocationLabel } from '../../utils/requestUi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = [21.0051, 105.8456];
const POLL_INTERVAL_MS = 10000;
const ONLINE_CONFIRM_INTERVAL_MS = 120000;
const ONLINE_CONFIRM_COUNTDOWN_SECONDS = 60;

const staffIcon = L.divIcon({
  className: 'tracking-div-icon',
  html: '<span class="tracking-marker tracking-marker-staff"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const searchingIcon = L.divIcon({
  className: 'tracking-div-icon',
  html: '<span class="tracking-marker tracking-marker-searching"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function StaffNearbyRequestsPage() {
  const { status, setStatus, loading: statusLoading, setLoading: setStatusLoading, setError: setStatusError } = useStaffAvailability();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingLocation, setRefreshingLocation] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(ONLINE_CONFIRM_COUNTDOWN_SECONDS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [staffLocation, setStaffLocation] = useState(() => ({
    lat: status?.currentLatitude ? Number(status.currentLatitude) : DEFAULT_CENTER[0],
    lng: status?.currentLongitude ? Number(status.currentLongitude) : DEFAULT_CENTER[1],
  }));

  const confirmTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    if (status?.currentLatitude && status?.currentLongitude) {
      setStaffLocation({
        lat: Number(status.currentLatitude),
        lng: Number(status.currentLongitude),
      });
    }
  }, [status?.currentLatitude, status?.currentLongitude]);

  const clearConfirmTimers = useCallback(() => {
    if (confirmTimeoutRef.current) {
      window.clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const forceOffline = useCallback(async (message) => {
    clearConfirmTimers();
    setConfirmOpen(false);
    setCountdown(ONLINE_CONFIRM_COUNTDOWN_SECONDS);
    setStatusLoading(true);
    try {
      const updated = await companyApi.updateMyStaffStatus({ status: 'OFFLINE' });
      setStatus(updated);
      setNotice(message || 'You have been switched to offline.');
      setStatusError('');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setStatusLoading(false);
    }
  }, [clearConfirmTimers, setStatus, setStatusError, setStatusLoading]);

  const scheduleOnlineConfirmation = useCallback(() => {
    clearConfirmTimers();
    if (status?.status !== 'ACTIVE') {
      return;
    }
    confirmTimeoutRef.current = window.setTimeout(() => {
      setCountdown(ONLINE_CONFIRM_COUNTDOWN_SECONDS);
      setConfirmOpen(true);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown((current) => {
          if (current <= 1) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            forceOffline('You did not confirm online status in time, so the system switched you to offline.');
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }, ONLINE_CONFIRM_INTERVAL_MS);
  }, [clearConfirmTimers, forceOffline, status?.status]);

  const updateCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('This device or browser does not support GPS location.');
      return null;
    }

    setRefreshingLocation(true);
    setError('');
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setStaffLocation(nextLocation);
          try {
            await companyApi.updateMyLocation({
              latitude: nextLocation.lat,
              longitude: nextLocation.lng,
            });
            setStatus((previous) => ({
              ...(previous || {}),
              currentLatitude: nextLocation.lat,
              currentLongitude: nextLocation.lng,
            }));
            resolve(nextLocation);
          } catch (err) {
            setError(getApiError(err));
            resolve(null);
          } finally {
            setRefreshingLocation(false);
          }
        },
        () => {
          setRefreshingLocation(false);
          setError('Please allow location access to receive nearby requests.');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }, [setStatus]);

  const ensureOnlineAndLocation = useCallback(async () => {
    setStatusLoading(true);
    try {
      let nextStatus = status;
      if (status?.status !== 'ACTIVE') {
        nextStatus = await companyApi.updateMyStaffStatus({ status: 'ACTIVE' });
        setStatus(nextStatus);
      }
      setStatusError('');
      await updateCurrentLocation();
      return nextStatus;
    } catch (err) {
      setError(getApiError(err));
      return null;
    } finally {
      setStatusLoading(false);
    }
  }, [setStatus, setStatusError, setStatusLoading, status, updateCurrentLocation]);

  const loadRequests = useCallback(async () => {
    if (status?.status !== 'ACTIVE') {
      setRequests([]);
      setLoading(false);
      return;
    }
    try {
      const list = await companyApi.getNearbySearchingRequests();
      setRequests(list || []);
      setError('');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [status?.status]);

  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      setLoading(true);
      const onlineStatus = await ensureOnlineAndLocation();
      if (!mounted) return;
      if (onlineStatus?.status === 'ACTIVE' || status?.status === 'ACTIVE') {
        await loadRequests();
      } else {
        setLoading(false);
      }
    }
    bootstrap();
    return () => {
      mounted = false;
      clearConfirmTimers();
    };
  }, [clearConfirmTimers, ensureOnlineAndLocation, loadRequests, status?.status]);

  useEffect(() => {
    if (status?.status !== 'ACTIVE') {
      clearConfirmTimers();
      return undefined;
    }
    scheduleOnlineConfirmation();
    return clearConfirmTimers;
  }, [clearConfirmTimers, scheduleOnlineConfirmation, status?.status]);

  useEffect(() => {
    if (status?.status !== 'ACTIVE') {
      return undefined;
    }
    loadRequests();
    const intervalId = window.setInterval(loadRequests, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadRequests, status?.status]);

  const handleStillOnline = async () => {
    clearConfirmTimers();
    setConfirmOpen(false);
    setCountdown(ONLINE_CONFIRM_COUNTDOWN_SECONDS);
    scheduleOnlineConfirmation();
  };

  const handleAcceptRequest = async (requestId) => {
    setActionId(requestId);
    setNotice('');
    setError('');
    try {
      await companyApi.acceptNearbySearchingRequest(requestId);
      const latestStatus = await companyApi.getMyStaffStatus();
      setStatus(latestStatus);
      setNotice('Request accepted successfully. You are now marked as busy.');
      await loadRequests();
    } catch (err) {
      setError(getApiError(err));
      await loadRequests();
    } finally {
      setActionId(null);
    }
  };

  const mapCenter = useMemo(
    () => [staffLocation.lat || DEFAULT_CENTER[0], staffLocation.lng || DEFAULT_CENTER[1]],
    [staffLocation.lat, staffLocation.lng],
  );

  const statusText = useMemo(() => {
    if (statusLoading) return 'Updating online status...';
    if (status?.status === 'BUSY') return 'You are busy with an active rescue request.';
    if (status?.status !== 'ACTIVE') return 'You are offline, so the system will not dispatch requests to you.';
    if (requests.length === 0) return 'Searching for new requests near your current location.';
    return `Found ${requests.length} searching request(s) around your area.`;
  }, [requests.length, status?.status, statusLoading]);

  return (
    <>
      <PageHeader
        title="Nearby Requests"
        subtitle="Stay online to receive rescue requests near your current location."
      />

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginBottom: '0.45rem' }}>Current Searching State</h2>
            <p className="muted-line">{statusText}</p>
          </div>
          <div className="actions-row" style={{ marginLeft: 'auto' }}>
            <span className={`status-badge ${status?.status === 'ACTIVE' ? 'status-active' : status?.status === 'BUSY' ? 'status-matched' : 'status-canceled'}`}>
              {status?.status || 'OFFLINE'}
            </span>
            <button type="button" className="button button-secondary" onClick={updateCurrentLocation} disabled={refreshingLocation}>
              <LocateFixed size={16} />
              {refreshingLocation ? 'Updating GPS...' : 'Refresh GPS'}
            </button>
            <button type="button" className="button button-secondary" onClick={loadRequests} disabled={loading || status?.status !== 'ACTIVE'}>
              <RefreshCw size={16} />
              Refresh requests
            </button>
          </div>
        </div>
      </div>

      {loading ? <Loader label="Loading nearby requests..." /> : null}

      {!loading ? (
        <div className="grid-two" style={{ alignItems: 'flex-start' }}>
          <div className="card">
            <h2><MapPin size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Nearby Map</h2>
            <div className="tracking-map-frame tracking-map-frame-searching" style={{ minHeight: '420px' }}>
              <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="tracking-map">
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapCenter} icon={staffIcon}>
                  <Popup>Your current location</Popup>
                </Marker>
                {requests.map((request) => (
                  request.location?.latitude && request.location?.longitude ? (
                    <Marker
                      key={request.id}
                      position={[Number(request.location.latitude), Number(request.location.longitude)]}
                      icon={searchingIcon}
                    >
                      <Popup>
                        <strong>{request.requestCode}</strong>
                        <br />
                        {request.incidentTypeName || 'Rescue request'}
                        <br />
                        {getRequestLocationLabel(request)}
                      </Popup>
                    </Marker>
                  ) : null
                ))}
              </MapContainer>
              <div className="tracking-map-status tracking-map-status-searching">
                <span className="tracking-live-dot tracking-live-dot-searching" />
                {statusText}
              </div>
            </div>
          </div>

          <div className="card">
            <h2><Truck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Searching Requests</h2>
            {status?.status !== 'ACTIVE' ? (
              <p className="muted-line">Switch to online in the header to receive and accept nearby requests.</p>
            ) : null}
            {status?.status === 'ACTIVE' && requests.length === 0 ? (
              <p className="muted-line">No nearby request is searching for staff right now.</p>
            ) : null}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {requests.map((request) => (
                <div key={request.id} className="card card-muted">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                    <div>
                      <strong>{request.requestCode}</strong>
                      <div className="muted-line">{request.incidentTypeName} • {request.priorityLevel}</div>
                    </div>
                    <span className="status-badge status-searching">{request.distanceKm?.toFixed?.(1) || request.distanceKm} km</span>
                  </div>
                  <p style={{ margin: '0.75rem 0 0.5rem' }}>{request.description || 'No extra description.'}</p>
                  <div className="muted-line" style={{ display: 'grid', gap: '0.35rem' }}>
                    <span><MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{getRequestLocationLabel(request)}</span>
                    <span><Clock3 size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{formatDateTime(request.createdAt)}</span>
                  </div>
                  <div className="actions-row" style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={actionId === request.id || status?.status !== 'ACTIVE'}
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      <Siren size={16} />
                      {actionId === request.id ? 'Accepting...' : 'Accept request'}
                    </button>
                    <Link className="button button-secondary" to={`/requests/${request.id}`}>
                      View detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={confirmOpen}
        onClose={() => {}}
        title="Still online?"
        footer={(
          <>
            <button type="button" className="button button-secondary" onClick={() => forceOffline('You chose to go offline from the online check popup.')}>
              Go offline
            </button>
            <button type="button" className="button button-primary" onClick={handleStillOnline}>
              Still online
            </button>
          </>
        )}
      >
        <p>The system checks every 2 minutes whether you are still available for nearby dispatch.</p>
        <p><strong>{countdown}s</strong> left to confirm. If you do nothing, your status will switch to offline automatically.</p>
      </Modal>
    </>
  );
}
