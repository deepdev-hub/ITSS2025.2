import { useEffect, useMemo, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ListTable from '../../components/common/ListTable';
import { formatDateTime } from '../../utils/requestUi';

function getMinimumAdultBirthDate() {
  const today = new Date();
  const date = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const emptyAddress = {
  country: 'Vietnam',
  province: '',
  district: '',
  ward: '',
  street: '',
  detail: '',
};

const initialForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  roleName: 'CUSTOMER',
  status: 'ACTIVE',
  dateOfBirth: '',
  gender: '',
  cccd: '',
  defaultAddress: { ...emptyAddress },
};

function toAddressForm(address) {
  return {
    country: address?.country || 'Vietnam',
    province: address?.province || '',
    district: address?.district || '',
    ward: address?.ward || '',
    street: address?.street || '',
    detail: address?.detail || '',
  };
}

function toForm(account, fallbackRole = 'CUSTOMER') {
  if (!account) {
    return { ...initialForm, roleName: fallbackRole, defaultAddress: { ...emptyAddress } };
  }
  return {
    email: account.email || '',
    password: '',
    fullName: account.fullName || '',
    phone: account.phone || '',
    avatarUrl: account.avatarUrl || '',
    roleName: account.roleName || fallbackRole,
    status: account.status || 'ACTIVE',
    dateOfBirth: account.dateOfBirth || '',
    gender: account.gender || '',
    cccd: account.cccd || '',
    defaultAddress: toAddressForm(account.defaultAddress),
  };
}

function normalizeAddress(address) {
  if (!address) return null;
  const trimmed = {
    country: address.country?.trim() || 'Vietnam',
    province: address.province?.trim() || '',
    district: address.district?.trim() || '',
    ward: address.ward?.trim() || '',
    street: address.street?.trim() || '',
    detail: address.detail?.trim() || '',
  };
  const hasDetails = [
    trimmed.province,
    trimmed.district,
    trimmed.ward,
    trimmed.street,
    trimmed.detail
  ].some((value) => value !== '');
  return hasDetails ? trimmed : null;
}

function buildPayload(form) {
  return {
    email: form.email.trim(),
    password: form.password || null,
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    avatarUrl: form.avatarUrl.trim(),
    roleName: form.roleName,
    status: form.status,
    dateOfBirth: form.dateOfBirth || null,
    gender: form.gender.trim(),
    cccd: form.cccd.trim(),
    defaultAddress: normalizeAddress(form.defaultAddress),
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ search: '', roleName: 'ALL', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const maxBirthDate = getMinimumAdultBirthDate();

  const defaultRole = roles[0]?.roleName || 'CUSTOMER';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [accountList, roleList] = await Promise.all([
        adminApi.getAccounts(),
        adminApi.getRoles(),
      ]);
      setAccounts(accountList);
      setRoles(roleList);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!editingId && roles.length > 0) {
      setForm((prev) => ({
        ...prev,
        roleName: prev.roleName || defaultRole,
      }));
    }
  }, [defaultRole, editingId, roles.length]);

  const filteredAccounts = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return accounts.filter((acc) => {
      const matches = keyword === ''
        || [acc.fullName, acc.email, acc.phone].some((v) => v?.toLowerCase().includes(keyword));
      const roleMatch = filters.roleName === 'ALL' || acc.roleName === filters.roleName;
      const statusMatch = filters.status === 'ALL' || acc.status === filters.status;
      return matches && roleMatch && statusMatch;
    });
  }, [accounts, filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('defaultAddress.')) {
      const key = name.replace('defaultAddress.', '');
      setForm((prev) => ({
        ...prev,
        defaultAddress: { ...prev.defaultAddress, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(toForm(null, defaultRole));
    setIsModalOpen(true);
  };

  const openEditModal = async (account) => {
    setEditingId(account.id);
    setForm(toForm(account, defaultRole));
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
      const payload = buildPayload(form);
      const isCreate = !editingId;
      if (isCreate) {
        await adminApi.createAccount(payload);
        setNotice('Account created successfully.');
      } else {
        await adminApi.updateAccount(editingId, payload);
        setNotice('Account updated successfully.');
      }
      await loadData();
      closeModal();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Deactivate account ${account.email}?`)) return;
    try {
      await adminApi.deleteAccount(account.id);
      setNotice('Account deactivated successfully.');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const columns = [
    { key: 'email', label: 'Email', width: '20%' },
    { key: 'fullName', label: 'Full Name', width: '20%' },
    { key: 'phone', label: 'Phone', width: '15%' },
    { key: 'roleName', label: 'Role', width: '15%' },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value) => <StatusBadge value={value} />,
    },
    { key: 'createdAt', label: 'Created', width: '15%', render: (v) => formatDateTime(v) },
  ];

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Manage user accounts with simple and clean interface"
        actions={
          <button className="button button-primary" onClick={openCreateModal}>
            <Plus size={18} /> Create Account
          </button>
        }
      />

      {notice && <div className="notice">{notice}</div>}
      {error && <div className="notice error">{error}</div>}

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by email, name, or phone..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          className="input-field"
        />
        <select name="roleName" value={filters.roleName} onChange={handleFilterChange} className="select-field">
          <option value="ALL">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.roleName}>{r.roleName}</option>
          ))}
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="select-field">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {loading ? <Loader label="Loading accounts..." /> : (
        <ListTable
          columns={columns}
          data={filteredAccounts}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="No accounts found"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? `Edit Account #${editingId}` : 'Create New Account'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="button button-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button className="button button-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editingId ? 'Leave blank to keep current' : 'defaults to Password@123'}
              />
            </div>
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Role</label>
              <select name="roleName" value={form.roleName} onChange={handleChange}>
                {roles.map((r) => (
                  <option key={r.id} value={r.roleName}>{r.roleName}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
            <div className="field">
              <label>Gender</label>
              <input
                type="text"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                max={maxBirthDate}
              />
            </div>
            <div className="field">
              <label>CCCD</label>
              <input
                type="text"
                name="cccd"
                value={form.cccd}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '12px' }}>Address</h4>
            <div className="form-grid">
              <div className="field">
                <label>Street</label>
                <input
                  type="text"
                  name="defaultAddress.street"
                  value={form.defaultAddress.street}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Ward</label>
                <input
                  type="text"
                  name="defaultAddress.ward"
                  value={form.defaultAddress.ward}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>District</label>
                <input
                  type="text"
                  name="defaultAddress.district"
                  value={form.defaultAddress.district}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>Province</label>
                <input
                  type="text"
                  name="defaultAddress.province"
                  value={form.defaultAddress.province}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
