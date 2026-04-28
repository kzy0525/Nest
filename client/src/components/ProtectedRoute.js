import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireClub = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireClub && user.user_type !== 'club') {
    return <Navigate to="/" replace />;
  }

  // Redirect club users away from student-only pages
  if (!requireClub && !requireAdmin && user.user_type === 'club') {
    const path = window.location.pathname;
    if (['/hiring', '/favorites', '/profile'].includes(path) || path.endsWith('/apply')) {
      return <Navigate to="/club/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
