import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Star, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useUserStorage } from '../utils/userStorage';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const userStorage = useUserStorage();
  const { user } = useAuth();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get('/api/clubs');
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const nextCarousel = () => {
    const hiringClubs = clubs.filter(club => isClubRecruiting(club));
    setCurrentCarouselIndex((prev) => (prev + 1) % Math.min(hiringClubs.length, 3));
  };

  const prevCarousel = () => {
    const hiringClubs = clubs.filter(club => isClubRecruiting(club));
    setCurrentCarouselIndex((prev) => (prev - 1 + Math.min(hiringClubs.length, 3)) % Math.min(hiringClubs.length, 3));
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/search', { state: { searchTerm: searchTerm.trim() } });
    }
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
      'bg-gray-400'
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
      'text-gray-800'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

  // Get user's first name
  const getFirstName = () => {
    if (!user?.name) return 'User';
    return user.name.split(' ')[0];
  };

  // Get real application data from localStorage
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Load applications from user-specific storage
    const savedApplications = userStorage.getJSON('clubApplications') || [];
    
    // Enhance applications with club data from the clubs list
    const enhancedApplications = savedApplications.map(app => {
      const clubData = clubs.find(club => club.id === app.clubId);
      return {
        ...app,
        clubLogo: clubData?.logo || null,
        clubName: clubData?.name || app.clubName
      };
    });
    
    setApplications(enhancedApplications);
    
    // Listen for application updates
    const handleApplicationUpdate = () => {
      const savedApplications = userStorage.getJSON('clubApplications') || [];
      const enhancedApplications = savedApplications.map(app => {
        const clubData = clubs.find(club => club.id === app.clubId);
        return {
          ...app,
          clubLogo: clubData?.logo || null,
          clubName: clubData?.name || app.clubName
        };
      });
      setApplications(enhancedApplications);
    };

    // Listen for new applications
    const handleNewApplication = (event) => {
      const { application } = event.detail;
      const clubData = clubs.find(club => club.id === application.clubId);
      const enhancedApplication = {
        ...application,
        clubLogo: clubData?.logo || null,
        clubName: clubData?.name || application.clubName
      };
      setApplications(prev => [...prev, enhancedApplication]);
    };

    window.addEventListener('clubApplicationAdded', handleNewApplication);
    window.addEventListener('applicationSaved', handleApplicationUpdate);
    window.addEventListener('applicationSubmitted', handleApplicationUpdate);

    return () => {
      window.removeEventListener('clubApplicationAdded', handleNewApplication);
      window.removeEventListener('applicationSaved', handleApplicationUpdate);
      window.removeEventListener('applicationSubmitted', handleApplicationUpdate);
    };
  }, [clubs, userStorage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted':
        return <Clock size={16} className="text-blue-500" />;
      case 'Interview':
        return <AlertCircle size={16} className="text-purple-500" />;
      case 'Accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Rejected':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'Incomplete':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return 'text-blue-600 bg-blue-50';
      case 'Interview':
        return 'text-purple-600 bg-purple-50';
      case 'Accepted':
        return 'text-green-600 bg-green-50';
      case 'Rejected':
        return 'text-red-600 bg-red-50';
      case 'Incomplete':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'Submitted':
        return 'Application under review';
      case 'Interview':
        return 'Interview scheduled';
      case 'Accepted':
        return 'Welcome to the club!';
      case 'Rejected':
        return 'Application not selected';
      case 'Incomplete':
        return 'Draft saved - complete to submit';
      default:
        return 'Status unknown';
    }
  };

  const isClubRecruiting = (club) => {
    // Check if club has application deadline and it's in the future
    if (!club.application_deadline) {
      return false;
    }
    
    const deadline = new Date(club.application_deadline);
    const now = new Date();
    
    // Club is recruiting if deadline is in the future
    return deadline > now;
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
      if (club.name.toLowerCase().includes('environmental') || club.name.toLowerCase().includes('sustainability')) {
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

  const isFavorite = (clubId) => {
    const favorites = userStorage.getJSON('favorites') || [];
    return favorites.some(fav => fav.id === clubId);
  };

  const handleFavorite = (club) => {
    const favorites = userStorage.getJSON('favorites') || [];
    
    if (isFavorite(club.id)) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav.id !== club.id);
      userStorage.setJSON('favorites', updatedFavorites);
    } else {
      // Add to favorites
      const newFavorite = {
        id: club.id,
        name: club.name,
        description: club.description,
        category: club.category,
        rating: club.rating,
        review_count: club.review_count,
        member_count: club.member_count,
        logo: club.logo,
        isHiring: club.isHiring,
        application_deadline: club.application_deadline
      };
      favorites.push(newFavorite);
      userStorage.setJSON('favorites', favorites);

      // Trigger notification event for liking a club
      window.dispatchEvent(new CustomEvent('clubLiked', { 
        detail: { club: club } 
      }));
    }
    
    // Force re-render
    setClubs([...clubs]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {getFirstName()}!</h1>
          <p className="text-lg text-gray-600">Discover amazing opportunities and track your applications</p>
        </div>

        {/* Quick Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleQuickSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Discover new clubs and opportunities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />

            </div>
          </form>
        </div>

        {/* Recommended Clubs Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <div className="flex space-x-2">
              <button
                onClick={prevCarousel}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button
                onClick={nextCarousel}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.filter(club => isClubRecruiting(club)).length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Clock size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No clubs are currently hiring</h3>
                <p className="text-gray-500">Check back later for new opportunities!</p>
              </div>
            ) : (
              clubs.filter(club => isClubRecruiting(club)).slice(currentCarouselIndex, currentCarouselIndex + 3).map((club) => (
              <div 
                key={club.id} 
                className="bg-white rounded-xl shadow-sm hover:scale-105 club-card-hover group relative"
                style={{
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                {/* Club Logo/Image Section */}
                <div className={`h-40 ${getClubBackground(club.name)} flex items-center justify-center relative rounded-t-xl overflow-hidden`}>
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
                    onClick={() => handleFavorite(club)}
                    className="absolute bottom-2 left-2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  >
                    <Heart 
                      size={16} 
                      className={`${isFavorite(club.id) ? 'text-red-500 fill-current' : 'text-white'}`} 
                    />
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
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isClubRecruiting(club) 
                        ? 'bg-white border border-gradient-to-r from-[#3D7AF5] to-[#0DCCF2] hover:shadow-md' 
                        : 'bg-white border border-gray-400 text-gray-600 cursor-default'
                    }`}
                    style={isClubRecruiting(club) ? {
                      borderImage: 'linear-gradient(to right, #3D7AF5, #0DCCF2) 1',
                      background: 'linear-gradient(to bottom, #3D7AF5, #0DCCF2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    } : {}}
                    onClick={() => navigate(`/club/${club.id}`)}
                  >
                    {isClubRecruiting(club) ? 'Recruiting Open' : 'Recruiting Closed'}
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Application Tracker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Application Tracker</h2>
            <button 
              onClick={() => navigate('/hiring')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No applications yet</p>
                    <p className="text-gray-400 text-sm">Click "Apply" on any club page to get started</p>
                  </div>
                ) : (
                  applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {/* Club Logo or Status Icon */}
                        <div className="flex items-center space-x-3">
                          {app.clubLogo ? (
                            <img 
                              src={app.clubLogo} 
                              alt={`${app.clubName} logo`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            getStatusIcon(app.status)
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{app.clubName}</h3>
                            <p className="text-sm text-gray-600">{getStatusDescription(app.status)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <span className="text-sm text-gray-500">{app.dateSubmitted}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/search')}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Search size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Clubs</h3>
            <p className="text-gray-600 text-sm">Discover new opportunities and find your perfect fit</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/favorites')}>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Heart size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Favorites</h3>
            <p className="text-gray-600 text-sm">View and manage your saved clubs</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/hiring')}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiring Dashboard</h3>
            <p className="text-gray-600 text-sm">Track your applications and interview progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
