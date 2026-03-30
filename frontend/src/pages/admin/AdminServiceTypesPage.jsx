import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

const initialForm = { serviceCode: '', serviceName: '', description: '' };

export default function AdminServiceTypesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      setItems(await adminApi.getServiceTypes());
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await adminApi.updateServiceType(editingId, form);
        setNotice('Service type updated successfully');
      } else {
        await adminApi.createServiceType(form);
        setNotice('Service type created successfully');
      }
      setForm(initialForm);
      setEditingId(null);
      await loadItems();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setForm(item);
  };

  const removeItem = async (id) => {
    if (!window.confirm('Delete this service type?')) {
      return;
    }
    try {
      await adminApi.deleteServiceType(id);
      setNotice('Service type deleted successfully');
      await loadItems();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Service Types" subtitle="Admin CRUD for service lookup data." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update service type' : 'Create service type'}</h2>
          <div className="field">
            <label>Code</label>
            <input value={form.serviceCode} onChange={(e) => setForm((p) => ({ ...p, serviceCode: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Name</label>
            <input value={form.serviceName} onChange={(e) => setForm((p) => ({ ...p, serviceName: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="actions-row">
            <button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Create'}</button>
            {editingId ? <button className="button button-secondary" type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
          </div>
        </form>

        <div className="card">
          <h2>Service Type List</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.serviceCode}</td>
                    <td>{item.serviceName}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>
                      <div className="actions-row">
                        <button className="button button-secondary" type="button" onClick={() => editItem(item)}>Edit</button>
                        <button className="button button-danger" type="button" onClick={() => removeItem(item.id)}>Delete</button>
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
