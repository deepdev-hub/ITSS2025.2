import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const initialForm = {
  branchId: '',
  vehicleCode: '',
  vehicleType: '',
  plateNumber: '',
  status: 'AVAILABLE',
};

export default function CompanyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [vehicleList, branchList] = await Promise.all([
        companyApi.getVehicles(),
        companyApi.getBranches(),
      ]);
      setVehicles(vehicleList);
      setBranches(branchList);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      branchId: vehicle.branchId || '',
      vehicleCode: vehicle.vehicleCode || '',
      vehicleType: vehicle.vehicleType || '',
      plateNumber: vehicle.plateNumber || '',
      status: vehicle.status || 'AVAILABLE',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const payload = {
      ...form,
      branchId: Number(form.branchId),
    };
    try {
      if (editingId) {
        await companyApi.updateVehicle(editingId, payload);
        setNotice('Vehicle updated successfully');
      } else {
        await companyApi.createVehicle(payload);
        setNotice('Vehicle created successfully');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const removeVehicle = async (vehicleId) => {
    if (!window.confirm('Delete this rescue vehicle?')) {
      return;
    }
    try {
      await companyApi.deleteVehicle(vehicleId);
      setNotice('Vehicle deleted successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Rescue Vehicles" subtitle="Maintain the towing and rescue vehicles used by your company." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update vehicle' : 'Create vehicle'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Branch</label>
              <select name="branchId" value={form.branchId} onChange={handleChange} required>
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                ))}
              </select>
            </div>
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
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="IN_SERVICE">IN_SERVICE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>
          <div className="actions-row">
            <button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Create vehicle'}</button>
            {editingId ? <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div className="card">
          <h2>Vehicle List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle Code</th>
                  <th>Branch</th>
                  <th>Plate</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vehicleCode}</td>
                    <td>{vehicle.branchName}</td>
                    <td>{vehicle.plateNumber}</td>
                    <td><StatusBadge value={vehicle.status} /></td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => handleEdit(vehicle)}>Edit</button>
                        <button className="button button-danger" type="button" onClick={() => removeVehicle(vehicle.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
