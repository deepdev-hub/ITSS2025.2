import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const VARIANTS = {
  success: { className: 'alert-success', Icon: CheckCircle2 },
  error: { className: 'alert-error', Icon: AlertCircle },
  warning: { className: 'alert-warning', Icon: AlertTriangle },
  info: { className: 'alert-info', Icon: Info },
};

export default function Alert({ variant = 'info', title, children, onDismiss }) {
  const config = VARIANTS[variant] || VARIANTS.info;
  const { className, Icon } = config;

  return (
    <div className={`alert ${className}`} role="alert">
      <Icon className="alert-icon" size={20} aria-hidden="true" />
      <div className="alert-body">
        {title ? <strong className="alert-title">{title}</strong> : null}
        <div className="alert-content">{children}</div>
      </div>
      {onDismiss ? (
        <button type="button" className="alert-dismiss" onClick={onDismiss} aria-label="Dismiss">
          x
        </button>
      ) : null}
    </div>
  );
}
