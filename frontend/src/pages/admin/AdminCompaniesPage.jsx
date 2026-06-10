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

const initialForm = {
  companyName: '',
  taxCode: '',
  licenseNumber: '',
  email: '',
  phone: '',
  description: '',
  status: 'PENDING',
  ownerAccountId: '',
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [companyList, accountList] = await Promise.all([
        adminApi.getCompanies(),
        adminApi.getAccounts(),
      ]);
      setCompanies(companyList);
      setAccounts(accountList);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const ownerAccounts = useMemo(
    () => accounts.filter((account) => account.roleName === 'RESCUE_COMPANY' && account.status !== 'BANNED'),
    [accounts],
  );

  const filteredCompanies = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return companies.filter((company) => {
      const matchesSearch = keyword === ''
        || [
          company.companyName,
          company.email,
          company.phone,
          company.ownerAccount?.fullName,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesStatus = filters.status === 'ALL' || company.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [companies, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setEditingId(company.id);
    setForm({
      companyName: company.companyName || '',
      taxCode: company.taxCode || '',
      licenseNumber: company.licenseNumber || '',
      email: company.email || '',
      phone: company.phone || '',
      description: company.description || '',
      status: company.status || 'PENDING',
      ownerAccountId: company.ownerAccount?.id ? String(company.ownerAccount.id) : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        ownerAccountId: form.ownerAccountId ? Number(form.ownerAccountId) : null,
      };
      if (editingId) {
        await adminApi.updateCompany(editingId, payload);
        setNotice('Company updated successfully.');
      } else {
        await adminApi.createCompany(payload);
        setNotice('Company created successfully.');
      }
      closeModal();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Suspend company ${company.companyName}?`)) {
      return;
    }
    setError('');
    setNotice('');
    try {
      await adminApi.deleteCompany(company.id);
      setNotice('Company suspended successfully.');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const columns = [
    {
      key: 'companyName',
      label: 'Company Name',
      width: '25%',
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          <div className="muted-line" style={{ fontSize: '0.85rem', color: '#666' }}>{row.email || 'No email'}</div>
        </div>
      ),
    },
    {
      key: 'ownerAccount',
      label: 'Owner Account',
      width: '20%',
      render: (owner) => owner?.fullName || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Not linked</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value) => <StatusBadge value={value} />,
    },
    { key: 'phone', label: 'Phone', width: '15%', render: (v) => v || 'N/A' },
    { key: 'createdAt', label: 'Created', width: '15%', render: (v) => formatDateTime(v) },
  ];

  return (
    <>
      <PageHeader
        title="Rescue Companies"
        subtitle="Manage rescue company profiles, status, and linked owner accounts"
        actions={
          <button className="button button-primary" onClick={openCreateModal}>
            <Plus size={18} /> Create Company
          </button>
        }
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="filters-row">
        <input
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="Search by name, owner, email, phone..."
          className="input-field"
        />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="select-field">
          <option value="ALL">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {loading ? <Loader label="Loading companies..." /> : (
        <ListTable
          columns={columns}
          data={filteredCompanies}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyMessage="No companies found"
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? `Edit Company #${editingId}` : 'Create New Company'}
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
              <label>Company Name</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Tax Code</label>
              <input name="taxCode" value={form.taxCode} onChange={handleChange} />
            </div>
            <div className="field">
              <label>License Number</label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Owner Account</label>
              <select name="ownerAccountId" value={form.ownerAccountId} onChange={handleChange}>
                <option value="">Not linked</option>
                {ownerAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.fullName} - {account.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="field" style={{ marginTop: '12px' }}>
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="field" style={{ marginTop: '12px' }}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>
        </form>
      </Modal>
    </>
  );
}
