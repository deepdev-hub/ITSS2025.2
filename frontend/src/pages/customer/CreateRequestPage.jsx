import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Send,
  AlertTriangle,
  Wrench,
  Navigation,
  FileCheck,
} from 'lucide-react';
import { authApi } from '../../api/authApi';
import { customerApi } from '../../api/customerApi';
import { requestApi } from '../../api/requestApi';
import { locationApi } from '../../api/locationApi';
import { getApiError } from '../../api/client';
import Alert from '../../components/common/Alert';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import ImageUploadZone from '../../components/common/ImageUploadZone';
import LocationPickerMap from '../../components/common/LocationPickerMap';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

const SUGGESTED_SERVICES_MAP = {
  FLAT_TIRE: ['ON_SITE_REPAIR', 'TOWING'],
  ENGINE_FAIL: ['TOWING'],
  BATTERY: ['BATTERY_SUPPORT', 'ON_SITE_REPAIR'],
};

const WIZARD_STEPS = [
  { id: 'situation', label: 'Tình trạng', hint: 'Xác nhận sự cố & mức ưu tiên' },
  { id: 'details', label: 'Thông tin', hint: 'Xe, dịch vụ & mô tả' },
  { id: 'location', label: 'Vị trí', hint: 'Chọn điểm cứu hộ' },
  { id: 'confirm', label: 'Xác nhận', hint: 'Kiểm tra & gửi yêu cầu' },
];

