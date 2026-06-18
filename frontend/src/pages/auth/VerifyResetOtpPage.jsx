import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';

const RESET_EMAIL_KEY = 'vbas.resetEmail';
const RESET_TOKEN_KEY = 'vbas.resetToken';

export default function VerifyResetOtpPage() {
  const navigate = useNavigate();
  const resetEmail = useMemo(() => sessionStorage.getItem(RESET_EMAIL_KEY) || '', []);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!resetEmail) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError('Please enter the 6-digit OTP from your email.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await authApi.verifyResetOtp({
        email: resetEmail,
        otp: normalizedOtp,
      });
      const resetToken = response?.data?.resetToken;
      if (!resetToken) {
        throw new Error('The OTP verification response is missing a reset token.');
      }
      sessionStorage.setItem(RESET_TOKEN_KEY, resetToken);
      navigate('/reset-password');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hero">
      <form className="auth-card card" style={{ maxWidth: '520px', width: '100%' }} onSubmit={handleSubmit}>
        <h1>Verify OTP</h1>
        <p>Enter the 6-digit code sent to {resetEmail}.</p>

        {error ? <div className="notice error">{error}</div> : null}

        <div className="field">
          <label htmlFor="otp">OTP Code</label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            required
            maxLength={6}
          />
        </div>

        <div className="actions-row">
          <button className="button button-primary" type="submit" disabled={submitting || otp.length !== 6}>
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>
          <Link className="button button-secondary" to="/forgot-password">Use another email</Link>
        </div>
      </form>
    </div>
  );
}
