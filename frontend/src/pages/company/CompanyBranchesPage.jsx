import { useEffect, useMemo, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

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
  const [filters, setFilters] = useState({ search: '', mainBranch: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadBranches = async () => {
    setLoading(true);
    setError('');
    try {
      setBranches(await companyApi.getBranches());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const filteredBranches = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesSearch = keyword === ''
        || [
          branch.branchName,
          branch.phone,
          branch.address?.fullAddress,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesMainBranch = filters.mainBranch === 'ALL'
        || (filters.mainBranch === 'MAIN' && branch.isMainBranch)
        || (filters.mainBranch === 'SUB' && !branch.isMainBranch);

      return matchesSearch && matchesMainBranch;
    });
  }, [branches, filters]);

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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (branch) => {
    setEditingId(branch.id);
    setForm({
      branchName: branch.branchName || '',
      phone: branch.phone || '',
      isMainBranch: branch.isMainBranch || false,
      latitude: branch.latitude ?? '',
      longitude: branch.longitude ?? '',
      address: {
        country: branch.address?.country || 'Vietnam',
        province: branch.address?.province || '',
        district: branch.address?.district || '',
        ward: branch.address?.ward || '',
        street: branch.address?.street || '',
        detail: branch.address?.detail || '',
        latitude: branch.address?.latitude ?? '',
        longitude: branch.address?.longitude ?? '',
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
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
      address: {
        ...form.address,
        latitude: form.address.latitude === '' ? null : Number(form.address.latitude),
        longitude: form.address.longitude === '' ? null : Number(form.address.longitude),
      },
    };
    try {
      if (editingId) {
        await companyApi.updateBranch(editingId, payload);
        setNotice('Branch updated successfully.');
      } else {
        await companyApi.createBranch(payload);
        setNotice('Branch created successfully.');
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
    setError('');
    setNotice('');
    try {
      await companyApi.deleteBranch(branchId);
      setNotice('Branch deleted successfully.');
      await loadBranches();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Company Branches" subtitle="Manage dispatch branches, main-branch flags, and branch coordinates used for rescue operations." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading branches..." /> : null}

      {!loading ? (
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
                <label>Branch Latitude</label>
                <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Branch Longitude</label>
                <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Country</label>
                <input name="address.country" value={form.address.country} onChange={handleChange} />
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
              <div className="field">
                <label>Address Latitude</label>
                <input name="address.latitude" type="number" step="any" value={form.address.latitude} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Address Longitude</label>
                <input name="address.longitude" type="number" step="any" value={form.address.longitude} onChange={handleChange} />
              </div>
            </div>
            <div className="field">
              <label>Address Detail</label>
              <textarea name="address.detail" value={form.address.detail} onChange={handleChange} />
            </div>
            <div className="field">
              <label className="checkbox-line">
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
            <div className="toolbar">
              <div className="toolbar-title">
                <h2>Branch List</h2>
                <p>{filteredBranches.length} branch(es) matched</p>
              </div>
              <div className="toolbar-filters">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by branch name, phone, address"
                />
                <select name="mainBranch" value={filters.mainBranch} onChange={handleFilterChange}>
                  <option value="ALL">All branches</option>
                  <option value="MAIN">Main branch</option>
                  <option value="SUB">Sub branch</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Coordinates</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.length === 0 ? (
                    <tr>
                      <td colSpan="5">No branches matched the current filters.</td>
                    </tr>
                  ) : (
                    filteredBranches.map((branch) => (
                      <tr key={branch.id}>
                        <td>
                          <strong>{branch.branchName}</strong>
                          <div className="muted-line">
                            {branch.isMainBranch ? <StatusBadge value="MAIN_BRANCH" /> : 'Sub branch'}
                          </div>
                        </td>
                        <td>{branch.phone || 'N/A'}</td>
                        <td>{branch.address?.fullAddress || 'N/A'}</td>
                        <td>
                          <div>Branch: {branch.latitude ?? 'N/A'}, {branch.longitude ?? 'N/A'}</div>
                          <div className="muted-line">
                            Address: {branch.address?.latitude ?? 'N/A'}, {branch.address?.longitude ?? 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="actions-row">
                            <button className="button button-secondary" type="button" onClick={() => handleEdit(branch)}>Edit</button>
                            <button className="button button-danger" type="button" onClick={() => removeBranch(branch.id)}>Delete</button>
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
