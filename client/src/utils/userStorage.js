// Utility functions for user-specific localStorage
import { useAuth } from '../contexts/AuthContext';

// Get user-specific storage key
const getUserKey = (key, userId) => {
  return userId ? `user_${userId}_${key}` : key;
};

// User-specific localStorage functions
export const userStorage = {
  // Get item for current user
  getItem: (key, userId) => {
    const userKey = getUserKey(key, userId);
    return localStorage.getItem(userKey);
  },

  // Set item for current user
  setItem: (key, value, userId) => {
    const userKey = getUserKey(key, userId);
    localStorage.setItem(userKey, value);
  },

  // Remove item for current user
  removeItem: (key, userId) => {
    const userKey = getUserKey(key, userId);
    localStorage.removeItem(userKey);
  },

  // Get JSON item for current user
  getJSON: (key, userId) => {
    const item = userStorage.getItem(key, userId);
    return item ? JSON.parse(item) : null;
  },

  // Set JSON item for current user
  setJSON: (key, value, userId) => {
    userStorage.setItem(key, JSON.stringify(value), userId);
  },

  // Clear all user-specific data
  clearUserData: (userId) => {
    if (!userId) return;
    
    const keysToRemove = [
      'favorites',
      'clubApplications', 
      'notifications',
      'userProfile'
    ];
    
    keysToRemove.forEach(key => {
      userStorage.removeItem(key, userId);
    });
  }
};

// Hook for using user-specific storage
export const useUserStorage = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return {
    getItem: (key) => userStorage.getItem(key, userId),
    setItem: (key, value) => userStorage.setItem(key, value, userId),
    removeItem: (key) => userStorage.removeItem(key, userId),
    getJSON: (key) => userStorage.getJSON(key, userId),
    setJSON: (key, value) => userStorage.setJSON(key, value, userId),
    clearUserData: () => userStorage.clearUserData(userId)
  };
};
