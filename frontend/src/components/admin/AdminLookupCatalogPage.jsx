import { useEffect, useMemo, useState } from 'react';
import {
  Database,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import PageHeader from '../common/PageHeader';
import StatCard from '../common/StatCard';
import { getApiError } from '../../api/client';

export default function AdminLookupCatalogPage({
  title,
  subtitle,
  eyebrow = 'Master Data',
  icon,
  rowIcon: RowIcon,
  codeKey,
  nameKey,
  initialForm,
  codeLabel = 'Code',
  nameLabel = 'Name',
  descriptionLabel = 'Description',
  entityLabel,
  api,
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.list());
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return [...items].sort((a, b) => (a[nameKey] || '').localeCompare(b[nameKey] || ''));
    }

    return items
      .filter((item) => [item[codeKey], item[nameKey], item.description]
        .some((value) => value?.toLowerCase().includes(keyword)))
      .sort((a, b) => (a[nameKey] || '').localeCompare(b[nameKey] || ''));
  }, [items, search, codeKey, nameKey]);

  const describedCount = useMemo(
    () => items.filter((item) => item.description?.trim()).length,
    [items],
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      [codeKey]: item[codeKey] || '',
      [nameKey]: item[nameKey] || '',
      description: item.description || '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (editingId) {
        await api.update(editingId, form);
        setNotice(`${entityLabel} updated successfully.`);
      } else {
        await api.create(form);
        setNotice(`${entityLabel} created successfully.`);
      }
      closeForm();
      await loadItems();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setDeletingId(deleteTarget.id);
    setError('');
    setNotice('');
    try {
      await api.remove(deleteTarget.id);
      setNotice(`${entityLabel} deleted successfully.`);
      if (editingId === deleteTarget.id) {
        closeForm();
      }
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const formFooter = (
    <div className="actions-row">
      <button className="button button-secondary" type="button" onClick={closeForm} disabled={submitting}>
        Cancel
      </button>
      <button className="button button-primary" type="submit" form="lookup-catalog-form" disabled={submitting}>
        {submitting ? 'Saving...' : editingId ? 'Save changes' : `Create ${entityLabel}`}
      </button>
    </div>
  );

  const deleteFooter = (
    <div className="actions-row">
      <button className="button button-secondary" type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(deletingId)}>
        Cancel
      </button>
      <button className="button button-danger" type="button" onClick={confirmDelete} disabled={Boolean(deletingId)}>
        {deletingId ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        icon={icon}
        actions={(
          <button className="button button-primary" type="button" onClick={openCreate}>
            <Plus size={18} aria-hidden="true" />
            Add {entityLabel}
          </button>
        )}
      />

      {notice ? (
        <Alert variant="success" title="Success" onDismiss={() => setNotice('')}>
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="error" title="Something went wrong" onDismiss={() => setError('')}>
          {error}
        </Alert>
      ) : null}

      {loading ? <Loader label={`Loading ${entityLabel}s...`} /> : null}

      {!loading ? (
        <>
          <div className="stats-grid lookup-catalog-stats">
            <StatCard
              label="Total entries"
              value={items.length}
              hint="Active catalog records"
              icon={<Database size={20} />}
              variant="info"
            />
            <StatCard
              label="With description"
              value={describedCount}
              hint="Entries documented for staff"
              icon={<FileText size={20} />}
              variant="success"
            />
          </div>

          <section className="card lookup-catalog-panel">
            <div className="lookup-catalog-toolbar">
              <div>
                <h2>Catalog</h2>
                <p className="muted-line">
                  {filteredItems.length} of {items.length} {entityLabel}(s) shown
                </p>
              </div>
              <label className="lookup-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search by code, name, or description...`}
                  aria-label={`Search ${entityLabel}s`}
                />
              </label>
            </div>

            {filteredItems.length === 0 ? (
              <div className="empty-state lookup-catalog-empty">
                {RowIcon ? <RowIcon size={40} strokeWidth={1.5} aria-hidden="true" /> : null}
                <h3>{search ? 'No matching entries' : `No ${entityLabel}s yet`}</h3>
                <p>
                  {search
                    ? 'Try a different keyword or clear the search filter.'
                    : `Create the first ${entityLabel} to populate the rescue request catalog.`}
                </p>
                {!search ? (
                  <button className="button button-primary" type="button" onClick={openCreate}>
                    <Plus size={18} aria-hidden="true" />
                    Add {entityLabel}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="lookup-catalog-table-wrap">
                <table className="lookup-catalog-table">
                  <thead>
                    <tr>
                      <th>{codeLabel}</th>
                      <th>{nameLabel}</th>
                      <th>{descriptionLabel}</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className={editingId === item.id ? 'lookup-row-active' : ''}>
                        <td data-label={codeLabel}>
                          <span className="lookup-code-chip">{item[codeKey]}</span>
                        </td>
                        <td data-label={nameLabel}>
                          <div className="lookup-name-cell">
                            {RowIcon ? (
                              <span className="lookup-row-icon" aria-hidden="true">
                                <RowIcon size={18} />
                              </span>
                            ) : null}
                            <strong>{item[nameKey]}</strong>
                          </div>
                        </td>
                        <td data-label={descriptionLabel}>
                          <span className="lookup-description">
                            {item.description?.trim() || '—'}
                          </span>
                        </td>
                        <td>
                          <div className="lookup-row-actions">
                            <button
                              className="button button-ghost lookup-action-btn"
                              type="button"
                              onClick={() => openEdit(item)}
                              aria-label={`Edit ${item[nameKey]}`}
                            >
                              <Pencil size={16} aria-hidden="true" />
                              Edit
                            </button>
                            <button
                              className="button button-ghost lookup-action-btn lookup-action-danger"
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              aria-label={`Delete ${item[nameKey]}`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingId ? `Edit ${entityLabel}` : `New ${entityLabel}`}
        size="medium"
        footer={formFooter}
      >
        <form id="lookup-catalog-form" className="lookup-catalog-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor={`${codeKey}-input`}>{codeLabel}</label>
            <input
              id={`${codeKey}-input`}
              value={form[codeKey]}
              onChange={(event) => setForm((previous) => ({ ...previous, [codeKey]: event.target.value }))}
              placeholder="e.g. FLAT_TIRE"
              required
            />
            <span className="muted-line">Short unique identifier, usually uppercase.</span>
          </div>
          <div className="field">
            <label htmlFor={`${nameKey}-input`}>{nameLabel}</label>
            <input
              id={`${nameKey}-input`}
              value={form[nameKey]}
              onChange={(event) => setForm((previous) => ({ ...previous, [nameKey]: event.target.value }))}
              placeholder="Display name shown to users"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lookup-description-input">{descriptionLabel}</label>
            <textarea
              id="lookup-description-input"
              value={form.description}
              onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
              placeholder="Optional guidance for dispatchers and customers"
              rows={4}
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete ${entityLabel}?`}
        size="small"
        footer={deleteFooter}
      >
        <p className="lookup-delete-copy">
          You are about to remove <strong>{deleteTarget?.[nameKey]}</strong>
          {' '}
          (<span className="lookup-code-chip">{deleteTarget?.[codeKey]}</span>).
          This action cannot be undone and may affect existing rescue requests.
        </p>
      </Modal>
    </>
  );
}
