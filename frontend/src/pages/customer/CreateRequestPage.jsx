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
  { id: 'situation', label: 'Tinh trang', hint: 'Xac nhan su co & muc uu tien' },
  { id: 'details', label: 'Thong tin', hint: 'Xe, dich vu & mo ta' },
  { id: 'location', label: 'Vi tri', hint: 'Chon diem cuu ho' },
  { id: 'confirm', label: 'Xac nhan', hint: 'Kiem tra & gui yeu cau' },
];

const STEP_GUIDES = {
  1: {
    title: 'Buoc 1 - Xac nhan tinh trang',
    text: 'Chon loai su co va muc do uu tien. Chon EMERGENCY neu ban dang gap nguy hiem.',
    icon: AlertTriangle,
  },
  2: {
    title: 'Buoc 2 - Nhap thong tin can thiet',
    text: 'Chon xe, dich vu cuu ho va mo ta tinh huong de doi ho tro chuan bi tot hon.',
    icon: Wrench,
  },
  3: {
    title: 'Buoc 3 - Xac nhan vi tri',
    text: 'Nhan tren ban do de chon vi tri chinh xac. He thong se tu dien dia chi neu co the.',
    icon: MapPin,
  },
  4: {
    title: 'Buoc 4 - Gui yeu cau cuu ho',
    text: 'Kiem tra lai toan bo thong tin va phi uoc tinh truoc khi gui. Sau khi gui, ban se theo doi tien trinh o buoc 5.',
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

function isValidCoordinate(value, min, max) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max;
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

    if (!isValidCoordinate(form.location.latitude, -90, 90)
        || !isValidCoordinate(form.location.longitude, -180, 180)) {
      setFeeInfo(null);
      setFeeError('Chon vi tri tren ban do de tinh phi di chuyen tu dong.');
      setFeeLoading(false);
      return;
    }

    let cancelled = false;
    setFeeLoading(true);
    setFeeError('');

    requestApi
      .predictFee(
        Number(form.serviceTypeId),
        Number(form.location.latitude),
        Number(form.location.longitude),
      )
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
  }, [form.serviceTypeId, form.location.latitude, form.location.longitude]);

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
        setError('Vui long chon loai su co.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.serviceTypeId) {
        setError('Vui long chon loai dich vu.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!form.location.province
          || !isValidCoordinate(form.location.latitude, -90, 90)
          || !isValidCoordinate(form.location.longitude, -180, 180)) {
        setError('Vui long chon vi tri tren ban do va dien tinh/thanh.');
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
      if (!isValidCoordinate(form.location.latitude, -90, 90)
          || !isValidCoordinate(form.location.longitude, -180, 180)) {
        setError('Vui long chon vi tri hop le tren ban do truoc khi tao request.');
        return;
      }

      const latitude = Number(form.location.latitude);
      const longitude = Number(form.location.longitude);
      const payload = {
        ...form,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        incidentTypeId: Number(form.incidentTypeId),
        serviceTypeId: Number(form.serviceTypeId),
        location: {
          ...form.location,
          latitude,
          longitude,
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
        title="Tao yeu cau cuu ho"
        subtitle="Hoan thanh tung buoc de gui yeu cau nhanh va chinh xac. Phi uoc tinh duoc tinh tu dong theo vi tri."
      />

      {error ? <Alert variant="error" title="Khong the tiep tuc">{error}</Alert> : null}
      {imageError ? <Alert variant="warning" title="Luu y">{imageError}</Alert> : null}
      {form.priorityLevel === 'EMERGENCY' ? (
        <Alert variant="warning" title="Tinh huong khan cap">
          Ban da chon muc uu tien EMERGENCY. Hay dam bao vi tri chinh xac va mo ta ro tinh trang.
        </Alert>
      ) : null}

      <div className="wizard-shell">
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

        <form className="card wizard-step-panel" onSubmit={handleSubmit}>
          {loading ? <p>Dang tai du lieu...</p> : null}

          {!loading && currentStep === 1 ? (
            <>
              <StepGuide step={1} />
              <div className="form-grid">
                <div className="field">
                  <label>Loai su co</label>
                  <select name="incidentTypeId" value={form.incidentTypeId} onChange={handleChange} required>
                    <option value="">Chon su co</option>
                    {incidentTypes.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Muc uu tien</label>
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
                    <option value="">Khong lien ket xe</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Dich vu</label>
                  <select name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange} required>
                    <option value="">Chon dich vu</option>
                    {suggestedServices.length > 0 ? (
                      <>
                        <optgroup label="Goi y">
                          {suggestedServices.map((item) => (
                            <option key={item.id} value={item.id}>{item.name} (De xuat)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Dich vu khac">
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
              </div>
              <div className="field">
                <label>Mo ta tinh huong</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mo ta su co, tinh trang xe, yeu cau ho tro..."
                />
              </div>
              <div className="field">
                <label>Anh minh hoa <span className="muted-line">(tuy chon)</span></label>
                <ImageUploadZone
                  label="Them anh minh hoa"
                  hint={`JPEG, PNG, WebP, GIF - toi da ${MAX_FILE_SIZE_MB}MB`}
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
                <label><MapPin size={16} style={{ verticalAlign: 'middle' }} /> Ban do - nhan de chon vi tri</label>
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
                  <label>Tinh/Thanh</label>
                  <input name="location.province" value={form.location.province} onChange={handleChange} required disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Quan/Huyen</label>
                  <input name="location.district" value={form.location.district} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Phuong/Xa</label>
                  <input name="location.ward" value={form.location.ward} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Duong</label>
                  <input name="location.street" value={form.location.street} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Chi tiet</label>
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
                  <span>Su co</span>
                  <strong>{selectedIncident?.name || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Uu tien</span>
                  <strong>{form.priorityLevel}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Xe</span>
                  <strong>
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                      : 'Khong lien ket'}
                  </strong>
                </div>
                <div className="wizard-review-item">
                  <span>Dich vu</span>
                  <strong>{selectedService?.name || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Vi tri</span>
                  <strong>{form.location.province || '-'}</strong>
                </div>
              </div>

              <div className={`fee-preview-panel ${feeInfo ? 'fee-preview-panel-ready' : ''}`} style={{ marginTop: '1rem' }}>
                <div>
                  <span>Phi uoc tinh</span>
                  {feeLoading ? (
                    <strong>Dang tinh...</strong>
                  ) : feeInfo ? (
                    <strong>{formatMoney(feeInfo.estimatedFee)}</strong>
                  ) : (
                    <strong>Chua tinh duoc</strong>
                  )}
                </div>
                {feeInfo ? (
                  <p>
                    He so {feeInfo.coefficient} x (Gia dich vu {formatMoney(feeInfo.basePrice)} + Phi di chuyen tu dong {formatMoney(feeInfo.travelCost)})
                  </p>
                ) : (
                  <p>{feeError || 'Chon dich vu va vi tri tren ban do de xem phi uoc tinh.'}</p>
                )}
              </div>
            </>
          ) : null}

          <div className="actions-row" style={{ marginTop: '1.25rem' }}>
            {currentStep > 1 ? (
              <button type="button" className="button button-secondary" onClick={goBack}>
                <ChevronLeft size={18} aria-hidden="true" />
                Quay lai
              </button>
            ) : null}

            {currentStep < WIZARD_STEPS.length ? (
              <button type="button" className="button button-primary" onClick={goNext}>
                Tiep tuc
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                className={`button button-sos ${submitting ? 'button-loading' : ''}`}
                type="submit"
                disabled={submitting || geocoding}
              >
                <Send size={18} aria-hidden="true" />
                {submitting ? 'Dang gui...' : 'Gui yeu cau cuu ho'}
              </button>
            )}
          </div>
        </form>

        <div className="card card-muted" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" />
          <p className="muted-line" style={{ margin: 0 }}>
            <strong>Buoc 5 - Theo doi:</strong> Sau khi gui, he thong chuyen ban den trang chi tiet voi timeline tien trinh xu ly.
          </p>
        </div>
      </div>
    </>
  );
}
