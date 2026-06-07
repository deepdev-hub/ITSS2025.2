import { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { customerApi } from '../../api/customerApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import ListTable from '../../components/common/ListTable';
import { formatDateTime } from '../../utils/requestUi';

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
  const [actionId, setActionId] = useState(null);
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
        setNotice('Cập nhật xe thành công.');
      } else {
        await customerApi.createVehicle(payload);
        setNotice('Thêm xe thành công.');
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
    if (!window.confirm(`Xóa xe ${vehicle.plateNumber}?`)) return;
    setActionId(vehicle.id);
    try {
      await customerApi.deleteVehicle(vehicle.id);
      setNotice('Xóa xe thành công.');
      await loadVehicles();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const columns = [
    { key: 'brand', label: 'Hãng xe', width: '18%' },
    { key: 'model', label: 'Mẫu xe', width: '18%' },
    { key: 'plateNumber', label: 'Biển số', width: '18%' },
    { key: 'color', label: 'Màu sắc', width: '15%' },
    { key: 'fuelType', label: 'Loại xăng', width: '15%' },
    { key: 'manufactureYear', label: 'Năm sản xuất', width: '16%' },
  ];

  return (
    <>
      <PageHeader
        title="Xe của tôi"
        subtitle="Quản lý danh sách các xe có thể được chọn khi tạo yêu cầu cứu hộ."
        actions={
          <button className="button button-primary" onClick={openCreateModal}>
            <Plus size={18} /> Thêm xe
          </button>
        }
      />

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="filters-row">
        <input
          type="text"
          placeholder="Tìm kiếm theo hãng, mẫu, biển số, hoặc màu sắc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
      </div>

      {loading ? (
        <Loader label="Đang tải danh sách xe..." />
      ) : (
        <ListTable
          columns={columns}
          data={filteredVehicles}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="Bạn chưa thêm xe nào"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? `Chỉnh sửa xe #${editingId}` : 'Thêm xe mới'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="button button-secondary" onClick={closeModal} disabled={saving}>
              Hủy
            </button>
            <button className="button button-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm xe'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Hãng xe <span style={{ color: 'var(--danger)' }}>*</span></label>
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
              <label>Mẫu xe <span style={{ color: 'var(--danger)' }}>*</span></label>
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
              <label>Biển số xe <span style={{ color: 'var(--danger)' }}>*</span></label>
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
              <label>Năm sản xuất</label>
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
              <label>Màu sắc</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Trắng, Đen, Xám..."
              />
            </div>
            <div className="field">
              <label>Loại xăng</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange}>
                <option value="">Chọn loại xăng</option>
                <option value="Gasoline">Xăng</option>
                <option value="Diesel">Dầu diesel</option>
                <option value="LPG">Gas LPG</option>
                <option value="Electric">Điện</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Ghi chú</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Ghi chú thêm về chiếc xe (tùy chọn)"
              style={{ minHeight: '80px' }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
