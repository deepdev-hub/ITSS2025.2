import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

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
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadCompanies = async () => {
    try {
      setCompanies(await adminApi.getCompanies());
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
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
      ownerAccountId: company.ownerAccount?.id || '',
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
        setNotice('Company updated successfully');
      } else {
        await adminApi.createCompany(payload);
        setNotice('Company created successfully');
      }
      resetForm();
      await loadCompanies();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Suspend this company?')) {
      return;
    }
    try {
      await adminApi.deleteCompany(companyId);
      setNotice('Company suspended successfully');
      await loadCompanies();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Rescue Companies" subtitle="Manage rescue company profiles and link owner accounts." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

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
              <label>Owner Account Id</label>
              <input name="ownerAccountId" value={form.ownerAccountId} onChange={handleChange} />
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
          <h2>Company List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.companyName}</td>
                    <td>{company.ownerAccount?.fullName || 'Not linked'}</td>
                    <td><StatusBadge value={company.status} /></td>
                    <td>{company.phone || 'N/A'}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
