import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Use AuthContext login function
        login(response.data.user, response.data.token);
        
        console.log('Login successful, navigating...');
        
        // Navigate based on user role and type
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else if (response.data.user.user_type === 'club') {
          navigate('/club/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
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

      {/* Right Side - Login Form */}
      <div className="w-2/5 bg-gradient-to-b from-[#3D5CF5] to-[#3DB8F5] opacity-60 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Welcome</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    name="userType"
                    value="student"
                    checked={userType === 'student'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Student</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="club"
                    checked={userType === 'club'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-white">Club</span>
                </label>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-gray-900"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-[#3D5CF5] focus:ring-[#3D5CF5]"
                />
                <span className="text-sm">Remember Me</span>
              </label>
              <button
                type="button"
                className="text-white text-sm hover:underline bg-transparent border-0 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#3D5CF5] py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-white text-sm">Don't have an account? </span>
              <a href="/register" className="text-white text-sm hover:underline font-medium">
                Register
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
