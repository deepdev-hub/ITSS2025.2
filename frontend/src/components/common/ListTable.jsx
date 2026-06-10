import { Trash2, Edit2, Eye } from 'lucide-react';
import './ListTable.css';

export default function ListTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'No data found'
}) {
  if (loading) {
    return <div className="list-table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="list-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="list-table-wrapper">
      <table className="list-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="table-actions">
                  {onView && (
                    <button
                      className="action-btn view-btn"
                      onClick={() => onView(row)}
                      title="View"
                      aria-label="View"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(row)}
                      title="Edit"
                      aria-label="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(row)}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
