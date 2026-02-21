import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

const TeacherAdminAlerts = () => {
  const navigate = useNavigate();

  const teacherMongoId = localStorage.getItem('teacherId'); // Fixed: was 'teacherMongoId'
  const academicYear = '2024-2025';

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherMongoId) return;
    fetchAlerts();
  }, [teacherMongoId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      // ✅ ADMIN → CLASS alerts for teacher’s class
      const className = localStorage.getItem('teacherClass');
      const section = localStorage.getItem('teacherSection');

      const res = await api.get(
        `/alerts/class/${className}/${section}`,
        { params: { academicYear } }
      );

      setAlerts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admin alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`);
      fetchAlerts(); // refresh
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  if (!teacherMongoId) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-red-600">
        Teacher session missing. Please login again.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Admin Alerts
        </h2>

        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-gray-500">
          No alerts from admin
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-4 ${
                alert.isRead ? 'bg-gray-100' : 'bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {alert.title}
                  </h3>

                  <p className="text-gray-700 mt-1">
                    {alert.message}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>

                {!alert.isRead && (
                  <button
                    onClick={() => markAsRead(alert._id)}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAdminAlerts;
