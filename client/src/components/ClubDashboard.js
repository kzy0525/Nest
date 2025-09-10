import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Eye, Calendar, CheckCircle, Clock, AlertCircle, Plus, Edit, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStorage } from '../utils/userStorage';

const ClubDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userStorage = useUserStorage();
  const [applications, setApplications] = useState([]);
  const [clubProfile, setClubProfile] = useState(null);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApplications = useCallback(() => {
    // In a real app, this would come from the server
    // For now, we'll simulate by getting all applications and filtering by club
    const allApplications = userStorage.getJSON('clubApplications') || [];
    const clubApplications = allApplications.filter(app => 
      app.clubName === user?.name || app.clubId === clubProfile?.id
    );
    setApplications(clubApplications);
  }, [userStorage, user, clubProfile]);

  const loadClubData = useCallback(() => {
    // Load club profile from user-specific storage
    const savedProfile = userStorage.getJSON('clubProfile');
    if (savedProfile) {
      setClubProfile(savedProfile);
    } else {
      // Create default club profile
      setClubProfile({
        name: user?.name || '',
        description: '',
        category: '',
        contact_email: user?.email || '',
        website: '',
        instagram: '',
        meeting_time: '',
        meeting_location: '',
        application_deadline: '',
        interview_start_date: '',
        interview_end_date: '',
        open_positions: '',
        available_spots: '',
        application_questions: '',
        isHiring: false,
        hasInterviews: false
      });
    }

    // Load applications for this club
    loadApplications();
    setLoading(false);
  }, [userStorage, user, loadApplications]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

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
        return 'bg-blue-100 text-blue-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationViewer(true);
  };

  const handleUpdateApplicationStatus = (applicationId, newStatus) => {
    // Update application status
    const updatedApplications = applications.map(app =>
      app.id === applicationId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApplications);
    
    // Save to user-specific storage
    userStorage.setJSON('clubApplications', updatedApplications);
  };

  const handleCreateClubProfile = () => {
    navigate('/club/register');
  };

  const handleEditClubProfile = () => {
    navigate('/club/edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading club dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Club Dashboard</h1>
              <p className="text-gray-600">Manage your club and applications</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleEditClubProfile}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={20} className="mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings size={20} className="mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!clubProfile || !clubProfile.description ? (
          // No club profile - show setup
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Club Profile</h2>
              <p className="text-gray-600 mb-6">
                Create your club profile to start receiving applications from students.
              </p>
              <button
                onClick={handleCreateClubProfile}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Club Profile
              </button>
            </div>
          </div>
        ) : (
          // Club profile exists - show dashboard
          <div className="space-y-8">
            {/* Club Profile Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{clubProfile.name}</h2>
                  <p className="text-gray-600 mb-4">{clubProfile.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {clubProfile.application_deadline ? `Deadline: ${clubProfile.application_deadline}` : 'No deadline set'}
                    </span>
                    <span className="flex items-center">
                      <Users size={16} className="mr-1" />
                      {clubProfile.available_spots ? `${clubProfile.available_spots} spots available` : 'No spots specified'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    clubProfile.isHiring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {clubProfile.isHiring ? 'Currently Hiring' : 'Not Hiring'}
                  </span>
                </div>
              </div>
            </div>

            {/* Applications Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
                  <span className="text-sm text-gray-500">{applications.length} total applications</span>
                </div>
              </div>

              {applications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <div key={application.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText size={20} className="text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{application.studentName || 'Anonymous'}</h4>
                            <p className="text-sm text-gray-500">Applied for {application.position || 'General Position'}</p>
                            <p className="text-xs text-gray-400">Applied on {new Date(application.submittedAt || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{application.status}</span>
                          </span>
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-500">Applications will appear here when students apply to your club.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application Viewer Modal */}
      {showApplicationViewer && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                <button
                  onClick={() => setShowApplicationViewer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {selectedApplication.studentName || 'Not provided'}</p>
                  <p><strong>Email:</strong> {selectedApplication.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedApplication.phone || 'Not provided'}</p>
                  <p><strong>Program:</strong> {selectedApplication.program || 'Not provided'}</p>
                  <p><strong>Year:</strong> {selectedApplication.year || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application Questions</h4>
                <div className="space-y-4">
                  {selectedApplication.answers && Object.entries(selectedApplication.answers).map(([questionId, answer]) => (
                    <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-700 mb-2">Question {questionId}</p>
                      <p className="text-gray-600">{answer || 'No answer provided'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'Accepted')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'Rejected')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'Interview')}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDashboard;
