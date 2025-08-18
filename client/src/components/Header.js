import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Bell size={20} className="text-gray-600 cursor-pointer hover:text-gray-800" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">William Smith</div>
              <div className="text-xs text-gray-500">williamsmith@gmail.com</div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
