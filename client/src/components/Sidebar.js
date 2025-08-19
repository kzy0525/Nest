import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Heart, Edit } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Compass, label: 'Search' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/hiring', icon: Edit, label: 'Hiring Dashboard' }
  ];

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-6 h-screen">


      {/* Navigation Items - Vertically Centered */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
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

    </div>
  );
};

export default Sidebar;
