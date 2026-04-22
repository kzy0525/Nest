import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import SearchPage from './components/Search';
import ClubDetail from './components/ClubDetail';
import Sidebar from './components/Sidebar';
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
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Home />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/search" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <SearchPage />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/club/:id" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ClubDetail />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/:id/apply" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ClubApplication />
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Club Dashboard Routes */}
        <Route path="/club/dashboard" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ClubDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/register" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <ClubRegistration />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/club/analytics" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <ClubAnalytics />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/hiring" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <HiringDashboard />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Favorites />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <UserProfile />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/register-club" element={
          <ProtectedRoute requireAdmin={true}>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <ClubRegistration />
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <div className="App flex h-screen" style={{ background: '#faf7f2' }}>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
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