import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages without sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard pages with sidebar */}
        <Route path="/" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <Home />
            </div>
          </div>
        } />
        
        <Route path="/search" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <SearchPage />
            </div>
          </div>
        } />
        
        <Route path="/club/:id" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <ClubDetail />
            </div>
          </div>
        } />

        <Route path="/club/:id/apply" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <ClubApplication />
            </div>
          </div>
        } />

        <Route path="/hiring" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <HiringDashboard />
            </div>
          </div>
        } />

        <Route path="/favorites" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <Favorites />
            </div>
          </div>
        } />
        
        <Route path="/profile" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <UserProfile />
            </div>
          </div>
        } />
        
        <Route path="/register-club" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <ClubRegistration />
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App; 