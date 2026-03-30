import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboard(await adminApi.getDashboard());
      } catch (err) {
        setError(getApiError(err));
      }
    }
    loadDashboard();
  }, []);

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of accounts, companies, requests, payments, and reviews in the system."
      />

      {error ? <div className="notice error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Total Accounts" value={dashboard?.totalAccounts ?? 0} />
        <StatCard label="Customers" value={dashboard?.totalCustomers ?? 0} />
        <StatCard label="Companies" value={dashboard?.totalCompanies ?? 0} />
        <StatCard label="Requests" value={dashboard?.totalRequests ?? 0} />
        <StatCard label="Pending Requests" value={dashboard?.pendingRequests ?? 0} />
        <StatCard label="Payments" value={dashboard?.totalPayments ?? 0} />
        <StatCard label="Paid Payments" value={dashboard?.paidPayments ?? 0} />
        <StatCard label="Reviews" value={dashboard?.totalReviews ?? 0} />
      </div>
    </>
  );
}
