import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="hero">
      <section className="hero-card">
        <div>
          <span className="status-badge status-emergency">Vehicle Breakdown Assistance System</span>
          <h1>Fullstack demo for breakdown rescue, dispatch, quote, payment, and review.</h1>
          <p>
            This project is built for a quick classroom or stakeholder demo: clear role-based flows,
            stable CRUD APIs, and a UI that lets customer, admin, company, and staff work on the same request lifecycle.
          </p>

          <div className="hero-actions">
            <Link className="button button-primary" to="/login">Login</Link>
            <Link className="button button-secondary" to="/register">Register as Customer</Link>
          </div>
        </div>

        <div className="hero-grid">
          <div className="hero-metric">
            <span>Customer Flow</span>
            <strong>Create request</strong>
            <small>Vehicle + incident + service + live location</small>
          </div>
          <div className="hero-metric">
            <span>Company Flow</span>
            <strong>Dispatch & quote</strong>
            <small>Assign staff and vehicle, then send quote</small>
          </div>
          <div className="hero-metric">
            <span>Admin Flow</span>
            <strong>Govern & assign</strong>
            <small>Manage accounts, companies, services, and requests</small>
          </div>
          <div className="hero-metric">
            <span>Staff Flow</span>
            <strong>Execute</strong>
            <small>Track assignments and update request progress</small>
          </div>
        </div>
      </section>
    </div>
  );
}
