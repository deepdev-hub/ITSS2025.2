import { useEffect, useState } from 'react';
import { customerApi } from '../../api/customerApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

const initialForm = {
  brand: '',
  model: '',
  plateNumber: '',
  manufactureYear: '',
  color: '',
  fuelType: '',
  notes: '',
};

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      setVehicles(await customerApi.listVehicles());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      plateNumber: vehicle.plateNumber || '',
      manufactureYear: vehicle.manufactureYear || '',
      color: vehicle.color || '',
      fuelType: vehicle.fuelType || '',
      notes: vehicle.notes || '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice('');
    setError('');
    try {
      const payload = {
        ...form,
        manufactureYear: form.manufactureYear ? Number(form.manufactureYear) : null,
      };
      if (editingId) {
        await customerApi.updateVehicle(editingId, payload);
        setNotice('Vehicle updated successfully');
      } else {
        await customerApi.createVehicle(payload);
        setNotice('Vehicle created successfully');
      }
      resetForm();
      await loadVehicles();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Delete this vehicle?')) {
      return;
    }
    try {
      await customerApi.deleteVehicle(vehicleId);
      setNotice('Vehicle deleted successfully');
      await loadVehicles();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader
        title="My Vehicles"
        subtitle="Manage the vehicles that can be selected when you create a rescue request."
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update vehicle' : 'Add vehicle'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Model</label>
              <input name="model" value={form.model} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Plate Number</label>
              <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Manufacture Year</label>
              <input name="manufactureYear" type="number" value={form.manufactureYear} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Color</label>
              <input name="color" value={form.color} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Fuel Type</label>
              <input name="fuelType" value={form.fuelType} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="actions-row">
            <button className="button button-primary" type="submit">
              {editingId ? 'Save changes' : 'Create vehicle'}
            </button>
            {editingId ? (
              <button className="button button-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="card">
          <h2>Vehicle List</h2>
          {loading ? <p>Loading vehicles...</p> : null}
          {!loading && vehicles.length === 0 ? <p>No vehicles found yet.</p> : null}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Plate</th>
                  <th>Fuel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.brand} {vehicle.model}</td>
                    <td>{vehicle.plateNumber}</td>
                    <td>{vehicle.fuelType || 'N/A'}</td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => handleEdit(vehicle)}>
                          Edit
                        </button>
                        <button className="button button-danger" type="button" onClick={() => handleDelete(vehicle.id)}>
                          Delete
                        </button>
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
