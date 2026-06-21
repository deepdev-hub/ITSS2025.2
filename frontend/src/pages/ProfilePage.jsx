import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  User,
  Edit2,
  Key,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { getApiError } from '../api/client';
import Alert from '../components/common/Alert';
import ImageUploadZone from '../components/common/ImageUploadZone';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
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
  const requestedTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';
  const [activeTab, setActiveTab] = useState(requestedTab);
  const [passwordStep, setPasswordStep] = useState(1);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const initials = useMemo(() => getInitials(user?.fullName), [user?.fullName]);
  const avatarPreview = useMemo(() => {
    const resolved = resolveAvatarUrl(getAvatarUrl(user));
    return resolved ? addAvatarCacheKey(resolved, user?.avatarUpdatedAt) : null;
  }, [user]);
  const isCompanyAccount = user?.roleName === 'RESCUE_COMPANY';
  const showIdentityFields = !isCompanyAccount;
  const showAddressFields = !isCompanyAccount && user?.roleName !== 'ADMIN';

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
  }, [refreshProfile]);

  useEffect(() => {
    setProfileForm(mapUserToForm(user));
  }, [user]);

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
        dateOfBirth: showIdentityFields ? profileForm.dateOfBirth : null,
        gender: showIdentityFields ? profileForm.gender : null,
        cccd: showIdentityFields ? profileForm.cccd : null,
        defaultAddress: showAddressFields ? profileForm.defaultAddress : null,
      });
      setNotice('Profile updated successfully.');
      setIsEditProfileOpen(false);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const verifyCurrentPassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) return;
    setVerifyingPassword(true);
    setError(null);
    try {
      await authApi.login({ email: user.email, password: passwordForm.currentPassword });
      setPasswordStep(2);
    } catch (err) {
      setError(getApiError(err) || 'Incorrect current password.');
    } finally {
      setVerifyingPassword(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setChangingPassword(true);
    setError(null);
    setNotice(null);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setNotice('Password changed successfully.');
      setIsChangePasswordOpen(false);
      setPasswordStep(1);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Error">{error}</Alert> : null}

      <div className="profile-page">
        <section className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
          <div style={{ flexShrink: 0, width: '120px', height: '120px' }}>
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
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text)' }}>{user?.fullName || 'User'}</h2>
              <span className="profile-hero-badge" style={{ margin: 0, background: 'var(--primary-soft)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} aria-hidden="true" />
                {user?.roleName || 'RESCUE_STAFF'}
              </span>
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--muted)', fontSize: '0.95rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={16} /> {user?.email || 'N/A'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={16} /> {profileForm.phone || 'Not updated'}</span>
              {showAddressFields && profileForm.defaultAddress.province ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={16} /> {profileForm.defaultAddress.province}</span>
              ) : null}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={16} /> Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
            </div>
          </div>
        </section>

        <div className="profile-tabs" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <button type="button" className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={16} /> Information
          </button>
          <button type="button" className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Lock size={16} /> Security
          </button>
        </div>

        <div className="profile-main" style={{ minWidth: 0 }}>
            {activeTab === 'profile' ? (
              <div className="card">
                <div className="section-header">
                  <div>
                    <h3>Information</h3>
                    <p>Your personal details and address</p>
                  </div>
                  <button className="button button-secondary" type="button" onClick={() => setIsEditProfileOpen(true)}>
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
                
                <div className="info-grid" style={{ marginTop: '1.5rem' }}>
                  <div className="info-item">
                    <span>Full Name</span>
                    <strong>{profileForm.fullName || 'N/A'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Phone</span>
                    <strong>{profileForm.phone || 'N/A'}</strong>
                  </div>
                  {showIdentityFields ? (
                    <>
                      <div className="info-item">
                        <span>Date of Birth</span>
                        <strong>{profileForm.dateOfBirth || 'N/A'}</strong>
                      </div>
                      <div className="info-item">
                        <span>Gender</span>
                        <strong>{profileForm.gender || 'N/A'}</strong>
                      </div>
                      <div className="info-item">
                        <span>CCCD</span>
                        <strong>{profileForm.cccd || 'N/A'}</strong>
                      </div>
                    </>
                  ) : null}
                </div>

                {showAddressFields ? (
                  <>
                    <h4 className="profile-section-title" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Address</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span>Province/City</span>
                        <strong>{profileForm.defaultAddress.province || 'N/A'}</strong>
                      </div>
                      <div className="info-item">
                        <span>District</span>
                        <strong>{profileForm.defaultAddress.district || 'N/A'}</strong>
                      </div>
                      <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                        <span>Detail</span>
                        <strong>{profileForm.defaultAddress.detail || 'N/A'}</strong>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {activeTab === 'security' ? (
              <div className="card">
                <div className="section-header">
                  <div>
                    <h3>Security</h3>
                    <p>Manage your password and security settings</p>
                  </div>
                  <button className="button button-secondary" type="button" onClick={() => setIsChangePasswordOpen(true)}>
                    <Key size={16} /> Change Password
                  </button>
                </div>
                <div className="section-banner section-banner-info" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Shield size={20} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Password is set</strong>
                    <span style={{ fontSize: '0.9rem' }}>It's a good idea to use a strong password that you're not using elsewhere to keep your account secure.</span>
                  </div>
                </div>
              </div>
            ) : null}
        </div>
      </div>

      <Modal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        title="Edit Information"
        size="large"
      >
        <form onSubmit={submitProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-grid profile-form-grid">
            <div className="field">
              <label>Full Name</label>
              <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
            </div>
            {showIdentityFields ? (
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

          {showAddressFields ? (
            <div>
              <h4 className="profile-section-title" style={{ marginBottom: '1rem' }}>Address</h4>
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
                  <textarea name="defaultAddress.detail" value={profileForm.defaultAddress.detail} onChange={handleProfileChange} style={{ minHeight: '80px' }} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="actions-row" style={{ marginTop: '0.5rem', justifyContent: 'flex-end' }}>
            <button className="button button-secondary" type="button" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </button>
            <button className={`button button-primary ${savingProfile ? 'button-loading' : ''}`} type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>

      {passwordStep === 1 ? (
        <Modal 
          isOpen={isChangePasswordOpen} 
          onClose={() => {
            setIsChangePasswordOpen(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }} 
          title="Verify Current Password"
        >
          <form onSubmit={verifyCurrentPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--muted)', margin: '-0.5rem 0 0.5rem 0' }}>
              Please enter your current password to continue.
            </p>
            <div className="field">
              <label>Current Password</label>
              <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
            </div>
            
            <div className="actions-row" style={{ marginTop: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="button button-secondary" type="button" onClick={() => {
                setIsChangePasswordOpen(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                Cancel
              </button>
              <button className={`button button-primary ${verifyingPassword ? 'button-loading' : ''}`} type="submit" disabled={verifyingPassword}>
                Continue
              </button>
            </div>
          </form>
        </Modal>
      ) : (
        <Modal 
          isOpen={isChangePasswordOpen} 
          onClose={() => {
            setIsChangePasswordOpen(false);
            setPasswordStep(1);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }} 
          title="Create New Password"
        >
          <form onSubmit={submitPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="field">
              <label>New Password</label>
              <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength="6" required />
            </div>
            <div className="field">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength="6" required />
            </div>
            
            <div className="actions-row" style={{ marginTop: '0.5rem', justifyContent: 'space-between' }}>
              <button className="button button-secondary" type="button" onClick={() => setPasswordStep(1)}>
                Back
              </button>
              <button className={`button button-primary ${changingPassword ? 'button-loading' : ''}`} type="submit" disabled={changingPassword}>
                <Lock size={16} aria-hidden="true" />
                {changingPassword ? 'Updating...' : 'Change password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </>
  );
}
