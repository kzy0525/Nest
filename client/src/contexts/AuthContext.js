import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Set user immediately from localStorage for better UX
      setUser(JSON.parse(userData));
      setLoading(false);
      
      // Verify token in background
      axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (!response.data.success) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      })
      .catch(() => {
        // Token verification failed, but don't clear immediately
        // Let the user try to use the app, it will fail on next API call
        console.warn('Token verification failed, but keeping user logged in');
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    // Clear any existing user-specific data
    clearUserData();
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const clearUserData = () => {
    // Clear all user-specific data from localStorage
    const keysToRemove = [
      'favorites',
      'clubApplications', 
      'notifications',
      'userProfile'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const logout = () => {
    clearUserData();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
