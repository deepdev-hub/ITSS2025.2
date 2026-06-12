import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { getApiError } from '../api/client';
import Alert from '../components/common/Alert';
import ChatModal from '../components/common/ChatModal';
import ImageUploadZone from '../components/common/ImageUploadZone';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { addAvatarCacheKey, getAvatarUrl, resolveAvatarUrl } from '../utils/avatar';

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
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word?.charAt(0)?.toUpperCase())
    .filter(Boolean)
    .join('') || '?';
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

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const { user, refreshProfile, updateProfile, uploadAvatar } = useAuth();
  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const requestedTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';
  const [activeTab, setActiveTab] = useState(requestedTab);

  const initials = useMemo(() => getInitials(user?.fullName), [user?.fullName]);
  const avatarPreview = useMemo(() => {
    const resolved = resolveAvatarUrl(getAvatarUrl(user));
    return resolved ? addAvatarCacheKey(resolved, user?.avatarUpdatedAt) : null;
  }, [user?.avatarUrl, user?.avatarUpdatedAt]);
  const isCompanyAccount = user?.roleName === 'RESCUE_COMPANY';
  const showPersonalFields = !isCompanyAccount;

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

  useEffect(() => {
    setActiveTab(requestedTab);
  }, [requestedTab]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('defaultAddress.')) {
      const key = name.replace('defaultAddress.', '');
      setProfileForm((previous) => ({
        ...previous,
        defaultAddress: { ...previous.defaultAddress, [key]: value },
      }));
      return;
    }
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    setError('');
    setNotice('');
    try {
      await uploadAvatar(file);
      setNotice('Avatar updated successfully.');
    } catch (err) {
      setError(getApiError(err));
      throw err;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        avatarUrl: profileForm.avatarUrl,
        dateOfBirth: showPersonalFields ? profileForm.dateOfBirth : null,
        gender: showPersonalFields ? profileForm.gender : null,
        cccd: showPersonalFields ? profileForm.cccd : null,
        defaultAddress: showPersonalFields ? profileForm.defaultAddress : null,
      });
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
    return <Loader label="Loading profile..." />;
  }

  return (
    <>
      <PageHeader
        icon={<User size={22} />}
        eyebrow="Account"
        title="My Profile"
        subtitle="Manage your account information, avatar, and security."
        actions={(
          <button type="button" className="button button-secondary" onClick={() => setIsChatOpen(true)}>
            <MessageCircle size={18} aria-hidden="true" />
            Support
          </button>
        )}
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Error">{error}</Alert> : null}

      <div className="profile-page">
        <section className="profile-hero card">
          <div className="profile-hero-cover" />
          <div className="profile-hero-body">
            <div className="profile-hero-avatar-wrap">
              <ImageUploadZone
                variant="avatar"
                previewSrc={avatarPreview}
                fallbackLabel={initials}
                label="Change avatar"
                uploading={uploadingAvatar}
                onUpload={handleAvatarUpload}
                onError={setError}
              />
            </div>
            <div className="profile-hero-info">
              <span className="profile-hero-badge">
                <Sparkles size={14} aria-hidden="true" />
                VBAS Rescue Member
              </span>
              <h2>{user?.fullName || 'User'}</h2>
              <p>{user?.roleName || 'CUSTOMER'}</p>
              <div className="profile-hero-meta">
                <span><Mail size={14} /> {user?.email || 'N/A'}</span>
                {!isCompanyAccount ? (
                  <span><MapPin size={14} /> {profileForm.defaultAddress.province || 'Vietnam'}</span>
                ) : null}
                <span><Calendar size={14} /> Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="profile-tabs">
          <button type="button" className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={16} /> Information
          </button>
          <button type="button" className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Lock size={16} /> Security
          </button>
        </div>

        <div className="profile-content-grid">
          <aside className="profile-sidebar card">
            <h3>About</h3>
            <ul className="profile-facts">
              <li><Shield size={16} /><span>{user?.roleName}</span></li>
              <li><Phone size={16} /><span>{profileForm.phone || 'Not updated'}</span></li>
              <li><Mail size={16} /><span>{user?.email}</span></li>
              {!isCompanyAccount ? (
                <li><MapPin size={16} /><span>{profileForm.defaultAddress.province || 'Vietnam'}</span></li>
              ) : null}
            </ul>
          </aside>

          <div className="profile-main">
            {activeTab === 'profile' ? (
              <form className="card" onSubmit={submitProfile}>
                <h3>Edit Information</h3>
                <div className="form-grid profile-form-grid">
                  <div className="field">
                    <label>Full Name</label>
                    <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                  </div>
                  {showPersonalFields ? (
                    <>
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
                    </>
                  ) : null}
                </div>

                {showPersonalFields ? (
                  <>
                    <h4 className="profile-section-title">Address</h4>
                    <div className="form-grid profile-form-grid">
                      <div className="field">
                        <label>Province/City</label>
                        <input name="defaultAddress.province" value={profileForm.defaultAddress.province} onChange={handleProfileChange} />
                      </div>
                      <div className="field">
                        <label>District</label>
                        <input name="defaultAddress.district" value={profileForm.defaultAddress.district} onChange={handleProfileChange} />
                      </div>
                      <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <label>Detail</label>
                        <textarea name="defaultAddress.detail" value={profileForm.defaultAddress.detail} onChange={handleProfileChange} />
                      </div>
                    </div>
                  </>
                ) : null}

                <div className="actions-row" style={{ marginTop: '1rem' }}>
                  <button className={`button button-primary ${savingProfile ? 'button-loading' : ''}`} type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            ) : null}

            {activeTab === 'security' ? (
              <form className="card" onSubmit={submitPassword}>
                <h3>Change Password</h3>
                <div className="form-grid profile-form-grid">
                  <div className="field">
                    <label>Current Password</label>
                    <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div className="field">
                    <label>New Password</label>
                    <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength="6" required />
                  </div>
                  <div className="field">
                    <label>Confirm Password</label>
                    <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength="6" required />
                  </div>
                </div>
                <div className="actions-row" style={{ marginTop: '1rem' }}>
                  <button className={`button button-primary ${changingPassword ? 'button-loading' : ''}`} type="submit" disabled={changingPassword}>
                    <Lock size={16} aria-hidden="true" />
                    {changingPassword ? 'Updating...' : 'Change password'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        requestId={null}
        companyName="Support Team"
        staffName="Support Agent"
      />
    </>
  );
}
