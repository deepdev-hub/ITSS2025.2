import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
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

export default function CompanyStaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [staffList, branchList] = await Promise.all([
        companyApi.getStaff(),
        companyApi.getBranches(),
      ]);
      setStaff(staffList);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const payload = {
      ...form,
      userId: form.userId ? Number(form.userId) : null,
      branchId: form.branchId ? Number(form.branchId) : null,
    };
    try {
      if (editingId) {
        await companyApi.updateStaff(editingId, payload);
        setNotice('Staff updated successfully');
      } else {
        await companyApi.createStaff(payload);
        setNotice('Staff created successfully');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const removeStaff = async (staffId) => {
    if (!window.confirm('Delete this staff profile?')) {
      return;
    }
    try {
      await companyApi.deleteStaff(staffId);
      setNotice('Staff deleted successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Company Staff" subtitle="Create rescue staff accounts or link existing staff user ids." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update staff' : 'Create staff'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Existing User Id</label>
              <input name="userId" value={form.userId} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
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
            <button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Create staff'}</button>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
