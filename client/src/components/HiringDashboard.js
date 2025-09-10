import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, ChevronDown, Trash2, FileText } from 'lucide-react';
import axios from 'axios';
import { useUserStorage } from '../utils/userStorage';

const HiringDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [clubData, setClubData] = useState({});
  const [deleteAction, setDeleteAction] = useState(''); // 'delete' or 'withdraw'
  const navigate = useNavigate();
  const userStorage = useUserStorage();

  // Load applications from user-specific storage on component mount
  useEffect(() => {
    const savedApplications = userStorage.getJSON('clubApplications') || [];
    console.log('Loaded applications:', savedApplications);
    savedApplications.forEach((app, index) => {
      console.log(`Application ${index}:`, app.clubName, 'Status:', app.status);
    });
    setApplications(savedApplications);

    // Listen for new applications
    const handleNewApplication = (event) => {
      const application = event.detail.application;
      setApplications(prev => [...prev, application]);
    };

    window.addEventListener('clubApplicationAdded', handleNewApplication);

    return () => {
      window.removeEventListener('clubApplicationAdded', handleNewApplication);
    };
  }, []);

  // Function to add a new application
  const addApplication = (application) => {
    setApplications(prev => [...prev, application]);
    // Also save to user-specific storage
    const savedApplications = userStorage.getJSON('clubApplications') || [];
    savedApplications.push(application);
    userStorage.setJSON('clubApplications', savedApplications);
  };

  // Function to update application status (for future use if needed)
  const updateApplicationStatus = (applicationId, newStatus) => {
    console.log('Updating application status:', applicationId, 'to:', newStatus);
    
    // Define status colors
    const getStatusColor = (status) => {
      switch (status) {
        case 'Submitted':
          return 'bg-blue-100 text-blue-600';
        case 'Interview':
          return 'bg-purple-100 text-purple-600';
        case 'Accepted':
          return 'bg-green-100 text-green-600';
        case 'Rejected':
          return 'bg-red-100 text-red-600';
        case 'Incomplete':
          return 'bg-yellow-100 text-yellow-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };
    
    setApplications(prev => {
      const updated = prev.map(app => 
        app.id === applicationId ? { 
          ...app, 
          status: newStatus,
          statusColor: getStatusColor(newStatus)
        } : app
      );
      console.log('Updated applications state:', updated);
      return updated;
    });
    
    // Also update user-specific storage
    const savedApplications = userStorage.getJSON('clubApplications') || [];
    const updatedApplications = savedApplications.map(app =>
      app.id === applicationId ? { 
        ...app, 
        status: newStatus,
        statusColor: getStatusColor(newStatus)
      } : app
    );
    userStorage.setJSON('clubApplications', updatedApplications);
    console.log('Updated localStorage applications:', updatedApplications);
  };

  // Function to delete an application
  const deleteApplication = (applicationId) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    
    // Also remove from user-specific storage
    const savedApplications = userStorage.getJSON('clubApplications') || [];
    const filteredApplications = savedApplications.filter(app => app.id !== applicationId);
    userStorage.setJSON('clubApplications', filteredApplications);
  };

  // Function to handle viewing an application
  const handleViewApplication = (application) => {
    setViewingApplication(application);

    // Load club data for this application
    fetchClubData(application.clubId);

    setShowApplicationViewer(true);
  };

  // Function to fetch club data
  const fetchClubData = async (clubId) => {
    try {
      const response = await axios.get(`/api/clubs/${clubId}`);
      setClubData(prev => ({
        ...prev,
        [clubId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching club data:', error);
    }
  };

  // Function to handle edit application
  const handleEditApplication = (application) => {
    navigate(`/club/${application.clubId}/apply?edit=true`);
  };

  // Function to handle delete/withdraw click
  const handleDeleteClick = (application, action) => {
    console.log('Delete/Withdraw clicked:', action, 'for application:', application);
    setApplicationToDelete(application);
    setDeleteAction(action);
    setShowDeleteModal(true);
  };

  // Function to confirm delete/withdraw
  const confirmDelete = () => {
    if (applicationToDelete) {
      console.log('Confirming action:', deleteAction, 'for application:', applicationToDelete);
      if (deleteAction === 'delete') {
        // For incomplete applications, delete them
        console.log('Deleting application:', applicationToDelete.id);
        deleteApplication(applicationToDelete.id);
      } else if (deleteAction === 'withdraw') {
        // For submitted applications, delete them completely when withdrawn
        console.log('Withdrawing application:', applicationToDelete.id);
        deleteApplication(applicationToDelete.id);
      }
    }
    
    setShowDeleteModal(false);
    setApplicationToDelete(null);
    setDeleteAction('');
  };

  // Generate calendar data
  const today = new Date();
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      isToday: i === 0
    };
  });

  // Generate calendar events from applications
  const calendarEvents = applications
    .filter(app => app.status !== 'Incomplete') // Only show events for submitted applications
    .reduce((events, app) => {
      const clubId = app.clubId;
      const clubName = app.clubName;
      const clubLogo = app.clubLogo;
      const clubIcon = clubName ? clubName.charAt(0).toUpperCase() : '?';
      const clubIconBg = `bg-${['blue', 'green', 'red', 'yellow', 'purple', 'indigo', 'pink'][clubId % 7]}-500`;

      // Add application deadline event
      if (app.applicationDeadline) {
        const deadline = new Date(app.applicationDeadline);
        if (deadline >= today && deadline <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          events.push({
            id: `deadline-${app.id}`,
            day: deadline.getDate(),
            month: deadline.getMonth(),
            year: deadline.getFullYear(),
            event: 'Application Due',
            clubName,
            clubLogo,
            clubIcon,
            clubIconBg
          });
        }
      }

      // Add interview dates events
      if (app.interviewStartDate) {
        const interviewDate = new Date(app.interviewStartDate);
        if (interviewDate >= today && interviewDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          // Determine interview round based on application status or other logic
          let interviewRound = '1st Round';
          if (app.status === 'Interview Round 2' || app.status === 'Final Interview') {
            interviewRound = '2nd Round';
          } else if (app.status === 'Final Interview') {
            interviewRound = 'Final Round';
          }
          
          events.push({
            id: `interview-${app.id}`,
            day: interviewDate.getDate(),
            month: interviewDate.getMonth(),
            year: interviewDate.getFullYear(),
            event: `${interviewRound} Interview`,
            clubName,
            clubLogo,
            clubIcon,
            clubIconBg
          });
        }
      }

      // Add results released events
      if (app.resultsReleased) {
        const resultsDate = new Date(app.resultsReleased);
        if (resultsDate >= today && resultsDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          events.push({
            id: `results-${app.id}`,
            day: resultsDate.getDate(),
            month: resultsDate.getMonth(),
            year: resultsDate.getFullYear(),
            event: 'Results',
            clubName,
            clubLogo,
            clubIcon,
            clubIconBg
          });
        }
      }

      return events;
    }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* My Applications Table - Full Width */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Applications</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Club</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date Submitted</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        {app.clubLogo ? (
                          <img 
                            src={app.clubLogo} 
                            alt={`${app.clubName} logo`} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {app.clubName ? app.clubName.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                        <div>
                          <button 
                            onClick={() => navigate(`/club/${app.clubId}`)}
                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {app.clubName}
                          </button>
                          <div className="text-sm text-gray-500">{app.appliedRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>{app.status !== 'Incomplete' ? app.dateSubmitted : '-'}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {app.status === 'Incomplete' ? (
                          <>
                            {/* Edit Icon for Incomplete Applications */}
                            <button
                              onClick={() => handleEditApplication(app)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Application"
                            >
                              <Edit size={16} />
                            </button>
                            
                            {/* Delete Icon for Incomplete Applications */}
                            <button
                              onClick={() => handleDeleteClick(app, 'delete')}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* View Icon for Submitted Applications */}
                            <button
                              onClick={() => handleViewApplication(app)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Application"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Withdraw Icon for Submitted Applications */}
                            <button
                              onClick={() => handleDeleteClick(app, 'withdraw')}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Withdraw Application"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section - Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-8" style={{ minHeight: '400px' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Deadlines and Dates</h2>
            <div className="grid grid-cols-7 gap-2" style={{ minHeight: '300px' }}>
              {calendarDays.map((calendarDay, i) => {
                const event = calendarEvents.find(e => e.day === calendarDay.day);
                
                return (
                  <div key={`${calendarDay.year}-${calendarDay.month}-${calendarDay.day}`} className="text-center relative">
                    {/* Vertical grey line between dates (except for the last one) */}
                    {i < 6 && (
                      <div className="absolute top-0 left-full w-px h-full bg-gray-100 transform -translate-x-1/2"></div>
                    )}
                    <div className={`text-base font-bold mb-6 ${calendarDay.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {calendarDay.day}
                    </div>
                    {event && (
                      <div className="flex justify-center">
                        <div className="text-center bg-gray-50 rounded-lg border border-gray-200 w-28" style={{ padding: '6px' }}>
                          {event.clubLogo ? (
                            <img src={event.clubLogo} alt={`${event.clubName} logo`} className="w-8 h-8 rounded-full object-cover mx-auto mb-2" />
                          ) : (
                            <div className={`w-8 h-8 ${event.clubIconBg} rounded-full flex items-center justify-center text-white text-sm font-semibold mx-auto mb-2`}>
                              {event.clubIcon}
                            </div>
                          )}
                          <div className="text-sm text-gray-700 leading-tight font-medium">{event.event}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      {/* Application Viewer Modal */}
      {showApplicationViewer && viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-2/3 h-full shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingApplication.clubName}</h2>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Application Status: </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${viewingApplication.statusColor}`}>
                    {viewingApplication.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowApplicationViewer(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ChevronDown size={20} className="text-blue-600 mr-2" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <p className="text-gray-900">{viewingApplication.fullName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{viewingApplication.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-gray-900">{viewingApplication.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <p className="text-gray-900">{viewingApplication.year}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                        <p className="text-gray-900">{viewingApplication.program}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied For</label>
                        <p className="text-gray-900">{viewingApplication.appliedRole}</p>
                      </div>
                      {viewingApplication.secondRole && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Second Role</label>
                          <p className="text-gray-900">{viewingApplication.secondRole}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ChevronDown size={20} className="text-blue-600 mr-2" />
                      Documents & Resources
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* Resume */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-gray-700">Resume</span>
                          {(viewingApplication.resumeFileName || viewingApplication.resume) && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              ✓ Uploaded
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {viewingApplication.resumeFileName || (viewingApplication.resume ? viewingApplication.resume.name : 'No resume uploaded')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Questions */}
                {viewingApplication.answers && Object.keys(viewingApplication.answers).length > 0 && (
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ChevronDown size={20} className="text-blue-600 mr-2" />
                        Application Questions
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-4">
                        {Object.entries(viewingApplication.answers).map(([questionId, answer]) => {
                          let questionText = `Question ${questionId}`;
                          
                          // Try to get the actual question text from club data
                          try {
                            const clubInfo = clubData[viewingApplication.clubId];
                            console.log('Club info:', clubInfo);
                            console.log('Question ID:', questionId);
                            
                            if (clubInfo && clubInfo.application_questions) {
                              console.log('Application questions:', clubInfo.application_questions);
                              const questions = JSON.parse(clubInfo.application_questions);
                              console.log('Parsed questions:', questions);
                              
                              const question = questions.find(q => q.id === parseInt(questionId));
                              console.log('Found question:', question);
                              
                              if (question && question.text) {
                                questionText = question.text;
                                console.log('Using question text:', questionText);
                              }
                            }
                          } catch (error) {
                            console.log('Error getting question text:', error);
                          }
                          
                          return (
                            <div key={questionId} className="border-l-4 border-blue-500 pl-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{questionText}</h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {answer || 'No answer provided'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Withdraw Confirmation Modal */}
      {showDeleteModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {deleteAction === 'withdraw' ? 'Withdraw Application' : 'Delete Application'}
              </h3>
              <p className="text-gray-600 mb-6">
                {deleteAction === 'withdraw' 
                  ? `Are you sure you want to withdraw your application to ${applicationToDelete.clubName}? This action can be undone.`
                  : `Are you sure you want to delete your application to ${applicationToDelete.clubName}? This action cannot be undone.`
                }
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    deleteAction === 'withdraw' 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deleteAction === 'withdraw' ? 'Withdraw' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringDashboard;