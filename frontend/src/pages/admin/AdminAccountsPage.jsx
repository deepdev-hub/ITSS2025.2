import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const initialForm = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  roleName: 'CUSTOMER',
  status: 'ACTIVE',
  gender: '',
  cccd: '',
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [accountList, roleList] = await Promise.all([
        adminApi.getAccounts(),
        adminApi.getRoles(),
      ]);
      setAccounts(accountList);
      setRoles(roleList);
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

  const handleEdit = (account) => {
    setEditingId(account.id);
    setForm({
      email: account.email || '',
      password: '',
      fullName: account.fullName || '',
      phone: account.phone || '',
      avatarUrl: account.avatarUrl || '',
      roleName: account.roleName || 'CUSTOMER',
      status: account.status || 'ACTIVE',
      gender: account.gender || '',
      cccd: account.cccd || '',
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await adminApi.updateAccount(editingId, form);
        setNotice('Account updated successfully');
      } else {
        await adminApi.createAccount(form);
        setNotice('Account created successfully');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Deactivate this account?')) {
      return;
    }
    try {
      await adminApi.deleteAccount(accountId);
      setNotice('Account deactivated successfully');
      await loadData();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Accounts" subtitle="Admin can create, update, and deactivate accounts by role." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update account' : 'Create account'}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'Leave blank to keep current password' : ''} />
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

          <div className="actions-row">
            <button className="button button-primary" type="submit">
              {editingId ? 'Save changes' : 'Create account'}
            </button>
            {editingId ? (
              <button className="button button-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="card">
          <h2>Account List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.fullName}</td>
                    <td>{account.email}</td>
                    <td>{account.roleName}</td>
                    <td><StatusBadge value={account.status} /></td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => handleEdit(account)}>
                          Edit
                        </button>
                        <button className="button button-danger" type="button" onClick={() => handleDelete(account.id)}>
                          Deactivate
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
