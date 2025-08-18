import React, { useState } from 'react';
import { Bell, ChevronDown, Edit, Plus, FileText, Github, Linkedin } from 'lucide-react';

const HiringDashboard = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);

  const applications = [
    {
      id: 1,
      club: {
        name: "Queen's Tech and Media Association",
        logo: "QTMA",
        color: "bg-blue-500"
      },
      status: "Interview",
      statusColor: "bg-blue-100 text-blue-700",
      dateSubmitted: "March 4, 2025",
      hasAction: true
    },
    {
      id: 2,
      club: {
        name: "Queen's Startup Consulting",
        logo: "QSC",
        color: "bg-black"
      },
      status: "Submitted",
      statusColor: "bg-green-100 text-green-700",
      dateSubmitted: "March 4, 2025",
      hasAction: true
    },
    {
      id: 3,
      club: {
        name: "Freshsight Consulting",
        logo: "FC",
        color: "bg-blue-900"
      },
      status: "Incomplete",
      statusColor: "bg-yellow-100 text-yellow-700",
      dateSubmitted: "",
      hasAction: true
    },
    {
      id: 4,
      club: {
        name: "Queen's University Investment Counsel",
        logo: "QUIC",
        color: "bg-blue-900"
      },
      status: "Submitted",
      statusColor: "bg-green-100 text-green-700",
      dateSubmitted: "March 4, 2025",
      hasAction: true
    },
    {
      id: 5,
      club: {
        name: "Limestone Capital",
        logo: "LC",
        color: "bg-orange-600"
      },
      status: "Incomplete",
      statusColor: "bg-yellow-100 text-yellow-700",
      dateSubmitted: "",
      hasAction: true
    }
  ];

  const calendarEvents = [
    { day: 13, event: { club: "QTMA", type: "Interview", time: "2:00pm", color: "bg-blue-500" } },
    { day: 15, event: { club: "Freshsight", type: "Application Deadline", color: "bg-blue-900" } },
    { day: 16, event: { club: "Limestone", type: "Application Deadline", color: "bg-orange-600" } },
    { day: 18, event: { club: "QTMA", type: "Interview Results", color: "bg-blue-500" } }
  ];

  const documents = [
    { name: "Resume", icon: FileText, hasEdit: true, hasAdd: false },
    { name: "Transcript", icon: FileText, hasEdit: true, hasAdd: false },
    { name: "Portfolio", icon: Plus, hasEdit: false, hasAdd: true },
    { name: "Github", icon: Github, hasEdit: false, hasAdd: true },
    { name: "LinkedIn", icon: Linkedin, hasEdit: true, hasAdd: false }
  ];

  const handleApplicationAction = (applicationId) => {
    setSelectedApplication(selectedApplication === applicationId ? null : applicationId);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Application Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Bell size={20} className="text-gray-600 cursor-pointer hover:text-gray-800" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">William Smith</div>
                <div className="text-xs text-gray-500">williamsmith@gmail.com</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          
          {/* My Applications Table - Takes up 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Applications</h2>
            <div className="border-b border-gray-200 mb-6"></div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Club</th>
                    <th className="pb-3">Application Status</th>
                    <th className="pb-3">Date Submitted</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full ${app.club.color} flex items-center justify-center text-white font-semibold text-sm`}>
                            {app.club.logo}
                          </div>
                          <span className="font-medium text-gray-900">{app.club.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${app.statusColor}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-500">
                        {app.dateSubmitted || '-'}
                      </td>
                      <td className="py-4">
                        <div className="relative">
                          <button
                            onClick={() => handleApplicationAction(app.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit size={16} className="text-gray-600" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {selectedApplication === app.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  View Application
                                </button>
                                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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

          {/* Right Side - Calendar and Documents */}
          <div className="space-y-6">
            
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => {
                  const day = 12 + i;
                  const event = calendarEvents.find(e => e.day === day);
                  
                  return (
                    <div key={day} className="text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </div>
                      <div className="relative">
                        <div className="w-8 h-8 mx-auto bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-700">
                          {day}
                        </div>
                        {event && (
                          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 ${event.event.color} rounded-lg flex items-center justify-center text-xs text-white font-medium`}>
                            {event.event.type === 'Interview' ? 'I' : 'D'}
                          </div>
                        )}
                      </div>
                      {event && (
                        <div className="mt-2 text-xs text-gray-600 text-center">
                          <div className={`inline-block px-2 py-1 rounded ${event.event.color} text-white text-xs`}>
                            {event.event.club}
                          </div>
                          <div className="text-gray-500 mt-1">
                            {event.event.type === 'Interview' ? event.event.time : event.event.type}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Resources</h3>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <doc.icon size={20} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.hasEdit && (
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <Edit size={16} className="text-gray-600" />
                        </button>
                      )}
                      {doc.hasAdd && (
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <Plus size={16} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringDashboard;
