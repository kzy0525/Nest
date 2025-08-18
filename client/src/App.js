import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClubDashboard from './components/ClubDashboard';
import ClubDetail from './components/ClubDetail';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="App flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<ClubDashboard />} />
            <Route path="/club/:id" element={<ClubDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 