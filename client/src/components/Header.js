import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, CheckCircle, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Load notifications from localStorage
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear tokens, etc.)
    navigate('/login');
  };

  // Function to add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const updatedNotifications = [newNotification, ...notifications].slice(0, 50); // Keep only last 50
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Function to mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  // Listen for notification events
  useEffect(() => {
    const handleApplicationSaved = (event) => {
      const { application } = event.detail;
      addNotification({
        type: 'application_saved',
        message: `Draft saved for ${application.clubName}`,
        icon: 'Save',
        color: 'text-yellow-600'
      });
    };

    const handleApplicationSubmitted = (event) => {
      const { application } = event.detail;
      addNotification({
        type: 'application_submitted',
        message: `Application submitted to ${application.clubName}`,
        icon: 'CheckCircle',
        color: 'text-green-600'
      });
    };

    const handleClubLiked = (event) => {
      const { club } = event.detail;
      addNotification({
        type: 'club_liked',
        message: `Added ${club.name} to favorites`,
        icon: 'Heart',
        color: 'text-red-600'
      });
    };

    const handleClubHiringStarted = (event) => {
      const { club } = event.detail;
      addNotification({
        type: 'hiring_started',
        message: `${club.name} is now hiring!`,
        icon: 'Clock',
        color: 'text-blue-600'
      });
    };

    // Listen for custom events
    window.addEventListener('applicationSaved', handleApplicationSaved);
    window.addEventListener('applicationSubmitted', handleApplicationSubmitted);
    window.addEventListener('clubLiked', handleClubLiked);
    window.addEventListener('clubHiringStarted', handleClubHiringStarted);

    return () => {
      window.removeEventListener('applicationSaved', handleApplicationSaved);
      window.removeEventListener('applicationSubmitted', handleApplicationSubmitted);
      window.removeEventListener('clubLiked', handleClubLiked);
      window.removeEventListener('clubHiringStarted', handleClubHiringStarted);
    };
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Nest Logo/Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-blue-600">Nest</h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <div 
              className="relative cursor-pointer hover:text-gray-800 p-2 rounded-lg"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} className="text-gray-600" />
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                  </span>
                </div>
              )}
            </div>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    // Get icon component based on icon name
                    const getIconComponent = (iconName) => {
                      switch (iconName) {
                        case 'Save': return CheckCircle; // Using CheckCircle as save icon
                        case 'CheckCircle': return CheckCircle;
                        case 'Heart': return Heart;
                        case 'Clock': return Clock;
                        default: return CheckCircle;
                      }
                    };
                    
                    const IconComponent = getIconComponent(notification.icon);
                    const timeAgo = notification.timestamp ? 
                      new Date(notification.timestamp).toLocaleString() : 
                      'Just now';
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent size={16} className={`mt-0.5 ${notification.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-relaxed ${
                              !notification.read ? 'font-medium text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {timeAgo}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                

              </div>
            )}
          </div>



          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">Kevin Ye</div>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
