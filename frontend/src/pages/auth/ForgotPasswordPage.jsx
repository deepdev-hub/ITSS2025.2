import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getApiError } from '../../api/client';
import { LifeBuoy, Mail, ArrowRight } from 'lucide-react';
import Alert from '../../components/common/Alert';

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
      <div className="auth-card card sync-auth-card">
        <div className="sync-auth-header">
          <div className="sync-auth-icon">
            <LifeBuoy size={32} />
          </div>
          <h2>Forgot Password</h2>
          <p>Enter your registered email to receive a one-time password.</p>
        </div>

        <form className="sync-auth-form" onSubmit={handleSubmit}>
          {error ? <Alert variant="error">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}

          <div className="sync-field">
            <label htmlFor="email">Email Address</label>
            <div className="sync-input-wrapper">
              <Mail size={18} className="sync-input-icon" />
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
          </div>

          <button
            className={`button button-primary sync-submit-btn ${submitting ? 'button-loading' : ''}`}
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Sending OTP...' : 'Send OTP'}
            {!submitting && <ArrowRight size={20} style={{ marginLeft: '8px' }} />}
          </button>

          <div className="sync-auth-footer">
            Remembered your password? <Link to="/login">Back to login</Link>
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
