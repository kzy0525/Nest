import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    console.log('Login attempt:', { email, password, rememberMe });
    navigate('/');
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
              className="w-full bg-white text-[#3D5CF5] py-3 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Login
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
