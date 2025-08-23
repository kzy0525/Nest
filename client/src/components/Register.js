import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
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
        !formData.password || !formData.confirmPassword || !formData.school || !formData.major) {
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
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
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
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
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
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* School and Major */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Your school"
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
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
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
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
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
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
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
              className="w-full bg-white text-[#3D5CF5] py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Create Account
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
