import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, ShoppingBag, Heart, Edit, RotateCcw, LogOut, Camera } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/clubs', icon: ShoppingBag, label: 'Clubs' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/hiring', icon: Edit, label: 'Hiring Dashboard' },
    { path: '/history', icon: RotateCcw, label: 'History' }
  ];

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div 
        className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
        onClick={() => navigate('/')}
      >
        <Camera size={24} className="text-white" />
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-6">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isActive(item.path)
                ? 'bg-blue-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <item.icon 
              size={24} 
              className={isActive(item.path) ? 'text-white' : 'text-gray-300'} 
            />
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-auto">
        <div 
          className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer"
          onClick={() => navigate('/login')}
          title="Logout"
        >
          <LogOut size={24} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
