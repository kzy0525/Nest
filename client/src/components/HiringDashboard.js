import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Plus, ChevronDown, Trash2, Upload, FileText } from 'lucide-react';
import axios from 'axios';

const HiringDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([
    { id: 1, name: "Resume", file: null, uploaded: false },
    { id: 2, name: "Transcript", file: null, uploaded: false },
    { id: 3, name: "Portfolio", file: null, uploaded: false },
    { id: 4, name: "Github", file: null, uploaded: false },
    { id: 5, name: "LinkedIn", file: null, uploaded: false }
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [clubData, setClubData] = useState({});
  const [deleteAction, setDeleteAction] = useState(''); // 'delete' or 'withdraw'
  const navigate = useNavigate();
  const fileInputRefs = useRef({});

  // Load applications from localStorage on component mount
  useEffect(() => {
    const savedApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
    setApplications(savedApplications);

    // Listen for new applications added from other components
    const handleNewApplication = (event) => {
      const { application } = event.detail;
      setApplications(prev => [...prev, application]);
    };

    window.addEventListener('clubApplicationAdded', handleNewApplication);

    return () => {
      window.removeEventListener('clubApplicationAdded', handleNewApplication);
    };
  }, []);

  // Function to add a new application
  const addApplication = (clubData) => {
    const newApplication = {
      id: Date.now(),
      clubId: clubData.id,
      clubName: clubData.name,
      clubLogo: clubData.logo || null,
      clubIcon: clubData.name.split(' ').map(word => word[0]).join('').substring(0, 4),
      clubIconBg: "bg-blue-600",
      position: '', // Will be set when application is created through the form
      year: '', // Will be set when application is created through the form
      program: '', // Will be set when application is created through the form
      status: "Submitted",
      statusColor: "bg-green-100 text-green-600",
      dateSubmitted: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };

    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));
  };



  // Function to remove an application
  const removeApplication = (applicationId) => {
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    setApplications(updatedApplications);
    localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));
    setSelectedApplication(null);
  };

  // Function to update application status
  const updateApplicationStatus = (applicationId, newStatus) => {
    const statusConfig = {
      "Submitted": "bg-green-100 text-green-600",
      "Interview": "bg-blue-100 text-blue-600",
      "Accepted": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-600",
      "Incomplete": "bg-yellow-100 text-yellow-600"
    };

    const updatedApplications = applications.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus, statusColor: statusConfig[newStatus] }
        : app
    );
    
    setApplications(updatedApplications);
    localStorage.setItem('clubApplications', JSON.stringify(updatedApplications));
    setSelectedApplication(null);
  };

  // Generate calendar events based on applications
  const calendarEvents = applications.map(app => {
    const today = new Date();
    const applicationDate = new Date(app.dateSubmitted);
    const daysDiff = Math.floor((today - applicationDate) / (1000 * 60 * 60 * 24));
    
    let eventText = "Application Submitted";
    if (app.status === "Interview") {
      eventText = "Interview";
    } else if (app.status === "Incomplete") {
      eventText = "Draft Saved";
    }
    
    return {
      day: today.getDate() + daysDiff + 1,
      club: app.clubIcon,
      event: eventText,
      clubIcon: app.clubIcon,
      clubIconBg: app.clubIconBg,
      clubLogo: app.clubLogo,
      clubName: app.clubName
    };
  }).slice(0, 4); // Limit to 4 events



  const handleActionClick = (application) => {
    setSelectedApplication(selectedApplication === application.id ? null : application.id);
  };

  const handleViewClub = (application) => {
    navigate(`/club/${application.clubId}`);
  };

  const handleViewApplication = async (app) => {
    setViewingApplication(app);
    setShowApplicationViewer(true);
    setSelectedApplication(null);
    
    // Fetch club data to get application questions
    try {
      const response = await axios.get(`/api/clubs/${app.clubId}`);
      setClubData(response.data);
    } catch (error) {
      console.error('Error fetching club data:', error);
      setClubData({});
    }
  };

  const handleDeleteClick = (app, action) => {
    setApplicationToDelete(app);
    setDeleteAction(action);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (applicationToDelete) {
      removeApplication(applicationToDelete.id);
      setShowDeleteModal(false);
      setApplicationToDelete(null);
      setDeleteAction('');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setApplicationToDelete(null);
    setDeleteAction('');
  };

  const handleFileUpload = (documentId, event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, file: file, uploaded: true }
          : doc
      ));
    }
  };

  const handleViewDocument = (document) => {
    if (document.file) {
      setSelectedDocument(document);
      setShowFileViewer(true);
    }
  };

  const handleRemoveDocument = (documentId) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file: null, uploaded: false }
        : doc
    ));
  };

  const renderFileContent = (file) => {
    if (!file) return null;

    const fileType = file.type;
    const fileName = file.name;

    if (fileType.startsWith('image/')) {
      // Display images
      return (
        <img 
          src={URL.createObjectURL(file)} 
          alt={fileName}
          className="max-w-full max-h-[70vh] object-contain mx-auto"
        />
      );
    } else if (fileType === 'application/pdf') {
      // Display PDFs
      return (
        <iframe
          src={URL.createObjectURL(file)}
          className="w-full h-[70vh] border-0"
          title={fileName}
        />
      );
    } else if (fileType.includes('text/') || fileType.includes('document')) {
      // Display text files
      return (
        <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {file.text || 'File content not available'}
          </pre>
        </div>
      );
    } else {
      // For other file types, show file info
      return (
        <div className="text-center py-8">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">{fileName}</p>
          <p className="text-sm text-gray-500">
            File size: {(file.size / 1024).toFixed(1)} KB
          </p>
          <p className="text-sm text-gray-500">
            Type: {fileType || 'Unknown'}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* My Applications Table - Full Width */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Applications</h2>
          
          <div className="overflow-x-auto" style={{ position: 'relative', zIndex: 1 }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Club</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Application Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-gray-500">
                      <div className="space-y-2">
                        <p className="text-lg">No applications yet</p>
                        <p className="text-sm">Click "Apply" on any club page to add it to your applications</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
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
                            <div className={`w-10 h-10 ${app.clubIconBg} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                              {app.clubIcon}
                            </div>
                          )}
                          <span 
                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => navigate(`/club/${app.clubId}`)}
                          >
                            {app.clubName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{app.dateSubmitted}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {/* Conditional Icons based on Status */}
                          {app.status === 'Incomplete' ? (
                            <>
                              {/* Edit Icon for Incomplete Applications */}
                              <button
                                onClick={() => navigate(`/club/${app.clubId}/apply`)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section - Timeline and Documents */}
        <div className="grid grid-cols-10 gap-6">
          {/* Timeline - Takes up 7/10 of the width */}
          <div className="col-span-7 bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const day = 12 + i;
                const event = calendarEvents.find(e => e.day === day);
                
                return (
                  <div key={day} className="text-center relative">
                    {/* Vertical grey line between dates (except for the last one) */}
                    {i < 6 && (
                      <div className="absolute top-0 left-full w-px h-5/6 bg-gray-100 transform -translate-x-1/2"></div>
                    )}
                    
                    <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                    {event && (
                      <div className="text-center">
                        {event.clubLogo ? (
                          <img 
                            src={event.clubLogo} 
                            alt={`${event.clubName} logo`}
                            className="w-6 h-6 rounded-full object-cover mx-auto mb-1"
                          />
                        ) : (
                          <div className={`w-6 h-6 ${event.clubIconBg} rounded-full flex items-center justify-center text-white text-xs font-semibold mx-auto mb-1`}>
                            {event.clubIcon}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 leading-tight">{event.event}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents - Takes up 3/10 of the width */}
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Resources</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-gray-700">{doc.name}</span>
                    {doc.uploaded && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!doc.uploaded ? (
                      <>
                        <input
                          ref={el => fileInputRefs.current[doc.id] = el}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.id, e)}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Upload file"
                        >
                          <Plus size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="View file"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {showFileViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-7xl max-h-[95vh] w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDocument.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDocument.file?.name}
                </p>
              </div>
              <button
                onClick={() => setShowFileViewer(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(95vh-120px)]">
              {renderFileContent(selectedDocument.file)}
            </div>
          </div>
        </div>
      )}

      {/* Application Viewer Modal */}
      {showApplicationViewer && viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-2/3 h-full shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
            <div className="p-6 overflow-auto h-[calc(100vh-120px)]">
              <div className="space-y-6">
                {/* My Information */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ChevronDown size={20} className="text-blue-600 mr-2" />
                      My Information
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-900">{viewingApplication.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="text-gray-900">{viewingApplication.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Year</label>
                        <p className="text-gray-900">{viewingApplication.year || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Program</label>
                        <p className="text-gray-900">{viewingApplication.program || 'Not provided'}</p>
                      </div>
                    </div>
                    {viewingApplication.position && (
                      <div>
                        <label className="text-sm text-gray-600">Applied Position</label>
                        <p className="text-gray-900 font-medium">{viewingApplication.position}</p>
                      </div>
                    )}
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
                          // Get the question text from the club's application questions
                          let questionText = `Question ${questionId}`;
                          try {
                            if (clubData.application_questions) {
                              const questions = JSON.parse(clubData.application_questions);
                              if (Array.isArray(questions)) {
                                const question = questions.find(q => q.id.toString() === questionId.toString());
                                if (question) {
                                  questionText = question.text;
                                }
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
                      
                      {/* Other documents from the documents state */}
                      {documents.filter(doc => doc.name !== 'Resume').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-gray-700">{doc.name}</span>
                            {doc.uploaded && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                ✓ Uploaded
                              </span>
                            )}
                          </div>
                          {doc.uploaded && (
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && applicationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {deleteAction === 'withdraw' ? 'Withdraw Application' : 'Delete Application'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {deleteAction === 'withdraw' 
                      ? 'Are you sure you want to withdraw this application?' 
                      : 'Are you sure you want to delete this application?'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  {applicationToDelete.clubLogo ? (
                    <img 
                      src={applicationToDelete.clubLogo} 
                      alt={`${applicationToDelete.clubName} logo`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {applicationToDelete.clubIcon}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{applicationToDelete.clubName}</p>
                    <p className="text-sm text-gray-600">Status: {applicationToDelete.status}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                {deleteAction === 'withdraw' 
                  ? 'This action will withdraw your application and remove it from your applications list. You can reapply later if the club is still accepting applications.'
                  : 'This action will permanently delete your application draft. You will need to start over if you want to apply again.'
                }
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
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
