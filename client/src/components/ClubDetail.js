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


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Club Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Club Header Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                {/* Blue Header Section */}
                <div className="bg-blue-600 h-32 relative z-0">
                  <button
                    onClick={handleFavorite}
                    className="absolute top-4 left-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all z-10"
                  >
                    <Heart 
                      size={20} 
                      className={`${isFavorite ? 'text-red-500 fill-current' : 'text-white'}`} 
                    />
                  </button>
                </div>
                
                {/* Club Avatar and Info - Positioned above the blue background */}
                <div className="px-6 pb-6 relative z-10">
                  <div className="flex items-start space-x-4 -mt-16">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg relative z-20">
                      {club.name.split(' ').map(word => word[0]).join('').substring(0, 4)}
                    </div>
                    <div className="flex-1 pt-2">
                      <h2 className="text-2xl font-bold text-gray-900">{club.name}</h2>
                      {club.slogan && (
                        <p className="text-gray-600 mt-1">{club.slogan}</p>
                      )}
                      
                      {/* Apply Button - Only show if club is hiring */}
                      {club.application_deadline && new Date(club.application_deadline) > new Date() && (
                        <button className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                          Apply
                        </button>
                      )}
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
                  <span className="text-gray-700">Active Members: <span className="font-bold">{club.member_count}</span></span>
                </div>
                {club.acceptance_rate > 0 && (
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={20} className="text-gray-500" />
                    <span className="text-gray-700">Acceptance Rate: <span className="font-bold">{club.acceptance_rate}%</span></span>
                  </div>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed">
                {club.description}
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
                {club.instagram && (
                  <>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500 block">Instagram</span>
                      <span className="text-gray-900 block">{club.instagram}</span>
                    </div>
                    <div className="border-t border-gray-200"></div>
                  </>
                )}
                {club.website && (
                  <>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500 block">Website</span>
                      <span className="text-gray-900 block">{club.website}</span>
                    </div>
                    <div className="border-t border-gray-200"></div>
                  </>
                )}
                {club.linkedin && (
                  <>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500 block">LinkedIn</span>
                      <span className="text-gray-900 block">{club.linkedin}</span>
                    </div>
                    <div className="border-t border-gray-200"></div>
                  </>
                )}
                {club.contact_email && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500 block">Contact Email</span>
                    <span className="text-gray-900 block">{club.contact_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recruitment Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Information</h3>
              <div className="space-y-4">
                {club.open_positions ? (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Open Positions</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {club.open_positions.split(', ').map((position, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>• {position}</span>
                          <span className="text-gray-500">x{Math.ceil(club.available_spots / club.open_positions.split(', ').length)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No positions currently open</p>
                )}
              </div>
            </div>

            {/* Hiring Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Timeline</h3>
              <div className="relative">
                <div className="space-y-4">
                  {club.applications_open && (
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(club.applications_open).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-600">Applications Open</div>
                      </div>
                    </div>
                  )}
                  
                  {club.application_deadline && (
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(club.application_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-600">Applications Close</div>
                      </div>
                    </div>
                  )}
                  
                  {club.interview_start_date && (
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(club.interview_start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-600">First Round Interviews</div>
                      </div>
                    </div>
                  )}
                  
                  {club.interview_end_date && (
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="absolute top-3 left-1.5 w-px h-8 bg-gray-300"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(club.interview_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-600">Second Round Interviews</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {club.results_released && (
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(club.results_released).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-gray-600">Results Released</div>
                      </div>
                    </div>
                  )}
                  
                  {!club.applications_open && !club.application_deadline && (
                    <p className="text-sm text-gray-600">No hiring timeline available</p>
                  )}
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