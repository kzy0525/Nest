import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Star, Search, Filter, SortAsc, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useUserStorage } from '../utils/userStorage';

const SearchPage = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    hiringNow: false,
    ratingRange: '',
    memberCountRange: '',
    acceptanceRateRange: ''
  });
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userStorage = useUserStorage();

  useEffect(() => {
    fetchClubs();
    loadFavorites();
  }, []);

  // Refetch clubs when the page becomes visible (e.g., when navigating back from club update)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchClubs();
      }
    };

    const handleFocus = () => {
      fetchClubs();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    // Handle search term passed from home page
    if (location.state?.searchTerm) {
      setSearchTerm(location.state.searchTerm);
    }
    
    // Refetch clubs when navigating to search page (e.g., after updating a club)
    fetchClubs();
  }, [location.pathname]);

  useEffect(() => {
    filterClubs();
  }, [clubs, selectedCategories, searchTerm, sortBy, selectedFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
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
    const savedFavorites = userStorage.getJSON('favorites') || [];
    setFavorites(savedFavorites);
  };

  const filterClubs = () => {
    let filtered = [...clubs];

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(club => {
        // Handle both array and string formats for category
        if (Array.isArray(club.category)) {
          return club.category.some(cat => 
            cat && selectedCategories.some(selectedCat => 
              cat.toLowerCase() === selectedCat.toLowerCase()
            )
          );
        } else {
          // Fallback for old string format
          return club.category && selectedCategories.some(selectedCat => 
            club.category.toLowerCase() === selectedCat.toLowerCase()
          );
        }
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(club => {
        const categoryText = Array.isArray(club.category) 
          ? club.category.join(' ') 
          : (club.category || '');
        
        return club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               categoryText.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply additional filters
    if (selectedFilters.hiringNow) {
      filtered = filtered.filter(club => {
        if (!club.application_deadline) return false;
        const deadline = new Date(club.application_deadline);
        const now = new Date();
        return deadline > now;
      });
    }

    // Rating range filter
    if (selectedFilters.ratingRange) {
      const [min, max] = selectedFilters.ratingRange.split('-').map(Number);
      filtered = filtered.filter(club => {
        const rating = club.rating || 0;
        return rating >= min && rating <= max;
      });
    }

    // Member count range filter
    if (selectedFilters.memberCountRange) {
      const [min, max] = selectedFilters.memberCountRange.split('-').map(Number);
      filtered = filtered.filter(club => {
        const memberCount = club.member_count || 0;
        return memberCount >= min && memberCount <= max;
      });
    }

    // Acceptance rate range filter
    if (selectedFilters.acceptanceRateRange) {
      const [min, max] = selectedFilters.acceptanceRateRange.split('-').map(Number);
      filtered = filtered.filter(club => {
        const acceptanceRate = club.acceptance_rate || 100;
        return acceptanceRate >= min && acceptanceRate <= max;
      });
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
        meeting_location: club.meeting_location,
        logo: club.logo,
        isHiring: club.isHiring,
        application_deadline: club.application_deadline
      };
      updatedFavorites.push(newFavorite);
    }
    
    setFavorites(updatedFavorites);
    userStorage.setJSON('favorites', updatedFavorites);

    // Trigger notification event for liking a club
    if (existingIndex < 0) {
      window.dispatchEvent(new CustomEvent('clubLiked', { 
        detail: { club: club } 
      }));
    }
  };

  const isFavorite = (clubId) => {
    return favorites.some(fav => fav.id === clubId);
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
      case 'name-a-z':
        return 'Name (A to Z)';
      case 'name-z-a':
        return 'Name (Z to A)';
      default:
        return 'Sort';
    }
  };

  const handleFilterToggle = (filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const handleRangeFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedFilters.hiringNow) count++;
    if (selectedFilters.ratingRange) count++;
    if (selectedFilters.memberCountRange) count++;
    if (selectedFilters.acceptanceRateRange) count++;
    return count;
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      } else {
        return [...prev, category];
      }
    });
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


      {/* Search and Filter Section */}
      <div className="px-8 py-6" style={{ backgroundColor: '#F5F6FA' }}>
        {/* Page Title - Centered */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Clubs</h1>
          <p className="text-lg text-gray-600">Find the perfect clubs for you</p>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          {/* Search Bar - Centered */}
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Discover new clubs and opportunities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg text-gray-700 placeholder-gray-500 placeholder:text-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Category Filters - Left Side */}
          <div className="flex flex-col space-y-2">
            {/* First Row */}
            <div className="flex space-x-4">
              {['All', 'Academic', 'Arts', 'Business', 'Culture', 'Community', 'Sports'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === 'All') {
                      setSelectedCategories([]);
                    } else {
                      handleCategoryToggle(category);
                    }
                  }}
                  className={`pb-1 text-sm transition-colors ${
                    (category === 'All' && selectedCategories.length === 0) || selectedCategories.includes(category)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Second Row */}
            <div className="flex space-x-4">
              {['Health', 'Environment', 'Innovation', 'Science', 'Technology', 'Politics', 'Media', 'Social'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === 'All') {
                      setSelectedCategories([]);
                    } else {
                      handleCategoryToggle(category);
                    }
                  }}
                  className={`pb-1 text-sm transition-colors ${
                    (category === 'All' && selectedCategories.length === 0) || selectedCategories.includes(category)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
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
                <span className="text-lg">{getSortLabel()}</span>
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
                  </div>
                </div>
              )}
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative" ref={filterDropdownRef}>
              <button 
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={16} />
                <span className="text-lg">Filter</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
                {showFilterDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Options</h3>
                    
                    <div className="space-y-4">
                      {/* Hiring Now */}
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.hiringNow}
                          onChange={() => handleFilterToggle('hiringNow')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Hiring Now</span>
                      </label>
                      
                      {/* Rating Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <select
                          value={selectedFilters.ratingRange}
                          onChange={(e) => handleRangeFilterChange('ratingRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Any Rating</option>
                          <option value="0-1">0.0 - 1.0</option>
                          <option value="1-2">1.1 - 2.0</option>
                          <option value="2-3">2.1 - 3.0</option>
                          <option value="3-4">3.1 - 4.0</option>
                          <option value="4-5">4.1 - 5.0</option>
                        </select>
                      </div>
                      
                      {/* Member Count Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Count</label>
                        <select
                          value={selectedFilters.memberCountRange}
                          onChange={(e) => handleRangeFilterChange('memberCountRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Any Size</option>
                          <option value="0-25">0 - 25 members</option>
                          <option value="26-50">26 - 50 members</option>
                          <option value="51-100">51 - 100 members</option>
                          <option value="101-1000">100+ members</option>
                        </select>
                      </div>
                      
                      {/* Acceptance Rate Range */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Acceptance Rate</label>
                        <select
                          value={selectedFilters.acceptanceRateRange}
                          onChange={(e) => handleRangeFilterChange('acceptanceRateRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Any Rate</option>
                          <option value="1-25">1% - 25%</option>
                          <option value="26-50">26% - 50%</option>
                          <option value="51-75">51% - 75%</option>
                          <option value="76-100">76% - 100%</option>
                        </select>
                      </div>
                    </div>
                    
                    {getActiveFiltersCount() > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setSelectedFilters({
                              hiringNow: false,
                              ratingRange: '',
                              memberCountRange: '',
                              acceptanceRateRange: ''
                            });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#F5F6FA' }}>
        {/* Separator Line */}
        <div className="px-8">
          <div className="border-b border-gray-200"></div>
        </div>
        
        <div className="p-6">

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClubs.map((club) => (
            <div 
              key={club.id} 
              className="bg-white rounded-xl shadow-sm hover:scale-105 club-card-hover group relative"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Club Logo/Image Section */}
              <div className={`h-32 ${getClubBackground(club.name)} flex items-center justify-center relative rounded-t-xl overflow-hidden`}>
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
    </div>
  );
};

export default SearchPage;
