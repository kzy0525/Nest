import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    major: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.password || !formData.confirmPassword || !formData.studentId || !formData.major) {
      alert('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    
    // TODO: Implement actual registration logic with backend API
    console.log('Registration attempt:', formData);
    
    // For now, just navigate to login
    // In a real app, you'd send the data to the backend
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Register text in top-left */}
      <div className="absolute top-8 left-8 text-white text-2xl font-semibold">
        Register
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-6xl h-[700px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-l-3xl">
          {/* Abstract pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1)_0%,transparent_50%)]"></div>
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-12">
            <h1 className="text-6xl font-bold bg-gradient-to-b from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              Nest
            </h1>
            <p className="text-gray-700 text-lg text-center leading-relaxed">
              Join thousands of students discovering amazing opportunities
            </p>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-3xl overflow-y-auto">
          <div className="h-full flex flex-col justify-center px-12 py-8">
            <h2 className="text-3xl font-semibold text-white mb-8">Create Account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    First Name:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Student ID:
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                    placeholder="Student ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Major:
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                    placeholder="Your major"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password:
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Confirm Password:
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-0 rounded focus:ring-2 focus:ring-blue-300"
                  required
                />
                <span className="text-white text-sm">
                  I agree to the{' '}
                  <button className="text-blue-200 hover:text-white underline bg-transparent border-0 cursor-pointer">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button className="text-blue-200 hover:text-white underline bg-transparent border-0 cursor-pointer">
                    Privacy Policy
                  </button>
                </span>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Create Account
              </button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-white text-sm">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-200 hover:text-white underline font-medium">
                    Login
                  </a>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
