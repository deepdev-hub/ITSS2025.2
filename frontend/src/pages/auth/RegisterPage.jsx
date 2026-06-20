import { useState, useEffect } from 'react';
import { LifeBuoy, UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, Calendar, CreditCard } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/roles';
import Alert from '../../components/common/Alert';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  cccd: '',
};

function getMinimumAdultBirthDate() {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isAtLeast18YearsOld(dateOfBirth) {
  if (!dateOfBirth) return false;
  return new Date(dateOfBirth) <= getMinimumAdultBirthDate();
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, isAuthenticated, getApiError } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const maxBirthDate = toDateInputValue(getMinimumAdultBirthDate());
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
    const normalizedCccd = form.cccd.trim();

    if (!form.dateOfBirth) {
      setError('Date of Birth is required.');
      return;
    }
    if (!isAtLeast18YearsOld(form.dateOfBirth)) {
      setError('You must be at least 18 years old to register.');
      return;
    }
    if (!normalizedCccd) {
      setError('CCCD is required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        cccd: normalizedCccd,
      };
      const response = await register(payload);
      navigate(getDefaultRoute(response.user.roleName), { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <div className="auth-card card sync-auth-card sync-auth-card-wide">
        <div className="sync-auth-header">
          <div className="sync-auth-icon">
            <LifeBuoy size={32} />
          </div>
          <h2>Create Account</h2>
          <p>Join VBAS Rescue today.</p>
        </div>

        <form className="sync-auth-form" onSubmit={handleSubmit}>
          {error ? <Alert variant="error" title="Registration failed">{error}</Alert> : null}

          <h3 className="sync-section-title">Personal Information</h3>
          
          <div className="sync-form-grid">
            <div className="sync-field">
              <label htmlFor="fullName">Full Name</label>
              <div className="sync-input-wrapper">
                <User size={18} className="sync-input-icon" />
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Enter your full name" />
              </div>
            </div>

            <div className="sync-field">
              <label htmlFor="phone">Phone</label>
              <div className="sync-input-wrapper">
                <Phone size={18} className="sync-input-icon" />
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
              </div>
            </div>

            <div className="sync-field">
              <label htmlFor="email">Email</label>
              <div className="sync-input-wrapper">
                <Mail size={18} className="sync-input-icon" />
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
              </div>
            </div>

            <div className="sync-field">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <div className="sync-input-wrapper">
                <Calendar size={18} className="sync-input-icon" />
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                  max={maxBirthDate}
                />
              </div>
            </div>

            <div className="sync-field">
              <label htmlFor="gender">Gender</label>
              <div className="sync-input-wrapper">
                <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            <div className="sync-field">
              <label htmlFor="cccd">CCCD</label>
              <div className="sync-input-wrapper">
                <CreditCard size={18} className="sync-input-icon" />
                <input id="cccd" name="cccd" value={form.cccd} onChange={handleChange} required placeholder="Enter your CCCD" />
              </div>
            </div>
          </div>

          <h3 className="sync-section-title">Password</h3>
          
          <div className="sync-form-grid">
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
                  minLength={6}
                  placeholder="At least 6 characters"
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

            <div className="sync-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="sync-input-wrapper">
                <Lock size={18} className="sync-input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="sync-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            className={`button button-primary sync-submit-btn ${submitting ? 'button-loading' : ''}`}
            type="submit"
            disabled={submitting}
            style={{ marginTop: '1.5rem' }}
          >
            <UserPlus size={20} style={{ marginRight: '8px' }} />
            {submitting ? 'Creating account...' : 'Register'}
          </button>

          <div className="sync-auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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
          margin: auto;
        }

        .sync-auth-card-wide {
          max-width: 700px;
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
        }

        .sync-section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
          margin: 1.5rem 0 1rem;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }

        .sync-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 650px) {
          .sync-form-grid {
            grid-template-columns: 1fr;
          }
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

        .sync-input-wrapper input,
        .sync-input-wrapper select {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .sync-input-wrapper select {
          appearance: none;
          padding-left: 1rem;
        }

        .sync-input-wrapper input:focus,
        .sync-input-wrapper select:focus {
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

        .sync-submit-btn {
          width: 100%;
          padding: 0.875rem;
          border-radius: 12px;
          font-size: 1.05rem;
          margin-top: 0.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
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
