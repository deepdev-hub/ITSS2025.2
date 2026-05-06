import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';




delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [21.0285, 105.8542];

function RecenterMap({ center, zoom = 16 }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

function ClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onChange({
        latitude: lat,
        longitude: lng,
      });
    },
  });

  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
  height = '360px',
}) {
  
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const hasValidLocation =
    value &&
    value.latitude !== '' &&
    value.longitude !== '' &&
    value.latitude !== null &&
    value.longitude !== null &&
    !Number.isNaN(Number(value.latitude)) &&
    !Number.isNaN(Number(value.longitude));

  const selectedPosition = useMemo(() => {
    if (hasValidLocation) {
      return [Number(value.latitude), Number(value.longitude)];
    }
  
    return DEFAULT_CENTER;
  }, [hasValidLocation, value]);
  
  const handleSearchPlace = async () => {
    const q = keyword.trim();
    if (!q) {
      setError('Vui lòng nhập tên địa điểm hoặc địa chỉ.');
      return;
    }

    try {
      setSearching(true);
      setError('');

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&q=${encodeURIComponent(q)}&limit=1`
      );  

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm địa điểm.');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError('Không tìm thấy địa điểm phù hợp.');
        return;
      }

      const first = data[0];

      handlePickLocation({
        latitude: Number(first.lat),
        longitude: Number(first.lon),
      });
    } catch (err) {
      setError(err.message || 'Tìm kiếm địa điểm thất bại.');
    } finally {
      setSearching(false);
    }
  };

  const handlePickLocation = ({ latitude, longitude }) => {
    setError('');
    if (typeof onChange === 'function') {
      onChange({ latitude, longitude });
    }
  };

  const handleGetCurrentLocation = () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt này không hỗ trợ lấy vị trí hiện tại.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handlePickLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (geoError) => {
        switch (geoError.code) {
          case 1:
            setError('Bạn đã từ chối quyền truy cập vị trí.');
            break;
          case 2:
            setError('Không thể xác định vị trí hiện tại.');
            break;
          case 3:
            setError('Hết thời gian lấy vị trí. Hãy thử lại.');
            break;
          default:
            setError('Lấy vị trí thất bại.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="location-picker">
      <div style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="button"
          onClick={handleGetCurrentLocation}
        >
          Lấy vị trí hiện tại
        </button>
      </div>

      <MapContainer
        center={selectedPosition}
        zoom={hasValidLocation ? 16 : 13}
        scrollWheelZoom
        style={{
          height,
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onChange={handlePickLocation} />
        <RecenterMap center={selectedPosition} zoom={16} />

        {hasValidLocation ? (
          <Marker position={selectedPosition}>
            <Popup>
              Vị trí đã chọn
              <br />
              Latitude: {Number(value.latitude).toFixed(6)}
              <br />
              Longitude: {Number(value.longitude).toFixed(6)}
            </Popup>
          </Marker>
        ) : null}
      </MapContainer>

      <div style={{ marginTop: 12, fontSize: 14 }}>
        <strong>Tọa độ đã chọn:</strong>{' '}
        {hasValidLocation
          ? `${Number(value.latitude).toFixed(6)}, ${Number(value.longitude).toFixed(6)}`
          : 'Chưa chọn'}
      </div>

      <div style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
        Bấm nút để lấy vị trí hiện tại hoặc click trực tiếp lên bản đồ để chọn vị trí.
      </div>
      <div
      style={{
        display: 'flex',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
      }}
    >
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập tên địa điểm hoặc địa chỉ..."
        style={{
          flex: 1,
          minWidth: 240,
          padding: '10px 12px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchPlace();
          }
        }}
      />

      <button
        type="button"
        className="button"
        onClick={handleSearchPlace}
        disabled={searching}
      >
        {searching ? 'Đang tìm...' : 'Tìm địa điểm'}
      </button>
    </div>

      {error ? (
        <div style={{ marginTop: 8, fontSize: 14, color: 'red' }}>{error}</div>
      ) : null}
    </div>
  );
}