import { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

export default function StaffDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboard(await companyApi.getStaffDashboard());
      } catch (err) {
        setError(getApiError(err));
      }
    }
    loadDashboard();
  }, []);

  return (
    <>
      <PageHeader title="Staff Dashboard" subtitle="Track your own assignments and active requests." />
      {error ? <div className="notice error">{error}</div> : null}
      <div className="stats-grid">
        <StatCard label="Total Assignments" value={dashboard?.totalAssignments ?? 0} />
        <StatCard label="Active Assignments" value={dashboard?.activeAssignments ?? 0} />
        <StatCard label="Completed Assignments" value={dashboard?.completedAssignments ?? 0} />
        <StatCard label="Handling Requests" value={dashboard?.handlingRequests ?? 0} />
      </div>
    </>
  );
}
