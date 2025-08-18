import React from 'react';
import { Home, Compass, ShoppingBag, Heart, RotateCcw, LogOut, Camera } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
        <Camera size={24} className="text-white" />
      </div>

      {/* Navigation Icons */}
      <div className="flex flex-col items-center space-y-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Home size={24} className="text-white" />
        </div>
        
        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
          <Compass size={24} className="text-gray-300" />
        </div>
        
        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
          <ShoppingBag size={24} className="text-gray-300" />
        </div>
        
        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
          <Heart size={24} className="text-gray-300" />
        </div>
        
        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
          <RotateCcw size={24} className="text-gray-300" />
        </div>
      </div>

      {/* Logout */}
      <div className="mt-auto">
        <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
          <LogOut size={24} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
