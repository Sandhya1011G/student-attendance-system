import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Alert } from '../../types';

const StudentAlerts: React.FC = () => {
  const studentId = localStorage.getItem('studentId');

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const academicYear = '2024-2025'; // keep consistent with DB for now

  useEffect(() => {
    if (!studentId) return;

    fetchAlerts();
  }, [studentId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);

      const res = await api.get<Alert[]>(`/alerts/student/${studentId}`, {
        params: { academicYear }
      });

      const fetchedAlerts = res.data || [];
      setAlerts(fetchedAlerts);

      // Automatically mark all unread alerts as read
      const unreadAlerts = fetchedAlerts.filter(alert => !alert.isRead);
      
      // Mark alerts as read in parallel
      const markReadPromises = unreadAlerts.map(alert => 
        api.put(`/alerts/${alert._id}/read`)
      );

      await Promise.all(markReadPromises);

      // Update local state to reflect read status
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));

    } catch (err: any) {
      console.error('Alerts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-red-600">
        Student session missing. Please login again.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Student Alerts</h2>

      {loading ? (
        <div className="text-center py-10">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No alerts found
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert: Alert) => (
            <div
              key={alert._id}
              className={`border rounded-lg p-4 ${
                alert.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                <div className="ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.isRead 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {alert.isRead ? 'Read' : 'New'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAlerts;
