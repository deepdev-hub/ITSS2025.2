import { useEffect, useMemo, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const VEHICLE_STATUSES = ['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE'];

const initialForm = {
  vehicleCode: '',
  vehicleType: '',
  plateNumber: '',
  status: 'AVAILABLE',
  assignedStaffId: '',
};

function toVehicleForm(vehicle) {
  if (!vehicle) {
    return initialForm;
  }
  return {
    vehicleCode: vehicle.vehicleCode || '',
    vehicleType: vehicle.vehicleType || '',
    plateNumber: vehicle.plateNumber || '',
    status: vehicle.status || 'AVAILABLE',
    assignedStaffId: vehicle.assignedStaffId ? String(vehicle.assignedStaffId) : '',
  };
}

function buildVehiclePayload(form) {
  return {
    vehicleCode: form.vehicleCode.trim(),
    vehicleType: form.vehicleType.trim(),
    plateNumber: form.plateNumber.trim(),
    status: form.status,
    assignedStaffId: form.assignedStaffId ? Number(form.assignedStaffId) : null,
  };
}

function buildQuickVehicleStatusPayload(vehicle, nextStatus) {
  return {
    vehicleCode: vehicle.vehicleCode,
    vehicleType: vehicle.vehicleType,
    plateNumber: vehicle.plateNumber,
    status: nextStatus,
    assignedStaffId: vehicle.assignedStaffId || null,
  };
}

export default function CompanyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter((item) => item.status === 'AVAILABLE').length,
    inService: vehicles.filter((item) => item.status === 'IN_SERVICE').length,
    maintenance: vehicles.filter((item) => item.status === 'MAINTENANCE').length,
  }), [vehicles]);

  const filteredVehicles = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch = keyword === ''
        || [
          vehicle.vehicleCode,
          vehicle.plateNumber,
          vehicle.vehicleType,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesStatus = filters.status === 'ALL' || vehicle.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [filters, vehicles]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vehicleList, staffList] = await Promise.all([
        companyApi.getVehicles(),
        companyApi.getStaff(),
      ]);
      setVehicles(vehicleList);
      setStaff(staffList);
      setStatusDrafts(Object.fromEntries(vehicleList.map((item) => [item.id, item.status])));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm(toVehicleForm(vehicle));
    setNotice('');
    setError('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(false);
  };

  const availableStaffOptions = useMemo(() => {
    return staff.filter((item) => {
      if (!item) return false;
      if (!item.vehicleId) return true;
      return editingId && String(item.id) === String(form.assignedStaffId);
    });
  }, [editingId, form.assignedStaffId, staff]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = buildVehiclePayload(form);
      if (editingId) {
        await companyApi.updateVehicle(editingId, payload);
        setNotice('Vehicle updated successfully.');
      } else {
        await companyApi.createVehicle(payload);
        setNotice('Vehicle created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (vehicle) => {
    const nextStatus = statusDrafts[vehicle.id];
    setActionId(vehicle.id);
    setError('');
    setNotice('');
    try {
      await companyApi.updateVehicle(vehicle.id, buildQuickVehicleStatusPayload(vehicle, nextStatus));
      setNotice(`Vehicle status updated to ${nextStatus}.`);
      if (editingId === vehicle.id) {
        setForm((previous) => ({ ...previous, status: nextStatus }));
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const removeVehicle = async (vehicleId) => {
    if (!window.confirm('Delete this rescue vehicle?')) {
      return;
    }
    setActionId(vehicleId);
    setError('');
    setNotice('');
    try {
      await companyApi.deleteVehicle(vehicleId);
      setNotice('Vehicle deleted successfully.');
      if (editingId === vehicleId) {
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
      <PageHeader title="Rescue Vehicles" subtitle="Manage vehicle inventory, search by code or plate, and update availability quickly for dispatch decisions." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading rescue vehicles..." /> : null}

      {!loading ? (
        <div>
          <Modal 
            isOpen={isModalOpen} 
            onClose={resetForm} 
            title={editingId ? 'Update Vehicle' : 'Create Vehicle'}
            size="large"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
                <button form="vehicle-form" className="button button-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create vehicle')}
                </button>
              </div>
            }
          >
          <form id="vehicle-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {editingId && (
              <div>
                <StatusBadge value={form.status} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="field">
                <label>Vehicle Code</label>
                <input name="vehicleCode" value={form.vehicleCode} onChange={handleChange} required placeholder="e.g. V-001" />
              </div>
              <div className="field">
                <label>Plate Number</label>
                <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required placeholder="e.g. 29A-123.45" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="field">
                <label>Vehicle Type</label>
                <input name="vehicleType" value={form.vehicleType} onChange={handleChange} required placeholder="Tow Truck, Flatbed..." />
              </div>
              <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {VEHICLE_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Assigned Staff</label>
                  <select name="assignedStaffId" value={form.assignedStaffId} onChange={handleChange}>
                    <option value="">Unassigned</option>
                    {availableStaffOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
          </Modal>

          <div className="card">
            <div className="toolbar">
              <div className="toolbar-title">
                <h2>Vehicle List</h2>
                <p>{filteredVehicles.length} vehicle(s) matched</p>
              </div>
              <div className="toolbar-filters">
                <button className="button button-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                  Create Vehicle
                </button>
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by code, plate, type"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="ALL">All statuses</option>
                  {VEHICLE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Plate</th>
                    <th>Type</th>
                    <th>Assigned Staff</th>
                    <th>Status</th>
                    <th>Quick Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="7">No vehicles matched the current filters.</td>
                    </tr>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>
                          <strong>{vehicle.vehicleCode}</strong>
                          <div className="muted-line">Vehicle #{vehicle.id}</div>
                        </td>
                        <td>{vehicle.plateNumber}</td>
                        <td>{vehicle.vehicleType}</td>
                        <td>{vehicle.assignedStaffName || 'Unassigned'}</td>
                        <td><StatusBadge value={vehicle.status} /></td>
                        <td>
                          <div className="actions-stack">
                            <select
                              value={statusDrafts[vehicle.id] || vehicle.status}
                              onChange={(event) => setStatusDrafts((previous) => ({
                                ...previous,
                                [vehicle.id]: event.target.value,
                              }))}
                            >
                              {VEHICLE_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <button
                              className="button button-secondary"
                              type="button"
                              disabled={actionId === vehicle.id || (statusDrafts[vehicle.id] || vehicle.status) === vehicle.status}
                              onClick={() => handleQuickStatusUpdate(vehicle)}
                            >
                              {actionId === vehicle.id ? 'Updating...' : 'Update status'}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="actions-stack">
                            <button className="button button-secondary" type="button" onClick={() => handleEdit(vehicle)}>
                              Open edit
                            </button>
                            <button className="button button-danger" type="button" disabled={actionId === vehicle.id} onClick={() => removeVehicle(vehicle.id)}>
                              {actionId === vehicle.id ? 'Deleting...' : 'Delete'}
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
      ) : null}
    </>
  );
}
