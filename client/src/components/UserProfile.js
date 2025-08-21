import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Camera, MapPin, GraduationCap, Calendar, User, Target, Users, Clock, CheckCircle } from 'lucide-react';

const UserProfile = () => {
  const navigate = useNavigate();
  
  // Mock user data - in a real app this would come from a database
  const [userProfile, setUserProfile] = useState({
    name: "William Smith",
    program: "Computer Science",
    year: "3rd Year",
    faculty: "Faculty of Engineering and Applied Science",
    pronouns: "He/Him",
    avatar: null, // URL to avatar image
    bio: "Passionate about technology and innovation, with a focus on software development and product design.",
    goals: "Looking for design + consulting roles in tech companies and startups.",
    currentClubs: [
      {
        id: 1,
        name: "Queen's Tech and Media Association (QTMA)",
        role: "Software Developer",
        joinDate: "September 2023"
      },
      {
        id: 2,
        name: "Queen's Startup Consulting",
        role: "Business Analyst",
        joinDate: "January 2024"
      }
    ],
    applyingClubs: [
      {
        id: 3,
        name: "Environmental Sustainability Group",
        status: "Application Submitted",
        date: "March 15, 2024"
      },
      {
        id: 4,
        name: "Political Science Society",
        status: "Interview Scheduled",
        date: "March 20, 2024"
      }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...userProfile });
  };

  const handleSave = () => {
    setUserProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({ ...userProfile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'application submitted':
        return 'bg-blue-100 text-blue-800';
      case 'interview scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Header Card */}
          <div className="relative">
            {/* Gradient Background Card */}
            <div className="bg-gradient-to-r from-purple-200 to-blue-200 rounded-2xl p-6 relative overflow-hidden">
              {/* Decorative dots */}
              <div className="absolute top-4 left-4 text-purple-300 text-2xl">•••</div>
              <div className="absolute top-8 left-8 text-purple-300 text-lg">•••</div>
              <div className="absolute top-12 left-12 text-purple-300 text-sm">•••</div>
              
              <div className="flex items-start space-x-6 relative z-10">
                {/* Profile Picture - overlapping the card edges */}
                <div className="relative -ml-4 -mt-4">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-gray-600 border-4 border-white shadow-lg">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      userProfile.name.split(' ').map(word => word[0]).join('')
                    )}
                  </div>
                </div>
                
                {/* User Information */}
                <div className="flex-1 pt-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      {/* Name and Pronouns */}
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{userProfile.name}</h2>
                        <span className="text-lg text-gray-700">{userProfile.pronouns}</span>
                      </div>
                      
                      {/* Academic Details with Icons */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-800">
                          <Calendar size={18} className="text-gray-700" />
                          <span className="text-lg">{userProfile.year}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-800">
                          <GraduationCap size={18} className="text-gray-700" />
                          <span className="text-lg">{userProfile.program}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-800">
                          <MapPin size={18} className="text-gray-700" />
                          <span className="text-lg">{userProfile.faculty}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Edit Button */}
                    <button
                      onClick={handleEdit}
                      className="p-3 text-gray-800 hover:text-gray-600 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Additional decorative dots */}
              <div className="absolute bottom-6 right-20 text-purple-300 text-lg">•••</div>
              <div className="absolute bottom-8 right-16 text-purple-300 text-sm">•••</div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User size={20} className="text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">About Me</h3>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
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
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
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
            <div className="flex items-center space-x-2 mb-6">
              <Users size={20} className="text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Current Clubs</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.currentClubs.map((club) => (
                <div key={club.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{club.name}</h4>
                      <p className="text-sm text-blue-600 mb-2">{club.role}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-green-500" />
                        <span>Member since {club.joinDate}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/club/${club.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      View Club
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clubs Currently Applying For Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock size={20} className="text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-900">Clubs Currently Applying For</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userProfile.applyingClubs.map((club) => (
                <div key={club.id} className="border border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{club.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(club.status)}`}>
                          {club.status}
                        </span>
                        <span className="text-sm text-gray-500">{club.date}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/club/${club.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      View Club
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
