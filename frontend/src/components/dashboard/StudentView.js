import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentReport from '../StudentReport';
import AttendanceSummary from '../student/AttendanceSummary';
import StudentAlerts from '../student/StudentAlerts';   // ✅ ADD THIS

const StudentView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentClass');
    localStorage.removeItem('studentSection');

    navigate('/student-login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance':
        return <StudentReport />;

      case 'summary':
        return <AttendanceSummary />;

      case 'alerts':
        return <StudentAlerts />;   // ✅ REAL BACKEND DATA

      default:
        return <StudentReport />;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Student Dashboard</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 mt-2">Welcome to your student portal</p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* My Attendance Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                📊
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              My Attendance
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View your attendance records and reports
            </p>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View Attendance
            </button>
          </div>

          {/* Attendance Summary Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                📈
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Attendance Summary
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View overall attendance statistics and trends
            </p>
            <button
              onClick={() => setActiveTab('summary')}
              className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'summary'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View Summary
            </button>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                ⚠️
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Alerts & Notices
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              View important announcements and alerts
            </p>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                activeTab === 'alerts'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View Alerts
            </button>
          </div>

        </div>

        {/* Content Area */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentView;
