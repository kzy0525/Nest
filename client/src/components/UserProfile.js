import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Camera, MapPin, GraduationCap, Calendar, User, Target, Users, Clock, CheckCircle, Plus, Search, X, MoreVertical, Upload } from 'lucide-react';
import axios from 'axios';
import { useUserStorage } from '../utils/userStorage';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const userStorage = useUserStorage();
  const { user } = useAuth();
  
  // Load user data from user-specific storage or use default
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = userStorage.getJSON('userProfile');
    if (savedProfile) {
      return savedProfile;
    }
    // Default user data based on authenticated user
    return {
      name: user?.name || "",
      program: user?.program || "",
      year: "",
      school: user?.school || "",
      pronouns: "",
      avatar: user?.avatar || null,
      bio: "",
      goals: "",
      currentClubs: []
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });
  const [editingSection, setEditingSection] = useState(null); // 'basic', 'about', 'clubs'
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [isUploadingBackdrop, setIsUploadingBackdrop] = useState(false);
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState(null);
  const [newClubForm, setNewClubForm] = useState({
    role: '',
    joinDate: ''
  });
  const [editingClub, setEditingClub] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [applications, setApplications] = useState([]);

  // Load applications from user-specific storage
  useEffect(() => {
    const loadApplications = () => {
      const savedApplications = userStorage.getJSON('clubApplications') || [];
      setApplications(savedApplications);
    };

    loadApplications();

    // Listen for application updates
    const handleApplicationUpdate = () => {
      loadApplications();
    };

    window.addEventListener('clubApplicationAdded', handleApplicationUpdate);
    window.addEventListener('applicationSaved', handleApplicationUpdate);
    window.addEventListener('applicationSubmitted', handleApplicationUpdate);

    return () => {
      window.removeEventListener('clubApplicationAdded', handleApplicationUpdate);
      window.removeEventListener('applicationSaved', handleApplicationUpdate);
      window.removeEventListener('applicationSubmitted', handleApplicationUpdate);
    };
  }, [userStorage]);

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        program: user.program || prev.program,
        school: user.school || prev.school,
        avatar: user.avatar || prev.avatar
      }));
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...userProfile });
  };

  const handleSave = () => {
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setEditForm({ ...userProfile });
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingProfilePicture(true);

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await axios.post('/api/user/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newProfilePicture = response.data.profile_picture;
        const updatedProfile = { ...userProfile, avatar: newProfilePicture };
        setUserProfile(updatedProfile);
        userStorage.setJSON('userProfile', updatedProfile);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Update edit form if it's open
        if (isEditing) {
          setEditForm({ ...editForm, avatar: newProfilePicture });
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const handleBackdropUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingBackdrop(true);

    try {
      const formData = new FormData();
      formData.append('backdrop', file);

      const response = await axios.post('/api/user/backdrop', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newBackdrop = response.data.backdrop;
        const updatedProfile = { ...userProfile, backdrop: newBackdrop };
        setUserProfile(updatedProfile);
        userStorage.setJSON('userProfile', updatedProfile);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        // Update edit form if it's open
        if (isEditing) {
          setEditForm({ ...editForm, backdrop: newBackdrop });
        }
      }
    } catch (error) {
      console.error('Error uploading backdrop:', error);
      alert('Failed to upload backdrop. Please try again.');
    } finally {
      setIsUploadingBackdrop(false);
    }
  };

  const handleSaveSection = () => {
    setUserProfile(editForm);
    // Save to localStorage to make changes permanent
    userStorage.setJSON('userProfile', editForm);
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...userProfile });
    setEditingSection(null);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setEditForm({ ...userProfile });
    setIsEditing(false);
  };

  // Fetch available clubs from the database
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/clubs');
        if (response.ok) {
          const clubs = await response.json();
          setAvailableClubs(clubs);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };

    if (showAddClubModal) {
      fetchClubs();
    }
  }, [showAddClubModal]);

  const handleAddClub = () => {
    setShowAddClubModal(true);
    setSearchQuery('');
    setSelectedClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const handleClubSelect = (club) => {
    setSelectedClub(club);
    setSearchQuery(club.name);
  };

  const handleSubmitClub = () => {
    if (selectedClub && newClubForm.role && newClubForm.joinDate) {
      const newClub = {
        id: Date.now(), // Generate unique ID
        name: selectedClub.name,
        role: newClubForm.role,
        joinDate: newClubForm.joinDate
      };
      
      const updatedProfile = {
        ...userProfile,
        currentClubs: [...userProfile.currentClubs, newClub]
      };
      setUserProfile(updatedProfile);
      userStorage.setJSON('userProfile', updatedProfile);
      
      setShowAddClubModal(false);
      setSearchQuery('');
      setSelectedClub(null);
      setNewClubForm({ role: '', joinDate: '' });
    }
  };

  const handleRemoveClub = (clubId) => {
    const updatedProfile = {
      ...userProfile,
      currentClubs: userProfile.currentClubs.filter(club => club.id !== clubId)
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowDropdown(null);
  };

  const handleEditClub = (club) => {
    setEditingClub(club);
    setNewClubForm({ role: club.role, joinDate: club.joinDate });
    setShowDropdown(null);
  };

  const handleUpdateClub = () => {
    if (editingClub && newClubForm.role && newClubForm.joinDate) {
      const updatedProfile = {
        ...userProfile,
        currentClubs: userProfile.currentClubs.map(club => 
          club.id === editingClub.id 
            ? { ...club, role: newClubForm.role, joinDate: newClubForm.joinDate }
            : club
        )
      };
      setUserProfile(updatedProfile);
      userStorage.setJSON('userProfile', updatedProfile);
      setEditingClub(null);
      setNewClubForm({ role: '', joinDate: '' });
    }
  };

  const handleCancelClubEdit = () => {
    setEditingClub(null);
    setNewClubForm({ role: '', joinDate: '' });
  };

  const toggleDropdown = (clubId) => {
    setShowDropdown(showDropdown === clubId ? null : clubId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const filteredClubs = availableClubs.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !userProfile.currentClubs.some(userClub => userClub.name === club.name)
  );



  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'application submitted':
        return 'bg-green-100 text-green-800';
      case 'interview scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Profile Header Card */}
          <div className="relative">
            {/* Club-style Background Card with backdrop */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Backdrop Section - takes up half the card */}
              <div className="h-32 relative">
                {userProfile.backdrop ? (
                  <img 
                    src={userProfile.backdrop} 
                    alt="Profile backdrop"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-full h-full"></div>
                )}
                
                {/* Backdrop Upload Button */}
                <div className="absolute top-2 right-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackdropUpload}
                      className="hidden"
                      disabled={isUploadingBackdrop}
                    />
                    <div className="w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-gray-600 hover:bg-opacity-100 transition-colors shadow-lg">
                      {isUploadingBackdrop ? (
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera size={14} />
                      )}
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Profile Content Section */}
              <div className="p-6 relative">
                <div className="flex items-start space-x-6">
                  {/* Profile Picture - overlapping the backdrop */}
                  <div className="relative -ml-4 -mt-16">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-gray-600 border-4 border-white shadow-lg">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        userProfile.name.split(' ').map(word => word[0]).join('')
                      )}
                    </div>
                    
                    {/* Profile Picture Upload Button */}
                    <div className="absolute bottom-0 right-0">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                          disabled={isUploadingProfilePicture}
                        />
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                          {isUploadingProfilePicture ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera size={16} />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                
                {/* User Information */}
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      {/* Name and Pronouns */}
                      <div>
                        {editingSection === 'basic' ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="Full Name"
                              />
                              <input
                                type="text"
                                value={editForm.pronouns}
                                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                                className="text-lg text-gray-700 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                placeholder="Pronouns (optional)"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-4">
                            <h2 className="text-3xl font-bold text-gray-900">{userProfile.name}</h2>
                            {userProfile.pronouns && (
                              <span className="text-lg text-gray-700">({userProfile.pronouns})</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Academic Details with Icons */}
                      <div className="space-y-3">
                        {editingSection === 'basic' ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-800">
                              <Calendar size={18} className="text-gray-600" />
                              <select
                                value={editForm.year}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                className="text-lg bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900"
                              >
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                                <option value="Graduate">Graduate</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-800">
                              <GraduationCap size={18} className="text-gray-600" />
                              <input
                                type="text"
                                value={editForm.program}
                                onChange={(e) => handleInputChange('program', e.target.value)}
                                className="text-lg bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900"
                                placeholder="Program"
                              />
                            </div>
                            <div className="flex items-center space-x-3 text-gray-800">
                              <MapPin size={18} className="text-gray-600" />
                              <input
                                type="text"
                                value={editForm.school}
                                onChange={(e) => handleInputChange('school', e.target.value)}
                                className="text-lg bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900"
                                placeholder="School"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-800">
                              <Calendar size={18} className="text-gray-600" />
                              <span className="text-lg">{userProfile.year}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-800">
                              <GraduationCap size={18} className="text-gray-600" />
                              <span className="text-lg">{userProfile.program}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-800">
                              <MapPin size={18} className="text-gray-600" />
                              <span className="text-lg">{userProfile.school}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    {editingSection === 'basic' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveSection}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelClubEdit}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditSection('basic')}
                        className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Basic Info"
                      >
                        <Edit size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
              </div>
              {editingSection !== 'about' && (
                <button
                  onClick={() => handleEditSection('about')}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit About Me"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
            
            {editingSection === 'about' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                  <textarea
                    value={editForm.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="What are you looking for?"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelClubEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
                <div className="flex items-center space-x-2">
                  <Target size={16} className="text-blue-600" />
                  <p className="text-gray-700 font-medium">{userProfile.goals}</p>
                </div>
              </div>
            )}
          </div>

          {/* Current Clubs Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Current Clubs</h3>
              </div>
              <button
                onClick={handleAddClub}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add Club</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.currentClubs.map((club) => (
                <div key={club.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 
                        className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/club/${club.id}`)}
                      >
                        {club.name}
                      </h4>
                      <p className="text-sm text-blue-600 mb-2">{club.role}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Member since {formatDate(club.joinDate)}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => toggleDropdown(club.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showDropdown === club.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => handleEditClub(club)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveClub(club.id)}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clubs Currently Applying For Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Clubs Currently Applying For</h3>
            </div>
            
            {applications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 
                          className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/club/${application.clubId}`)}
                        >
                          {application.clubName}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {application.status !== 'Incomplete' ? application.dateSubmitted : 'Draft'}
                          </span>
                        </div>
                        {application.position && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-blue-600">{application.position}</span>
                            {application.secondRole && (
                              <span className="text-xs font-medium text-blue-600 ml-2">, {application.secondRole}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No applications yet</p>
                <button
                  onClick={() => navigate('/search')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Clubs
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Club Modal */}
      {showAddClubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add Club</h3>
              <button
                onClick={() => setShowAddClubModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for a club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Club Search Results */}
            {!selectedClub && searchQuery && (
              <div className="mb-4 max-h-40 overflow-y-auto">
                {filteredClubs.map((club) => (
                  <div
                    key={club.id}
                    onClick={() => handleClubSelect(club)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer mb-2"
                  >
                    <h4 className="font-medium text-gray-900">{club.name}</h4>
                    <p className="text-sm text-gray-600">{club.description?.substring(0, 60)}...</p>
                  </div>
                ))}
                {filteredClubs.length === 0 && (
                  <p className="text-gray-500 text-center py-2">No clubs found</p>
                )}
              </div>
            )}

            {/* Club Details Form */}
            {selectedClub && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedClub.name}</h4>
                  <p className="text-sm text-blue-700">{selectedClub.description?.substring(0, 80)}...</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Member, Executive, Developer"
                    value={newClubForm.role}
                    onChange={(e) => setNewClubForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <input
                    type="date"
                    value={newClubForm.joinDate}
                    onChange={(e) => setNewClubForm(prev => ({ ...prev, joinDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleSubmitClub}
                    disabled={!newClubForm.role || !newClubForm.joinDate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Club
                  </button>
                  <button
                    onClick={() => setShowAddClubModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {editingClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Edit Club</h3>
              <button
                onClick={handleCancelClubEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900">{editingClub.name}</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                <input
                  type="text"
                  placeholder="e.g., Member, Executive, Developer"
                  value={newClubForm.role}
                  onChange={(e) => setNewClubForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <input
                  type="date"
                  value={newClubForm.joinDate}
                  onChange={(e) => setNewClubForm(prev => ({ ...prev, joinDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleUpdateClub}
                  disabled={!newClubForm.role || !newClubForm.joinDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update Club
                </button>
                <button
                  onClick={handleCancelClubEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserProfile;
