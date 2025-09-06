import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Send, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ClubApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationForm, setApplicationForm] = useState({
    resume: null,
    email: '',
    phone: '',
    year: '',
    program: '',
    position: '',
    answers: {},
    resumeFileName: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await axios.get(`/api/clubs/${id}`);
      setClub(response.data);
      setLoading(false);
      
      // Check for existing draft application
      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      const existingDraft = existingApplications.find(app => 
        app.clubId === parseInt(id) && app.status === 'Incomplete'
      );

      if (existingDraft) {
        // Load existing draft data
        setApplicationForm({
          resume: null, // Resume file can't be restored from localStorage
          email: existingDraft.email || '',
          phone: existingDraft.phone || '',
          year: existingDraft.year || '',
          program: existingDraft.program || '',
          position: existingDraft.position || '',
          answers: existingDraft.answers || {},
          resumeFileName: existingDraft.resumeFileName || null // Store resume filename for display
        });
      } else {
        // Initialize answers object with club's application questions
        if (response.data.application_questions) {
          try {
            const questions = JSON.parse(response.data.application_questions);
            if (Array.isArray(questions)) {
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
            console.log('Error parsing application_questions in fetch:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching club details:', error);
      setLoading(false);
    }
  };



  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setApplicationForm(prev => ({
        ...prev,
        resume: file,
        resumeFileName: null // Clear saved filename when new file is uploaded
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
        clubLogo: club.logo || null,
        clubIcon: club.name.split(' ').map(word => word[0]).join('').substring(0, 4),
        clubIconBg: "bg-blue-600",
        position: applicationForm.position,
        year: applicationForm.year,
        program: applicationForm.program,
        email: applicationForm.email,
        phone: applicationForm.phone,
        answers: applicationForm.answers, // Save the application question answers
        resumeFileName: applicationForm.resume ? applicationForm.resume.name : null, // Save resume filename
        status: "Incomplete",
        statusColor: "bg-yellow-100 text-yellow-600",
        dateSubmitted: new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };

      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      
      // Check if there's already a draft for this club
      const existingDraftIndex = existingApplications.findIndex(app => 
        app.clubId === club.id && app.status === 'Incomplete'
      );
      
      let updatedApplications;
      if (existingDraftIndex >= 0) {
        // Update existing draft
        updatedApplications = [...existingApplications];
        updatedApplications[existingDraftIndex] = newApplication;
      } else {
        // Add new draft
        updatedApplications = [...existingApplications, newApplication];
      }
      
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

    if (!applicationForm.email || !applicationForm.phone || !applicationForm.year || !applicationForm.program) {
      alert('Please fill in all required fields (email, phone, year, and program).');
      return;
    }

    // Check if club has positions and if position is required
    let hasPositions = false;
    try {
      if (club.open_positions) {
        const positions = JSON.parse(club.open_positions);
        hasPositions = Array.isArray(positions) && positions.length > 0;
      }
    } catch (error) {
      console.log('Error parsing open_positions:', error);
      hasPositions = false;
    }

    if (hasPositions && !applicationForm.position) {
      alert('Please select a position.');
      return;
    }

    // Check if all questions are answered
    let questions = [];
    try {
      if (club.application_questions) {
        questions = JSON.parse(club.application_questions);
        if (!Array.isArray(questions)) {
          questions = [];
        }
      }
    } catch (error) {
      console.log('Error parsing application_questions:', error);
      questions = [];
    }
    
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
        clubLogo: club.logo || null,
        clubIcon: club.name.split(' ').map(word => word[0]).join('').substring(0, 4),
        clubIconBg: "bg-blue-600",
        position: applicationForm.position,
        year: applicationForm.year,
        program: applicationForm.program,
        email: applicationForm.email,
        phone: applicationForm.phone,
        answers: applicationForm.answers, // Save the application question answers
        resumeFileName: applicationForm.resume ? applicationForm.resume.name : null, // Save resume filename
        status: "Submitted",
        statusColor: "bg-green-100 text-green-600",
        dateSubmitted: new Date().toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };

      const existingApplications = JSON.parse(localStorage.getItem('clubApplications') || '[]');
      
      // Check if there's already a draft for this club
      const existingDraftIndex = existingApplications.findIndex(app => 
        app.clubId === club.id && app.status === 'Incomplete'
      );
      
      let updatedApplications;
      if (existingDraftIndex >= 0) {
        // Update existing draft to submitted
        updatedApplications = [...existingApplications];
        updatedApplications[existingDraftIndex] = newApplication;
      } else {
        // Add new submitted application
        updatedApplications = [...existingApplications, newApplication];
      }
      
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

  // Parse application questions safely
  let questions = [];
  try {
    if (club.application_questions) {
      questions = JSON.parse(club.application_questions);
      if (!Array.isArray(questions)) {
        questions = [];
      }
    }
  } catch (error) {
    console.log('Error parsing application_questions in render:', error);
    questions = [];
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        

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

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={applicationForm.email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@queensu.ca"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={applicationForm.phone}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  value={applicationForm.year}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your current year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                <input
                  type="text"
                  value={applicationForm.program}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, program: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
            </div>
          </div>

          {/* Position Selection */}
          {(() => {
            let positions = [];
            try {
              if (club && club.open_positions) {
                positions = JSON.parse(club.open_positions);
                if (!Array.isArray(positions)) {
                  positions = [];
                }
              }
            } catch (error) {
              console.log('Error parsing open_positions:', error);
              positions = [];
            }

            return positions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Selection</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Position *</label>
                  <select
                    value={applicationForm.position}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose a position...</option>
                    {positions.map((position, index) => (
                      <option key={index} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}

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
                    {applicationForm.resume ? applicationForm.resume.name : 
                     applicationForm.resumeFileName ? applicationForm.resumeFileName : 'Upload Resume'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {applicationForm.resume ? 'Click to change file' : 
                     applicationForm.resumeFileName ? 'Resume saved in draft - click to re-upload' : 'PDF files only, max 5MB'}
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
