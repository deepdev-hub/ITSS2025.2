import { useEffect, useMemo, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const VEHICLE_STATUSES = ['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE'];

const initialForm = {
  vehicleCode: '',
  vehicleType: '',
  plateNumber: '',
  status: 'AVAILABLE',
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
  };
}

function buildVehiclePayload(form) {
  return {
    vehicleCode: form.vehicleCode.trim(),
    vehicleType: form.vehicleType.trim(),
    plateNumber: form.plateNumber.trim(),
    status: form.status,
  };
}

function buildQuickVehicleStatusPayload(vehicle, nextStatus) {
  return {
    vehicleCode: vehicle.vehicleCode,
    vehicleType: vehicle.vehicleType,
    plateNumber: vehicle.plateNumber,
    status: nextStatus,
  };
}

export default function CompanyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

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
      const vehicleList = await companyApi.getVehicles();
      setVehicles(vehicleList);
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
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

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
        <div className="grid-two">
          <form className="card" onSubmit={handleSubmit}>
            <div className="actions-row" style={{ justifyContent: 'space-between' }}>
              <h2>{editingId ? 'Update Vehicle' : 'Create Vehicle'}</h2>
              {editingId ? <StatusBadge value={form.status} /> : null}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span>Total Vehicles</span>
                <strong>{summary.total}</strong>
              </div>
              <div className="info-item">
                <span>Available</span>
                <strong>{summary.available}</strong>
              </div>
              <div className="info-item">
                <span>In Service</span>
                <strong>{summary.inService}</strong>
              </div>
              <div className="info-item">
                <span>Maintenance</span>
                <strong>{summary.maintenance}</strong>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Vehicle Code</label>
                <input name="vehicleCode" value={form.vehicleCode} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Vehicle Type</label>
                <input name="vehicleType" value={form.vehicleType} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Plate Number</label>
                <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {VEHICLE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="actions-row">
              <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create vehicle')}
              </button>
              {editingId ? (
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="card">
            <div className="toolbar">
              <div className="toolbar-title">
                <h2>Vehicle List</h2>
                <p>{filteredVehicles.length} vehicle(s) matched</p>
              </div>
              <div className="toolbar-filters">
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
                    <th>Status</th>
                    <th>Quick Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.length === 0 ? (
                    <tr>
                      <td colSpan="6">No vehicles matched the current filters.</td>
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
