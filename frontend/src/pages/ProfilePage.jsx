import { useEffect, useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('profile');

  const initials = useMemo(() => getInitials(user?.fullName), [user?.fullName]);
  const avatarPreview = useMemo(() => {
    const resolved = resolveAvatarUrl(getAvatarUrl(user));
    return resolved ? addAvatarCacheKey(resolved, user?.avatarUpdatedAt) : null;
  }, [user?.avatarUrl, user?.avatarUpdatedAt]);

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
      setNotice('Cập nhật ảnh đại diện thành công.');
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
      await updateProfile(profileForm);
      setNotice('Cập nhật hồ sơ thành công.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
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
      setNotice('Đổi mật khẩu thành công.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <Loader label="Đang tải hồ sơ..." />;
  }

  return (
    <>
      <PageHeader
        icon={<User size={22} />}
        eyebrow="Tài khoản"
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin, ảnh đại diện và bảo mật tài khoản của bạn."
        actions={(
          <button type="button" className="button button-secondary" onClick={() => setIsChatOpen(true)}>
            <MessageCircle size={18} aria-hidden="true" />
            Hỗ trợ
          </button>
        )}
      />

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="error" title="Có lỗi">{error}</Alert> : null}

      <div className="profile-page">
        <section className="profile-hero card">
          <div className="profile-hero-cover" />
          <div className="profile-hero-body">
            <div className="profile-hero-avatar-wrap">
              <ImageUploadZone
                variant="avatar"
                previewSrc={avatarPreview}
                fallbackLabel={initials}
                label="Đổi ảnh đại diện"
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
              <h2>{user?.fullName || 'Người dùng'}</h2>
              <p>{user?.roleName || 'CUSTOMER'}</p>
              <div className="profile-hero-meta">
                <span><Mail size={14} /> {user?.email || 'N/A'}</span>
                <span><MapPin size={14} /> {profileForm.defaultAddress.province || 'Việt Nam'}</span>
                <span><Calendar size={14} /> Tham gia {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="profile-tabs">
          <button type="button" className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={16} /> Thông tin
          </button>
          <button type="button" className={`profile-tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            <Sparkles size={16} /> Ảnh đại diện
          </button>
          <button type="button" className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <Lock size={16} /> Bảo mật
          </button>
        </div>

        <div className="profile-content-grid">
          <aside className="profile-sidebar card">
            <h3>Giới thiệu</h3>
            <ul className="profile-facts">
              <li><Shield size={16} /> {user?.roleName}</li>
              <li><Phone size={16} /> {profileForm.phone || 'Chưa cập nhật'}</li>
              <li><Mail size={16} /> {user?.email}</li>
              <li><MapPin size={16} /> {profileForm.defaultAddress.province || 'Việt Nam'}</li>
            </ul>
          </aside>

          <div className="profile-main">
            {activeTab === 'profile' ? (
              <form className="card" onSubmit={submitProfile}>
                <h3>Chỉnh sửa thông tin</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Họ và tên</label>
                    <input name="fullName" value={profileForm.fullName} onChange={handleProfileChange} required />
                  </div>
                  <div className="field">
                    <label>Số điện thoại</label>
                    <input name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label>Ngày sinh</label>
                    <input name="dateOfBirth" type="date" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label>Giới tính</label>
                    <input name="gender" value={profileForm.gender} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label>CCCD</label>
                    <input name="cccd" value={profileForm.cccd} onChange={handleProfileChange} />
                  </div>
                </div>
                <h4 className="profile-section-title">Địa chỉ</h4>
                <div className="form-grid">
                  <div className="field">
                    <label>Tỉnh/Thành</label>
                    <input name="defaultAddress.province" value={profileForm.defaultAddress.province} onChange={handleProfileChange} />
                  </div>
                  <div className="field">
                    <label>Quận/Huyện</label>
                    <input name="defaultAddress.district" value={profileForm.defaultAddress.district} onChange={handleProfileChange} />
                  </div>
                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label>Chi tiết</label>
                    <textarea name="defaultAddress.detail" value={profileForm.defaultAddress.detail} onChange={handleProfileChange} />
                  </div>
                </div>
                <div className="actions-row" style={{ marginTop: '1rem' }}>
                  <button className={`button button-primary ${savingProfile ? 'button-loading' : ''}`} type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            ) : null}

            {activeTab === 'photos' ? (
              <div className="card profile-photos-card">
                <h3>Ảnh đại diện</h3>
                <p className="muted-line">Nhấn vào vùng bên dưới hoặc kéo thả ảnh để tải lên. Ảnh sẽ hiển thị ngay sau khi upload thành công.</p>
                <ImageUploadZone
                  previewSrc={avatarPreview}
                  fallbackLabel={initials}
                  label="Tải ảnh đại diện"
                  hint="JPEG, PNG, WebP, GIF — tối đa 5MB"
                  uploading={uploadingAvatar}
                  onUpload={handleAvatarUpload}
                  onError={setError}
                />
              </div>
            ) : null}

            {activeTab === 'security' ? (
              <form className="card" onSubmit={submitPassword}>
                <h3>Đổi mật khẩu</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Mật khẩu hiện tại</label>
                    <input name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
                  </div>
                  <div className="field">
                    <label>Mật khẩu mới</label>
                    <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} minLength="6" required />
                  </div>
                  <div className="field">
                    <label>Xác nhận mật khẩu</label>
                    <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} minLength="6" required />
                  </div>
                </div>
                <div className="actions-row" style={{ marginTop: '1rem' }}>
                  <button className={`button button-primary ${changingPassword ? 'button-loading' : ''}`} type="submit" disabled={changingPassword}>
                    <Lock size={16} aria-hidden="true" />
                    {changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
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
