import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, CheckCircle } from 'lucide-react';

const ClubRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: [],
    contact_email: '',
    website: '',
    instagram: '',
    linkedin: '',
    slogan: '',
    member_count: '',
    acceptance_rate: '',
    logo: null,
    backdrop: null,
    isHiring: false,
    applications_open: '',
    applications_close: '',
    hasInterviews: false,
    first_round_interviews: '',
    second_round_interviews: '',
    results_released: '',
    positions: [{ title: '', spots: '' }],
    hasApplicationQuestions: false,
    applicationQuestions: []
  });

  const [errors, setErrors] = useState({});

  const categories = [
    'Academic', 'Arts', 'Business', 'Culture', 'Community', 
    'Sports', 'Health', 'Environment', 'Innovation', 'Science', 
    'Technology', 'Politics', 'Media', 'Social'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  const addPosition = () => {
    setFormData(prev => ({
      ...prev,
      positions: [...prev.positions, { title: '', spots: '' }]
    }));
  };

  const removePosition = (index) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index)
    }));
  };

  const updatePosition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.map((pos, i) => 
        i === index ? { ...pos, [field]: value } : pos
      )
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleFileRemove = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const addApplicationQuestion = () => {
    setFormData(prev => ({
      ...prev,
      applicationQuestions: [...prev.applicationQuestions, { 
        id: Date.now(), 
        text: '', 
        type: 'short' 
      }]
    }));
  };

  const removeApplicationQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      applicationQuestions: prev.applicationQuestions.filter((_, i) => i !== index)
    }));
  };

  const updateApplicationQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      applicationQuestions: prev.applicationQuestions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Club name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.category.length === 0) newErrors.category = 'Please select at least one category';
    if (!formData.contact_email.trim()) newErrors.contact_email = 'Contact email is required';
    if (!formData.member_count) newErrors.member_count = 'Member count is required';
    
    // Validate positions if hiring is enabled
    if (formData.isHiring) {
      formData.positions.forEach((pos, index) => {
        if (!pos.title.trim()) {
          newErrors[`position_${index}_title`] = `Position ${index + 1} title is required`;
        }
        if (!pos.spots || parseInt(pos.spots) < 1) {
          newErrors[`position_${index}_spots`] = `Position ${index + 1} must have at least 1 spot`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', JSON.stringify(formData.category));
      formDataToSend.append('contact_email', formData.contact_email);
      formDataToSend.append('website', formData.website || '');
      formDataToSend.append('instagram', formData.instagram || '');
      formDataToSend.append('linkedin', formData.linkedin || '');
      formDataToSend.append('slogan', formData.slogan || '');
      formDataToSend.append('member_count', formData.member_count);
      formDataToSend.append('acceptance_rate', formData.acceptance_rate || '');
      formDataToSend.append('rating', '0');
      formDataToSend.append('review_count', '0');
      
      // Add files if they exist
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.backdrop) {
        formDataToSend.append('backdrop', formData.backdrop);
      }
      
      // Add hiring-related fields
      formDataToSend.append('isHiring', formData.isHiring.toString());
      if (formData.isHiring) {
        formDataToSend.append('open_positions', formData.positions.map(p => p.title).join(', '));
        formDataToSend.append('available_spots', formData.positions.reduce((total, p) => total + parseInt(p.spots || 0), 0).toString());
        formDataToSend.append('applications_open', formData.applications_open);
        formDataToSend.append('applications_close', formData.applications_close);
        formDataToSend.append('hasInterviews', formData.hasInterviews.toString());
        if (formData.hasInterviews) {
          formDataToSend.append('interview_start_date', formData.first_round_interviews);
          formDataToSend.append('interview_end_date', formData.second_round_interviews);
        }
        formDataToSend.append('results_released', formData.results_released);
        formDataToSend.append('application_questions', formData.hasApplicationQuestions ? JSON.stringify(formData.applicationQuestions) : '');
      }
      
      console.log('Sending club data with files');
      
      const response = await fetch('/api/clubs', {
        method: 'POST',
        body: formDataToSend, // Don't set Content-Type header for FormData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Club created successfully:', result);
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/search');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create club');
      }
    } catch (error) {
      console.error('Error creating club:', error);
      setErrors({ submit: error.message || 'Failed to create club. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/search');
  };

  if (submitSuccess) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Club Created Successfully!</h2>
              <p className="text-gray-600 mb-4">Your club profile has been added to the database.</p>
              <p className="text-sm text-gray-500">Redirecting to search page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Club</h1>
            <p className="text-gray-600">Create a profile for your club to help students discover and join your organization.</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter club name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Innovation through collaboration"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Club Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your club's mission, activities, and what makes it unique..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Club Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {formData.logo ? (
                      <div className="space-y-3">
                        <div className="w-20 h-20 mx-auto">
                          <img 
                            src={URL.createObjectURL(formData.logo)} 
                            alt="Club logo preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-600">{formData.logo.name}</p>
                        <button
                          type="button"
                          onClick={() => handleFileRemove('logo')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-3">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Upload club logo</p>
                        <p className="text-xs text-gray-500 mb-3">PNG, JPG up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('logo', e.target.files[0])}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Backdrop Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Backdrop
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {formData.backdrop ? (
                      <div className="space-y-3">
                        <div className="w-full h-32 mx-auto">
                          <img 
                            src={URL.createObjectURL(formData.backdrop)} 
                            alt="Club backdrop preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <p className="text-sm text-gray-600">{formData.backdrop.name}</p>
                        <button
                          type="button"
                          onClick={() => handleFileRemove('backdrop')}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mx-auto w-12 h-12 text-gray-400 mb-3">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Upload club backdrop</p>
                        <p className="text-xs text-gray-500 mb-3">PNG, JPG up to 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload('backdrop', e.target.files[0])}
                          className="hidden"
                          id="backdrop-upload"
                        />
                        <label
                          htmlFor="backdrop-upload"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Count and Acceptance Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Member Count *
                  </label>
                  <input
                    type="number"
                    value={formData.member_count}
                    onChange={(e) => handleInputChange('member_count', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.member_count ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 25"
                    min="1"
                  />
                  {errors.member_count && <p className="mt-1 text-sm text-red-600">{errors.member_count}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acceptance Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.acceptance_rate}
                    onChange={(e) => handleInputChange('acceptance_rate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 15"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.category.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contact_email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="club@university.edu"
                />
                {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
              </div>

              {/* Social Media & Website */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourclub.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="@yourclub"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-club-linkedin"
                  />
                </div>
              </div>

              {/* Currently Hiring Toggle */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Recruitment</h3>
                    <p className="text-sm text-gray-600">Is your club currently hiring new members?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isHiring', !formData.isHiring)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      formData.isHiring ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isHiring ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Hiring Information - Only show if isHiring is true */}
              {formData.isHiring && (
                <>
                  {/* Open Positions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Open Positions
                      </label>
                      <button
                        type="button"
                        onClick={addPosition}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        + Add Position
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.positions.map((position, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Position Title {index + 1}
                            </label>
                            <input
                              type="text"
                              value={position.title}
                              onChange={(e) => updatePosition(index, 'title', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors[`position_${index}_title`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="e.g., Software Developer"
                            />
                            {errors[`position_${index}_title`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`position_${index}_title`]}</p>
                            )}
                          </div>
                          
                          <div className="w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Spots
                            </label>
                            <input
                              type="number"
                              value={position.spots}
                              onChange={(e) => updatePosition(index, 'spots', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors[`position_${index}_title`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="1"
                              min="1"
                            />
                            {errors[`position_${index}_spots`] && (
                              <p className="mt-1 text-sm text-red-600">{errors[`position_${index}_spots`]}</p>
                            )}
                          </div>
                          
                          {formData.positions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePosition(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove position"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Recruitment Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Open Date *
                      </label>
                      <input
                        type="date"
                        value={formData.applications_open}
                        onChange={(e) => handleInputChange('applications_open', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Application Close Date *
                      </label>
                      <input
                        type="date"
                        value={formData.applications_close}
                        onChange={(e) => handleInputChange('applications_close', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Optional Interview Dates */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Interview Process (Optional)</h4>
                        <p className="text-sm text-gray-600">Add interview dates if your club conducts interviews</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('hasInterviews', !formData.hasInterviews)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          formData.hasInterviews 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {formData.hasInterviews ? 'Remove Interviews' : 'Add Interviews'}
                      </button>
                    </div>

                    {formData.hasInterviews && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Round Interviews
                          </label>
                          <input
                            type="date"
                            value={formData.first_round_interviews}
                            onChange={(e) => handleInputChange('first_round_interviews', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Second Round Interviews
                          </label>
                          <input
                            type="date"
                            value={formData.second_round_interviews}
                            onChange={(e) => handleInputChange('second_round_interviews', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results Released Date - Independent Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Results</h4>
                      <p className="text-sm text-gray-600">When will you notify applicants of the final decision?</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Results Released Date
                        </label>
                        <input
                          type="date"
                          value={formData.results_released}
                          onChange={(e) => handleInputChange('results_released', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Application Questions Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Application Questions</h4>
                        <p className="text-sm text-gray-600">Add custom questions for applicants to answer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('hasApplicationQuestions', !formData.hasApplicationQuestions)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          formData.hasApplicationQuestions 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {formData.hasApplicationQuestions ? 'Remove Questions' : 'Add Questions'}
                      </button>
                    </div>

                    {formData.hasApplicationQuestions && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Application Questions
                          </label>
                          <button
                            type="button"
                            onClick={addApplicationQuestion}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            + Add Question
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {formData.applicationQuestions.map((question, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex-1 space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question {index + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={question.text}
                                    onChange={(e) => updateApplicationQuestion(index, 'text', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Why do you want to join this club?"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Answer Type
                                  </label>
                                  <select
                                    value={question.type}
                                    onChange={(e) => updateApplicationQuestion(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="short">Short Answer (1-2 sentences)</option>
                                    <option value="long">Long Answer (Paragraph)</option>
                                  </select>
                                </div>
                              </div>
                              
                              {formData.applicationQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeApplicationQuestion(index)}
                                  className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove question"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {formData.applicationQuestions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <p>No questions added yet. Click "Add Question" to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}



              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{isSubmitting ? 'Creating...' : 'Create Club'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubRegistration;
