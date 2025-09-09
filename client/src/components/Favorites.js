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

  const getClubInitials = (clubName) => {
    return clubName.split(' ').map(word => word[0]).join('').substring(0, 4);
  };

  const getClubBackground = (clubName) => {
    const backgrounds = [
      'bg-gray-300',
      'bg-gray-400',
      'bg-gray-200',
      'bg-gray-500',
      'bg-gray-300',
      'bg-gray-400',
      'bg-gradient-to-br from-orange-400 to-pink-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

  const getClubTextColor = (clubName) => {
    const backgrounds = [
      'text-gray-700',
      'text-gray-800',
      'text-gray-600',
      'text-gray-900',
      'text-gray-700',
      'text-gray-800',
      'text-white',
      'text-gray-800'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

    const getClubTags = (club) => {
    let tags = [];
    
    // Handle both array and string formats for category
    if (Array.isArray(club.category)) {
      tags = [...club.category];
    } else if (club.category) {
      tags = [club.category];
    }
    
    // Add additional tags based on club characteristics if we don't have enough
    if (tags.length < 2) {
      if (club.name.toLowerCase().includes('tech') || club.name.toLowerCase().includes('technology')) {
        if (!tags.includes('Technology')) tags.push('Technology');
      }
      if (club.name.toLowerCase().includes('business') || club.name.toLowerCase().includes('consulting') || club.name.toLowerCase().includes('startup')) {
        if (!tags.includes('Business')) tags.push('Business');
      }
      if (club.name.toLowerCase().includes('cultural') || club.name.toLowerCase().includes('vietnamese') || club.name.toLowerCase().includes('arts')) {
        if (!tags.includes('Culture')) tags.push('Culture');
      }
      if (club.name.toLowerCase().includes('engineering') || club.name.toLowerCase().includes('hyperloop') || club.name.toLowerCase().includes('science')) {
        if (!tags.includes('Science')) tags.push('Science');
      }
      if (club.name.toLowerCase().includes('environmental') || club.name.toLowerCase().includes('environmental')) {
        if (!tags.includes('Environment')) tags.push('Environment');
      }
      if (club.name.toLowerCase().includes('political') || club.name.toLowerCase().includes('politics')) {
        if (!tags.includes('Politics')) tags.push('Politics');
      }
      if (club.name.toLowerCase().includes('media') || club.name.toLowerCase().includes('publications')) {
        if (!tags.includes('Media')) tags.push('Media');
      }
    }
    
    // Ensure we have at least 2 tags
    if (tags.length === 0) {
      tags.push('Technology');
    }
    if (tags.length === 1) {
      tags.push('Innovation');
    }
    
    return tags.slice(0, 2); // Return only first 2 tags
  };

  const isClubRecruiting = (club) => {
    // First check if the club is hiring
    if (club.isHiring === 'false' || club.isHiring === false) {
      return false;
    }
    
    // If no deadline, assume not recruiting
    if (!club.application_deadline) {
      return false;
    }
    
    // Check if deadline has passed
    const deadline = new Date(club.application_deadline);
    const now = new Date();
    return deadline > now;
  };

  if (favorites.length === 0) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">


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


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((club) => (
            <div key={club.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Club Logo/Image Section */}
              <div className={`h-32 ${getClubBackground(club.name)} flex items-center justify-center relative`}>
                {club.logo ? (
                  <img 
                    src={club.logo} 
                    alt={`${club.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`text-2xl font-bold ${getClubTextColor(club.name)}`}>
                    {getClubInitials(club.name)}
                  </div>
                )}
                
                {/* Heart Icon */}
                <button
                  onClick={() => handleUnlike(club.id)}
                  className="absolute bottom-2 left-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <Heart size={16} className="text-red-500 fill-current" />
                </button>
                
                {/* Rating */}
                <div className="absolute bottom-2 right-2 text-white text-sm font-medium">
                  {club.rating ? `${club.rating.toFixed(1)} ★` : 'N/A'}
                </div>
              </div>

              {/* Club Details */}
              <div className="p-4">
                {/* Tags and Member Count */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-2">
                    {getClubTags(club).map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{club.member_count || 'N/A'} Members</span>
                </div>
                
                                              {/* Club Name - Clickable */}
                  <h3 
                    className="font-semibold text-gray-900 mb-3 h-12 flex items-start cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/club/${club.id}`)}
                  >
                    <span className="line-clamp-2">{club.name}</span>
                  </h3>
                
                  {/* Recruiting Button - Clickable */}
                  <button 
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isClubRecruiting(club) 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-400 text-white cursor-default'
                    }`}
                    onClick={() => navigate(`/club/${club.id}`)}
                  >
                    {isClubRecruiting(club) ? 'Recruiting Open' : 'Recruiting Closed'}
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
