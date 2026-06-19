import { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  Phone,
  Building,
  Briefcase,
  Star,
  Award,
  Calendar,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../common/Loader';
import Modal from '../common/Modal';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import { resolveAvatarUrl } from '../../utils/avatar';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'ST';
}

export default function StaffProfileModal({ staffId, isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !staffId) {
      return;
    }

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        setProfile(await companyApi.getStaffProfile(staffId));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isOpen, staffId]);

  const ratingLabel = useMemo(() => (
    profile?.averageRating === null || profile?.averageRating === undefined
      ? 'N/A'
      : `${Number(profile.averageRating).toFixed(2)}/5`
  ), [profile?.averageRating]);

  const staffAvatarSrc = useMemo(
    () => (profile?.avatarUrl ? resolveAvatarUrl(profile.avatarUrl) : null),
    [profile?.avatarUrl],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Staff Profile" size="large">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading && <Loader label="Loading staff profile..." />}
        
        {!loading && error && <div className="notice error">{error}</div>}
        
        {!loading && !error && !profile && <div className="notice error">Staff profile is unavailable.</div>}

        {!loading && profile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hero Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.5rem', 
              background: '#f8fafc', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                background: '#dbeafe', 
                color: '#1e40af', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.5rem', 
                fontWeight: 700,
                overflow: 'hidden'
              }}>
                {staffAvatarSrc ? (
                  <img src={staffAvatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{getInitials(profile.fullName)}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>{profile.fullName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>{profile.jobTitle || 'Rescue staff'}</p>
                  <StatusBadge value={profile.status} />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <Star size={18} color="#eab308" /> Average Rating
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{ratingLabel}</div>
              </div>
              <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <Award size={18} color="#3b82f6" /> Completed Jobs
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{profile.completedRequests ?? 0}</div>
              </div>
              <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <Calendar size={18} color="#8b5cf6" /> Experience
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {profile.yearsExperience !== null && profile.yearsExperience !== undefined ? `${profile.yearsExperience} years` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#0f172a' }}>Contact Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Building size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Company</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{profile.companyName}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Position</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{profile.jobTitle || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Mail size={18} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Phone</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{profile.phone || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#0f172a' }}>About</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>{profile.bio || 'No bio has been added for this staff member yet.'}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
