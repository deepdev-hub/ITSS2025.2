import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { customerApi } from '../../api/customerApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import LocationPickerMap from '../../components/common/LocationPickerMap';
import { resolveRequestImageUrl } from '../../utils/requestImage';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

const initialForm = {
  vehicleId: '',
  incidentTypeId: '',
  serviceTypeId: '',
  description: '',
  priorityLevel: 'NORMAL',
  location: {
    country: 'Vietnam',
    province: '',
    district: '',
    ward: '',
    street: '',
    detail: '',
    latitude: '',
    longitude: '',
  },
};

function RequestImagePicker({ onFileSelected, onError }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const resolvedDisplayUrl = resolveRequestImageUrl(previewUrl || '');
  const displayUrl = imageError ? null : resolvedDisplayUrl;

  useEffect(() => {
    setImageError(false);
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
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
    onFileSelected(file);
  };

  const handleRemove = () => {
    setPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
      return null;
    });
    onFileSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="request-image-picker">
      {displayUrl ? (
        <div className="request-image-preview-wrap">
          <img
            src={displayUrl}
            alt="Request preview"
            className="request-image-preview"
            onError={() => setImageError(true)}
          />
          <button
            type="button"
            className="button button-danger request-image-remove"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="request-image-placeholder">
          <p className="muted-line">No image selected. JPEG, PNG, WebP or GIF — Max {MAX_FILE_SIZE_MB}MB</p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
          </button>
        </div>
      )}
      {!displayUrl && (
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}
      {displayUrl && (
        <button
          type="button"
          className="button button-secondary"
          style={{ marginTop: '0.5rem' }}
          onClick={() => fileInputRef.current?.click()}
        >
          Change image
        </button>
      )}
      {displayUrl && (
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [vehicles, setVehicles] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      try {
        const [vehicleList, incidentList, serviceList] = await Promise.all([
          customerApi.listVehicles(),
          authApi.getIncidentTypes(),
          authApi.getServiceTypes(),
        ]);
        setVehicles(vehicleList);
        setIncidentTypes(incidentList);
        setServiceTypes(serviceList);
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const key = name.replace('location.', '');
      setForm((previous) => ({
        ...previous,
        location: {
          ...previous.location,
          [key]: value,
        },
      }));
      return;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setImageError('');
    try {
      const payload = {
        ...form,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        incidentTypeId: Number(form.incidentTypeId),
        serviceTypeId: form.serviceTypeId ? Number(form.serviceTypeId) : null,
        location: {
          ...form.location,
          latitude: form.location.latitude ? Number(form.location.latitude) : null,
          longitude: form.location.longitude ? Number(form.location.longitude) : null,
        },
      };
      const created = await requestApi.createRequest(payload);

      // Upload image after successful request creation (non-blocking)
      if (selectedImageFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedImageFile);
          await requestApi.uploadRequestImage(created.id, formData);
        } catch (uploadErr) {
          // Image upload failure does not block navigation
          setImageError(`Request created, but image upload failed: ${getApiError(uploadErr)}`);
        }
      }

      navigate(`/requests/${created.id}`);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationPick = ({ latitude, longitude }) => {
    setForm((previous) => ({
      ...previous,
      location: {
        ...previous.location,
        latitude: String(latitude),
        longitude: String(longitude),
      },
    }));
  };

  return (
    <>
      <PageHeader
        title="Create Rescue Request"
        subtitle="Submit your breakdown incident, service type, and location so a rescue company can take over."
      />

      {error ? <div className="notice error">{error}</div> : null}
      {imageError ? <div className="notice notice-warning">{imageError}</div> : null}

      <form className="card" onSubmit={handleSubmit}>
        {loading ? <p>Loading options...</p> : null}
        <div className="form-grid">
          <div className="field">
            <label>Vehicle</label>
            <select name="vehicleId" value={form.vehicleId} onChange={handleChange}>
              <option value="">No linked vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Incident Type</label>
            <select name="incidentTypeId" value={form.incidentTypeId} onChange={handleChange} required>
              <option value="">Select incident</option>
              {incidentTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Service Type</label>
            <select name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange}>
              <option value="">Select service</option>
              {serviceTypes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select name="priorityLevel" value={form.priorityLevel} onChange={handleChange}>
              <option value="LOW">LOW</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="EMERGENCY">EMERGENCY</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the breakdown or rescue situation..." />
        </div>

        <div className="field" style={{ marginTop: '0.5rem' }}>
          <label>Request Image <span className="muted-line" style={{ fontWeight: 400 }}>(optional)</span></label>
          <RequestImagePicker
            onFileSelected={setSelectedImageFile}
            onError={setImageError}
          />
        </div>

        <h3>Incident Location</h3>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Map</label>
          <LocationPickerMap
            value={{
              latitude: form.location.latitude,
              longitude: form.location.longitude,
            }}
            onChange={handleLocationPick}
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Country</label>
            <input name="location.country" value={form.location.country} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Province</label>
            <input name="location.province" value={form.location.province} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>District</label>
            <input name="location.district" value={form.location.district} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Ward</label>
            <input name="location.ward" value={form.location.ward} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Street</label>
            <input name="location.street" value={form.location.street} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Detail</label>
            <input name="location.detail" value={form.location.detail} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Latitude</label>
            <input name="location.latitude" value={form.location.latitude} onChange={handleChange} />
          </div>
          <div className="field">
            <label>Longitude</label>
            <input name="location.longitude" value={form.location.longitude} onChange={handleChange} />
          </div>
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Create Request'}
          </button>
        </div>
      </form>
    </>
  );
}