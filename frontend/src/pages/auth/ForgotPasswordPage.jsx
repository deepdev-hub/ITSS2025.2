import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';

const RESET_EMAIL_KEY = 'vbas.resetEmail';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Please enter your registered email.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const response = await authApi.forgotPassword(normalizedEmail);
      sessionStorage.setItem(RESET_EMAIL_KEY, normalizedEmail);
      setMessage(response?.message || 'Password reset OTP sent successfully. Please check your email.');
      navigate('/verify-reset-otp');
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
        <p>Enter your registered email to receive a one-time password.</p>

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
            {submitting ? 'Sending...' : 'Send OTP'}
          </button>
          <Link className="button button-secondary" to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
