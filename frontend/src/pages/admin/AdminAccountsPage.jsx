import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/requestUi';

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
  defaultAddress: emptyAddress,
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
    return {
      ...initialForm,
      roleName: fallbackRole,
      defaultAddress: { ...emptyAddress },
    };
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
  const trimmed = {
    country: address.country?.trim() || '',
    province: address.province?.trim() || '',
    district: address.district?.trim() || '',
    ward: address.ward?.trim() || '',
    street: address.street?.trim() || '',
    detail: address.detail?.trim() || '',
  };

  const hasValue = Object.values(trimmed).some((value) => value !== '');
  return hasValue ? trimmed : null;
}

function buildPayload(form) {
  return {
    email: form.email.trim(),
    password: form.password || '',
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

function buildStatusPayload(account, nextStatus) {
  return {
    email: account.email,
    password: '',
    fullName: account.fullName || '',
    phone: account.phone || '',
    avatarUrl: account.avatarUrl || '',
    roleName: account.roleName || 'CUSTOMER',
    status: nextStatus,
    dateOfBirth: account.dateOfBirth || null,
    gender: account.gender || '',
    cccd: account.cccd || '',
    defaultAddress: normalizeAddress(toAddressForm(account.defaultAddress)),
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({ search: '', roleName: 'ALL', status: 'ALL' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionAccountId, setActionAccountId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const defaultRole = roles[0]?.roleName || 'CUSTOMER';

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!editingId && roles.length > 0) {
      setForm((previous) => ({
        ...previous,
        roleName: previous.roleName || defaultRole,
      }));
    }
  }, [defaultRole, editingId, roles.length]);

  const filteredAccounts = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch = keyword === ''
        || [
          account.fullName,
          account.email,
          account.phone,
        ].some((value) => value?.toLowerCase().includes(keyword));

      const matchesRole = filters.roleName === 'ALL' || account.roleName === filters.roleName;
      const matchesStatus = filters.status === 'ALL' || account.status === filters.status;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('defaultAddress.')) {
      const key = name.replace('defaultAddress.', '');
      setForm((previous) => ({
        ...previous,
        defaultAddress: {
          ...previous.defaultAddress,
          [key]: value,
        },
      }));
      return;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedAccount(null);
    setForm(toForm(null, defaultRole));
  };

  const handleEdit = async (accountId) => {
    setLoadingDetail(true);
    setError('');
    try {
      const account = await adminApi.getAccount(accountId);
      setEditingId(account.id);
      setSelectedAccount(account);
      setForm(toForm(account, defaultRole));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const payload = buildPayload(form);
      const savedAccount = editingId
        ? await adminApi.updateAccount(editingId, payload)
        : await adminApi.createAccount(payload);

      setNotice(editingId ? 'Account updated successfully.' : 'Account created successfully.');
      setEditingId(savedAccount.id);
      setSelectedAccount(savedAccount);
      setForm(toForm(savedAccount, defaultRole));
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (accountId) => {
    if (!window.confirm('Deactivate this account?')) {
      return;
    }
    setActionAccountId(accountId);
    setError('');
    setNotice('');
    try {
      await adminApi.deleteAccount(accountId);
      setNotice('Account deactivated successfully.');
      if (editingId === accountId) {
        setForm((previous) => ({ ...previous, status: 'INACTIVE' }));
        setSelectedAccount((previous) => (previous ? { ...previous, status: 'INACTIVE' } : previous));
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionAccountId(null);
    }
  };

  const handleActivate = async (accountId) => {
    setActionAccountId(accountId);
    setError('');
    setNotice('');
    try {
      const account = await adminApi.getAccount(accountId);
      await adminApi.updateAccount(accountId, buildStatusPayload(account, 'ACTIVE'));
      setNotice('Account activated successfully.');
      if (editingId === accountId) {
        const refreshed = await adminApi.getAccount(accountId);
        setSelectedAccount(refreshed);
        setForm(toForm(refreshed, defaultRole));
      }
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionAccountId(null);
    }
  };

  return (
    <>
      <PageHeader title="Accounts" subtitle="Search, filter, edit, and quickly activate or deactivate accounts with full profile fields and default address support." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading accounts..." /> : null}

      {!loading ? (
        <div className="grid-two">
          <form className="card" onSubmit={handleSubmit}>
            <div className="actions-row" style={{ justifyContent: 'space-between' }}>
              <h2>{editingId ? 'Edit Account' : 'Create Account'}</h2>
              {editingId ? <StatusBadge value={form.status} /> : null}
            </div>

            {loadingDetail ? <Loader label="Loading account detail..." /> : null}

            {!loadingDetail ? (
              <>
                <div className="info-grid">
                  <div className="info-item">
                    <span>Mode</span>
                    <strong>{editingId ? `Editing #${editingId}` : 'Creating new account'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Role</span>
                    <strong>{form.roleName}</strong>
                  </div>
                  <div className="info-item">
                    <span>Status</span>
                    <strong>{form.status}</strong>
                  </div>
                  <div className="info-item">
                    <span>Created At</span>
                    <strong>{formatDateTime(selectedAccount?.createdAt)}</strong>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={editingId ? 'Leave blank to keep current password' : 'Optional, defaults to Password@123'}
                    />
                  </div>
                  <div className="field">
                    <label>Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Avatar URL</label>
                    <input name="avatarUrl" value={form.avatarUrl} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Date of Birth</label>
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <input name="gender" value={form.gender} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>CCCD</label>
                    <input name="cccd" value={form.cccd} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Role</label>
                    <select name="roleName" value={form.roleName} onChange={handleChange}>
                      {roles.map((role) => (
                        <option key={role.id} value={role.roleName}>{role.roleName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </div>
                </div>

                <h3>Default Address</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Country</label>
                    <input name="defaultAddress.country" value={form.defaultAddress.country} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Province</label>
                    <input name="defaultAddress.province" value={form.defaultAddress.province} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>District</label>
                    <input name="defaultAddress.district" value={form.defaultAddress.district} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Ward</label>
                    <input name="defaultAddress.ward" value={form.defaultAddress.ward} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Street</label>
                    <input name="defaultAddress.street" value={form.defaultAddress.street} onChange={handleChange} />
                  </div>
                </div>

                <div className="field">
                  <label>Address Detail</label>
                  <textarea name="defaultAddress.detail" value={form.defaultAddress.detail} onChange={handleChange} />
                </div>

                <div className="actions-row">
                  <button className="button button-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : (editingId ? 'Save changes' : 'Create account')}
                  </button>
                  {editingId ? (
                    <button className="button button-secondary" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </>
            ) : null}
          </form>

          <div className="card">
            <div className="toolbar">
              <div className="toolbar-title">
                <h2>Account List</h2>
                <p>{filteredAccounts.length} account(s) matched</p>
              </div>
              <div className="toolbar-filters">
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, email, phone"
                />
                <select name="roleName" value={filters.roleName} onChange={handleFilterChange}>
                  <option value="ALL">All roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.roleName}>{role.roleName}</option>
                  ))}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="BANNED">BANNED</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Default Address</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan="7">No accounts matched the current filters.</td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <strong>{account.fullName}</strong>
                          <div className="muted-line">ID #{account.id}</div>
                        </td>
                        <td>
                          <div>{account.email}</div>
                          <div className="muted-line">{account.phone || 'No phone'}</div>
                        </td>
                        <td>{account.roleName}</td>
                        <td><StatusBadge value={account.status} /></td>
                        <td>{formatDateTime(account.createdAt)}</td>
                        <td>{account.defaultAddress?.fullAddress || 'No default address'}</td>
                        <td>
                          <div className="actions-stack">
                            <button className="button button-secondary" type="button" onClick={() => handleEdit(account.id)}>
                              Open detail
                            </button>
                            {account.status === 'ACTIVE' ? (
                              <button
                                className="button button-danger"
                                type="button"
                                disabled={actionAccountId === account.id}
                                onClick={() => handleDeactivate(account.id)}
                              >
                                {actionAccountId === account.id ? 'Updating...' : 'Deactivate'}
                              </button>
                            ) : (
                              <button
                                className="button button-primary"
                                type="button"
                                disabled={actionAccountId === account.id}
                                onClick={() => handleActivate(account.id)}
                              >
                                {actionAccountId === account.id ? 'Updating...' : 'Activate'}
                              </button>
                            )}
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
