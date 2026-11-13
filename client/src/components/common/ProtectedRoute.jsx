import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Loader from './Loader';

/**
 * ProtectedRoute — route guard that checks authentication and role
 * Renders child routes via <Outlet /> if authorized
 */
const ProtectedRoute = ({ role }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader size="lg" text="Authenticating..." />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role — redirect to correct dashboard
  if (role && user?.role !== role) {
    const redirectMap = {
      rider: '/rider',
      driver: '/driver',
      admin: '/admin',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default ProtectedRoute;
