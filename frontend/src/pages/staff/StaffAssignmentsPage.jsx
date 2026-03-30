import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { getApiError } from '../../api/client';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

export default function StaffAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAssignments() {
      try {
        setAssignments(await companyApi.getMyAssignments());
      } catch (err) {
        setError(getApiError(err));
      }
    }
    loadAssignments();
  }, []);

  return (
    <>
      <PageHeader title="My Assignments" subtitle="Review requests assigned to you and jump into request detail." />
      {error ? <div className="notice error">{error}</div> : null}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Assigned At</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.companyName}</td>
                  <td>{assignment.vehicleCode || 'N/A'}</td>
                  <td><StatusBadge value={assignment.status} /></td>
                  <td>{assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleString() : 'N/A'}</td>
                  <td>
                    <Link className="button button-secondary" to={`/requests/${assignment.requestId}`}>
                      Open detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
