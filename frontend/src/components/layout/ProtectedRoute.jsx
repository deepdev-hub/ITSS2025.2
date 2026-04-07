import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRoute } from '../../utils/roles';

export default function ProtectedRoute({ roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length > 0 && !roles.includes(user.roleName)) {
    return <Navigate to="/403" replace />;
  }

  if (location.pathname === '/app') {
    return <Navigate to={getDefaultRoute(user.roleName)} replace />;
  }

  return <Outlet />;
}
