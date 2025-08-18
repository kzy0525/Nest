import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    // TODO: Implement actual login logic with backend API
    console.log('Login attempt:', { email, password, rememberMe });
    
    // For now, just navigate to dashboard
    // In a real app, you'd verify credentials and get a token
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Login text in top-left */}
      <div className="absolute top-8 left-8 text-white text-2xl font-semibold">
        Login
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-6xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden">
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
              All your campus opportunities, in one place
            </p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-3xl">
          <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-3xl font-semibold text-white mb-8">Welcome</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-0 rounded focus:ring-2 focus:ring-blue-300"
                  />
                  <span className="text-white text-sm">Remember Me</span>
                </label>
                <button className="text-white text-sm hover:underline bg-transparent border-0 cursor-pointer">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Login
              </button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-white text-sm">
                  Don't have an account?{' '}
                  <a href="/register" className="text-blue-200 hover:text-white underline font-medium">
                    Register
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

export default Login;
