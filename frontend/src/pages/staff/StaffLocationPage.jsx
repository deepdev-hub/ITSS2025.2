import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

// Khắc phục lỗi không hiển thị Icon mặc định của Leaflet trong React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component phụ giúp bản đồ trượt mượt mà đến tọa độ mới
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
}

export default function StaffLocationPage() {
  // Mặc định ở khu vực Hà Nội
  const [location, setLocation] = useState({ lat: 21.0051, lng: 105.8456 }); 
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState({ type: '', text: '' });

  // Hàm gọi GPS của thiết bị
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({ type: 'error', text: 'Thiết bị hoặc trình duyệt không hỗ trợ định vị GPS.' });
      return;
    }
    
    setIsLocating(true);
    setLocationNotice({ type: '', text: '' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
        setIsLocating(false);
        setLocationNotice({ type: 'success', text: 'Đã định vị thành công!' });
      },
      () => {
        setIsLocating(false);
        setLocationNotice({ type: 'error', text: 'Hãy cấp quyền truy cập vị trí cho trang web để tiếp tục.' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Hàm lưu tọa độ xuống Database
  const handleSaveLocation = async () => {
    setIsSavingLocation(true);
    setLocationNotice({ type: '', text: '' });
    try {
      // Chỉ gửi latitude và longitude
      await companyApi.updateMyLocation({ 
        latitude: location.lat, 
        longitude: location.lng 
      });
      
      setLocationNotice({ type: 'success', text: 'Đã cập nhật vị trí lên hệ thống điều phối thành công!' });
    } catch (err) {
      setLocationNotice({ type: 'error', text: getApiError(err) });
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <>
      <PageHeader 
        title="Khu vực trực hiện hành" 
        subtitle="Cập nhật tọa độ của bạn để hệ thống ưu tiên phân công các sự cố gần nhất." 
      />

      <div className="card">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          📍 Cập nhật vị trí
          <span className="status-badge status-active">Bán kính hoạt động: 5 km</span>
        </h2>
        
        {locationNotice.text && (
          <div className={`notice ${locationNotice.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
            {locationNotice.text}
          </div>
        )}
        
        <div className="grid-two" style={{ alignItems: 'flex-start' }}>
          {/* Cột 1: Các nút bấm điều khiển */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="field">
              <label>Tọa độ của bạn</label>
              <div className="muted-line" style={{ marginBottom: '0.5rem' }}>
                Lat: {location.lat.toFixed(5)} | Lng: {location.lng.toFixed(5)}
              </div>
              <button 
                type="button" 
                className="button button-secondary" 
                onClick={handleGetCurrentLocation} 
                disabled={isLocating}
                style={{ width: '100%' }}
              >
                {isLocating ? 'Đang lấy tọa độ...' : '🔄 Lấy vị trí GPS mới nhất'}
              </button>
            </div>

            <button 
              type="button" 
              className="button button-primary" 
              onClick={handleSaveLocation} 
              disabled={isSavingLocation}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              {isSavingLocation ? 'Đang cập nhật lên máy chủ...' : 'Lưu vị trí hiện hành'}
            </button>
          </div>

          {/* Cột 2: Bản đồ */}
          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
             <MapContainer 
                center={[location.lat, location.lng]} 
                zoom={13} 
                style={{ height: '300px', width: '100%', zIndex: 1 }}
             >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapUpdater center={location} />
                <Marker position={[location.lat, location.lng]} />
                {/* 5000 mét = 5km */}
                <Circle 
                  center={[location.lat, location.lng]} 
                  radius={5000} 
                  pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 1, fillOpacity: 0.15 }} 
                />
             </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
}