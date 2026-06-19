import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Vui long nhap email da dang ky.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.forgotPassword(normalizedEmail);
      setMessage(response?.message || 'Neu email da dang ky, vui long kiem tra hop thu de dat lai mat khau.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <form className="auth-card card" style={{ maxWidth: '520px', width: '100%' }} onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Nhap email da dang ky de nhan link dat lai mat khau.</p>

        {error ? <div className="notice error">{error}</div> : null}
        {message ? <div className="notice success">{message}</div> : null}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
          <Link className="button button-secondary" to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
