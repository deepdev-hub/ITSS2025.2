import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { ROLES } from '../utils/roles';
import HomePage from '../pages/HomePage';
import ForbiddenPage from '../pages/ForbiddenPage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CustomerVehiclesPage from '../pages/customer/CustomerVehiclesPage';
import CreateRequestPage from '../pages/customer/CreateRequestPage';
import MyRequestsPage from '../pages/customer/MyRequestsPage';
import RequestDetailPage from '../pages/customer/RequestDetailPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminAccountsPage from '../pages/admin/AdminAccountsPage';
import AdminCompaniesPage from '../pages/admin/AdminCompaniesPage';
import AdminIncidentTypesPage from '../pages/admin/AdminIncidentTypesPage';
import AdminServiceTypesPage from '../pages/admin/AdminServiceTypesPage';
import AdminRequestsPage from '../pages/admin/AdminRequestsPage';
import AdminRolesPage from '../pages/admin/AdminRolesPage';
import CompanyDashboardPage from '../pages/company/CompanyDashboardPage';
import CompanyProfilePage from '../pages/company/CompanyProfilePage';
import CompanyRequestsPage from '../pages/company/CompanyRequestsPage';
import CompanyStaffPage from '../pages/company/CompanyStaffPage';
import CompanyVehiclesPage from '../pages/company/CompanyVehiclesPage';
import StaffDashboardPage from '../pages/staff/StaffDashboardPage';
import StaffAssignmentsPage from '../pages/staff/StaffAssignmentsPage';
import ProfilePage from '../pages/ProfilePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />

          <Route element={<ProtectedRoute roles={[ROLES.CUSTOMER]} />}>
            <Route path="/customer/requests" element={<MyRequestsPage />} />
            <Route path="/customer/requests/new" element={<CreateRequestPage />} />
            <Route path="/customer/vehicles" element={<CustomerVehiclesPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/accounts" element={<AdminAccountsPage />} />
            <Route path="/admin/roles" element={<AdminRolesPage />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/incident-types" element={<AdminIncidentTypesPage />} />
            <Route path="/admin/service-types" element={<AdminServiceTypesPage />} />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.RESCUE_COMPANY]} />}>
            <Route path="/company/dashboard" element={<CompanyDashboardPage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
            <Route path="/company/requests" element={<CompanyRequestsPage />} />
            <Route path="/company/branches" element={<Navigate to="/company/profile" replace />} />
            <Route path="/company/staff" element={<CompanyStaffPage />} />
            <Route path="/company/vehicles" element={<CompanyVehiclesPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.RESCUE_STAFF]} />}>
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/assignments" element={<StaffAssignmentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
