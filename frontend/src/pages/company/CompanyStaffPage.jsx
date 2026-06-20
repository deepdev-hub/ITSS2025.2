import { useEffect, useMemo, useState } from 'react';
import { MapPin, Mail, Phone, Edit2, Trash2, CheckCircle2, UserPlus } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mechanicIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995562.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const STAFF_STATUSES = ['ACTIVE', 'OFFLINE', 'BUSY'];
const DEFAULT_MAP_CENTER = [21.0051, 105.8456];

const initialForm = {
  userId: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  jobTitle: '',
  yearsExperience: '',
  bio: '',
  status: 'ACTIVE',
};

function hasLocation(item) {
  return item.currentLatitude !== null
    && item.currentLatitude !== undefined
    && item.currentLongitude !== null
    && item.currentLongitude !== undefined;
}

function MapBounds({ staffList }) {
  const map = useMap();

  useEffect(() => {
    const validStaff = staffList.filter(hasLocation);
    if (validStaff.length > 0) {
      const bounds = L.latLngBounds(validStaff.map((item) => [item.currentLatitude, item.currentLongitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [staffList, map]);

  return null;
}

function getStatusColor(status) {
  switch (status) {
    case 'ACTIVE':
      return '#10b981';
    case 'BUSY':
      return '#f59e0b';
    case 'OFFLINE':
      return '#64748b';
    default:
      return '#1e293b';
  }
}

function toStaffForm(item) {
  if (!item) {
    return initialForm;
  }

  return {
    userId: item.userId ? String(item.userId) : '',
    email: item.email || '',
    password: '',
    fullName: item.fullName || '',
    phone: item.phone || '',
    jobTitle: item.jobTitle || '',
    yearsExperience: item.yearsExperience ?? '',
    bio: item.bio || '',
    status: item.status || 'ACTIVE',
  };
}

function buildStaffPayload(form, creationMode, editingId) {
  const isLinkMode = !editingId && creationMode === 'LINK_EXISTING';

  return {
    userId: isLinkMode && form.userId ? Number(form.userId) : null,
    email: isLinkMode ? null : (form.email.trim() || null),
    password: isLinkMode ? null : (form.password || null),
    fullName: isLinkMode ? null : (form.fullName.trim() || null),
    phone: isLinkMode ? null : form.phone.trim(),
    jobTitle: form.jobTitle.trim(),
    yearsExperience: form.yearsExperience !== '' ? Number(form.yearsExperience) : null,
    bio: form.bio.trim() || null,
    status: form.status,
  };
}

function buildQuickStatusPayload(item, nextStatus) {
  return {
    userId: item.userId,
    email: item.email || null,
    password: null,
    fullName: item.fullName || null,
    phone: item.phone || '',
    jobTitle: item.jobTitle || '',
    yearsExperience: item.yearsExperience ?? null,
    bio: item.bio || null,
    status: nextStatus,
  };
}

export default function CompanyStaffPage() {
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [creationMode, setCreationMode] = useState('NEW_ACCOUNT');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = useMemo(() => ({
    total: staff.length,
    active: staff.filter((item) => item.status === 'ACTIVE').length,
    offline: staff.filter((item) => item.status === 'OFFLINE').length,
    busy: staff.filter((item) => item.status === 'BUSY').length,
  }), [staff]);

  const filteredStaff = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return staff.filter((item) => {
      const matchesSearch = keyword === ''
        || [
          item.fullName,
          item.email,
          item.phone,
          item.jobTitle,
        ].some((value) => value?.toLowerCase().includes(keyword));
      const matchesStatus = filters.status === 'ALL' || item.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [filters, staff]);

  const staffWithLocations = useMemo(() => filteredStaff.filter(hasLocation), [filteredStaff]);

  const loadData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    try {
      const staffList = await companyApi.getStaff();
      setStaff(staffList);
      setStatusDrafts(Object.fromEntries(staffList.map((item) => [item.id, item.status])));
    } catch (err) {
      if (!silent) {
        setError(getApiError(err));
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => loadData(true), 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCreationMode('NEW_ACCOUNT');
    setForm(toStaffForm(item));
    setNotice('');
    setError('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCreationMode('NEW_ACCOUNT');
    setForm(initialForm);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const payload = buildStaffPayload(form, creationMode, editingId);
      if (editingId) {
        await companyApi.updateStaff(editingId, payload);
        setNotice('Staff updated successfully.');
      } else {
        await companyApi.createStaff(payload);
        setNotice('Staff created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (item) => {
    const nextStatus = statusDrafts[item.id];
    setActionId(item.id);
    setError('');
    setNotice('');

    try {
      await companyApi.updateStaff(item.id, buildQuickStatusPayload(item, nextStatus));
      setNotice(`Staff status updated to ${nextStatus}.`);
      if (editingId === item.id) {
        setForm((previous) => ({ ...previous, status: nextStatus }));
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const removeStaff = async (staffId) => {
    if (!window.confirm('Delete this staff profile?')) {
      return;
    }

    setActionId(staffId);
    setError('');
    setNotice('');

    try {
      await companyApi.deleteStaff(staffId);
      setNotice('Staff deleted successfully.');
      if (editingId === staffId) {
        resetForm();
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Company Staff"
        subtitle="Manage rescue staff, search the roster, view real-time locations, and change working status quickly."
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
      {loading ? <Loader label="Loading company staff..." /> : null}

      {!loading ? (
        <>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span>Staff Live Location Map</span>
              <span
                className="status-badge status-active"
                style={{ textTransform: 'none', fontSize: '14px', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px' }}
              >
                Operating radius: 5 km
              </span>
            </h2>
            <p className="muted-line">Track the current field location of staff. Data refreshes automatically every 10 seconds.</p>

            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd', marginTop: '1rem' }}>
              <MapContainer
                center={DEFAULT_MAP_CENTER}
                zoom={12}
                style={{ height: '450px', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                {staffWithLocations.length > 0 ? <MapBounds staffList={staffWithLocations} /> : null}

                {staffWithLocations.map((item) => (
                  <Marker
                    key={item.id}
                    position={[item.currentLatitude, item.currentLongitude]}
                    icon={mechanicIcon}
                  >
                    <Tooltip direction="bottom" offset={[0, 5]} opacity={0.95} permanent>
                      <div style={{ textAlign: 'center', lineHeight: '1.3' }}>
                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>{item.fullName}</strong>
                        <br />
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Code: KTV-{item.userId || item.id}</span>
                        <br />
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: getStatusColor(item.status) }}>
                          {item.status}
                        </span>
                      </div>
                    </Tooltip>

                    <Popup>
                      <div style={{ padding: '5px' }}>
                        <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>{item.fullName}</h4>
                        <p style={{ margin: '5px 0' }}>Staff code: <strong>KTV-{item.userId || item.id}</strong></p>
                        <p style={{ margin: '0 0 5px 0' }}>Phone: {item.phone || 'Not updated'}</p>
                        <p style={{ margin: 0 }}>
                          Status: <strong style={{ color: getStatusColor(item.status) }}>{item.status}</strong>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

        <div>
          <Modal 
            isOpen={isModalOpen} 
            onClose={resetForm} 
            title={editingId ? 'Update Staff' : 'Create Staff'}
            size="large"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button form="staff-form" className="button button-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create staff')}
                </button>
              </div>
            }
          >
            <form id="staff-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {editingId && (
                <div>
                  <StatusBadge value={form.status} />
                </div>
              )}

              {!editingId ? (
                <div className="field">
                  <label>Create Mode</label>
                  <select value={creationMode} onChange={(event) => setCreationMode(event.target.value)}>
                    <option value="NEW_ACCOUNT">Create new staff account</option>
                    <option value="LINK_EXISTING">Link existing RESCUE_STAFF account</option>
                  </select>
                </div>
              ) : null}

              {creationMode === 'LINK_EXISTING' && !editingId ? (
                <div className="field">
                  <label>Existing User Id</label>
                  <input
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    placeholder="Enter an existing RESCUE_STAFF account id"
                    required
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="field">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required={!editingId} />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={editingId ? 'Leave blank to keep current password' : 'Required'}
                      required={!editingId}
                    />
                  </div>
                  <div className="field">
                    <label>Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required={!editingId} />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="field">
                  <label>Job Title</label>
                  <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Tow operator, dispatcher..." />
                </div>
                <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      {STAFF_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Experience (Years)</label>
                    <input name="yearsExperience" type="number" min="0" value={form.yearsExperience} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Bio</label>
                <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Short rescue experience, specialties, or service notes" rows="3" />
              </div>
            </form>
          </Modal>

            <div className="card">
              <div className="toolbar">
                <div className="toolbar-title">
                  <h2>Staff List</h2>
                  <p>{filteredStaff.length} staff member(s) matched</p>
                </div>
                <div className="toolbar-filters">
                  <button className="button button-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                    Create Staff
                  </button>
                  <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name, email, phone, job title"
                  />
                  <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="ALL">All statuses</option>
                    {STAFF_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="table-wrapper modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Staff Profile</th>
                      <th>Contact Info</th>
                      <th>Job Details</th>
                      <th>Live Location</th>
                      <th>Status Management</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="empty-state">No staff matched the current filters.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((item) => (
                        <tr key={item.id} className="modern-tr">
                          <td className="staff-cell">
                            <div className="staff-profile">
                              <div className="staff-avatar">
                                {item.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="staff-info">
                                <strong>{item.fullName}</strong>
                                <span className="muted-line">User #{item.userId || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="contact-cell">
                            <div className="staff-contact-info">
                              <div className="staff-contact-line" title={item.email}><Mail size={14}/> <span>{item.email || 'No email'}</span></div>
                              <div className="staff-contact-line"><Phone size={14}/> <span>{item.phone || 'No phone'}</span></div>
                            </div>
                          </td>
                          <td className="job-cell">
                            <div className="job-info">
                              <span className="job-title-badge">{item.jobTitle || 'N/A'}</span>
                              <span className="muted-line">{item.yearsExperience !== null && item.yearsExperience !== undefined ? `${item.yearsExperience} yrs exp` : ''}</span>
                            </div>
                          </td>
                          <td className="location-cell">
                            {hasLocation(item) ? (
                              <div className="staff-loc-info">
                                <div className="loc-icon"><MapPin size={16} /></div>
                                <div className="staff-loc-coords">
                                  <span>{Number(item.currentLatitude).toFixed(4)}</span>
                                  <span className="muted-line">{Number(item.currentLongitude).toFixed(4)}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="muted-line no-loc">No location</span>
                            )}
                          </td>
                          <td className="status-cell">
                            <div className="status-update-wrapper">
                              <StatusBadge value={item.status} />
                              <div className="quick-status-control">
                                <select
                                  className="status-select-minimal"
                                  value={statusDrafts[item.id] || item.status}
                                  onChange={(event) => setStatusDrafts((previous) => ({
                                    ...previous,
                                    [item.id]: event.target.value,
                                  }))}
                                >
                                  {STAFF_STATUSES.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                {(statusDrafts[item.id] && statusDrafts[item.id] !== item.status) && (
                                  <button
                                    className="button-icon-check"
                                    title="Save Status"
                                    disabled={actionId === item.id}
                                    onClick={() => handleQuickStatusUpdate(item)}
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="actions-cell text-right">
                            <div className="actions-row">
                              <button className="icon-btn edit-btn" title="Edit Staff" onClick={() => handleEdit(item)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="icon-btn delete-btn" title="Delete Staff" disabled={actionId === item.id} onClick={() => removeStaff(item.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
