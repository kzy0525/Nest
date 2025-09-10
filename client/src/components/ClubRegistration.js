import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import axios from 'axios';

const ClubRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: [],
    contact_email: '',
    website: '',
    instagram: '',
    slogan: '',
    applications_open: '',
    application_deadline: '',
    interview_start_date: '',
    interview_end_date: '',
    second_round_start_date: '',
    second_round_end_date: '',
    results_released: '',
    application_questions: '',
    isHiring: false,
    hasInterviews: false
  });

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ text: '', type: 'short' });
  const [positions, setPositions] = useState([]);
  const [newPosition, setNewPosition] = useState({ title: '', spots: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
    
    // Clear category validation error when user selects a category
    if (validationErrors.categories) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.categories;
        return newErrors;
      });
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.text.trim()) {
      const question = {
        id: Date.now(), 
        text: newQuestion.text,
        type: newQuestion.type
      };
      setQuestions(prev => [...prev, question]);
      setNewQuestion({ text: '', type: 'short' });
    }
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleAddPosition = () => {
    if (newPosition.title.trim() && newPosition.spots.trim()) {
      const position = {
        id: Date.now(),
        title: newPosition.title,
        spots: parseInt(newPosition.spots) || 0
      };
      setPositions(prev => [...prev, position]);
      setNewPosition({ title: '', spots: '' });
    }
  };

  const handleRemovePosition = (positionId) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleBackdropChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackdropFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setValidationErrors({});
    
    // Check for validation errors
    const errors = {};
    if (!formData.name) errors.name = 'Club name is required';
    if (!formData.description) errors.description = 'Description is required';
    if (formData.categories.length === 0) errors.categories = 'Please select at least one category';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare form data for API call
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'categories') {
            formDataToSend.append('category', JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      
      // Add application questions
      formDataToSend.append('application_questions', JSON.stringify(questions));
      
      // Add positions
      formDataToSend.append('positions', JSON.stringify(positions));
      
      // Add file uploads if they exist
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (backdropFile) {
        formDataToSend.append('backdrop', backdropFile);
      }

      // Create club in database
      const response = await axios.post('/api/admin/clubs', formDataToSend, {
          headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/club/dashboard');
        }, 2000);
      }

    } catch (error) {
      console.error('Error creating club:', error);
      setError('Failed to create club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/club/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Club Profile</h1>
              <p className="text-gray-600">Set up your club profile to start receiving applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Club profile created successfully! Redirecting to dashboard...
              </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
          </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter club name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slogan
                  </label>
                  <input
                    type="text"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your club's motto or tagline"
                  />
              </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your club's mission, activities, and what makes it unique"
                    required
                  />
                </div>

                {/* Club Images */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Club Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Club Logo
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="logo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                id="logo-upload"
                                name="logo-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleLogoChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          {logoFile && (
                            <p className="text-sm text-green-600 font-medium">
                              Selected: {logoFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Backdrop Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Club Backdrop
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="backdrop-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                id="backdrop-upload"
                                name="backdrop-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleBackdropChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          {backdropFile && (
                            <p className="text-sm text-green-600 font-medium">
                              Selected: {backdropFile.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['Technology', 'Business', 'Arts', 'Sports', 'Community', 'Health', 'Culture', 'Social', 'Innovation', 'Media'].map((category) => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                          checked={formData.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                {validationErrors.categories && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.categories}</p>
                )}
              </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="w-full md:w-1/3 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      placeholder="@yourclub"
                    />
                  </div>

                  <div className="w-full md:w-1/3 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      placeholder="https://yourclub.com"
                    />
                  </div>

                  <div className="w-full md:w-1/3 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                      placeholder="club@university.edu"
                    />
                  </div>
                </div>
                </div>
              </div>



            {/* Hiring Information */}
                  <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hiring Information</h2>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    name="isHiring"
                    checked={formData.isHiring}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Is your club currently hiring?
                  </label>
                    </div>
                    
                {formData.isHiring && (
                  <div className="space-y-6">
                    {/* Available Positions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Available Positions</h3>
                    <div className="space-y-4">
                        {positions.map((position) => (
                          <div key={position.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                              <p className="font-medium text-gray-900">{position.title}</p>
                              <p className="text-sm text-gray-500">{position.spots} spot{position.spots !== 1 ? 's' : ''} available</p>
                          </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePosition(position.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ))}
                        
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            value={newPosition.title}
                            onChange={(e) => setNewPosition(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Position title (e.g., President, Treasurer)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <input
                            type="number"
                            value={newPosition.spots}
                            onChange={(e) => setNewPosition(prev => ({ ...prev, spots: e.target.value }))}
                            placeholder="Spots"
                            min="1"
                            className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddPosition}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Plus size={20} className="mr-2" />
                            Add
                          </button>
                        </div>
                    </div>
                  </div>

                    {/* Application Dates */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Timeline</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Open Date *
                          </label>
                          <input
                            type="date"
                            name="applications_open"
                            value={formData.applications_open}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Close Date *
                          </label>
                          <input
                            type="date"
                            name="application_deadline"
                            value={formData.application_deadline}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interview Dates (Optional) */}
                    <div>
                      <div className="flex items-center space-x-4 mb-4">
                        <input
                          type="checkbox"
                          name="hasInterviews"
                          checked={formData.hasInterviews}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-lg font-medium text-gray-700">
                          Will you be conducting interviews? (Optional)
                        </label>
                      </div>

                      {formData.hasInterviews && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-md font-medium text-gray-800 mb-3">1st Round Interview</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Interview Start Date
                                </label>
                                <input
                                  type="date"
                                  name="interview_start_date"
                                  value={formData.interview_start_date}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Interview End Date
                                </label>
                                <input
                                  type="date"
                                  name="interview_end_date"
                                  value={formData.interview_end_date}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-md font-medium text-gray-800 mb-3">2nd Round Interview (Optional)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Second Round Start Date
                                </label>
                                <input
                                  type="date"
                                  name="second_round_start_date"
                                  value={formData.second_round_start_date || ''}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Second Round End Date
                                </label>
                                <input
                                  type="date"
                                  name="second_round_end_date"
                                  value={formData.second_round_end_date || ''}
                                  onChange={handleChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Results Released Date */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Results Released Date *
                          </label>
                          <input
                            type="date"
                            name="results_released"
                            value={formData.results_released}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                        </div>
                      )}
                    </div>
                  </div>


            {/* Application Questions */}
            {formData.isHiring && (
                      <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Questions</h2>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{question.text}</p>
                        <p className="text-sm text-gray-500 capitalize">{question.type} answer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Text
                                  </label>
                                  <input
                                    type="text"
                          value={newQuestion.text}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your question"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Answer Type
                                  </label>
                                  <select
                          value={newQuestion.type}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="short">Short Answer</option>
                          <option value="long">Long Answer</option>
                                  </select>
                                </div>
                                <button
                                  type="button"
                        onClick={handleAddQuestion}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                        <Plus size={20} className="mr-2" />
                        Add Question
                                </button>
                      </div>
                  </div>
                </div>
                </div>
              )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
                <button
                  type="button"
                onClick={() => navigate('/club/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Cancel
                </button>
                <button
                  type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Profile...' : 'Create Club Profile'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ClubRegistration;