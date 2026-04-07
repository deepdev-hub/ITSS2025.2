import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

const initialForm = {
  branchName: '',
  phone: '',
  isMainBranch: false,
  latitude: '',
  longitude: '',
  address: {
    country: 'Vietnam',
    province: '',
    district: '',
    ward: '',
    street: '',
    detail: '',
    latitude: '',
    longitude: '',
  },
};

export default function CompanyBranchesPage() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadBranches = async () => {
    try {
      setBranches(await companyApi.getBranches());
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name.startsWith('address.')) {
      const key = name.replace('address.', '');
      setForm((previous) => ({
        ...previous,
        address: { ...previous.address, [key]: value },
      }));
      return;
    }
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      branchName: branch.branchName || '',
      phone: branch.phone || '',
      isMainBranch: branch.isMainBranch || false,
      latitude: branch.latitude || '',
      longitude: branch.longitude || '',
      address: {
        country: branch.address?.country || 'Vietnam',
        province: branch.address?.province || '',
        district: branch.address?.district || '',
        ward: branch.address?.ward || '',
        street: branch.address?.street || '',
        detail: branch.address?.detail || '',
        latitude: branch.address?.latitude || '',
        longitude: branch.address?.longitude || '',
      },
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
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      address: {
        ...form.address,
        latitude: form.address.latitude ? Number(form.address.latitude) : null,
        longitude: form.address.longitude ? Number(form.address.longitude) : null,
      },
    };
    try {
      if (editingId) {
        await companyApi.updateBranch(editingId, payload);
        setNotice('Branch updated successfully');
      } else {
        await companyApi.createBranch(payload);
        setNotice('Branch created successfully');
      }
      resetForm();
      await loadBranches();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const removeBranch = async (branchId) => {
    if (!window.confirm('Delete this branch?')) {
      return;
    }
    try {
      await companyApi.deleteBranch(branchId);
      setNotice('Branch deleted successfully');
      await loadBranches();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Company Branches" subtitle="Manage branch locations used for rescue vehicles and dispatch." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update branch' : 'Create branch'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Branch Name</label>
              <input name="branchName" value={form.branchName} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Province</label>
              <input name="address.province" value={form.address.province} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>District</label>
              <input name="address.district" value={form.address.district} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Ward</label>
              <input name="address.ward" value={form.address.ward} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Street</label>
              <input name="address.street" value={form.address.street} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label>Address Detail</label>
            <textarea name="address.detail" value={form.address.detail} onChange={handleChange} />
          </div>
          <div className="field">
            <label>
              <input name="isMainBranch" type="checkbox" checked={form.isMainBranch} onChange={handleChange} />
              {' '}Main branch
            </label>
          </div>
          <div className="actions-row">
            <button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Create branch'}</button>
            {editingId ? <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div className="card">
          <h2>Branch List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.branchName}</td>
                    <td>{branch.phone || 'N/A'}</td>
                    <td>{branch.address?.fullAddress || 'N/A'}</td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => handleEdit(branch)}>Edit</button>
                        <button className="button button-danger" type="button" onClick={() => removeBranch(branch.id)}>Delete</button>
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
