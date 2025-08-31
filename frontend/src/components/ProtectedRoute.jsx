import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null; // Optionally render a spinner

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user?.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
