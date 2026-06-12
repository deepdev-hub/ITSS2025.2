import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const tokenMissing = !token;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    if (tokenMissing) {
      setError('Token khong hop le hoac da thieu trong URL.');
      setSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError('Mat khau moi phai co it nhat 6 ky tu.');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Xac nhan mat khau khong khop.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: password,
      });
      setMessage(response?.message || 'Doi mat khau thanh cong.');
      setPassword('');
      setConfirmPassword('');
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
        <p>Nhap mat khau moi cho tai khoan cua ban.</p>

        {tokenMissing ? <div className="notice error">Khong tim thay token trong URL.</div> : null}
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
            disabled={tokenMissing || submitting}
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
            disabled={tokenMissing || submitting}
          />
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={tokenMissing || submitting}>
            {submitting ? 'Updating...' : 'Reset password'}
          </button>
          <Link className="button button-secondary" to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
