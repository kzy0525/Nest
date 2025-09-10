import React, { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Eye, CheckCircle, Clock, AlertCircle, Download, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStorage } from '../utils/userStorage';

const ClubAnalytics = () => {
  const { user } = useAuth();
  const userStorage = useUserStorage();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationViewer, setShowApplicationViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const loadApplications = useCallback(() => {
    // Load applications for this club from user-specific storage
    const allApplications = userStorage.getJSON('clubApplications') || [];
    const clubApplications = allApplications.filter(app => 
      app.clubName === user?.name || app.clubId === user?.id
    );
    setApplications(clubApplications);
    setFilteredApplications(clubApplications);
    setLoading(false);
  }, [userStorage, user]);

  const filterApplications = useCallback(() => {
    let filtered = [...applications];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0);
        case 'oldest':
          return new Date(a.submittedAt || a.createdAt || 0) - new Date(b.submittedAt || b.createdAt || 0);
        case 'name':
          return (a.studentName || '').localeCompare(b.studentName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

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
    const updatedApplications = applications.map(app =>
      app.id === applicationId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApplications);
    userStorage.setJSON('clubApplications', updatedApplications);
  };

  const exportApplications = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Position', 'Status', 'Applied Date', 'Phone', 'Program'],
      ...filteredApplications.map(app => [
        app.studentName || 'N/A',
        app.email || 'N/A',
        app.position || 'N/A',
        app.status || 'N/A',
        new Date(app.submittedAt || app.createdAt || 0).toLocaleDateString(),
        app.phone || 'N/A',
        app.program || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `club-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusCounts = () => {
    const counts = {
      total: applications.length,
      submitted: applications.filter(app => app.status === 'Submitted').length,
      interview: applications.filter(app => app.status === 'Interview').length,
      accepted: applications.filter(app => app.status === 'Accepted').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
      incomplete: applications.filter(app => app.status === 'Incomplete').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Club Analytics</h1>
              <p className="text-gray-600">View and manage student applications</p>
            </div>
            <button
              onClick={exportApplications}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Submitted</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Interview</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.interview}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.accepted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.rejected}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Incomplete</p>
                <p className="text-2xl font-semibold text-gray-900">{statusCounts.incomplete}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Interview">Interview</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h3>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
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
                        <p className="text-xs text-gray-400">
                          Applied on {new Date(application.submittedAt || application.createdAt || Date.now()).toLocaleDateString()}
                        </p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Applications will appear here when students apply to your club.'}
              </p>
            </div>
          )}
        </div>
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

export default ClubAnalytics;
