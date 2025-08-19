import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SearchPage from './components/Search';
import ClubDetail from './components/ClubDetail';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import HiringDashboard from './components/HiringDashboard';
import Favorites from './components/Favorites';

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
              <Home />
            </div>
          </div>
        } />
        
        <Route path="/search" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <SearchPage />
            </div>
          </div>
        } />
        
        <Route path="/club/:id" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <ClubDetail />
            </div>
          </div>
        } />

        <Route path="/hiring" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <HiringDashboard />
            </div>
          </div>
        } />

        <Route path="/favorites" element={
          <div className="App flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Favorites />
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App; 