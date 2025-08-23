import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Upload, FileText, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ClubApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applicationForm, setApplicationForm] = useState({
    resume: null,
    answers: {}
  });
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubDetails();
    checkFavoriteStatus();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`);
      setClub(response.data);
      setLoading(false);
      
      // Initialize answers object with club's application questions
      if (response.data.application_questions) {
        const questions = JSON.parse(response.data.application_questions);
        const initialAnswers = {};
        questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setApplicationForm(prev => ({
          ...prev,
          answers: initialAnswers
        }));
      }
    } catch (error) {
      console.error('Error fetching club details:', error);
      setLoading(false);
    }
  };

  const checkFavoriteStatus = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter(fav => fav.id !== club.id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(false);
    } else {
      const newFavorite = {
        id: club.id,
        name: club.name,
        description: club.description,
        category: club.category,
        rating: club.rating,
        review_count: club.review_count,
        member_count: club.member_count
      };
      favorites.push(newFavorite);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setApplicationForm(prev => ({
        ...prev,
        resume: file
      }));
    } else {
      alert('Please upload a PDF file for your resume.');
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setApplicationForm(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const saveDraft = async () => {
    if (!applicationForm.resume) {
      alert('Please upload your resume.');
      return;
    }

    setSaving(true);

    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to applications list as incomplete
      const newApplication = {
        id: Date.now(),
        clubId: club.id,
        clubName: club.name,
        clubIcon: club.name.split(' ').map(word => word[0]).join('').substring(0, 4),
        clubIconBg: "bg-blue-600",
        status: "Incomplete",
        statusColor: "bg-yellow-100 text-yellow-600",
        dateSubmitted: new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };

      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      const updatedApplications = [...existingApplications, newApplication];
      localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));

      // Trigger custom event for HiringDashboard
      window.dispatchEvent(new CustomEvent('clubApplicationAdded', { 
        detail: { application: newApplication } 
      }));

      alert('Draft saved successfully! You can complete and submit it later from the Hiring Dashboard.');
      navigate('/hiring');
    } catch (error) {
      alert('Error saving draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!applicationForm.resume) {
      alert('Please upload your resume.');
      return;
    }

    // Check if all questions are answered
    const questions = club.application_questions ? JSON.parse(club.application_questions) : [];
    const unansweredQuestions = questions.filter(q => !applicationForm.answers[q.id]?.trim());
    
    if (unansweredQuestions.length > 0) {
      alert('Please answer all application questions.');
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, you'd upload the file to a server
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add to applications list
      const newApplication = {
        id: Date.now(),
        clubId: club.id,
        clubName: club.name,
        clubIcon: club.name.split(' ').map(word => word[0]).join('').substring(0, 4),
        clubIconBg: "bg-blue-600",
        status: "Submitted",
        statusColor: "bg-green-100 text-green-600",
        dateSubmitted: new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };

      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      const updatedApplications = [...existingApplications, newApplication];
      localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));

      // Trigger custom event for HiringDashboard
      window.dispatchEvent(new CustomEvent('clubApplicationAdded', { 
        detail: { application: newApplication } 
      }));

      alert('Application submitted successfully! You can track your application in the Hiring Dashboard.');
      navigate('/hiring');
    } catch (error) {
      alert('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const questions = club.application_questions ? JSON.parse(club.application_questions) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        
        {/* Club Header Card */}
        <div className="bg-white border-b border-gray-200">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          
          {/* Back Button */}
          <button
            onClick={() => navigate(`/club/${id}`)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Club</span>
          </button>

          {/* Application Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Form</h1>
            <p className="text-gray-600">Complete your application for {club.name}</p>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Upload</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {applicationForm.resume ? applicationForm.resume.name : 'Upload Resume'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {applicationForm.resume ? 'Click to change file' : 'PDF files only, max 5MB'}
                  </p>
                </label>
              </div>
              {applicationForm.resume && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText size={20} className="text-green-600" />
                  <span className="text-green-800 font-medium">{applicationForm.resume.name}</span>
                </div>
              )}
            </div>
          </div>



          {/* Application Questions */}
          {questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Questions</h3>
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {index + 1}. {question.text}
                    </label>
                    {question.type === 'short' ? (
                      <input
                        type="text"
                        value={applicationForm.answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your answer..."
                      />
                    ) : (
                      <textarea
                        value={applicationForm.answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Your answer..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Save Draft Button */}
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Draft</span>
                  </>
                )}
              </button>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubApplication;
