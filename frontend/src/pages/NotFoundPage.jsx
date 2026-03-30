import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="hero">
      <div className="empty-state" style={{ maxWidth: '520px' }}>
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
        <Link className="button button-primary" to="/">Back to home</Link>
      </div>
    </div>
  );
}
