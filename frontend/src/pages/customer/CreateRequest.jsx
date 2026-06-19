import { useState } from 'react';
import LocationPickerMap from '../../components/common/LocationPickerMap';
import { requestApi } from '../../api/requestApi';

export default function CreateRequest() {
  const [form, setForm] = useState({
    incidentTypeId: '',
    serviceTypeId: '',
    description: '',
    latitude: null,
    longitude: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleLocationChange = ({ latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (form.latitude == null || form.longitude == null) {
      setMessage('Please choose a location before submitting the request.');
      return;
    }

    try {
      setSubmitting(true);

      await requestApi.createRequest({
        incidentTypeId: form.incidentTypeId,
        serviceTypeId: form.serviceTypeId,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      setMessage('Request created successfully.');
    } catch (error) {
      setMessage(error?.message || 'Request creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create Rescue Request</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Incident Type</label>
          <input
            name="incidentTypeId"
            value={form.incidentTypeId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Service Type</label>
          <input
            name="serviceTypeId"
            value={form.serviceTypeId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <label>Incident Location</label>
          <LocationPickerMap
            value={{
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={handleLocationChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
