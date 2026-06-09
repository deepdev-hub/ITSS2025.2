export default function StatCard({
  label,
  value,
  hint,
  icon,
  variant = 'default',
  className = '',
}) {
  const variantClass = variant !== 'default' ? `stat-card-${variant}` : '';

  return (
    <div className={`stat-card stat-card-premium ${variantClass} ${className}`.trim()}>
      {icon ? <span className="stat-card-icon-wrap">{icon}</span> : null}
      <span className="stat-card-label">{label}</span>
      <strong className="stat-card-value">{value}</strong>
      {hint ? <small className="stat-card-hint">{hint}</small> : null}
    </div>
  );
}
