export default function PageHeader({ title, subtitle, actions, eyebrow, icon }) {
  return (
    <div className="page-header page-header-premium">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {icon ? <span className="page-header-icon" style={{ marginBottom: 0 }}>{icon}</span> : null}
          {eyebrow ? <span className="request-lifecycle-eyebrow">{eyebrow}</span> : null}
        </div>
        <h1 style={{ margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {subtitle ? <p style={{ marginTop: '0.35rem', color: 'var(--muted)' }}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}
