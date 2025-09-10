import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import SearchPage from './components/Search';
import ClubDetail from './components/ClubDetail';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import HiringDashboard from './components/HiringDashboard';
import Favorites from './components/Favorites';
import UserProfile from './components/UserProfile';
import ClubRegistration from './components/ClubRegistration';
import ClubApplication from './components/ClubApplication';
import ClubDashboard from './components/ClubDashboard';
import ClubAnalytics from './components/ClubAnalytics';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* Auth pages without sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard pages with sidebar */}
        <Route path="/" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <Home />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/search" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <SearchPage />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/club/:id" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <ClubDetail />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/:id/apply" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <ClubApplication />
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Club Dashboard Routes */}
        <Route path="/club/dashboard" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <ClubDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/register" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <Header />
                <ClubRegistration />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/analytics" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <ClubAnalytics />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/hiring" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <HiringDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <Favorites />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <UserProfile />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/register-club" element={
          <ProtectedRoute requireAdmin={true}>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <Header />
                <ClubRegistration />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <div className="App flex h-screen bg-gray-100">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <AdminDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 