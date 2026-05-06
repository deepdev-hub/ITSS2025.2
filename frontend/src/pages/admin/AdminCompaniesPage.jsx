import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleEdit = (company) => {
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
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Suspend this company?')) {
      return;
    }
    setError('');
    setNotice('');
    try {
      await adminApi.deleteCompany(companyId);
      setNotice('Company suspended successfully.');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Rescue Companies" subtitle="Manage company profiles, approval status, and owner account mapping without typing raw ids." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading companies..." /> : null}

      {!loading ? (
        <div className="grid-two">
          <form className="card" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Update company' : 'Create company'}</h2>
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

            <div className="field">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="actions-row">
              <button className="button button-primary" type="submit">
                {editingId ? 'Save changes' : 'Create company'}
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
                <h2>Company List</h2>
                <p>{filteredCompanies.length} company(s) matched</p>
              </div>
              <div className="toolbar-filters">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, owner, email, phone"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="ALL">All statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Phone</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="6">No companies matched the current filters.</td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <strong>{company.companyName}</strong>
                          <div className="muted-line">{company.email || 'No email'}</div>
                        </td>
                        <td>{company.ownerAccount?.fullName || 'Not linked'}</td>
                        <td><StatusBadge value={company.status} /></td>
                        <td>{company.phone || 'N/A'}</td>
                        <td>{formatDateTime(company.createdAt)}</td>
                        <td>
                          <div className="actions-row">
                            <button className="button button-secondary" type="button" onClick={() => handleEdit(company)}>
                              Edit
                            </button>
                            <button className="button button-danger" type="button" onClick={() => handleDelete(company.id)}>
                              Suspend
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
