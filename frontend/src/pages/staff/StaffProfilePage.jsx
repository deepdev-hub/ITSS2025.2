import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Mail,
  Phone,
  Building,
  Briefcase,
  Star,
  Award,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Calendar,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { resolveAvatarUrl } from '../../utils/avatar';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';
}

export default function StaffProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        setProfile(await companyApi.getStaffProfile(id));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  const ratingLabel = useMemo(() => (
    profile?.averageRating === null || profile?.averageRating === undefined
      ? 'N/A'
      : `${Number(profile.averageRating).toFixed(2)}/5`
  ), [profile?.averageRating]);

  const staffAvatarSrc = useMemo(
    () => (profile?.avatarUrl ? resolveAvatarUrl(profile.avatarUrl) : null),
    [profile?.avatarUrl],
  );

  if (loading) {
    return <Loader label="Loading staff profile..." />;
  }

  if (error) {
    return <div className="notice error">{error}</div>;
  }

  if (!profile) {
    return <div className="notice error">Staff profile is unavailable.</div>;
  }

  return (
    <>
      <PageHeader
        title={profile.fullName}
        subtitle={profile.companyName}
        actions={<button className="button button-secondary" type="button" onClick={() => navigate(-1)}><ArrowLeft size={16} style={{ marginRight: '8px' }} />Back</button>}
      />

      <div className="staff-profile-layout">
        {/* Profile Header with Avatar */}
        <div className="staff-profile-hero">
          <div className="staff-profile-avatar">
            {staffAvatarSrc ? <img src={staffAvatarSrc} alt="" /> : <span>{getInitials(profile.fullName)}</span>}
          </div>
          <div className="staff-profile-info">
            <h2>{profile.fullName}</h2>
            <p className="staff-profile-title">{profile.jobTitle || 'Rescue staff'}</p>
            <StatusBadge value={profile.status} />
          </div>
          <button className="button button-primary staff-profile-chat">
            <MessageCircle size={18} style={{ marginRight: '8px' }} />
            Chat
          </button>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <StatCard label="Average Rating" value={ratingLabel} icon={<Star size={20} />} />
          <StatCard label="Completed Jobs" value={profile.completedRequests ?? 0} icon={<Award size={20} />} />
          <StatCard label="Experience" value={profile.yearsExperience !== null && profile.yearsExperience !== undefined ? `${profile.yearsExperience} years` : 'N/A'} icon={<Calendar size={20} />} />
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2>Contact Information</h2>
          <div className="contact-info-grid">
            <div className="contact-item">
              <div className="contact-item-icon">
                <Building size={20} />
              </div>
              <div className="contact-item-content">
                <span>Company</span>
                <strong>{profile.companyName}</strong>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">
                <Briefcase size={20} />
              </div>
              <div className="contact-item-content">
                <span>Position</span>
                <strong>{profile.jobTitle || 'N/A'}</strong>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">
                <Mail size={20} />
              </div>
              <div className="contact-item-content">
                <span>Email</span>
                <strong>{profile.email || 'N/A'}</strong>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">
                <Phone size={20} />
              </div>
              <div className="contact-item-content">
                <span>Phone</span>
                <strong>{profile.phone || 'N/A'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card">
          <h2>About</h2>
          <p className="staff-bio">{profile.bio || 'No bio has been added for this staff member yet.'}</p>
        </div>
      </div>

      <style>{`
        .staff-profile-layout {
          max-width: 900px;
          margin: 0 auto;
        }
        .staff-profile-hero {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
          margin-bottom: 2rem;
        }
        .staff-profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
          overflow: hidden;
          flex-shrink: 0;
        }
        .staff-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .staff-profile-info {
          flex: 1;
        }
        .staff-profile-info h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
        }
        .staff-profile-title {
          margin: 0 0 0.75rem 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }
        .staff-profile-chat {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .staff-profile-chat:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .contact-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          transition: background 0.2s ease;
        }
        .contact-item:hover {
          background: #e9ecef;
        }
        .contact-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .contact-item-content {
          flex: 1;
        }
        .contact-item-content span {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        .contact-item-content strong {
          font-size: 1rem;
          color: #333;
        }
        .staff-bio {
          line-height: 1.6;
          color: #555;
        }
      `}</style>
    </>
  );
}
