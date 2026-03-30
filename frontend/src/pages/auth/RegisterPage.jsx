import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/roles';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, isAuthenticated, getApiError } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await register(form);
      navigate(getDefaultRoute(response.user.roleName), { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <form className="auth-card card" style={{ maxWidth: '560px', width: '100%' }} onSubmit={handleSubmit}>
        <h1>Create Customer Account</h1>
        <p>This registration form creates a `CUSTOMER` account only.</p>

        {error ? <div className="notice error">{error}</div> : null}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Register'}
          </button>
          <Link className="button button-secondary" to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
