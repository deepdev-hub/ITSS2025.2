import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="hero">
      <div className="empty-state" style={{ maxWidth: '520px' }}>
        <h1>403</h1>
        <p>You do not have permission to access this page.</p>
        <Link className="button button-primary" to="/">Back to home</Link>
      </div>
    </div>
  );
}
