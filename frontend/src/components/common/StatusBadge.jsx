export default function StatusBadge({ value }) {
  const normalized = (value || 'UNKNOWN').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return <span className={`status-badge status-${normalized}`}>{value}</span>;
}
