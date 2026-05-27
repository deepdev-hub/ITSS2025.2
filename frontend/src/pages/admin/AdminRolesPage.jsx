import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <>
      <PageHeader
        title="Roles"
        subtitle="View the system role master data used by accounts and route guards."
      />

      {error ? <div className="notice error">{error}</div> : null}

      {loading ? <Loader label="Loading roles..." /> : null}

      {!loading ? (
        <div className="card">
          <h2>Role List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Role Id</th>
                  <th>Role Name</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>{role.roleName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}