const STEP_GUIDES = {
  1: {
    title: 'Bước 1 — Xác nhận tình trạng',
    text: 'Chọn loại sự cố và mức độ ưu tiên. Chọn EMERGENCY nếu bạn đang gặp nguy hiểm.',
    icon: AlertTriangle,
  },
  2: {
    title: 'Bước 2 — Nhập thông tin cần thiết',
    text: 'Chọn xe, dịch vụ cứu hộ, chi phí di chuyển và mô tả tình huống để đội hỗ trợ chuẩn bị tốt hơn.',
    icon: Wrench,
  },
  3: {
    title: 'Bước 3 — Xác nhận vị trí',
    text: 'Nhấn trên bản đồ để chọn vị trí chính xác. Hệ thống sẽ tự điền địa chỉ nếu có thể.',
    icon: MapPin,
  },
  4: {
    title: 'Bước 4 — Gửi yêu cầu cứu hộ',
    text: 'Kiểm tra lại toàn bộ thông tin và phí ước tính trước khi gửi. Sau khi gửi, bạn sẽ theo dõi tiến trình ở bước 5.',
    icon: FileCheck,
  },
};

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

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VND`;
}

function StepGuide({ step }) {
  const guide = STEP_GUIDES[step];
  if (!guide) return null;

  const IconComponent = guide.icon || Info;

  return (
    <div className="wizard-step-guide">
      <IconComponent size={24} aria-hidden="true" style={{ color: 'var(--primary)' }} />
      <div>
        <strong>{guide.title}</strong>
        <p>{guide.text}</p>
      </div>
    </div>
  );
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [transportCost, setTransportCost] = useState('');
  const [feeInfo, setFeeInfo] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState('');
  const [geocoding, setGeocoding] = useState(false);

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

  useEffect(() => {
    if (!form.serviceTypeId) {
      setFeeInfo(null);
      setFeeError('');
      setFeeLoading(false);
      return;
    }

    const cost = Number(transportCost || 0);
    if (Number.isNaN(cost) || cost < 0) {
      setFeeInfo(null);
      setFeeError('Travel cost must be a valid non-negative number.');
      setFeeLoading(false);
      return;
    }

    let cancelled = false;
    setFeeLoading(true);
    setFeeError('');

    requestApi
      .predictFee(Number(form.serviceTypeId), cost)
      .then((data) => {
        if (!cancelled) setFeeInfo(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setFeeInfo(null);
          setFeeError(getApiError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setFeeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.serviceTypeId, transportCost]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('location.')) {
      const key = name.replace('location.', '');
      setForm((previous) => ({
        ...previous,
        location: { ...previous.location, [key]: value },
      }));
      return;
    }

    if (name === 'incidentTypeId') {
      const selectedIncident = incidentTypes.find((i) => i.id === Number(value));
      const suggestedCodes = selectedIncident ? (SUGGESTED_SERVICES_MAP[selectedIncident.code] || []) : [];
      let newServiceTypeId = form.serviceTypeId;
      if (suggestedCodes.length > 0) {
        const firstSuggested = serviceTypes.find((s) => suggestedCodes.includes(s.code));
        if (firstSuggested) newServiceTypeId = String(firstSuggested.id);
      }
      setForm((previous) => ({ ...previous, incidentTypeId: value, serviceTypeId: newServiceTypeId }));
      return;
    }

    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const applyGeocodeResult = (geocodeData, latitude, longitude) => {
    setForm((previous) => ({
      ...previous,
      location: {
        country: geocodeData.country || previous.location.country,
        province: geocodeData.province || '',
        district: geocodeData.district || '',
        ward: geocodeData.ward || '',
        street: geocodeData.street || '',
        detail: geocodeData.detail || '',
        latitude: String(latitude),
        longitude: String(longitude),
      },
    }));
  };

  const runReverseGeocode = async (latitude, longitude) => {
    if (geocoding) return;
    setGeocoding(true);
    setError('');
    try {
      const geocodeData = await locationApi.reverseGeocode(latitude, longitude);
      applyGeocodeResult(geocodeData, latitude, longitude);
    } catch (err) {
      setForm((previous) => ({
        ...previous,
        location: {
          ...previous.location,
          latitude: String(latitude),
          longitude: String(longitude),
        },
      }));
      setError(`Location selected, but address lookup failed: ${getApiError(err)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocationPick = ({ latitude, longitude }) => {
    runReverseGeocode(latitude, longitude);
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.incidentTypeId) {
        setError('Vui lòng chọn loại sự cố.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.serviceTypeId) {
        setError('Vui lòng chọn loại dịch vụ.');
        return false;
      }
      const cost = Number(transportCost || 0);
      if (Number.isNaN(cost) || cost < 0) {
        setError('Chi phí di chuyển phải là số hợp lệ.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!form.location.province || !form.location.latitude || !form.location.longitude) {
        setError('Vui lòng chọn vị trí trên bản đồ và điền tỉnh/thành.');
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    setError('');
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, WIZARD_STEPS.length));
  };

  const goBack = () => {
    setError('');
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    setError('');
    setImageError('');
    try {
      const resolvedTransportCost = Number(transportCost || 0);
      const payload = {
        ...form,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        incidentTypeId: Number(form.incidentTypeId),
        serviceTypeId: Number(form.serviceTypeId),
        transportCost: resolvedTransportCost,
        location: {
          ...form.location,
          latitude: form.location.latitude ? Number(form.location.latitude) : null,
          longitude: form.location.longitude ? Number(form.location.longitude) : null,
        },
      };
      const created = await requestApi.createRequest(payload);

      if (selectedImageFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedImageFile);
          await requestApi.uploadRequestImage(created.id, formData);
        } catch (uploadErr) {
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

  const selectedIncidentId = Number(form.incidentTypeId);
  const selectedIncident = incidentTypes.find((i) => i.id === selectedIncidentId);
  const suggestedCodes = selectedIncident ? (SUGGESTED_SERVICES_MAP[selectedIncident.code] || []) : [];
  const suggestedServices = serviceTypes.filter((s) => suggestedCodes.includes(s.code));
  const otherServices = serviceTypes.filter((s) => !suggestedCodes.includes(s.code));

  const selectedVehicle = vehicles.find((v) => String(v.id) === String(form.vehicleId));
  const selectedService = serviceTypes.find((s) => String(s.id) === String(form.serviceTypeId));

  return (
    <>
      <PageHeader
        title="Tạo yêu cầu cứu hộ"
        subtitle="Hoàn thành từng bước để gửi yêu cầu nhanh và chính xác. Sau khi gửi, bạn sẽ theo dõi tiến trình ở trang chi tiết."
      />

      {error ? <Alert variant="error" title="Không thể tiếp tục">{error}</Alert> : null}
      {imageError ? <Alert variant="warning" title="Lưu ý">{imageError}</Alert> : null}
      {form.priorityLevel === 'EMERGENCY' ? (
        <Alert variant="warning" title="Tình huống khẩn cấp">
          Bạn đã chọn mức ưu tiên EMERGENCY. Hãy đảm bảo vị trí chính xác và mô tả rõ tình trạng.
        </Alert>
      ) : null}

      <div className="wizard-shell">
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

        <form className="card wizard-step-panel" onSubmit={handleSubmit}>
          {loading ? <p>Đang tải dữ liệu...</p> : null}

          {!loading && currentStep === 1 ? (
            <>
              <StepGuide step={1} />
              <div className="form-grid">
                <div className="field">
                  <label>Loại sự cố</label>
                  <select name="incidentTypeId" value={form.incidentTypeId} onChange={handleChange} required>
                    <option value="">Chọn sự cố</option>
                    {incidentTypes.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Mức ưu tiên</label>
                  <select name="priorityLevel" value={form.priorityLevel} onChange={handleChange}>
                    <option value="LOW">LOW</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
              </div>
            </>
          ) : null}

          {!loading && currentStep === 2 ? (
            <>
              <StepGuide step={2} />
              <div className="form-grid">
                <div className="field">
                  <label>Xe</label>
                  <select name="vehicleId" value={form.vehicleId} onChange={handleChange}>
                    <option value="">Không liên kết xe</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Dịch vụ</label>
                  <select name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange} required>
                    <option value="">Chọn dịch vụ</option>
                    {suggestedServices.length > 0 ? (
                      <>
                        <optgroup label="Gợi ý">
                          {suggestedServices.map((item) => (
                            <option key={item.id} value={item.id}>{item.name} (Đề xuất)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Dịch vụ khác">
                          {otherServices.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </optgroup>
                      </>
                    ) : (
                      serviceTypes.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Chi phí di chuyển (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Ví dụ: 50000"
                    value={transportCost}
                    onChange={(event) => setTransportCost(event.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Mô tả tình huống</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả sự cố, tình trạng xe, yêu cầu hỗ trợ..."
                />
              </div>
              <div className="field">
                <label>Ảnh minh họa <span className="muted-line">(tùy chọn)</span></label>
                <ImageUploadZone
                  label="Thêm ảnh minh họa"
                  hint={`JPEG, PNG, WebP, GIF — tối đa ${MAX_FILE_SIZE_MB}MB`}
                  accept={ACCEPTED_IMAGE_TYPES}
                  maxSizeMb={MAX_FILE_SIZE_MB}
                  showRemove
                  onFileSelected={setSelectedImageFile}
                  onRemove={() => setSelectedImageFile(null)}
                  onError={setImageError}
                />
              </div>
            </>
          ) : null}

          {!loading && currentStep === 3 ? (
            <>
              <StepGuide step={3} />
              <div className="field">
                <label><MapPin size={16} style={{ verticalAlign: 'middle' }} /> Bản đồ — nhấn để chọn vị trí</label>
                <LocationPickerMap
                  value={{
                    latitude: form.location.latitude,
                    longitude: form.location.longitude,
                  }}
                  onChange={handleLocationPick}
                />
              </div>
              <div className="form-grid" style={{ marginTop: '1rem' }}>
                <div className="field">
                  <label>Tỉnh/Thành</label>
                  <input name="location.province" value={form.location.province} onChange={handleChange} required disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Quận/Huyện</label>
                  <input name="location.district" value={form.location.district} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Phường/Xã</label>
                  <input name="location.ward" value={form.location.ward} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Đường</label>
                  <input name="location.street" value={form.location.street} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Chi tiết</label>
                  <input name="location.detail" value={form.location.detail} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Latitude</label>
                  <input name="location.latitude" value={form.location.latitude} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Longitude</label>
                  <input name="location.longitude" value={form.location.longitude} onChange={handleChange} disabled={geocoding} />
                </div>
              </div>
            </>
          ) : null}

          {!loading && currentStep === 4 ? (
            <>
              <StepGuide step={4} />
              <div className="wizard-review-grid">
                <div className="wizard-review-item">
                  <span>Sự cố</span>
                  <strong>{selectedIncident?.name || '—'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Ưu tiên</span>
                  <strong>{form.priorityLevel}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Xe</span>
                  <strong>
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                      : 'Không liên kết'}
                  </strong>
                </div>
                <div className="wizard-review-item">
                  <span>Dịch vụ</span>
                  <strong>{selectedService?.name || '—'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Vị trí</span>
                  <strong>{form.location.province || '—'}</strong>
                </div>
              </div>

              <div className={`fee-preview-panel ${feeInfo ? 'fee-preview-panel-ready' : ''}`} style={{ marginTop: '1rem' }}>
                <div>
                  <span>Phí ước tính</span>
                  {feeLoading ? (
                    <strong>Đang tính...</strong>
                  ) : feeInfo ? (
                    <strong>{formatMoney(feeInfo.estimatedFee)}</strong>
                  ) : (
                    <strong>Chưa tính được</strong>
                  )}
                </div>
                {feeInfo ? (
                  <p>
                    Hệ số {feeInfo.coefficient} x (Giá dịch vụ {formatMoney(feeInfo.basePrice)} + Di chuyển {formatMoney(feeInfo.transportCost)})
                  </p>
                ) : (
                  <p>{feeError || 'Chọn dịch vụ và nhập chi phí di chuyển để xem phí ước tính.'}</p>
                )}
              </div>
            </>
          ) : null}

          <div className="actions-row" style={{ marginTop: '1.25rem' }}>
            {currentStep > 1 ? (
              <button type="button" className="button button-secondary" onClick={goBack}>
                <ChevronLeft size={18} aria-hidden="true" />
                Quay lại
              </button>
            ) : null}

            {currentStep < WIZARD_STEPS.length ? (
              <button type="button" className="button button-primary" onClick={goNext}>
                Tiếp tục
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                className={`button button-sos ${submitting ? 'button-loading' : ''}`}
                type="submit"
                disabled={submitting || geocoding}
              >
                <Send size={18} aria-hidden="true" />
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu cứu hộ'}
              </button>
            )}
          </div>
        </form>

        <div className="card card-muted" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" />
          <p className="muted-line" style={{ margin: 0 }}>
            <strong>Bước 5 — Theo dõi:</strong> Sau khi gửi, hệ thống chuyển bạn đến trang chi tiết với timeline tiến trình xử lý.
          </p>
        </div>
      </div>
    </>
  );
}
