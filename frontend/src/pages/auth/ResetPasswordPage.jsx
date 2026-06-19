import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';

const RESET_EMAIL_KEY = 'vbas.resetEmail';
const RESET_TOKEN_KEY = 'vbas.resetToken';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const resetToken = useMemo(() => sessionStorage.getItem(RESET_TOKEN_KEY) || '', []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('The new password must be at least 6 characters.');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await authApi.resetPassword({
        resetToken,
        newPassword: password,
      });
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      sessionStorage.removeItem(RESET_TOKEN_KEY);
      setMessage(response?.message || 'Password changed successfully.');
      setPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: { notice: 'Password reset successfully. Please sign in.' },
        });
      }, 1200);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <form className="auth-card card" style={{ maxWidth: '520px', width: '100%' }} onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter a new password for your account.</p>

        {error ? <div className="notice error">{error}</div> : null}
        {message ? <div className="notice success">{message}</div> : null}

        <div className="field">
          <label htmlFor="password">New Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            disabled={submitting}
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            disabled={submitting}
          />
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Reset password'}
          </button>
          <Link className="button button-secondary" to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
