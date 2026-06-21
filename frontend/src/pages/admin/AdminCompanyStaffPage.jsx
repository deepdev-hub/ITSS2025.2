import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ListTable from '../../components/common/ListTable';

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

export default function AdminCompanyStaffPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const companyList = await adminApi.getCompanies();
      setCompanies(companyList);
      if (companyList.length > 0) {
        setSelectedCompanyId(String(companyList[0].id));
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyData = useCallback(async (companyId) => {
    if (!companyId) {
      setStaff([]);
      return;
    }
    try {
      const staffList = await adminApi.getCompanyStaff(companyId);
      setStaff(staffList);
    } catch (err) {
      setError(getApiError(err));
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    resetForm();
    if (selectedCompanyId) {
      loadCompanyData(selectedCompanyId);
    }
  }, [selectedCompanyId, loadCompanyData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    setSelectedCompanyId(event.target.value);
    setError('');
    setNotice('');
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({
      userId: item.userId || '',
      email: item.email || '',
      password: '',
      fullName: item.fullName || '',
      phone: item.phone || '',
      jobTitle: item.jobTitle || '',
      yearsExperience: item.yearsExperience ?? '',
      bio: item.bio || '',
      status: item.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setNotice('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const buildPayload = () => ({
    ...form,
    userId: form.userId ? Number(form.userId) : null,
    yearsExperience: form.yearsExperience !== '' ? Number(form.yearsExperience) : null,
    bio: form.bio.trim() || null,
    password: form.password || null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) {
      setError('Please select a company first');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await adminApi.updateCompanyStaff(selectedCompanyId, editingId, buildPayload());
        setNotice('Staff updated successfully');
      } else {
        await adminApi.createCompanyStaff(selectedCompanyId, buildPayload());
        setNotice('Staff created successfully');
      }
      closeModal();
      await loadCompanyData(selectedCompanyId);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete staff profile for ${item.fullName}?`)) {
      return;
    }
    setError('');
    setNotice('');
    try {
      await adminApi.deleteCompanyStaff(selectedCompanyId, item.id);
      setNotice('Staff deleted successfully');
      await loadCompanyData(selectedCompanyId);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const columns = [
    { key: 'fullName', label: 'Full Name', width: '25%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'jobTitle', label: 'Job Title', width: '20%', render: (v) => v || 'N/A' },
    {
      key: 'yearsExperience',
      label: 'Experience',
      width: '15%',
      render: (v) => (v !== null && v !== undefined ? `${v} years` : 'N/A'),
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (value) => <StatusBadge value={value} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Company Staff"
        subtitle="Manage rescue staff profiles for each rescue company"
        actions={
          selectedCompanyId ? (
            <button className="button button-primary" onClick={openCreateModal}>
              <Plus size={18} /> Create Staff
            </button>
          ) : null
        }
      />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="field" style={{ maxWidth: '400px', margin: '0' }}>
          <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Select Rescue Company</label>
          <select value={selectedCompanyId} onChange={handleCompanyChange} className="select-field">
            <option value="">Select company...</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName} ({company.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <Loader label="Loading staff..." /> : (
        selectedCompanyId ? (
          <ListTable
            columns={columns}
            data={staff}
            onEdit={openEditModal}
            onDelete={handleDelete}
            emptyMessage="No staff found for this company"
          />
        ) : (
          <div className="notice" style={{ textAlign: 'center' }}>Please select a rescue company to view and manage staff.</div>
        )
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? `Edit Staff #${editingId}` : 'Create New Staff'}
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
              <label>Existing User Id</label>
              <input name="userId" value={form.userId} onChange={handleChange} placeholder="Optional" disabled={Boolean(editingId)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required={!form.userId} />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'Leave blank to keep current' : 'Required if User ID empty'} required={!editingId && !form.userId} />
            </div>
            <div className="field">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required={!form.userId} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Job Title</label>
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Years Experience</label>
              <input name="yearsExperience" type="number" min="0" value={form.yearsExperience} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OFFLINE">OFFLINE</option>
                <option value="BUSY">BUSY</option>
              </select>
            </div>
          </div>
          <div className="field" style={{ marginTop: '12px' }}>
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} />
          </div>
        </form>
      </Modal>
    </>
  );
}
