import React, { useEffect, useState } from 'react';
import api from '../../config/api';

const StudentAlerts = () => {
  const studentId = localStorage.getItem('studentId');

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const academicYear = '2024-2025'; // keep consistent with DB for now

  useEffect(() => {
    if (!studentId) return;

    fetchAlerts();
  }, [studentId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/alerts/student/${studentId}`, {
        params: { academicYear }
      });

      const fetchedAlerts = res.data || [];
      setAlerts(fetchedAlerts);

      // Automatically mark all unread alerts as read
      const unreadAlerts = fetchedAlerts.filter(alert => !alert.isRead);
      if (unreadAlerts.length > 0) {
        await markAllAlertsAsRead(unreadAlerts);
      }
    } catch (err) {
      console.error('Alerts Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAlertsAsRead = async (unreadAlerts) => {
    try {
      // Mark each unread alert as read
      const markReadPromises = unreadAlerts.map(alert => 
        api.put(`/alerts/${alert._id}/read`)
      );
      
      await Promise.all(markReadPromises);
      
      // Update UI to show all alerts as read
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, isRead: true }))
      );
      
      console.log(`Marked ${unreadAlerts.length} alerts as read automatically`);
    } catch (err) {
      console.error('Auto Mark Read Error:', err);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/read`);

      // update UI instantly (no reload)
      setAlerts(prev =>
        prev.map(a =>
          a._id === alertId ? { ...a, isRead: true } : a
        )
      );
    } catch (err) {
      console.error('Mark Read Error:', err);
    }
  };

  if (!studentId) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        Student session missing. Please login again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading alerts...
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Alerts / Notices</h2>
        <p className="text-gray-500 text-sm">No alerts available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Alerts / Notices</h2>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert._id}
            className={`border rounded-lg p-4 transition ${
              alert.isRead ? 'bg-gray-50' : 'bg-yellow-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-800">
                  {alert.title}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {alert.message}
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>

              <div className={`text-xs px-2 py-1 rounded font-medium ${
                alert.isRead 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {alert.isRead ? 'READ' : 'UNREAD'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAlerts;
