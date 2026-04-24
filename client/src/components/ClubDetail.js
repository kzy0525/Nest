import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Instagram, Globe, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getClubById, getReviews, addReview, isFavorited, addFavorite, removeFavorite, deleteClub } from '../lib/db';

// Rating Form Component
const RatingForm = ({ clubId, onRatingAdded, existingReviews, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [clubPosition, setClubPosition] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if user has already reviewed this club
  const hasUserReviewed = (name) => {
    return existingReviews.some(review => 
      review.student_name.toLowerCase() === name.toLowerCase()
    );
  };

  // Get user's existing review
  const getUserReview = (name) => {
    return existingReviews.find(review => 
      review.student_name.toLowerCase() === name.toLowerCase()
    );
  };

  // Render stars for display
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating || !studentName || !reviewText) {
      setError('Please fill in all fields');
      return;
    }

    // Check if user has already reviewed
    if (hasUserReviewed(studentName)) {
      setError('You have already reviewed this club. Please use a different name or contact support if you need to update your review.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newReview = await addReview({ clubId, studentName, clubPosition, rating, reviewText });

      if (newReview.id) {
        // Show success state
        setIsSubmitted(true);
        
        // Refresh reviews
        onRatingAdded();
        
        // Close the form after a short delay
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
          // Reset form
          setRating(0);
          setStudentName('');
          setClubPosition('');
          setReviewText('');
          setIsSubmitted(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      setError('Failed to add rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Student Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your name"
          required
        />
        
        {/* Show existing review if user has already reviewed */}
        {studentName && getUserReview(studentName) && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>You've already reviewed this club:</strong>
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {renderStars(getUserReview(studentName).rating)}
              <span className="text-sm text-blue-700 ml-2">
                {getUserReview(studentName).rating} star{getUserReview(studentName).rating > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              "{getUserReview(studentName).review_text}"
            </p>
          </div>
        )}
      </div>

      {/* Club Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Position in the Club
        </label>
        <input
          type="text"
          value={clubPosition}
          onChange={(e) => setClubPosition(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Member, Executive, President, etc."
        />
      </div>

      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                size={24}
                className={`${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rating > 0 ? `You rated this club ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
        </p>
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Share your experience with this club... (optional)"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Rating submitted successfully! Thank you for your feedback.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !rating || !studentName || isSubmitted}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isSubmitting ? 'Submitting...' : isSubmitted ? 'Rating Submitted!' : 'Submit Rating'}
      </button>
    </form>
  );
};

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    getClubById(id).then(setClub).catch(console.error).finally(() => setLoading(false));
    getReviews(id).then(setReviews).catch(console.error);
    if (user) isFavorited(user.id, id).then(setIsFavorite).catch(console.error);
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) return;
    if (isFavorite) {
      setIsFavorite(false);
      await removeFavorite(user.id, id);
    } else {
      setIsFavorite(true);
      window.dispatchEvent(new CustomEvent('clubLiked', { detail: { club } }));
      await addFavorite(user.id, id);
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
            
            {/* Combined Club Profile and Overview Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                {/* Backdrop Image or Blue Header Section */}
                <div className="h-32 relative z-0">
                  {club.backdrop ? (
                    <img 
                      src={club.backdrop} 
                      alt={`${club.name} backdrop`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-300 w-full h-full"></div>
                  )}
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
                
                {/* Club Avatar and Info - Positioned at bottom of backdrop */}
                <div className="px-6 pb-6 relative z-10">
                  <div className="flex items-start space-x-4 -mt-16">
                    {club.logo ? (
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl relative z-20 overflow-hidden">
                        <img 
                          src={club.logo} 
                          alt={`${club.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl relative z-20">
                        {club.name.split(' ').map(word => word[0]).join('').substring(0, 4)}
                      </div>
                    )}
                    <div className="flex-1" style={{ paddingTop: '70px' }}>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h2>
                      {club.slogan && (
                        <p className="text-lg text-gray-600 mb-3 font-medium">{club.slogan}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Overview Stats - Completely underneath icon and club info */}
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
                    <div className="grid grid-cols-2 gap-2 mb-6">
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
                    
                    {/* Club Description */}
                    {club.description && (
                      <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed">{club.description}</p>
                      </div>
                    )}
                    
                      {/* Apply Button - Only show if club is hiring */}
                      {club.application_deadline && new Date(club.application_deadline) > new Date() && (
                        <button 
                          onClick={() => {
                            // Check if already applied - convert both IDs to strings for comparison
                            const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
                            
                            const alreadyApplied = existingApplications.some(app => 
                              String(app.clubId) === String(club.id)
                            );
                            
                            if (alreadyApplied) {
                              alert('You have already applied to this club!');
                              return;
                            }

                            // Navigate to application page
                            navigate(`/club/${club.id}/apply`);
                          }}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                        >
                          Apply
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Rating Section */}
            {showRatingForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Add Your Rating</h3>
                <div className="flex items-center space-x-3">

                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                    title="Close rating form"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
                <RatingForm
                  clubId={club.id}
                  onRatingAdded={() => getReviews(id).then(setReviews).catch(console.error)}
                  existingReviews={reviews}
                  onClose={() => setShowRatingForm(false)}
                />
              </div>
            )}

            {/* Reviews and Ratings Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Reviews and Ratings</h3>
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    showRatingForm 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title={showRatingForm ? "Hide rating form" : "Add a rating"}
                >
                  {showRatingForm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Section - Overall Rating and Distribution */}
                <div>
                  {/* Overall Rating */}
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
                    <div className="flex space-x-1 mb-2">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <div className="text-gray-600">{reviews.length} Reviews</div>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div>
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

                {/* Right Section - Individual Reviews */}
                <div>
                  <div className="flex items-center justify-end mb-4">
                    {reviews.length > 2 && (
                      <button 
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review, index) => (
                      <div key={review.id} className="border-t border-gray-100 pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{review.student_name}</div>
                            <div className="text-sm text-gray-500">
                              {review.club_position && (
                                <span>{review.club_position}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                      </div>
                    ))}
                    
                    {reviews.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <p>No reviews yet. Be the first to rate this club!</p>
                      </div>
                    )}
                  </div>
                </div>
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

                {club.contact_email && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-500 block">Contact Email</span>
                    <span className="text-gray-900 block">{club.contact_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Open Positions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {(() => {
                let positions = [];
                let spots = [];
                try {
                  if (club.open_positions) {
                    // Try to parse as JSON array first
                    try {
                      positions = JSON.parse(club.open_positions);
                      if (!Array.isArray(positions)) {
                        positions = [];
                      }
                    } catch (jsonError) {
                      // If JSON parsing fails, treat as comma-separated string
                      positions = club.open_positions.split(',').map(pos => pos.trim()).filter(pos => pos);
                    }
                  }
                  
                  // Handle available_spots
                  if (club.available_spots) {
                    // Try to parse as JSON array first
                    try {
                      spots = JSON.parse(club.available_spots);
                      if (!Array.isArray(spots)) {
                        spots = [];
                      }
                    } catch (jsonError) {
                      // If JSON parsing fails, use the total number for all positions
                      const totalSpots = parseInt(club.available_spots) || 0;
                      spots = positions.map(() => Math.ceil(totalSpots / positions.length));
                    }
                  } else {
                    // If no spots data, default to 1 for each position
                    spots = positions.map(() => 1);
                  }
                  
                  // Ensure spots array has same length as positions array
                  while (spots.length < positions.length) {
                    spots.push(1);
                  }
                } catch (error) {
                  console.log('Error parsing positions/spots:', error);
                  positions = [];
                  spots = [];
                }

                return positions.length > 0 ? (
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-3">Open Positions</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      {positions.map((position, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{position.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                          <span className="text-gray-500">x{spots[index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No positions currently open</p>
                );
              })()}
            </div>

            {/* Hiring Package PDF */}
            {club.hiring_package && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Package</h3>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Hiring Package</h4>
                    <p className="text-xs text-gray-500">Detailed information about roles and requirements</p>
                  </div>
                  <a
                    href={club.hiring_package}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View PDF
                  </a>
                </div>
              </div>
            )}

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
        
        {/* Temporary Delete Button - Bottom Right Corner */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
          <button 
            onClick={() => navigate(`/register-club?edit=${club.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
          >
            ✏️ Edit Club (Test)
          </button>
          <button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
                try {
                  await deleteClub(club.id);
                  alert('Club deleted successfully!');
                  navigate('/search');
                } catch (error) {
                  console.error('Error deleting club:', error);
                  alert('Error deleting club. Please try again.');
                }
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
          >
            🗑️ Delete Club (Test)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail; 