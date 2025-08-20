import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Eye, Plus, ChevronDown } from 'lucide-react';

const HiringDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const navigate = useNavigate();

  // Mock applications data
  const applications = [
    {
      id: 1,
      clubName: "Queen's Tech and Media Association",
      clubIcon: "QTMA",
      clubIconBg: "bg-blue-600",
      status: "Interview",
      statusColor: "bg-blue-100 text-blue-600",
      dateSubmitted: "March 4, 2025"
    },
    {
      id: 2,
      clubName: "Queen's Startup Consulting",
      clubIcon: "QSC",
      clubIconBg: "bg-black",
      status: "Submitted",
      statusColor: "bg-green-100 text-green-600",
      dateSubmitted: "March 8, 2025"
    },
    {
      id: 3,
      clubName: "Freshsight Consulting",
      clubIcon: "FC",
      clubIconBg: "bg-blue-800",
      status: "Incomplete",
      statusColor: "bg-yellow-100 text-yellow-600",
      dateSubmitted: "March 10, 2025"
    },
    {
      id: 4,
      clubName: "Queen's University Investment Counsel",
      clubIcon: "QUIC",
      clubIconBg: "bg-blue-800",
      status: "Submitted",
      statusColor: "bg-green-100 text-green-600",
      dateSubmitted: "March 12, 2025"
    },
    {
      id: 5,
      clubName: "Limestone Capital",
      clubIcon: "LC",
      clubIconBg: "bg-orange-600",
      status: "Submitted",
      statusColor: "bg-green-100 text-green-600",
      dateSubmitted: "March 15, 2025"
    }
  ];

  // Mock calendar events
  const calendarEvents = [
    { day: 13, club: "QTMA", event: "2:00pm Interview", clubIcon: "QTMA", clubIconBg: "bg-blue-600" },
    { day: 15, club: "Freshsight Consulting", event: "Application Deadline", clubIcon: "FC", clubIconBg: "bg-blue-800" },
    { day: 16, club: "Limestone Capital", event: "Application Deadline", clubIcon: "LC", clubIconBg: "bg-orange-600" },
    { day: 18, club: "QTMA", event: "Interview Results", clubIcon: "QTMA", clubIconBg: "bg-blue-600" }
  ];

  // Mock documents
  const documents = [
    { name: "Resume", icon: Eye, action: "view" },
    { name: "Transcript", icon: Eye, action: "view" },
    { name: "Portfolio", icon: Plus, action: "add" },
    { name: "Github", icon: Plus, action: "add" },
    { name: "LinkedIn", icon: Eye, action: "view" }
  ];

  const handleActionClick = (application) => {
    if (application.id === 5) { // Limestone Capital
      setSelectedApplication(selectedApplication === application.id ? null : application.id);
    } else {
      // For other applications, navigate to view application
      navigate(`/club/${application.id}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">


      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {/* My Applications Table - Full Width */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Applications</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Club</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Application Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${app.clubIconBg} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                          {app.clubIcon}
                        </div>
                        <span className="font-medium text-gray-900">{app.clubName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{app.dateSubmitted}</td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <button
                          onClick={() => handleActionClick(app)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        
                        {/* Dropdown for Limestone Capital */}
                        {selectedApplication === app.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                View Application
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Withdraw Application
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section - Timeline and Documents */}
        <div className="grid grid-cols-10 gap-6">
          {/* Timeline - Takes up 7/10 of the width */}
          <div className="col-span-7 bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const day = 12 + i;
                const event = calendarEvents.find(e => e.day === day);
                
                return (
                  <div key={day} className="text-center relative">
                    {/* Vertical grey line between dates (except for the last one) */}
                    {i < 6 && (
                      <div className="absolute top-0 left-full w-px h-5/6 bg-gray-100 transform -translate-x-1/2"></div>
                    )}
                    
                    <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                    {event && (
                      <div className="text-center">
                        <div className={`w-6 h-6 ${event.clubIconBg} rounded-full flex items-center justify-center text-white text-xs font-semibold mx-auto mb-1`}>
                          {event.clubIcon}
                        </div>
                        <div className="text-xs text-gray-600 leading-tight">{event.event}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents - Takes up 3/10 of the width */}
          <div className="col-span-3 bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-3">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-gray-700">{doc.name}</span>
                  <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                    <doc.icon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringDashboard;
