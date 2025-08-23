import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Plus, ChevronDown, Trash2, Upload, FileText } from 'lucide-react';

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
      clubIcon: clubData.name.split(' ').map(word => word[0]).join('').substring(0, 4),
      clubIconBg: "bg-blue-600",
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
      clubIconBg: app.clubIconBg
    };
  }).slice(0, 4); // Limit to 4 events



  const handleActionClick = (application) => {
    setSelectedApplication(selectedApplication === application.id ? null : application.id);
  };

  const handleViewClub = (application) => {
    navigate(`/club/${application.clubId}`);
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
                          <div className={`w-10 h-10 ${app.clubIconBg} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                            {app.clubIcon}
                          </div>
                          <span className="font-medium text-gray-900">{app.clubName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{app.dateSubmitted}</td>
                                              <td className="py-4 px-4">
                          <div className="relative" style={{ zIndex: 1000 }}>
                            <button
                              onClick={() => handleActionClick(app)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            
                            {/* Dropdown for all applications */}
                            {selectedApplication === app.id && (
                              <div className="absolute left-0 top-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 9999 }}>
                              <div className="py-1">
                                <button 
                                  onClick={() => handleViewClub(app)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  View Club
                                </button>
                                <button 
                                  onClick={() => updateApplicationStatus(app.id, "Interview")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Interview
                                </button>
                                <button 
                                  onClick={() => updateApplicationStatus(app.id, "Accepted")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Accepted
                                </button>
                                <button 
                                  onClick={() => updateApplicationStatus(app.id, "Rejected")}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  Mark as Rejected
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button 
                                  onClick={() => removeApplication(app.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} className="inline mr-2" />
                                  Remove Application
                                </button>
                              </div>
                            </div>
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
                        <div className={`w-6 h-6 ${event.clubIconBg} rounded-full flex items-center justify-center text-white text-xs font-semibold mx-auto mb-1`}>
                          {event.clubIcon}
                        </div>
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
    </div>
  );
};

export default HiringDashboard;
