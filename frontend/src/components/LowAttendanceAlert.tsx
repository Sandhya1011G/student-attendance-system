import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { Student, LowAttendanceStudent, NotificationMessage, Class as ClassType } from '../types';

interface Filters {
  className: string;
  section: string;
  threshold: number;
  academicYear: string;
}

const LowAttendanceAlert: React.FC = () => {
  const [shortageStudents, setShortageStudents] = useState<LowAttendanceStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifyMessage, setNotifyMessage] = useState<NotificationMessage>({ type: '', text: '' });
  const [filters, setFilters] = useState<Filters>({
    className: '',
    section: '',
    threshold: 75,
    academicYear: getCurrentAcademicYear()
  });
  const [classes, setClasses] = useState<ClassType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    fetchShortageStudents();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const response = await api.get<ClassType[]>('/classes');
      setClasses(response.data);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchShortageStudents = async () => {
    try {
      setLoading(true);
      const params: any = {
        academicYear: filters.academicYear,
        threshold: filters.threshold
      };
      if (filters.className) params.className = filters.className;
      if (filters.section) params.section = filters.section;

      const response = await api.get<{ students: LowAttendanceStudent[] }>('/attendance/shortage', { params });
      setShortageStudents(response.data.students || []);
    } catch (error: any) {
      console.error('Error fetching shortage students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyParent = async (studentId: string) => {
    try {
      setNotifyingId(studentId);
      await api.post('/notifications/parent', {
        studentId,
        message: `Your child's attendance is below ${filters.threshold}%. Please ensure regular attendance.`
      });

      setNotifyMessage({ type: 'success', text: 'Parent notified successfully' });
      setTimeout(() => setNotifyMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      console.error('Error notifying parent:', error);
      setNotifyMessage({ type: 'error', text: 'Failed to notify parent' });
    } finally {
      setNotifyingId(null);
    }
  };

  const getSeverityColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 65) return 'bg-orange-500';
    if (percentage < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Low Attendance Alerts
          </h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={filters.className}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, className: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, section: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Sections</option>
              {classes
                .filter(c => !filters.className || c.className === filters.className)
                .map(c => c.section)
                .map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold (%)</label>
            <input
              type="number"
              value={filters.threshold}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, threshold: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, academicYear: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>
        </div>

        {/* Notification Message */}
        {notifyMessage.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg ${
            notifyMessage.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {notifyMessage.text}
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : shortageStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No students found with attendance below {filters.threshold}%
          </div>
        ) : (
          <div className="space-y-4">
            {shortageStudents.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${getSeverityColor(item.attendance.percentage)}`}></div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {item.student.name} - {item.student.class}{item.student.section}
                        </h3>
                        <p className="text-gray-600">
                          Parent: {item.student.parentName} | Contact: {item.student.parentContact}
                        </p>
                        <div className="mt-2 flex space-x-4">
                          <span className="text-sm">
                            Attendance: <span className="font-semibold text-red-600">
                              {item.attendance.percentage}%
                            </span>
                          </span>
                          <span className="text-sm">
                            Present: {item.attendance.presentDays} / Total: {item.attendance.totalDays}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/student-report/${item.student._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Report
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleNotifyParent(item.student._id)}
                      disabled={notifyingId === item.student._id}
                    >
                      {notifyingId === item.student._id ? 'Sending...' : 'Contact Parent'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LowAttendanceAlert;
