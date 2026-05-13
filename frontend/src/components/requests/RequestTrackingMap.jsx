import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getApiError } from '../../api/client';
import { requestApi } from '../../api/requestApi';

const DEFAULT_CENTER = [21.0285, 105.8542];
const TRACKING_POLL_INTERVAL = 20000;

const staffMarkerIcon = L.divIcon({
  className: 'tracking-div-icon',
  html: '<span class="tracking-marker tracking-marker-staff"></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationMarkerIcon = L.divIcon({
  className: 'tracking-div-icon',
  html: '<span class="tracking-marker tracking-marker-destination"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function toLatLng(point) {
  if (!point || point.latitude === null || point.longitude === null) {
    return null;
  }

  const latitude = Number(point.latitude);
  const longitude = Number(point.longitude);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return [latitude, longitude];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'RS';
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function calculateDistanceKm(from, to) {
  if (!from || !to) {
    return null;
  }

  const [fromLatRaw, fromLngRaw] = from;
  const [toLatRaw, toLngRaw] = to;
  const earthRadiusKm = 6371;
  const fromLat = (fromLatRaw * Math.PI) / 180;
  const toLat = (toLatRaw * Math.PI) / 180;
  const deltaLat = ((toLatRaw - fromLatRaw) * Math.PI) / 180;
  const deltaLng = ((toLngRaw - fromLngRaw) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function getMovementLabel(tracking, staffPosition, destinationPosition) {
  const backendStatus = tracking?.movementStatus;
  if (backendStatus === 'ARRIVED' || ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(tracking?.requestStatus)) {
    return 'Rescue staff đã đến nơi';
  }
  if (backendStatus === 'NEARBY') {
    return 'Sắp đến nơi';
  }
  if (backendStatus === 'APPROACHING') {
    return 'Đang tới điểm cứu hộ';
  }

  const distanceKm = calculateDistanceKm(staffPosition, destinationPosition);
  if (distanceKm !== null && distanceKm < 0.3) {
    return 'Sắp đến nơi';
  }

  return 'Đang tới điểm cứu hộ';
}

function getEtaLabel(tracking) {
  if (tracking?.movementStatus === 'ARRIVED' || tracking?.etaMinutes === 0) {
    return 'Đã đến nơi';
  }
  if (Number.isFinite(Number(tracking?.etaMinutes)) && Number(tracking?.etaMinutes) > 0) {
    return `Khoảng ${tracking.etaMinutes} phút`;
  }

  return 'Đang cập nhật ETA';
}

function FitTrackingBounds({ points, boundsKey }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return undefined;
    }

    const animationFrame = requestAnimationFrame(() => {
      map.invalidateSize();
      if (points.length === 1) {
        map.setView(points[0], 15);
        return;
      }

      map.fitBounds(L.latLngBounds(points), {
        padding: [42, 42],
        maxZoom: 16,
      });
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [boundsKey, map, points]);

  return null;
}

export default function RequestTrackingMap({ requestId }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const inFlightRef = useRef(false);

  const loadTracking = useCallback(async ({ initial = false } = {}) => {
    if (!requestId || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const nextTracking = await requestApi.getRequestTracking(requestId);
      setTracking(nextTracking);
      setError('');
    } catch (err) {
      setError(getApiError(err) || 'Không thể cập nhật vị trí mới nhất. Đang thử lại...');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestId]);

  useEffect(() => {
    setTracking(null);
    setError('');
    loadTracking({ initial: true });

    const intervalId = window.setInterval(() => {
      loadTracking();
    }, TRACKING_POLL_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadTracking]);

  const destinationPosition = useMemo(() => toLatLng(tracking?.destination), [tracking]);
  const staffPosition = useMemo(() => toLatLng(tracking?.staff?.location), [tracking]);

  const routePositions = useMemo(() => {
    const apiRoute = (tracking?.route || []).map(toLatLng).filter(Boolean);
    if (apiRoute.length >= 2) {
      return apiRoute;
    }
    if (staffPosition && destinationPosition) {
      return [staffPosition, destinationPosition];
    }
    return [];
  }, [destinationPosition, staffPosition, tracking?.route]);

  const mapPoints = useMemo(() => {
    const points = [];
    if (staffPosition) {
      points.push(staffPosition);
    }
    if (destinationPosition) {
      points.push(destinationPosition);
    }
    return points;
  }, [destinationPosition, staffPosition]);

  const boundsKey = mapPoints.map((point) => point.join(',')).join('|');
  const movementLabel = getMovementLabel(tracking, staffPosition, destinationPosition);
  const etaLabel = getEtaLabel(tracking);
  const vehicleLabel = tracking?.vehicle
    ? [tracking.vehicle.vehicleType, tracking.vehicle.vehicleCode].filter(Boolean).join(' - ')
    : 'Phương tiện đang cập nhật';
  const plateLabel = tracking?.vehicle?.plateNumber || 'Chưa có biển số';
  const ratingLabel = Number.isFinite(Number(tracking?.staff?.rating))
    ? `${Number(tracking.staff.rating).toFixed(1)}/5`
    : 'Chưa có đánh giá';

  if (loading && !tracking) {
    return (
      <div className="card tracking-state-card tracking-loading-card">
        <div className="tracking-skeleton-map" />
        <div>
          <div className="loader-spinner" />
          <h2>Đang tải bản đồ tracking...</h2>
          <p>Hệ thống đang lấy trạng thái điều phối mới nhất.</p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="card tracking-state-card">
        <div className="tracking-search-icon">MAP</div>
        <div>
          <h2>Không thể tải bản đồ tracking</h2>
          <p>Không thể cập nhật vị trí mới nhất. Đang thử lại...</p>
          {error ? <p className="tracking-error-detail">{error}</p> : null}
        </div>
      </div>
    );
  }

  if (!tracking.hasDestination) {
    return (
      <div className="card tracking-state-card">
        <div className="tracking-search-icon">MAP</div>
        <div>
          <h2>Request này chưa có thông tin vị trí.</h2>
          <p>Hãy cập nhật tọa độ điểm cứu hộ để hiển thị bản đồ theo dõi.</p>
        </div>
      </div>
    );
  }

  if (!tracking.assigned) {
    return (
      <div className="card tracking-state-card">
        <div className="tracking-search-icon">RS</div>
        <div>
          <div className="loader-spinner" />
          <h2>Đang tìm kiếm rescue staff phù hợp...</h2>
          <p>Hệ thống sẽ tự động cập nhật khi có nhân viên nhận chuyến.</p>
          {error ? <p className="tracking-inline-warning">Không thể cập nhật vị trí mới nhất. Đang thử lại...</p> : null}
        </div>
      </div>
    );
  }

  return (
    <section className="tracking-panel" aria-label="Request tracking map">
      <div className="tracking-map-frame">
        <MapContainer
          center={mapPoints[0] || DEFAULT_CENTER}
          zoom={14}
          scrollWheelZoom
          className="tracking-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitTrackingBounds points={mapPoints} boundsKey={boundsKey} />

          {routePositions.length >= 2 ? (
            <Polyline positions={routePositions} pathOptions={{ color: '#168f57', weight: 5, opacity: 0.85 }} />
          ) : null}

          {staffPosition ? (
            <Marker position={staffPosition} icon={staffMarkerIcon} zIndexOffset={1000}>
              <Popup>
                <strong>{tracking.staff?.name || 'Rescue staff'}</strong>
                <br />
                {movementLabel}
              </Popup>
            </Marker>
          ) : null}

          {destinationPosition ? (
            <Marker position={destinationPosition} icon={destinationMarkerIcon}>
              <Popup>
                <strong>Điểm cứu hộ</strong>
                <br />
                {tracking.destination?.label || 'Customer destination'}
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>

        <div className="tracking-map-status">
          <span className="tracking-live-dot" />
          {refreshing ? 'Đang cập nhật...' : movementLabel}
        </div>

        {error ? (
          <div className="tracking-map-warning">
            Không thể cập nhật vị trí mới nhất. Đang thử lại...
          </div>
        ) : null}
      </div>

      <div className="tracking-staff-card">
        <div className="tracking-avatar">{getInitials(tracking.staff?.name)}</div>
        <div className="tracking-staff-main">
          <div>
            <h2>{tracking.staff?.name || 'Rescue staff'}</h2>
            <p>{tracking.staff?.jobTitle || 'Nhân viên cứu hộ'}</p>
          </div>
          <div className="tracking-meta-grid">
            <div>
              <span>Trạng thái</span>
              <strong>{movementLabel}</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{etaLabel}</strong>
            </div>
            <div>
              <span>Phương tiện</span>
              <strong>{vehicleLabel || 'Đang cập nhật'}</strong>
            </div>
            <div>
              <span>Biển số</span>
              <strong>{plateLabel}</strong>
            </div>
            <div>
              <span>Rating</span>
              <strong>{ratingLabel}</strong>
            </div>
          </div>
        </div>
        <div className="tracking-actions">
          <button className="button button-secondary" type="button" disabled>
            Gọi
          </button>
          <button className="button button-secondary" type="button" disabled>
            Chat
          </button>
        </div>
      </div>
    </section>
  );
}
