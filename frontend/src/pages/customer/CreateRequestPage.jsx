import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { customerApi } from '../../api/customerApi';
import { requestApi } from '../../api/requestApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

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

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [vehicles, setVehicles] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      navigate(`/requests/${created.id}`);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Rescue Request"
        subtitle="Submit your breakdown incident, service type, and location so a rescue company can take over."
      />

      {error ? <div className="notice error">{error}</div> : null}

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

        <h3>Incident Location</h3>
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
