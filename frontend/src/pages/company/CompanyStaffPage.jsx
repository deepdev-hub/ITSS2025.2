import { useEffect, useMemo, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const STAFF_STATUSES = ['ACTIVE', 'OFFLINE', 'BUSY'];

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

function toStaffForm(item) {
  if (!item) {
    return initialForm;
  }
  return {
    userId: item.userId ? String(item.userId) : '',
    email: item.email || '',
    password: '',
    fullName: item.fullName || '',
    phone: item.phone || '',
    branchId: item.branchId ? String(item.branchId) : '',
    jobTitle: item.jobTitle || '',
    status: item.status || 'ACTIVE',
  };
}

function buildStaffPayload(form, creationMode, editingId) {
  const isLinkMode = !editingId && creationMode === 'LINK_EXISTING';
  return {
    userId: isLinkMode && form.userId ? Number(form.userId) : null,
    email: isLinkMode ? null : (form.email.trim() || null),
    password: isLinkMode ? null : (form.password || null),
    fullName: isLinkMode ? null : (form.fullName.trim() || null),
    phone: isLinkMode ? null : form.phone.trim(),
    branchId: form.branchId ? Number(form.branchId) : null,
    jobTitle: form.jobTitle.trim(),
    status: form.status,
  };
}

function buildQuickStatusPayload(item, nextStatus) {
  return {
    userId: item.userId,
    email: item.email || null,
    password: null,
    fullName: item.fullName || null,
    phone: item.phone || '',
    branchId: item.branchId || null,
    jobTitle: item.jobTitle || '',
    status: nextStatus,
  };
}

export default function CompanyStaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', branchId: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [creationMode, setCreationMode] = useState('NEW_ACCOUNT');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const branchMap = useMemo(
    () => Object.fromEntries(branches.map((branch) => [branch.id, branch])),
    [branches],
  );

  const summary = useMemo(() => ({
    total: staff.length,
    active: staff.filter((item) => item.status === 'ACTIVE').length,
    offline: staff.filter((item) => item.status === 'OFFLINE').length,
    busy: staff.filter((item) => item.status === 'BUSY').length,
  }), [staff]);

  const filteredStaff = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return staff.filter((item) => {
      const branchName = branchMap[item.branchId]?.branchName || '';
      const matchesSearch = keyword === ''
        || [
          item.fullName,
          item.email,
          item.phone,
          item.jobTitle,
          branchName,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesStatus = filters.status === 'ALL' || item.status === filters.status;
      const matchesBranch = filters.branchId === 'ALL' || String(item.branchId || '') === filters.branchId;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [branchMap, filters, staff]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [staffList, branchList] = await Promise.all([
        companyApi.getStaff(),
        companyApi.getBranches(),
      ]);
      setStaff(staffList);
      setBranches(branchList);
      setStatusDrafts(Object.fromEntries(staffList.map((item) => [item.id, item.status])));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCreationMode('NEW_ACCOUNT');
    setForm(toStaffForm(item));
    setNotice('');
    setError('');
  };

  const resetForm = () => {
    setEditingId(null);
    setCreationMode('NEW_ACCOUNT');
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = buildStaffPayload(form, creationMode, editingId);
      if (editingId) {
        await companyApi.updateStaff(editingId, payload);
        setNotice('Staff updated successfully.');
      } else {
        await companyApi.createStaff(payload);
        setNotice('Staff created successfully.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (item) => {
    const nextStatus = statusDrafts[item.id];
    setActionId(item.id);
    setError('');
    setNotice('');
    try {
      await companyApi.updateStaff(item.id, buildQuickStatusPayload(item, nextStatus));
      setNotice(`Staff status updated to ${nextStatus}.`);
      if (editingId === item.id) {
        setForm((previous) => ({ ...previous, status: nextStatus }));
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  const removeStaff = async (staffId) => {
    if (!window.confirm('Delete this staff profile?')) {
      return;
    }
    setActionId(staffId);
    setError('');
    setNotice('');
    try {
      await companyApi.deleteStaff(staffId);
      setNotice('Staff deleted successfully.');
      if (editingId === staffId) {
        resetForm();
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <PageHeader title="Company Staff" subtitle="Manage rescue staff, search the roster, update branch assignments, and change working status quickly from one screen." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading company staff..." /> : null}

      {!loading ? (
        <div className="grid-two">
          <form className="card" onSubmit={handleSubmit}>
            <div className="actions-row" style={{ justifyContent: 'space-between' }}>
              <h2>{editingId ? 'Update Staff' : 'Create Staff'}</h2>
              {editingId ? <StatusBadge value={form.status} /> : null}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span>Total Staff</span>
                <strong>{summary.total}</strong>
              </div>
              <div className="info-item">
                <span>Active</span>
                <strong>{summary.active}</strong>
              </div>
              <div className="info-item">
                <span>Offline</span>
                <strong>{summary.offline}</strong>
              </div>
              <div className="info-item">
                <span>Busy</span>
                <strong>{summary.busy}</strong>
              </div>
            </div>

            {!editingId ? (
              <div className="field">
                <label>Create Mode</label>
                <select value={creationMode} onChange={(event) => setCreationMode(event.target.value)}>
                  <option value="NEW_ACCOUNT">Create new staff account</option>
                  <option value="LINK_EXISTING">Link existing RESCUE_STAFF account</option>
                </select>
              </div>
            ) : null}

            {creationMode === 'LINK_EXISTING' && !editingId ? (
              <div className="field">
                <label>Existing User Id</label>
                <input
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  placeholder="Enter an existing RESCUE_STAFF account id"
                  required
                />
              </div>
            ) : (
              <div className="form-grid">
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required={!editingId} />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={editingId ? 'Leave blank to keep current password' : 'Required for a new account'}
                    required={!editingId}
                  />
                </div>
                <div className="field">
                  <label>Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required={!editingId} />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="form-grid">
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
                <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Tow operator, dispatcher, mechanic..." />
              </div>
              <div className="field">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {STAFF_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="actions-row">
              <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create staff')}
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
                <h2>Staff List</h2>
                <p>{filteredStaff.length} staff member(s) matched</p>
              </div>
              <div className="toolbar-filters">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, email, phone, job title"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="ALL">All statuses</option>
                  {STAFF_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select name="branchId" value={filters.branchId} onChange={handleFilterChange}>
                  <option value="ALL">All branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>{branch.branchName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Contact</th>
                    <th>Branch</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Quick Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="7">No staff matched the current filters.</td>
                    </tr>
                  ) : (
                    filteredStaff.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.fullName}</strong>
                          <div className="muted-line">User #{item.userId}</div>
                        </td>
                        <td>
                          <div>{item.email}</div>
                          <div className="muted-line">{item.phone || 'No phone'}</div>
                        </td>
                        <td>{branchMap[item.branchId]?.branchName || 'Unassigned branch'}</td>
                        <td>{item.jobTitle || 'N/A'}</td>
                        <td><StatusBadge value={item.status} /></td>
                        <td>
                          <div className="actions-stack">
                            <select
                              value={statusDrafts[item.id] || item.status}
                              onChange={(event) => setStatusDrafts((previous) => ({
                                ...previous,
                                [item.id]: event.target.value,
                              }))}
                            >
                              {STAFF_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <button
                              className="button button-secondary"
                              type="button"
                              disabled={actionId === item.id || (statusDrafts[item.id] || item.status) === item.status}
                              onClick={() => handleQuickStatusUpdate(item)}
                            >
                              {actionId === item.id ? 'Updating...' : 'Update status'}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="actions-stack">
                            <button className="button button-secondary" type="button" onClick={() => handleEdit(item)}>
                              Open edit
                            </button>
                            <button className="button button-danger" type="button" disabled={actionId === item.id} onClick={() => removeStaff(item.id)}>
                              {actionId === item.id ? 'Deleting...' : 'Delete'}
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
