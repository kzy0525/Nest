import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Search, Filter, SortAsc, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const ClubDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClubs();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, selectedCategory, searchTerm, sortBy]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get('/api/clubs');
      setClubs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  };

  const filterClubs = () => {
    let filtered = [...clubs];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(club => {
        // Check if the club's category matches the selected category
        // Also check if any of the club's tags match the category
        const clubTags = [club.category, 'Technology', 'Business', 'Cultural', 'Engineering'];
        return clubTags.some(tag => 
          tag && tag.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort clubs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating-high-low':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-low-high':
          return (a.rating || 0) - (b.rating || 0);
        case 'members-high-low':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'members-low-high':
          return (a.member_count || 0) - (b.member_count || 0);
        case 'hiring-now':
          // For now, we'll assume all clubs are hiring. You can add a hiring field to your database later
          return 0;
        case 'name-a-z':
          return a.name.localeCompare(b.name);
        case 'name-z-a':
          return b.name.localeCompare(a.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredClubs(filtered);
  };

  const handleFavorite = (club) => {
    const updatedFavorites = [...favorites];
    const existingIndex = updatedFavorites.findIndex(fav => fav.id === club.id);
    
    if (existingIndex >= 0) {
      // Remove from favorites
      updatedFavorites.splice(existingIndex, 1);
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
        meeting_time: club.meeting_time,
        meeting_location: club.meeting_location
      };
      updatedFavorites.push(newFavorite);
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (clubId) => {
    return favorites.some(fav => fav.id === clubId);
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
      'bg-gray-900',
      'bg-gradient-to-br from-orange-400 to-pink-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500'
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
      'text-white',
      'text-white',
      'text-gray-800'
    ];
    const index = clubName.length % backgrounds.length;
    return backgrounds[index];
  };

  const getClubTags = (club) => {
    const tags = [club.category];
    
    // Add additional tags based on club characteristics
    if (club.name.toLowerCase().includes('tech') || club.name.toLowerCase().includes('technology')) {
      tags.push('Technology');
    }
    if (club.name.toLowerCase().includes('business') || club.name.toLowerCase().includes('consulting') || club.name.toLowerCase().includes('investment')) {
      tags.push('Business');
    }
    if (club.name.toLowerCase().includes('cultural') || club.name.toLowerCase().includes('vietnamese')) {
      tags.push('Cultural');
    }
    if (club.name.toLowerCase().includes('engineering') || club.name.toLowerCase().includes('hyperloop')) {
      tags.push('Engineering');
    }
    
    // Ensure we have at least 2 tags
    if (tags.length === 1) {
      tags.push('Technology');
    }
    
    return tags.slice(0, 2); // Return only first 2 tags
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'rating-high-low':
        return 'Rating (High to Low)';
      case 'rating-low-high':
        return 'Rating (Low to High)';
      case 'members-high-low':
        return 'Members (High to Low)';
      case 'members-low-high':
        return 'Members (Low to High)';
      case 'hiring-now':
        return 'Hiring Now';
      case 'name-a-z':
        return 'Name (A to Z)';
      case 'name-z-a':
        return 'Name (Z to A)';
      default:
        return 'Sort';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading clubs...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Nest Logo/Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-blue-600">Nest</h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">William Smith</div>
              <div className="text-xs text-gray-500">williamsmith@gmail.com</div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>
          </div>
          
          {/* Sort and Filter */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button 
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                <SortAsc size={16} />
                <span className="text-sm">{getSortLabel()}</span>
                {showSortDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</div>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('rating-high-low');
                        setShowSortDropdown(false);
                      }}
                    >
                      High to Low
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('rating-low-high');
                        setShowSortDropdown(false);
                      }}
                    >
                      Low to High
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Members</div>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('members-high-low');
                        setShowSortDropdown(false);
                      }}
                    >
                      High to Low
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('members-low-high');
                        setShowSortDropdown(false);
                      }}
                    >
                      Low to High
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Name</div>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('name-a-z');
                        setShowSortDropdown(false);
                      }}
                    >
                      A to Z
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('name-z-a');
                        setShowSortDropdown(false);
                      }}
                    >
                      Z to A
                    </button>
                    
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2">Status</div>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        setSortBy('hiring-now');
                        setShowSortDropdown(false);
                      }}
                    >
                      Hiring Now
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Filter size={16} />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        {/* Search Results Title and Category Filters */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Search Results</h1>
          
          {/* Category Filters */}
          <div className="flex space-x-6">
            {['All', 'Academics', 'Arts', 'Business', 'Debate', 'Environment', 'Health', 'See more'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`pb-2 transition-colors ${
                  selectedCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClubs.map((club) => (
            <div key={club.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              {/* Club Logo/Image Section */}
              <div className={`h-32 ${getClubBackground(club.name)} flex items-center justify-center relative`}>
                <div className={`text-2xl font-bold ${getClubTextColor(club.name)}`}>
                  {getClubInitials(club.name)}
                </div>
                
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
                  className="font-semibold text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => navigate(`/club/${club.id}`)}
                >
                  {club.name}
                </h3>
                
                {/* Recruiting Button - Clickable */}
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

        {/* No Results Message */}
        {filteredClubs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clubs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard; 