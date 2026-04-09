import { useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { getApiError } from '../api/client';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';

const initialProfileForm = {
  fullName: '',
  phone: '',
  avatarUrl: '',
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

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function mapUserToForm(user) {
  return {
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    cccd: user?.cccd || '',
    defaultAddress: {
      country: user?.defaultAddress?.country || 'Vietnam',
      province: user?.defaultAddress?.province || '',
      district: user?.defaultAddress?.district || '',
      ward: user?.defaultAddress?.ward || '',
      street: user?.defaultAddress?.street || '',
      detail: user?.defaultAddress?.detail || '',
    },
  };
}

export default function ProfilePage() {
  const { user, refreshProfile, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      setError('');
      try {
        const freshUser = await refreshProfile();
        setProfileForm(mapUserToForm(freshUser || user));
      } catch (err) {
        setError(getApiError(err));
        setProfileForm(mapUserToForm(user));
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('defaultAddress.')) {
      const key = name.replace('defaultAddress.', '');
      setProfileForm((previous) => ({
        ...previous,
        defaultAddress: {
          ...previous.defaultAddress,
          [key]: value,
        },
      }));
      return;
    }
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      await updateProfile(profileForm);
      setNotice('Profile updated successfully.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setChangingPassword(true);
    setError('');
    setNotice('');
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(initialPasswordForm);
      setNotice('Password changed successfully.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <Loader label="Loading your profile..." />;
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Update your personal information and change your password without leaving the app."
      />

      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="grid-two">
        <form className="card" onSubmit={submitProfile}>
          <h2>Profile Information</h2>
          <div className="form-grid">
            <div className="field">
              <label>Email</label>
              <input value={user?.email || ''} disabled />
            </div>
            <div className="field">
              <label>Role</label>
              <input value={user?.roleName || ''} disabled />
            </div>
            <div className="field">
              <label>Full Name</label>
              <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Avatar URL</label>
              <input name="avatarUrl" value={profileForm.avatarUrl} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Gender</label>
              <input name="gender" value={profileForm.gender} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>CCCD</label>
              <input name="cccd" value={profileForm.cccd} onChange={handleProfileChange} />
            </div>
          </div>

          <h3>Default Address</h3>
          <div className="form-grid">
            <div className="field">
              <label>Country</label>
              <input name="defaultAddress.country" value={profileForm.defaultAddress.country} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Province</label>
              <input name="defaultAddress.province" value={profileForm.defaultAddress.province} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>District</label>
              <input name="defaultAddress.district" value={profileForm.defaultAddress.district} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Ward</label>
              <input name="defaultAddress.ward" value={profileForm.defaultAddress.ward} onChange={handleProfileChange} />
            </div>
            <div className="field">
              <label>Street</label>
              <input name="defaultAddress.street" value={profileForm.defaultAddress.street} onChange={handleProfileChange} />
            </div>
          </div>

          <div className="field">
            <label>Address Detail</label>
            <textarea name="defaultAddress.detail" value={profileForm.defaultAddress.detail} onChange={handleProfileChange} />
          </div>

          <button className="button button-primary" type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <form className="card" onSubmit={submitPassword}>
          <h2>Change Password</h2>
          <div className="field">
            <label>Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="field">
            <label>New Password</label>
            <input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              minLength="6"
              required
            />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              minLength="6"
              required
            />
          </div>

          <div className="card card-muted">
            <h3>Current Session</h3>
            <p><strong>Status:</strong> {user?.status}</p>
            <p><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
            <p><strong>Linked Company:</strong> {user?.companyId || 'N/A'}</p>
            <p><strong>Linked Staff Profile:</strong> {user?.staffId || 'N/A'}</p>
          </div>

          <button className="button button-secondary" type="submit" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Change password'}
          </button>
        </form>
      </div>
    </>
  );
}
