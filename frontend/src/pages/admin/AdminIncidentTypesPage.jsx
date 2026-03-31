import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';

const initialForm = { incidentCode: '', incidentName: '', description: '' };

export default function AdminIncidentTypesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      setItems(await adminApi.getIncidentTypes());
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
        await adminApi.updateIncidentType(editingId, form);
        setNotice('Incident type updated successfully');
      } else {
        await adminApi.createIncidentType(form);
        setNotice('Incident type created successfully');
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
    if (!window.confirm('Delete this incident type?')) {
      return;
    }
    try {
      await adminApi.deleteIncidentType(id);
      setNotice('Incident type deleted successfully');
      await loadItems();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Incident Types" subtitle="Admin CRUD for incident lookup data." />
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
      <div className="grid-two">
        <form className="card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Update incident type' : 'Create incident type'}</h2>
          <div className="field">
            <label>Code</label>
            <input value={form.incidentCode} onChange={(e) => setForm((p) => ({ ...p, incidentCode: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Name</label>
            <input value={form.incidentName} onChange={(e) => setForm((p) => ({ ...p, incidentName: e.target.value }))} required />
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
          <h2>Incident Type List</h2>
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
                    <td>{item.incidentCode}</td>
                    <td>{item.incidentName}</td>
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
