import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);

  const handleUnlike = (clubId) => {
    const updatedFavorites = favorites.filter(club => club.id !== clubId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">William Smith</div>
                  <div className="text-xs text-gray-500">williamsmith@gmail.com</div>
                </div>
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <Heart size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Start exploring clubs and add them to your favorites!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Clubs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">William Smith</div>
                <div className="text-xs text-gray-500">williamsmith@gmail.com</div>
              </div>
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((club) => (
            <div key={club.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Club Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 relative">
                <button
                  onClick={() => handleUnlike(club.id)}
                  className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                >
                  <Heart size={20} className="text-red-500 fill-current" />
                </button>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-white">
                      {club.name.split(' ').map(word => word[0]).join('').substring(0, 4)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{club.name}</h3>
                  <span className="text-blue-100 text-sm">{club.category}</span>
                </div>
              </div>

              {/* Club Details */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {club.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{club.member_count || 'N/A'} members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star size={16} className="text-yellow-400" />
                    <span>{club.rating ? club.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>

                {/* Rating */}
                {club.rating && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex space-x-1">
                      {renderStars(Math.round(club.rating))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({club.review_count || 0} reviews)
                    </span>
                  </div>
                )}

                {/* Meeting Info */}
                <div className="space-y-2 mb-4">
                  {club.meeting_time && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{club.meeting_time}</span>
                    </div>
                  )}
                  {club.meeting_location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{club.meeting_location}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => navigate(`/club/${club.id}`)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
