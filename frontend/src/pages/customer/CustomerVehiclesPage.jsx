import { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ListTable from '../../components/common/ListTable';

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
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setVehicles(await customerApi.listVehicles());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return vehicles;
    return vehicles.filter((v) =>
      [v.brand, v.model, v.plateNumber, v.color].some((field) =>
        field?.toLowerCase().includes(keyword)
      )
    );
  }, [vehicles, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        manufactureYear: form.manufactureYear ? Number(form.manufactureYear) : null,
      };
      if (editingId) {
        await customerApi.updateVehicle(editingId, payload);
        setNotice('Vehicle updated successfully.');
      } else {
        await customerApi.createVehicle(payload);
        setNotice('Vehicle added successfully.');
      }
      await loadVehicles();
      closeModal();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.plateNumber}?`)) return;
    try {
      await customerApi.deleteVehicle(vehicle.id);
      setNotice('Vehicle deleted successfully.');
      await loadVehicles();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const columns = [
    { key: 'brand', label: 'Brand', width: '18%' },
    { key: 'model', label: 'Model', width: '18%' },
    { key: 'plateNumber', label: 'Plate Number', width: '18%' },
    { key: 'color', label: 'Color', width: '15%' },
    { key: 'fuelType', label: 'Fuel Type', width: '15%' },
    { key: 'manufactureYear', label: 'Manufacture Year', width: '16%' },
  ];

  return (
    <>
      <PageHeader
        title="My Vehicles"
        subtitle="Manage vehicles that can be selected when creating a rescue request."
        actions={
          <button className="button button-primary" onClick={openCreateModal}>
            <Plus size={18} /> Add Vehicle
          </button>
        }
      />

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by brand, model, plate number, or color..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
      </div>

      {loading ? (
        <Loader label="Loading vehicle list..." />
      ) : (
        <ListTable
          columns={columns}
          data={filteredVehicles}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="You have not added any vehicles yet"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? `Edit Vehicle #${editingId}` : 'Add New Vehicle'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="button button-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button className="button button-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Vehicle'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Brand <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Toyota, Honda, etc."
                required
              />
            </div>
            <div className="field">
              <label>Model <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Vios, City, etc."
                required
              />
            </div>
            <div className="field">
              <label>Plate Number <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                name="plateNumber"
                value={form.plateNumber}
                onChange={handleChange}
                placeholder="51A-888.88"
                required
              />
            </div>
            <div className="field">
              <label>Manufacture Year</label>
              <input
                type="number"
                name="manufactureYear"
                value={form.manufactureYear}
                onChange={handleChange}
                placeholder="2021"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="field">
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="White, Black, Gray..."
              />
            </div>
            <div className="field">
              <label>Fuel Type</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange}>
                <option value="">Select fuel type</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="LPG">LPG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes about this vehicle (optional)"
              style={{ minHeight: '80px' }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
