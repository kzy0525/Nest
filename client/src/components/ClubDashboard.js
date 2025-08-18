import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Heart, Filter, SortAsc } from 'lucide-react';
import axios from 'axios';
import Header from './Header';

const ClubDashboard = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchClubs();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortClubs();
  }, [clubs, searchTerm, selectedCategory, sortBy, sortOrder]);

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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterAndSortClubs = () => {
    let filtered = [...clubs];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort clubs
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'rating' || sortBy === 'member_count' || sortBy === 'review_count') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'ASC') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredClubs(filtered);
  };

  const handleClubClick = (clubId) => {
    navigate(`/club/${clubId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} fill="currentColor" style={{ opacity: 0.5 }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="container">
          <h2>Loading clubs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header />
      
      <div className="p-8">
        {/* Main Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Search Results</h1>
        
        {/* Category Filters and Sort/Filter */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-6">
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">All</button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">Abstract</button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">Avatar</button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">Games</button>
            <button className="text-gray-600 hover:text-gray-900 pb-2">Memes</button>
          </div>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <SortAsc size={16} />
              <span>Sort</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h2 className="text-2xl font-semibold mb-2">No clubs found</h2>
            <p>Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.map(club => (
              <div key={club.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleClubClick(club.id)}>
                {/* Club Logo/Image Section */}
                <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center relative">
                  <div className="text-white text-2xl font-bold">
                    {club.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                  </div>
                  
                  {/* Heart Icon */}
                  <div className="absolute bottom-2 left-2">
                    <Heart size={16} className="text-white" />
                  </div>
                  
                  {/* Rating */}
                  <div className="absolute bottom-2 right-2 text-white text-sm font-medium">
                    {club.rating.toFixed(1)}★
                  </div>
                </div>
                
                {/* Club Info */}
                <div className="p-4">
                  {/* Category Tags */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{club.category}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Technology</span>
                    </div>
                    <span className="text-sm text-gray-600">{club.member_count} Members</span>
                  </div>
                  
                  {/* Club Name */}
                  <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">{club.name}</h3>
                  
                  {/* Recruiting Button */}
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    Recruiting Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDashboard; 