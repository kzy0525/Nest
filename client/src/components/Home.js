import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Star, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [clubs, setClubs] = useState([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    setCurrentCarouselIndex((prev) => (prev + 1) % Math.min(clubs.length, 6));
  };

  const prevCarousel = () => {
    setCurrentCarouselIndex((prev) => (prev - 1 + Math.min(clubs.length, 6)) % Math.min(clubs.length, 6));
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
      'bg-black',
      'bg-blue-600',
      'bg-white',
      'bg-blue-800',
      'bg-white',
      'bg-gray-900'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

  const getClubTextColor = (clubName) => {
    const backgrounds = [
      'text-white',
      'text-white',
      'text-gray-800',
      'text-white',
      'text-blue-800',
      'text-white'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

  // Mock application data
  const applications = [
    {
      id: 1,
      clubName: "Queen's Tech and Media Association",
      status: "pending",
      date: "2024-01-15",
      stage: "Application Review"
    },
    {
      id: 2,
      clubName: "Queen's Investment Counsel",
      status: "interview",
      date: "2024-01-20",
      stage: "Interview Scheduled"
    },
    {
      id: 3,
      clubName: "Smith Engineering Hyperloop",
      status: "accepted",
      date: "2024-01-10",
      stage: "Application Accepted"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'interview':
        return <AlertCircle size={16} className="text-blue-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'interview':
        return 'text-blue-600 bg-blue-50';
      case 'accepted':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, William!</h1>
          <p className="text-lg text-gray-600">Discover amazing opportunities and track your applications</p>
        </div>

        {/* Quick Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleQuickSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search for clubs, opportunities, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clubs.slice(currentCarouselIndex, currentCarouselIndex + 4).map((club) => (
              <div key={club.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Club Logo/Image Section */}
                <div className={`h-32 ${getClubBackground(club.name)} flex items-center justify-center relative`}>
                  <div className={`text-2xl font-bold ${getClubTextColor(club.name)}`}>
                    {getClubInitials(club.name)}
                  </div>
                  
                  {/* Heart Icon */}
                  <button className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
                    <Heart size={16} className="text-white" />
                  </button>
                  
                  {/* Rating */}
                  <div className="absolute bottom-2 right-2 text-white text-sm font-medium">
                    {club.rating ? `${club.rating.toFixed(1)} ★` : 'N/A'}
                  </div>
                </div>

                {/* Club Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-2">
                      {getClubTags(club).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{club.member_count || 'N/A'} Members</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-3 h-12 flex items-start">
                    <span className="line-clamp-2">{club.name}</span>
                  </h3>
                  
                  <button 
                    className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    onClick={() => navigate(`/club/${club.id}`)}
                  >
                    Recruiting Open
                  </button>
                </div>
              </div>
            ))}
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
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(app.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{app.clubName}</h3>
                        <p className="text-sm text-gray-600">{app.stage}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">{app.date}</span>
                    </div>
                  </div>
                ))}
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
