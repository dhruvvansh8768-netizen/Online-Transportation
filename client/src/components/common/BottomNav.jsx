import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Home, Search, Clock, User, CreditCard, LayoutDashboard, Car, Users } from 'lucide-react';

/**
 * BottomNav — mobile bottom navigation bar
 * Shows different links depending on user role
 */
const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Nav items based on role
  const getNavItems = () => {
    switch (user.role) {
      case 'rider':
        return [
          { path: '/rider', label: 'Home', icon: Home },
          { path: '/rider/search', label: 'Search', icon: Search },
          { path: '/rider/history', label: 'History', icon: Clock },
          { path: '/rider/payments', label: 'Pay', icon: CreditCard },
          { path: '/rider/profile', label: 'Profile', icon: User },
        ];
      case 'driver':
        return [
          { path: '/driver', label: 'Home', icon: Home },
          { path: '/driver/earnings', label: 'Earnings', icon: CreditCard },
          { path: '/driver/history', label: 'History', icon: Clock },
          { path: '/driver/profile', label: 'Profile', icon: User },
        ];
      case 'admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/rides', label: 'Rides', icon: Car },
          { path: '/admin/payments', label: 'Payments', icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-800 border-t border-white/10 z-50 safe-area-inset">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-200 min-w-0 ${
                isActive
                  ? 'text-accent'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-accent' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-accent rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
