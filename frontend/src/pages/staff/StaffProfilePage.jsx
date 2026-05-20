import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

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
        actions={<button className="button button-secondary" type="button" onClick={() => navigate(-1)}>Back</button>}
      />

      <div className="staff-profile-layout">
        <div className="staff-profile-hero">
          <div className="staff-profile-avatar">
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <span>{getInitials(profile.fullName)}</span>}
          </div>
          <div>
            <h2>{profile.fullName}</h2>
            <p>{profile.jobTitle || 'Rescue staff'}</p>
            <StatusBadge value={profile.status} />
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Average Rating" value={ratingLabel} />
          <StatCard label="Completed Jobs" value={profile.completedRequests ?? 0} />
          <StatCard label="Experience" value={profile.yearsExperience !== null && profile.yearsExperience !== undefined ? `${profile.yearsExperience} years` : 'N/A'} />
        </div>

        <div className="grid-two">
          <div className="card">
            <h2>Profile</h2>
            <div className="info-grid">
              <div className="info-item">
                <span>Company</span>
                <strong>{profile.companyName}</strong>
              </div>
              <div className="info-item">
                <span>Position</span>
                <strong>{profile.jobTitle || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span>Email</span>
                <strong>{profile.email || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span>Phone</span>
                <strong>{profile.phone || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Bio</h2>
            <p>{profile.bio || 'No bio has been added for this staff member yet.'}</p>
          </div>
        </div>
      </div>
    </>
  );
}
