import { useState, useEffect } from 'react';
import { LifeBuoy, UserPlus, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
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
  defaultAddress: {
    country: 'Vietnam',
    province: '',
    district: '',
    ward: '',
    street: '',
    detail: '',
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, isAuthenticated, getApiError } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    // Remove dark mode class if it was previously set
    document.documentElement.classList.remove('dark-mode');
  }, []);

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('defaultAddress.')) {
      const key = name.replace('defaultAddress.', '');
      setForm((previous) => ({
        ...previous,
        defaultAddress: {
          ...previous.defaultAddress,
          [key]: value,
        },
      }));
      return;
    }
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender,
        cccd: form.cccd,
        defaultAddress: form.defaultAddress,
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
    <div className="hero">      <form className="auth-card card modern-auth-card" style={{ maxWidth: '800px', width: '100%' }} onSubmit={handleSubmit}>
        <div className="auth-card-header">
          <div className="auth-card-icon">
            <LifeBuoy size={40} />
          </div>
          <h1>VBAS Rescue</h1>
          <p className="auth-card-subtitle">Create a customer account</p>
        </div>

        {error ? <Alert variant="error" title="Registration failed">{error}</Alert> : null}

        <h2 className="section-title">Personal Information</h2>
        <div className="form-grid">
          <div className="field modern-field">
            <label htmlFor="fullName">
              <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Full Name
            </label>
            <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Enter your full name" />
          </div>

          <div className="field modern-field">
            <label htmlFor="phone">
              <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Phone
            </label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" />
          </div>

          <div className="field modern-field">
            <label htmlFor="email">
              <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Email
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
          </div>

          <div className="field modern-field">
            <label htmlFor="dateOfBirth">
              <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Date of Birth
            </label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
          </div>

          <div className="field modern-field">
            <label htmlFor="gender">Gender</label>
            <input id="gender" name="gender" value={form.gender} onChange={handleChange} placeholder="Optional" />
          </div>

          <div className="field modern-field">
            <label htmlFor="cccd">
              <CreditCard size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              CCCD
            </label>
            <input id="cccd" name="cccd" value={form.cccd} onChange={handleChange} placeholder="Optional" />
          </div>
        </div>

        <h2 className="section-title">Password</h2>
        <div className="form-grid">
          <div className="field modern-field">
            <label htmlFor="password">
              <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Enter a password (at least 6 characters)"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field modern-field">
            <label htmlFor="confirmPassword">
              <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Confirm Password
            </label>
            <div className="password-input-wrapper">
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
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <h2 className="section-title">Default Address</h2>
        <div className="form-grid">
          <div className="field modern-field">
            <label htmlFor="country">Country</label>
            <input id="country" name="defaultAddress.country" value={form.defaultAddress.country} onChange={handleChange} />
          </div>

          <div className="field modern-field">
            <label htmlFor="province">Province</label>
            <input id="province" name="defaultAddress.province" value={form.defaultAddress.province} onChange={handleChange} />
          </div>

          <div className="field modern-field">
            <label htmlFor="district">District</label>
            <input id="district" name="defaultAddress.district" value={form.defaultAddress.district} onChange={handleChange} />
          </div>

          <div className="field modern-field">
            <label htmlFor="ward">Ward</label>
            <input id="ward" name="defaultAddress.ward" value={form.defaultAddress.ward} onChange={handleChange} />
          </div>

          <div className="field modern-field">
            <label htmlFor="street">Street</label>
            <input id="street" name="defaultAddress.street" value={form.defaultAddress.street} onChange={handleChange} />
          </div>
        </div>

        <div className="field modern-field">
          <label htmlFor="detail">
            <MapPin size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Address Detail
          </label>
          <textarea id="detail" name="defaultAddress.detail" value={form.defaultAddress.detail} onChange={handleChange} placeholder="Enter detailed address" />
        </div>

        <div className="actions-row">
          <button
            className={`button button-primary button-large ${submitting ? 'button-loading' : ''}`}
            type="submit"
            disabled={submitting}
          >
            <UserPlus size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </div>

        <div className="auth-card-footer">
          <Link className="auth-link" to="/login">Back to login</Link>
        </div>
      </form>

      <style>{`
        .modern-auth-card {
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        .auth-card-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-card-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .auth-card-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          color: #333;
        }
        .auth-card-subtitle {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }
        .section-title {
          margin: 2rem 0 1rem 0;
          font-size: 1.3rem;
          color: #333;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e0e0e0;
        }
        .modern-field label {
          display: flex;
          align-items: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .modern-field input,
        .modern-field textarea {
          padding: 0.875rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        .modern-field input:focus,
        .modern-field textarea:focus {
          border-color: #667eea;
          outline: none;
        }
        .password-input-wrapper {
          position: relative;
        }
        .password-input-wrapper input {
          width: 100%;
          padding-right: 3rem;
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }
        .password-toggle:hover {
          color: #667eea;
        }
        .button-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 8px;
        }
        .auth-card-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
          text-align: center;
        }
        .auth-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }
        .auth-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
