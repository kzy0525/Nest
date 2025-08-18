import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Calendar, MapPin, Mail, Phone, Globe, Instagram, Linkedin, Twitter, Facebook, Clock } from 'lucide-react';
import axios from 'axios';
import Header from './Header';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    student_name: '',
    rating: 5,
    review_text: ''
  });

  useEffect(() => {
    fetchClubDetails();
    fetchClubReviews();
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/clubs/${id}/reviews`, reviewForm);
      setReviewForm({ student_name: '', rating: 5, review_text: '' });
      setShowReviewForm(false);
      fetchClubDetails();
      fetchClubReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={20}
          fill={i <= rating ? 'currentColor' : 'none'}
          color={i <= rating ? '#fbbf24' : '#d1d5db'}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <Header />
        <div className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-600">Loading club details...</h2>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <Header />
        <div className="p-8">
          <h2 className="text-2xl font-semibold">Club not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <Header />
      
      <div className="p-8">
        <button 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg mb-8 transition-colors hover:bg-gray-700"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={16} />
          Back to Clubs
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12">
            <h1 className="text-5xl font-bold mb-4">{club.name}</h1>
            <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-lg font-medium inline-block mb-4">{club.category}</span>
            <p className="text-xl leading-relaxed opacity-90">{club.description}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Meeting Information</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock size={20} className="text-blue-600" />
                  <span>{club.meeting_time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={20} className="text-blue-600" />
                  <span>{club.meeting_location}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={20} className="text-blue-600" />
                  <span>{club.contact_email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={20} className="text-blue-600" />
                  <span>{club.contact_phone}</span>
                </div>
                {club.website && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe size={20} className="text-blue-600" />
                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Application Timeline</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-blue-600" />
                  <span>Deadline: {formatDate(club.application_deadline)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={20} className="text-blue-600" />
                  <span>Interviews: {formatDate(club.interview_start_date)} - {formatDate(club.interview_end_date)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Club Statistics</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Star size={20} className="text-blue-600" />
                  <span>{club.rating.toFixed(1)} rating ({club.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users size={20} className="text-blue-600" />
                  <span>{club.member_count} members</span>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            {(club.instagram || club.linkedin || club.twitter || club.facebook) && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Social Media</h3>
                <div className="flex gap-4 flex-wrap">
                  {club.instagram && (
                    <a href={`https://instagram.com/${club.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors hover:bg-gray-200">
                      <Instagram size={16} />
                      Instagram
                    </a>
                  )}
                  {club.linkedin && (
                    <a href={`https://linkedin.com/company/${club.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors hover:bg-gray-200">
                      <Linkedin size={16} />
                      LinkedIn
                    </a>
                  )}
                  {club.twitter && (
                    <a href={`https://twitter.com/${club.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors hover:bg-gray-200">
                      <Twitter size={16} />
                      Twitter
                    </a>
                  )}
                  {club.facebook && (
                    <a href={`https://facebook.com/${club.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg transition-colors hover:bg-gray-200">
                      <Facebook size={16} />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">Reviews & Ratings</h3>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </button>
              </div>

              {showReviewForm && (
                <form className="bg-gray-50 p-6 rounded-lg mb-8" onSubmit={handleReviewSubmit}>
                  <div className="mb-4">
                    <label htmlFor="student_name" className="block mb-2 font-medium text-gray-700">Your Name</label>
                    <input
                      type="text"
                      id="student_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={reviewForm.student_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, student_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="rating" className="block mb-2 font-medium text-gray-700">Rating</label>
                    <select
                      id="rating"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    >
                      <option value={5}>5 stars - Excellent</option>
                      <option value={4}>4 stars - Very Good</option>
                      <option value={3}>3 stars - Good</option>
                      <option value={2}>2 stars - Fair</option>
                      <option value={1}>1 star - Poor</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="review_text" className="block mb-2 font-medium text-gray-700">Review</label>
                    <textarea
                      id="review_text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-y"
                      value={reviewForm.review_text}
                      onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                      placeholder="Share your experience with this club..."
                      required
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Submit Review
                  </button>
                </form>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800">{review.student_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">
                            {renderStars(review.rating)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{review.review_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to share your experience!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail; 