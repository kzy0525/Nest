import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Heart, Edit, Plus, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Different navigation based on user type
  let navItems = [];
  
  if (user?.role === 'admin') {
    // Admin navigation
    navItems = [
      { path: '/admin', icon: Home, label: 'Admin Dashboard' },
      { path: '/register-club', icon: Plus, label: 'Register Club' },
      { path: 'logout', icon: LogOut, label: 'Logout', action: handleLogout }
    ];
  } else if (user?.user_type === 'club') {
    // Club navigation
    navItems = [
      { path: '/club/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/search', icon: Compass, label: 'Browse Clubs' },
      { path: '/club/analytics', icon: Users, label: 'Analytics' }
    ];
  } else {
    // Student navigation
    navItems = [
      { path: '/', icon: Home, label: 'Home' },
      { path: '/search', icon: Compass, label: 'Search' },
      { path: '/favorites', icon: Heart, label: 'Favorites' },
      { path: '/hiring', icon: Edit, label: 'Hiring Dashboard' }
    ];
  }

  return (
    <div className="w-20 bg-white flex flex-col items-center py-6 h-screen">


      {/* Navigation Items - Positioned higher */}
      <div className="flex flex-col items-center space-y-8" style={{ marginTop: 'calc(33vh - 180px)' }}>
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isActive(item.path)
                ? 'bg-gradient-to-b from-[#3D5CF5]/60 to-[#3DB8F5]/60'
                : 'hover:scale-110'
            }`}
            onClick={() => item.action ? item.action() : navigate(item.path)}
            title={item.label}
          >
            <item.icon
              size={24}
              className={isActive(item.path) ? 'text-white' : 'text-gray-600'}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default Sidebar;
