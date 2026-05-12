import { useEffect, useRef, useState } from 'react';
import { authApi } from '../api/authApi';
import { getApiError } from '../api/client';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { addAvatarCacheKey, getAvatarUrl, resolveAvatarUrl } from '../utils/avatar';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

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

function getInitials(fullName) {
  if (typeof fullName !== 'string') return '?';

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word?.charAt(0)?.toUpperCase())
    .filter(Boolean)
    .join('');

  return initials || '?';
}

function mapUserToForm(user) {
  return {
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    avatarUrl: getAvatarUrl(user),
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

function AvatarUpload({ user, onUploadSuccess, onError }) {
  const { uploadAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const rawAvatar = previewUrl || getAvatarUrl(user);
  const initials = getInitials(user?.fullName);
  const resolvedDisplayUrl = resolveAvatarUrl(rawAvatar);
  const displayUrl = imageError ? null : addAvatarCacheKey(resolvedDisplayUrl, user?.avatarUpdatedAt);

  useEffect(() => {
    setImageError(false);
  }, [rawAvatar]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError('Please select a valid image file (JPEG, PNG, WebP, or GIF).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return objectUrl;
    });
    setImageError(false);

    setUploading(true);
    onError('');
    try {
      const updatedUser = await uploadAvatar(file);
      setPreviewUrl((previous) => {
        if (previous?.startsWith('blob:')) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
      onUploadSuccess('Avatar updated successfully.', updatedUser);
    } catch (err) {
      setPreviewUrl((previous) => {
        if (previous?.startsWith('blob:')) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
      onError(getApiError(err));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="avatar-upload-block">
      <div className="avatar-preview-wrap">
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="avatar-preview"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="avatar-preview avatar-initials-lg">{initials}</span>
        )}
        {uploading && (
          <div className="avatar-overlay">
            <div className="avatar-spinner" />
          </div>
        )}
      </div>
      <div className="avatar-upload-info">
        <p className="avatar-upload-hint">
          JPEG, PNG, WebP or GIF - Max {MAX_FILE_SIZE_MB}MB
        </p>
        <button
          type="button"
          className="button button-secondary"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : 'Change avatar'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
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

  useEffect(() => {
    setProfileForm((previous) => ({
      ...previous,
      avatarUrl: getAvatarUrl(user),
    }));
  }, [user?.avatarUrl, user?.avatarUpdatedAt]);

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

          <AvatarUpload
            user={user}
            onUploadSuccess={(msg, updatedUser) => {
              setProfileForm((previous) => ({
                ...previous,
                avatarUrl: getAvatarUrl(updatedUser) || previous.avatarUrl,
              }));
              setNotice(msg);
              setError('');
            }}
            onError={(msg) => { setError(msg); setNotice(''); }}
          />

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
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
            <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
          </div>
          <div className="field">
            <label>New Password</label>
            <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength="6" required />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength="6" required />
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
