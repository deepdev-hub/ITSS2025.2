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
  Calculator,
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
  { id: 'situation', label: 'Situation', hint: 'Confirm issue and priority' },
  { id: 'details', label: 'Details', hint: 'Vehicle, service, and notes' },
  { id: 'location', label: 'Location', hint: 'Choose rescue point' },
  { id: 'quotation', label: 'Estimate', hint: 'Automatic fee' },
  { id: 'confirm', label: 'Confirm', hint: 'Review and submit' },
];

const STEP_GUIDES = {
  1: {
    title: 'Step 1 - Confirm the situation',
    text: 'Choose the incident type and priority. Select EMERGENCY if you are in danger.',
    icon: AlertTriangle,
  },
  2: {
    title: 'Step 2 - Enter the required details',
    text: 'Choose a vehicle, rescue service, and description so the support team can prepare.',
    icon: Wrench,
  },
  3: {
    title: 'Step 3 - Confirm the location',
    text: 'Click the map to choose an exact location. The system will fill the address when possible.',
    icon: MapPin,
  },
  4: {
    title: 'Step 4 - Calculate the automatic fee',
    text: 'The system estimates the fee from the service price and nearest travel cost.',
    icon: Calculator,
  },
  5: {
    title: 'Step 5 - Confirm and submit',
    text: 'Review all details and the estimated fee before submitting. You can track progress on the detail page.',
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
  return `${Number(value || 0).toLocaleString('en-US')} VND`;
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
      setFeeError('Choose a location on the map to calculate automatic travel cost.');
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
        setError('Please choose an incident type.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!form.serviceTypeId) {
        setError('Please choose a service type.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!form.location.province
          || !isValidCoordinate(form.location.latitude, -90, 90)
          || !isValidCoordinate(form.location.longitude, -180, 180)) {
        setError('Please choose a map location and enter the province/city.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (feeLoading) {
        setError('Please wait for the automatic fee calculation.');
        return false;
      }
      if (!feeInfo) {
        setError(feeError || 'The automatic fee could not be calculated. Please check the service and location.');
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
    event?.preventDefault?.();
    if (currentStep < WIZARD_STEPS.length) {
      goNext();
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) return;

    setSubmitting(true);
    setError('');
    setImageError('');
    try {
      if (!isValidCoordinate(form.location.latitude, -90, 90)
          || !isValidCoordinate(form.location.longitude, -180, 180)) {
        setError('Please choose a valid map location before creating the request.');
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
        title="Create Rescue Request"
        subtitle="Complete each step to submit a fast and accurate request. The estimated fee is calculated automatically from the location."
      />

      {error ? <Alert variant="error" title="Cannot continue">{error}</Alert> : null}
      {imageError ? <Alert variant="warning" title="Note">{imageError}</Alert> : null}
      {form.priorityLevel === 'EMERGENCY' ? (
        <Alert variant="warning" title="Emergency situation">
          You selected EMERGENCY priority. Make sure the location is accurate and the description is clear.
        </Alert>
      ) : null}

      <div className="wizard-shell">
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

        <div className="card wizard-step-panel">
          {loading ? <p>Loading data...</p> : null}

          {!loading && currentStep === 1 ? (
            <>
              <StepGuide step={1} />
              <div className="form-grid">
                <div className="field">
                  <label>Incident Type</label>
                  <select name="incidentTypeId" value={form.incidentTypeId} onChange={handleChange} required>
                    <option value="">Choose incident</option>
                    {incidentTypes.map((item) => (
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
            </>
          ) : null}

          {!loading && currentStep === 2 ? (
            <>
              <StepGuide step={2} />
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
                  <label>Service</label>
                  <select name="serviceTypeId" value={form.serviceTypeId} onChange={handleChange} required>
                    <option value="">Choose service</option>
                    {suggestedServices.length > 0 ? (
                      <>
                        <optgroup label="Suggested">
                          {suggestedServices.map((item) => (
                            <option key={item.id} value={item.id}>{item.name} (Recommended)</option>
                          ))}
                        </optgroup>
                        <optgroup label="Other services">
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
                <label>Situation Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue, vehicle condition, and support request..."
                />
              </div>
              <div className="field">
                <label>Reference Image <span className="muted-line">(optional)</span></label>
                <ImageUploadZone
                  label="Add reference image"
                  hint={`JPEG, PNG, WebP, GIF - up to ${MAX_FILE_SIZE_MB}MB`}
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
                <label><MapPin size={16} style={{ verticalAlign: 'middle' }} /> Map - click to choose a location</label>
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
                  <label>Province/City</label>
                  <input name="location.province" value={form.location.province} onChange={handleChange} required disabled={geocoding} />
                </div>

                <div className="field">
                  <label>Ward</label>
                  <input name="location.ward" value={form.location.ward} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Street</label>
                  <input name="location.street" value={form.location.street} onChange={handleChange} disabled={geocoding} />
                </div>
                <div className="field">
                  <label>Detail</label>
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
                  <span>Service</span>
                  <strong>{selectedService?.name || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Location</span>
                  <strong>{form.location.province || '-'}</strong>
                </div>
              </div>
              <div className={`fee-preview-panel ${feeInfo ? 'fee-preview-panel-ready' : ''}`}>
                <div>
                  <span>Estimated Fee</span>
                  {feeLoading ? (
                    <strong>Calculating...</strong>
                  ) : feeInfo ? (
                    <strong>{formatMoney(feeInfo.estimatedFee)}</strong>
                  ) : (
                    <strong>Not available</strong>
                  )}
                </div>
                {feeInfo ? (
                  <p>
                    Coefficient {feeInfo.coefficient} x (Service price {formatMoney(feeInfo.basePrice)} + Automatic travel cost {formatMoney(feeInfo.travelCost)})
                  </p>
                ) : (
                  <p>{feeError || 'Choose a service and map location to see the estimated fee.'}</p>
                )}
              </div>
            </>
          ) : null}

          {!loading && currentStep === 5 ? (
            <>
              <StepGuide step={5} />
              <div className="wizard-review-grid">
                <div className="wizard-review-item">
                  <span>Incident</span>
                  <strong>{selectedIncident?.name || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Priority</span>
                  <strong>{form.priorityLevel}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Vehicle</span>
                  <strong>
                    {selectedVehicle
                      ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                      : 'No linked vehicle'}
                  </strong>
                </div>
                <div className="wizard-review-item">
                  <span>Service</span>
                  <strong>{selectedService?.name || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Location</span>
                  <strong>{form.location.province || '-'}</strong>
                </div>
                <div className="wizard-review-item">
                  <span>Estimated Fee</span>
                  <strong>{feeInfo ? formatMoney(feeInfo.estimatedFee) : 'Not available'}</strong>
                </div>
              </div>
            </>
          ) : null}

          <div className="actions-row" style={{ marginTop: '1.25rem' }}>
            {currentStep > 1 ? (
              <button type="button" className="button button-secondary" onClick={goBack}>
                <ChevronLeft size={18} aria-hidden="true" />
                Back
              </button>
            ) : null}

            {currentStep < WIZARD_STEPS.length ? (
              <button type="button" className="button button-primary" onClick={goNext}>
                Continue
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ) : (
              <button
                className={`button button-sos ${submitting ? 'button-loading' : ''}`}
                type="button"
                disabled={submitting || geocoding}
                onClick={handleSubmit}
              >
                <Send size={18} aria-hidden="true" />
                {submitting ? 'Submitting...' : 'Submit rescue request'}
              </button>
            )}
          </div>
        </div>

        <div className="card card-muted" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <CheckCircle2 size={20} color="var(--success)" aria-hidden="true" />
          <p className="muted-line" style={{ margin: 0 }}>
            <strong>After submitting:</strong> The system will open the detail page with the service timeline.
          </p>
        </div>
      </div>
    </>
  );
}
