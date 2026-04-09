import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/roles';

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
    <div className="hero">
      <form className="auth-card card" style={{ maxWidth: '860px', width: '100%' }} onSubmit={handleSubmit}>
        <h1>Create Customer Account</h1>
        <p>This registration form creates a `CUSTOMER` account and stores the basic profile and default address immediately.</p>

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
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="gender">Gender</label>
            <input id="gender" name="gender" value={form.gender} onChange={handleChange} placeholder="Optional" />
          </div>

          <div className="field">
            <label htmlFor="cccd">CCCD</label>
            <input id="cccd" name="cccd" value={form.cccd} onChange={handleChange} placeholder="Optional" />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
          </div>
        </div>

        <h2>Default Address</h2>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="country">Country</label>
            <input id="country" name="defaultAddress.country" value={form.defaultAddress.country} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="province">Province</label>
            <input id="province" name="defaultAddress.province" value={form.defaultAddress.province} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="district">District</label>
            <input id="district" name="defaultAddress.district" value={form.defaultAddress.district} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="ward">Ward</label>
            <input id="ward" name="defaultAddress.ward" value={form.defaultAddress.ward} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="street">Street</label>
            <input id="street" name="defaultAddress.street" value={form.defaultAddress.street} onChange={handleChange} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="detail">Address Detail</label>
          <textarea id="detail" name="defaultAddress.detail" value={form.defaultAddress.detail} onChange={handleChange} />
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
