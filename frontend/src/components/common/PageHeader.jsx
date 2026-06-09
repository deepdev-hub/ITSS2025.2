export default function PageHeader({ title, subtitle, actions, eyebrow, icon }) {
  return (
    <div className="page-header page-header-premium">
      <div>
        {icon ? <span className="page-header-icon">{icon}</span> : null}
        {eyebrow ? <span className="request-lifecycle-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}
