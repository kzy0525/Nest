import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Star, Instagram, Globe, Linkedin, Users, TrendingUp } from 'lucide-react';
import axios from 'axios';

const ClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubDetails();
    fetchClubReviews();
    checkFavoriteStatus();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`);
      setClub(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching club details:', error);
      setLoading(false);
    }
  };

  const fetchClubReviews = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav.id !== club.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
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
      favorites.push(newFavorite);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      if (distribution[review.rating] !== undefined) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const getMaxRating = () => {
    const distribution = getRatingDistribution();
    return Math.max(...Object.values(distribution));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-xl text-red-600">Club not found</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = getRatingDistribution();
  const maxRating = getMaxRating();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Club Profile</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Club Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Club Header Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                {/* Blue Header Section */}
                <div className="bg-blue-600 h-32 relative">
                  <button
                    onClick={handleFavorite}
                    className="absolute top-4 left-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                  >
                    <Heart 
                      size={20} 
                      className={`${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
                    />
                  </button>
                </div>
                
                {/* Club Avatar and Info */}
                <div className="px-6 pb-6">
                  <div className="flex items-center space-x-4 -mt-16">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {club.name.split(' ').map(word => word[0]).join('').substring(0, 4)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
                      <p className="text-gray-600 mt-1">Canada's premier undergraduate product development club</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-gray-500" />
                  <span className="text-gray-700">Active Members: <span className="font-bold">52</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp size={20} className="text-gray-500" />
                  <span className="text-gray-700">Acceptance Rate: <span className="font-bold">15%</span></span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                The Queen's Technology and Media Association (QTMA) is the flagship product development launchpad and incubation platform for student technology products. Founded in 2014 to bridge the gap between the increasingly convergent worlds of business and technology, QTMA is pillared on technological education, cultivating a strong network of alumni professionals across an array of technological fields, and the deliverance of novel technological products that solve problems facing the modern student.
              </p>
            </div>

            {/* Reviews and Ratings Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reviews and Ratings</h3>
              
              {/* Overall Rating */}
              <div className="flex items-start space-x-8 mb-6">
                <div className="text-left">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
                  <div className="flex space-x-1 mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <div className="text-gray-600">{reviews.length} Reviews</div>
                </div>
                
                {/* Rating Distribution */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-4">{rating}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${maxRating > 0 ? (ratingDistribution[rating] / maxRating) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{ratingDistribution[rating]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Recent Reviews</h4>
                {reviews.slice(0, 2).map((review, index) => (
                  <div key={review.id} className="border-t border-gray-100 pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900">{review.student_name}</div>
                        <div className="text-sm text-gray-500">Business Analyst '27</div>
                      </div>
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-6">
            
            {/* Social Media Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Instagram</span>
                  <span className="text-gray-900">@queenstechmedia</span>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Website</span>
                  <span className="text-gray-900">qtma.ca</span>
                </div>
                <div className="border-t border-gray-200"></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">LinkedIn</span>
                  <span className="text-gray-900">linkedin.com/company/qtma/</span>
                </div>
              </div>
            </div>

            {/* Recruitment Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Open Positions</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Business Analyst x3</li>
                    <li>• UI/UX Designer x2</li>
                    <li>• Software Developer x4</li>
                    <li>• Project Manager x1</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hiring Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Timeline</h3>
              <div className="relative">
                <div className="space-y-4">
                  {[
                    { date: 'February 26', event: 'Applications Open' },
                    { date: 'March 5', event: 'Applications Close' },
                    { date: 'March 12', event: 'First Round Interviews' },
                    { date: 'March 15', event: 'Second Round Interviews' },
                    { date: 'March 18', event: 'Results' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        {index < 4 && (
                          <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.date}</div>
                        <div className="text-sm text-gray-600">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail; 