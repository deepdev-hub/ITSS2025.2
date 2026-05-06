import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const initialForm = {
  userId: '',
  email: '',
  password: '',
  fullName: '',
  phone: '',
  branchId: '',
  jobTitle: '',
  status: 'ACTIVE',
};

export default function AdminCompanyStaffPage() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selectedCompany = useMemo(
    () => companies.find((company) => String(company.id) === String(selectedCompanyId)),
    [companies, selectedCompanyId],
  );

  const loadCompanies = async () => {
    try {
      const companyList = await adminApi.getCompanies();
      setCompanies(companyList);
      if (!selectedCompanyId && companyList.length > 0) {
        setSelectedCompanyId(String(companyList[0].id));
      }
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const loadCompanyData = async (companyId) => {
    if (!companyId) {
      setBranches([]);
      setStaff([]);
      return;
    }
    try {
      const [branchList, staffList] = await Promise.all([
        adminApi.getCompanyBranches(companyId),
        adminApi.getCompanyStaff(companyId),
      ]);
      setBranches(branchList);
      setStaff(staffList);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    resetForm();
    loadCompanyData(selectedCompanyId);
  }, [selectedCompanyId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    setSelectedCompanyId(event.target.value);
    setError('');
    setNotice('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      userId: item.userId || '',
      email: item.email || '',
      password: '',
      fullName: item.fullName || '',
      phone: item.phone || '',
      branchId: item.branchId || '',
      jobTitle: item.jobTitle || '',
      status: item.status || 'ACTIVE',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const buildPayload = () => ({
    ...form,
    userId: form.userId ? Number(form.userId) : null,
    branchId: form.branchId ? Number(form.branchId) : null,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCompanyId) {
      setError('Please select a company first');
      return;
    }
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
      resetForm();
      await loadCompanyData(selectedCompanyId);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const removeStaff = async (staffId) => {
    if (!window.confirm('Delete this staff profile?')) {
      return;
    }
    try {
      await adminApi.deleteCompanyStaff(selectedCompanyId, staffId);
      setNotice('Staff deleted successfully');
      await loadCompanyData(selectedCompanyId);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Company Staff" subtitle="Admin can manage rescue staff accounts under each rescue company." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card">
        <div className="field">
          <label>Rescue Company</label>
          <select value={selectedCompanyId} onChange={handleCompanyChange}>
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName} ({company.status})
              </option>
            ))}
          </select>
        </div>
        {selectedCompany ? <p>Managing staff for {selectedCompany.companyName}</p> : null}
      </div>

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update staff' : 'Create staff'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Existing User Id</label>
              <input name="userId" value={form.userId} onChange={handleChange} placeholder="Optional" disabled={Boolean(editingId)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'Leave blank to keep current password' : ''} />
            </div>
            <div className="field">
              <label>Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Branch</label>
              <select name="branchId" value={form.branchId} onChange={handleChange}>
                <option value="">No branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Job Title</label>
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} />
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
          <div className="actions-row">
            <button className="button button-primary" type="submit" disabled={!selectedCompanyId}>
              {editingId ? 'Save changes' : 'Create staff'}
            </button>
            {editingId ? <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div className="card">
          <h2>Staff List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {staff.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{branches.find((branch) => branch.id === item.branchId)?.branchName || 'N/A'}</td>
                    <td><StatusBadge value={item.status} /></td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="button button-danger" type="button" onClick={() => removeStaff(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5">No staff found</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
