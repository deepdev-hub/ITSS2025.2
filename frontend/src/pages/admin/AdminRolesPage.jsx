import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { ROLES } from '../../utils/roles';

const ROLE_OPTIONS = Object.values(ROLES);

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ roleName: ROLES.CUSTOMER });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      setRoles(await adminApi.getRoles());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const availableCreateOptions = useMemo(
    () => ROLE_OPTIONS.filter((roleName) => !roles.some((role) => role.roleName === roleName)),
    [roles],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await adminApi.updateRole(editingId, form);
        setNotice('Role updated successfully.');
      } else {
        await adminApi.createRole(form);
        setNotice('Role created successfully.');
      }
      setEditingId(null);
      setForm({ roleName: availableCreateOptions[0] || ROLES.CUSTOMER });
      await loadRoles();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleEdit = (role) => {
    setEditingId(role.id);
    setForm({ roleName: role.roleName });
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm('Delete this role? The backend will block deletion if accounts still use it.')) {
      return;
    }
    setError('');
    setNotice('');
    try {
      await adminApi.deleteRole(roleId);
      setNotice('Role deleted successfully.');
      await loadRoles();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ roleName: availableCreateOptions[0] || ROLES.CUSTOMER });
  };

  useEffect(() => {
    if (!editingId) {
      setForm((previous) => ({
        roleName: previous.roleName || availableCreateOptions[0] || ROLES.CUSTOMER,
      }));
    }
  }, [availableCreateOptions, editingId]);

  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="Manage the system role master data used by accounts and route guards."
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading roles..." /> : null}

      {!loading ? (
        <div className="grid-two">
          <form className="card" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Update role' : 'Create role'}</h2>
            <div className="field">
              <label>Role Name</label>
              <select
                value={form.roleName}
                onChange={(event) => setForm({ roleName: event.target.value })}
                disabled={!editingId && availableCreateOptions.length === 0}
              >
                {(editingId ? ROLE_OPTIONS : availableCreateOptions).map((roleName) => (
                  <option key={roleName} value={roleName}>{roleName}</option>
                ))}
              </select>
            </div>

            {!editingId && availableCreateOptions.length === 0 ? (
              <p className="muted-line">All standard roles already exist in the system.</p>
            ) : null}

            <div className="actions-row">
              <button className="button button-primary" type="submit" disabled={!editingId && availableCreateOptions.length === 0}>
                {editingId ? 'Save changes' : 'Create role'}
              </button>
              {editingId ? (
                <button className="button button-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="card">
            <h2>Role List</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Role Id</th>
                    <th>Role Name</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td>{role.id}</td>
                      <td>{role.roleName}</td>
                      <td>
                        <div className="actions-row">
                          <button className="button button-secondary" type="button" onClick={() => handleEdit(role)}>
                            Edit
                          </button>
                          <button className="button button-danger" type="button" onClick={() => handleDelete(role.id)}>
                            Delete
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
      ) : null}
    </>
  );
}
