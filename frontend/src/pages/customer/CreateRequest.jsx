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
      setMessage('Vui lòng chọn vị trí trước khi gửi yêu cầu.');
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

      setMessage('Tạo yêu cầu thành công.');
    } catch (error) {
      setMessage(error?.message || 'Tạo yêu cầu thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Tạo yêu cầu cứu hộ</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Loại sự cố</label>
          <input
            name="incidentTypeId"
            value={form.incidentTypeId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Loại dịch vụ</label>
          <input
            name="serviceTypeId"
            value={form.serviceTypeId}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <label>Vị trí sự cố</label>
          <LocationPickerMap
            value={{
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={handleLocationChange}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}