import { useState, useEffect } from 'react';
import { LifeBuoy, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute, getPostLoginRoute } from '../../utils/roles';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, getApiError } = useAuth();
  const notice = location.state?.notice;
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    // Remove dark mode class if it was previously set
    document.documentElement.classList.remove('dark-mode');
  }, []);

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
      const response = await login(form);
      const destination = getPostLoginRoute(response.user.roleName, location.state?.from?.pathname);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <div className="auth-card card sync-auth-card">
        <div className="sync-auth-header">
          <div className="sync-auth-icon">
            <LifeBuoy size={32} />
          </div>
          <h2>Welcome back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="sync-auth-form">
          {notice ? <Alert variant="success">{notice}</Alert> : null}
          {error ? <Alert variant="error" title="Login failed">{error}</Alert> : null}

          <div className="sync-field">
            <label htmlFor="email">Email</label>
            <div className="sync-input-wrapper">
              <Mail size={18} className="sync-input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="sync-field">
            <label htmlFor="password">Password</label>
            <div className="sync-input-wrapper">
              <Lock size={18} className="sync-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="sync-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="sync-auth-actions">
            <Link className="sync-forgot-link" to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            className={`button button-primary sync-submit-btn ${submitting ? 'button-loading' : ''}`}
            type="submit"
            disabled={submitting}
          >
            <LogIn size={20} style={{ marginRight: '8px' }} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="sync-auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>

      <style>{`
        .sync-auth-card {
          max-width: 440px;
          width: 100%;
          padding: 3rem 2.5rem;
          border-radius: 20px;
          background: #ffffff;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05), 0 5px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .sync-auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .sync-auth-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.25rem;
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sync-auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem;
        }

        .sync-auth-header p {
          color: #64748b;
          margin: 0;
          font-size: 0.95rem;
        }

        .sync-auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .sync-field label {
          display: block;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .sync-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sync-input-icon {
          position: absolute;
          left: 1rem;
          color: #94a3b8;
          pointer-events: none;
        }

        .sync-input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .sync-input-wrapper input:focus {
          border-color: #0d6efd;
          background: #ffffff;
          outline: none;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
        }

        .sync-input-wrapper input::placeholder {
          color: #cbd5e1;
        }

        .sync-password-toggle {
          position: absolute;
          right: 0.5rem;
          background: none;
          border: none;
          color: #94a3b8;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .sync-password-toggle:hover {
          color: #0d6efd;
        }

        .sync-auth-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: -0.25rem;
        }

        .sync-forgot-link {
          color: #0d6efd;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
        }

        .sync-forgot-link:hover {
          text-decoration: underline;
        }

        .sync-submit-btn {
          width: 100%;
          padding: 0.875rem;
          border-radius: 12px;
          font-size: 1.05rem;
          margin-top: 0.5rem;
        }

        .sync-auth-footer {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
        }

        .sync-auth-footer a {
          color: #0d6efd;
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.25rem;
        }

        .sync-auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
