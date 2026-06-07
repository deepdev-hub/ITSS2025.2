import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Lock, Moon, Sun, Settings, Camera, Edit3, MapPin, Calendar, Mail, Phone, Shield, MoreHorizontal } from 'lucide-react';
import { authApi } from '../api/authApi';
import { getApiError } from '../api/client';
import Loader from '../components/common/Loader';
import PageHeader from '../components/common/PageHeader';
import ChatModal from '../components/common/ChatModal';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

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

  const initials = getInitials(user?.fullName);
  const rawAvatar = getAvatarUrl(user);
  const resolvedDisplayUrl = resolveAvatarUrl(rawAvatar);
  const displayUrl = resolvedDisplayUrl;

  return (
    <>
      {/* Dark Mode Toggle */}
      <button
        className="dark-mode-toggle-profile"
        onClick={toggleDarkMode}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {/* Facebook-like Profile Layout */}
      <div className="fb-profile-container">
        {/* Cover Photo */}
        <div className="fb-cover-photo">
          <div className="fb-cover-gradient"></div>
          <button className="fb-cover-camera">
            <Camera size={20} />
          </button>
        </div>

        {/* Profile Header */}
        <div className="fb-profile-header">
          <div className="fb-profile-avatar-container">
            {displayUrl ? (
              <img src={displayUrl} alt="Profile" className="fb-profile-avatar" />
            ) : (
              <div className="fb-profile-avatar fb-avatar-initials">{initials}</div>
            )}
            <button className="fb-avatar-camera">
              <Camera size={18} />
            </button>
          </div>

          <div className="fb-profile-info">
            <h1 className="fb-profile-name">{user?.fullName || 'User'}</h1>
            <p className="fb-profile-bio">{user?.roleName || 'Rescue Service Member'}</p>
            <div className="fb-profile-meta">
              <span className="fb-meta-item">
                <MapPin size={14} style={{ marginRight: '4px' }} />
                {profileForm.defaultAddress.province || 'Vietnam'}
              </span>
              <span className="fb-meta-item">
                <Calendar size={14} style={{ marginRight: '4px' }} />
                Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </span>
            </div>
          </div>

          <div className="fb-profile-actions">
            <button
              className="fb-action-button fb-primary"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
            >
              <Edit3 size={16} style={{ marginRight: '6px' }} />
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </button>
            <button
              className="fb-action-button fb-secondary"
              onClick={() => setIsChatOpen(true)}
            >
              <MessageCircle size={16} style={{ marginRight: '6px' }} />
              Message
            </button>
            <button
              className="fb-action-button fb-icon-only"
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="fb-action-button fb-icon-only">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="fb-tabs-container">
          <div className="fb-tabs">
            <button
              className={`fb-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            <button
              className={`fb-tab ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
            <button
              className={`fb-tab ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </button>
            <button
              className={`fb-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="fb-profile-content">
          <div className="fb-content-grid">
            {/* Left Sidebar */}
            <div className="fb-sidebar">
              <div className="fb-sidebar-card">
                <h3 className="fb-sidebar-title">Intro</h3>
                <div className="fb-sidebar-item">
                  <Shield size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                  <span>{user?.roleName || 'Rescue Service Member'}</span>
                </div>
                <div className="fb-sidebar-item">
                  <MapPin size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                  <span>Lives in {profileForm.defaultAddress.province || 'Vietnam'}</span>
                </div>
                <div className="fb-sidebar-item">
                  <Mail size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                  <span>{user?.email || 'N/A'}</span>
                </div>
                <div className="fb-sidebar-item">
                  <Phone size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                  <span>{profileForm.phone || 'N/A'}</span>
                </div>
                <div className="fb-sidebar-item">
                  <Calendar size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                  <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="fb-sidebar-card">
                <h3 className="fb-sidebar-title">Photos</h3>
                <div className="fb-photos-grid">
                  <div className="fb-photo-placeholder">
                    <Camera size={24} />
                  </div>
                  <div className="fb-photo-placeholder">
                    <Camera size={24} />
                  </div>
                  <div className="fb-photo-placeholder">
                    <Camera size={24} />
</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="fb-main-content">
              {activeTab === 'about' && (
                <>
                  {isEditingProfile ? (
                    <form className="fb-edit-form" onSubmit={submitProfile}>
                      <div className="fb-card">
                        <h3 className="fb-card-title">Edit Profile</h3>

                        <div className="fb-form-group">
                          <label>Full Name</label>
                          <input
                            name="fullName"
                            value={profileForm.fullName}
                            onChange={handleProfileChange}
                            required
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>Phone</label>
                          <input
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>Date of Birth</label>
                          <input
                            name="dateOfBirth"
                            type="date"
                            value={profileForm.dateOfBirth}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>Gender</label>
                          <input
                            name="gender"
                            value={profileForm.gender}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>CCCD</label>
                          <input
                            name="cccd"
                            value={profileForm.cccd}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <h4 className="fb-section-title">Address</h4>

                        <div className="fb-form-group">
                          <label>Province</label>
                          <input
                            name="defaultAddress.province"
                            value={profileForm.defaultAddress.province}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>District</label>
                          <input
                            name="defaultAddress.district"
                            value={profileForm.defaultAddress.district}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-group">
                          <label>Address Detail</label>
                          <textarea
                            name="defaultAddress.detail"
                            value={profileForm.defaultAddress.detail}
                            onChange={handleProfileChange}
                          />
                        </div>

                        <div className="fb-form-actions">
                          <button
                            type="submit"
                            className="fb-button fb-primary"
                            disabled={savingProfile}
                          >
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            className="fb-button fb-secondary"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="fb-card">
                      <h3 className="fb-card-title">About</h3>
                      <div className="fb-about-section">
                        <div className="fb-about-item">
                          <Shield size={20} style={{ marginRight: '12px', color: '#667eea' }} />
                          <div>
                            <strong>Role</strong>
                            <p>{user?.roleName || 'Rescue Service Member'}</p>
                          </div>
                        </div>
                        <div className="fb-about-item">
                          <MapPin size={20} style={{ marginRight: '12px', color: '#667eea' }} />
                          <div>
                            <strong>Location</strong>
                            <p>{profileForm.defaultAddress.province || 'Vietnam'}</p>
                          </div>
                        </div>
                        <div className="fb-about-item">
                          <Mail size={20} style={{ marginRight: '12px', color: '#667eea' }} />
                          <div>
                            <strong>Email</strong>
                            <p>{user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="fb-about-item">
                          <Phone size={20} style={{ marginRight: '12px', color: '#667eea' }} />
                          <div>
                            <strong>Phone</strong>
                            <p>{profileForm.phone || 'N/A'}</p>
                          </div>
                        </div>
                        {profileForm.dateOfBirth && (
                          <div className="fb-about-item">
                            <Calendar size={20} style={{ marginRight: '12px', color: '#667eea' }} />
                            <div>
                              <strong>Birthday</strong>
                              <p>{new Date(profileForm.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'photos' && (
                <div className="fb-card">
                  <h3 className="fb-card-title">Photos</h3>
                  <div className="fb-photos-large-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="fb-photo-large-placeholder">
                        <Camera size={32} />
                        <span>No photos yet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'friends' && (
                <div className="fb-card">
                  <h3 className="fb-card-title">Friends</h3>
                  <p className="fb-empty-state">No friends to show</p>
                </div>
              )}

              {activeTab === 'settings' && (
                <form className="fb-card" onSubmit={submitPassword}>
                  <h3 className="fb-card-title">Change Password</h3>
                  <div className="fb-form-group">
                    <label>Current Password</label>
                    <input
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="fb-form-group">
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
                  <div className="fb-form-group">
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
                  <div className="fb-form-actions">
                    <button
                      type="submit"
                      className="fb-button fb-primary"
                      disabled={changingPassword}
                    >
                      <Lock size={16} style={{ marginRight: '8px' }} />
                      {changingPassword ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        requestId={null}
        companyName="Support Team"
        staffName="Support Agent"
      />

      <style>{`
        .dark-mode-toggle-profile {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .dark-mode-toggle-profile:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .fb-profile-container {
          max-width: 1200px;
          margin: 0 auto;
          background: #f0f2f5;
          min-height: 100vh;
        }
        .fb-cover-photo {
          height: 350px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        .fb-cover-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
        }
        .fb-cover-camera {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.3s ease;
        }
        .fb-cover-camera:hover {
          background: white;
          transform: scale(1.1);
        }
        .fb-profile-header {
          background: white;
          padding: 0 32px 32px;
          position: relative;
          margin-top: -100px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .fb-profile-avatar-container {
          position: relative;
          width: 168px;
          height: 168px;
          margin-bottom: 16px;
        }
        .fb-profile-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid white;
          object-fit: cover;
          background: #e0e0e0;
        }
        .fb-avatar-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
        }
        .fb-avatar-camera {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #667eea;
          border: 3px solid white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
        }
        .fb-avatar-camera:hover {
          background: #764ba2;
          transform: scale(1.1);
        }
        .fb-profile-info {
          margin-bottom: 20px;
        }
        .fb-profile-name {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }
        .fb-profile-bio {
          font-size: 1.1rem;
          color: #65676b;
          margin: 0 0 12px 0;
        }
        .fb-profile-meta {
          display: flex;
          gap: 16px;
          color: #65676b;
          font-size: 0.95rem;
        }
        .fb-meta-item {
          display: flex;
          align-items: center;
        }
        .fb-profile-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .fb-action-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          border: none;
        }
        .fb-primary {
          background: #667eea;
          color: white;
        }
        .fb-primary:hover {
          background: #764ba2;
        }
        .fb-secondary {
          background: #e4e6eb;
          color: #1a1a1a;
        }
        .fb-secondary:hover {
          background: #d8dadf;
        }
        .fb-icon-only {
          width: 40px;
          height: 40px;
          padding: 0;
          justify-content: center;
          background: #e4e6eb;
          color: #1a1a1a;
        }
        .fb-icon-only:hover {
          background: #d8dadf;
        }
        .fb-tabs-container {
          background: white;
          border-bottom: 1px solid #ced0d4;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .fb-tabs {
          display: flex;
          gap: 32px;
          padding: 0 32px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .fb-tab {
          padding: 16px 0;
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: #65676b;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        .fb-tab:hover {
          color: #1a1a1a;
        }
        .fb-tab.active {
          color: #667eea;
        }
        .fb-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #667eea;
          border-radius: 3px 3px 0 0;
        }
        .fb-profile-content {
          padding: 32px;
        }
        .fb-content-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .fb-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .fb-sidebar-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .fb-sidebar-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }
        .fb-sidebar-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          color: #65676b;
          font-size: 0.95rem;
        }
        .fb-photos-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .fb-photo-placeholder {
          aspect-ratio: 1;
          background: #e4e6eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #65676b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fb-photo-placeholder:hover {
          background: #d8dadf;
        }
        .fb-main-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .fb-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .fb-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }
        .fb-about-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .fb-about-item {
          display: flex;
          align-items: flex-start;
          padding: 12px;
          background: #f0f2f5;
          border-radius: 8px;
        }
        .fb-about-item strong {
          display: block;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .fb-about-item p {
          margin: 0;
          color: #65676b;
        }
        .fb-edit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .fb-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .fb-form-group label {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.95rem;
        }
        .fb-form-group input,
        .fb-form-group textarea {
          padding: 12px;
          border: 1px solid #ced0d4;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }
        .fb-form-group input:focus,
        .fb-form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        .fb-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 16px 0 12px 0;
        }
        .fb-form-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .fb-button {
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .fb-button.fb-primary {
          background: #667eea;
          color: white;
        }
        .fb-button.fb-primary:hover {
          background: #764ba2;
        }
        .fb-button.fb-secondary {
          background: #e4e6eb;
          color: #1a1a1a;
        }
        .fb-button.fb-secondary:hover {
          background: #d8dadf;
        }
        .fb-photos-large-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .fb-photo-large-placeholder {
          aspect-ratio: 1;
          background: #f0f2f5;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #65676b;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .fb-photo-large-placeholder:hover {
          background: #e4e6eb;
        }
        .fb-empty-state {
          color: #65676b;
          text-align: center;
          padding: 40px 0;
        }
        /* Dark mode styles */
        .dark-mode .fb-profile-container {
          background: #18191a;
        }
        .dark-mode .fb-profile-header {
          background: #242526;
          color: #e4e6eb;
        }
        .dark-mode .fb-profile-name {
          color: #e4e6eb;
        }
        .dark-mode .fb-profile-bio {
          color: #b0b3b8;
        }
        .dark-mode .fb-profile-meta {
          color: #b0b3b8;
        }
        .dark-mode .fb-tabs-container {
          background: #242526;
          border-color: #3e4042;
        }
        .dark-mode .fb-tab {
          color: #b0b3b8;
        }
        .dark-mode .fb-tab:hover {
          color: #e4e6eb;
        }
        .dark-mode .fb-sidebar-card,
        .dark-mode .fb-card {
          background: #242526;
        }
        .dark-mode .fb-sidebar-title,
        .dark-mode .fb-card-title,
        .dark-mode .fb-section-title {
          color: #e4e6eb;
        }
        .dark-mode .fb-sidebar-item {
          color: #b0b3b8;
        }
        .dark-mode .fb-about-item {
          background: #3e4042;
        }
        .dark-mode .fb-about-item strong {
          color: #e4e6eb;
        }
        .dark-mode .fb-about-item p {
          color: #b0b3b8;
        }
        .dark-mode .fb-form-group label {
          color: #e4e6eb;
        }
        .dark-mode .fb-form-group input,
        .dark-mode .fb-form-group textarea {
          background: #3e4042;
          color: #e4e6eb;
          border-color: #3e4042;
        }
        .dark-mode .fb-form-group input:focus,
        .dark-mode .fb-form-group textarea:focus {
          border-color: #667eea;
        }
        .dark-mode .fb-secondary,
        .dark-mode .fb-icon-only {
          background: #3e4042;
          color: #e4e6eb;
        }
        .dark-mode .fb-secondary:hover,
        .dark-mode .fb-icon-only:hover {
          background: #4e4f50;
        }
        .dark-mode .fb-photo-placeholder,
        .dark-mode .fb-photo-large-placeholder {
          background: #3e4042;
          color: #b0b3b8;
        }
        .dark-mode .fb-photo-placeholder:hover,
        .dark-mode .fb-photo-large-placeholder:hover {
          background: #4e4f50;
        }
        .dark-mode .fb-empty-state {
          color: #b0b3b8;
        }
      `}</style>
    </>
  );
}
