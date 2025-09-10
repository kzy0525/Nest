import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    user_type: 'student'
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || 
        !formData.confirmPassword || !formData.school) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        school: formData.school,
        user_type: formData.user_type
      });

      if (response.data.success) {
        setSuccess(true);
        // Auto-login after successful registration
        login(response.data.user, response.data.token);
        
        // Show success message for 2 seconds, then navigate based on user type
        setTimeout(() => {
          if (response.data.user.user_type === 'club') {
            navigate('/club/dashboard');
          } else {
            navigate('/');
          }
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Nest Branding */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Abstract Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #3D5CF5 1px, transparent 1px),
              linear-gradient(0deg, #3D5CF5 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Nest Branding */}
        <div className="relative text-center z-10">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#3D5CF5] to-[#3DB8F5] bg-clip-text text-transparent">
            Nest
          </h1>
          <p className="text-xl text-gray-700">
            All your campus opportunities, in one place
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-2/5 bg-gradient-to-b from-[#3D5CF5] to-[#3DB8F5] opacity-60 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Registration successful! Redirecting to dashboard...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                I am a:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="user_type"
                    value="student"
                    checked={formData.user_type === 'student'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="user_type"
                    value="club"
                    checked={formData.user_type === 'club'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-white">Club</span>
                </label>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {formData.user_type === 'club' ? 'Club Name:' : 'Full Name:'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder={formData.user_type === 'club' ? 'Your club name' : 'Your full name'}
                required
              />
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
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder="your.email@queensu.ca"
                required
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password:
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                  placeholder="Password"
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
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                School:
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder="e.g., Queen's University"
                required
              />
            </div>


            {/* Terms Agreement */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-[#3D5CF5] bg-white border-0 rounded focus:ring-2 focus:ring-[#3D5CF5]"
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
              disabled={isLoading}
              className="w-full bg-white text-[#3D5CF5] py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-white text-sm">Already have an account? </span>
              <a href="/login" className="text-white text-sm hover:underline font-medium">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
