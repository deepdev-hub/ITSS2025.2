import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  MapPin,
  Navigation,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

// Fix the default Leaflet marker icon in React.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Smoothly move the map to the latest coordinates.
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
  const [location, setLocation] = useState({ lat: 21.0051, lng: 105.8456 }); 
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState({ type: '', text: '' });

  // Load existing location from DB when page loads
  useEffect(() => {
    async function loadCurrentLocation() {
      try {
        const status = await companyApi.getMyStaffStatus();
        if (status.currentLatitude && status.currentLongitude) {
          setLocation({
            lat: Number(status.currentLatitude),
            lng: Number(status.currentLongitude)
          });
        }
      } catch (err) {
        console.error('Failed to fetch initial location:', err);
      }
    }
    loadCurrentLocation();
  }, []);

  // Read GPS coordinates from the device.
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice({ type: 'error', text: 'This device or browser does not support GPS location.' });
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
        setLocationNotice({ type: 'success', text: 'Location detected successfully.' });
      },
      () => {
        setIsLocating(false);
        setLocationNotice({ type: 'error', text: 'Please allow location access for this website to continue.' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Save coordinates to the database.
  const handleSaveLocation = async () => {
    setIsSavingLocation(true);
    setLocationNotice({ type: '', text: '' });
    try {
      // Send latitude and longitude only.
      await companyApi.updateMyLocation({ 
        latitude: location.lat, 
        longitude: location.lng 
      });
      
      setLocationNotice({ type: 'success', text: 'Location updated in the dispatch system successfully.' });
    } catch (err) {
      setLocationNotice({ type: 'error', text: getApiError(err) });
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Current Service Area"
        subtitle="Update your coordinates so the system can prioritize nearby incidents."
      />

      <div className="card">
        <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <MapPin size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Update Location
          <span className="status-badge status-active">Service radius: 5 km</span>
        </h2>

        {locationNotice.text && (
          <div className={`notice ${locationNotice.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
            {locationNotice.type === 'error' ? <XCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> : <CheckCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
            {locationNotice.text}
          </div>
        )}

        <div className="grid-two" style={{ alignItems: 'flex-start' }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="field">
              <label><Navigation size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Your Coordinates</label>
              <div className="muted-line" style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <strong>Lat:</strong> {location.lat.toFixed(5)} | <strong>Lng:</strong> {location.lng.toFixed(5)}
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                style={{ width: '100%' }}
              >
                <RefreshCw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {isLocating ? 'Getting coordinates...' : 'Get latest GPS location'}
              </button>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={handleSaveLocation}
              disabled={isSavingLocation}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <Save size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {isSavingLocation ? 'Updating server...' : 'Save current location'}
            </button>
          </div>

          {/* Map */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
             <MapContainer
                center={[location.lat, location.lng]}
                zoom={13}
                style={{ height: '350px', width: '100%', zIndex: 1 }}
             >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapUpdater center={location} />
                <Marker position={[location.lat, location.lng]} />
                {/* 5000 meters = 5km */}
                <Circle
                  center={[location.lat, location.lng]}
                  radius={5000}
                  pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 2, fillOpacity: 0.15 }}
                />
             </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
}
