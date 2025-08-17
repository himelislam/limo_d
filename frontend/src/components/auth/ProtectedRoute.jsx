import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireActiveStatus = false 
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Map frontend route roles to backend roles
  const roleMapping = {
    'admin': 'super_admin',
    'owner': 'business_owner',
    'driver': 'driver',
    'passenger': 'passenger'
  };

  const userBackendRole = user.role;
  const allowedBackendRoles = allowedRoles.map(role => roleMapping[role] || role);

  if (allowedRoles.length > 0 && !allowedBackendRoles.includes(userBackendRole)) {
    return <Navigate to="/login" replace />;
  }

  // Check business status for business owners and drivers
  if (requireActiveStatus && user.business && user.business.status !== 'active') {
    if (user.business.status === 'pending') {
      return <Navigate to="/owner/pending" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
