import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const TeacherView = () => {
  const navigate = useNavigate();

  const teacherName = localStorage.getItem('teacherName') || 'Teacher';
  const teacherMongoId = localStorage.getItem('teacherId'); // Fixed: was 'teacherMongoId'

  const [unreadCount, setUnreadCount] = useState(0);

  const academicYear = '2024-2025';

  const handleLogout = () => {
    // Clear teacher session
    localStorage.removeItem('teacherId'); // Fixed: was 'teacherMongoId'
    localStorage.removeItem('teacherName');
    localStorage.removeItem('teacherMongoId'); // Also clear this just in case
    localStorage.removeItem('isClassTeacher');
    localStorage.removeItem('teacherClass');
    localStorage.removeItem('teacherSection');
    
    // Navigate to teacher login page
    navigate('/teacher-login');
  };

  useEffect(() => {
    if (!teacherMongoId) return;

    fetchAdminAlerts();
  }, []);

  const fetchAdminAlerts = async () => {
    try {
      const res = await api.get(`/alerts/teacher/${teacherMongoId}`, {
        params: { academicYear }
      });

      const unread = res.data.filter(a => !a.isRead).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('Admin Alerts Error:', err);
    }
  };

  if (!teacherMongoId) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-red-600">
        Teacher session missing. Please login again.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold mb-1">
          Teacher Panel
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Welcome, {teacherName}
      </p>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* MARK ATTENDANCE */}
        <div className="border rounded-lg p-4 hover:shadow transition">
          <h3 className="font-semibold text-gray-800 mb-2">
            Mark Attendance
          </h3>

          <p className="text-sm text-gray-500 mb-3">
            Record daily student attendance
          </p>

          <button
            onClick={() => navigate('/mark-attendance')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          >
            Open
          </button>
        </div>

        {/* VIEW REPORTS */}
        <div className="border rounded-lg p-4 hover:shadow transition">
          <h3 className="font-semibold text-gray-800 mb-2">
            Attendance Reports
          </h3>

          <p className="text-sm text-gray-500 mb-3">
            View class & student performance
          </p>

          <button
            onClick={() => navigate('/reports')}
            className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
          >
            View
          </button>
        </div>

        {/* SEND ALERTS */}
        <div className="border rounded-lg p-4 hover:shadow transition">
          <h3 className="font-semibold text-gray-800 mb-2">
            Send Alerts
          </h3>

          <p className="text-sm text-gray-500 mb-3">
            Notify students about attendance
          </p>

          <button
            onClick={() => navigate('/teacher-alerts')}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-400"
          >
            Send
          </button>
        </div>

        {/* ✅ ADMIN ALERTS (NEW) */}
        <div className="border rounded-lg p-4 hover:shadow transition relative">
          <h3 className="font-semibold text-gray-800 mb-2">
            Admin Alerts
          </h3>

          <p className="text-sm text-gray-500 mb-3">
            Messages from school admin
          </p>

          <button
            onClick={() => navigate('/teacher-admin-alerts')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            View
          </button>

          {/* ✅ Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </div>
          )}
        </div>

      </div>

      {/* FOOTER NOTE */}
      <div className="text-sm text-gray-500 mt-6">
        Teachers can manage attendance, reports, and alerts.
      </div>
    </div>
  );
};

export default TeacherView;
