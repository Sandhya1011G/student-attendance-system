import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { getCurrentAcademicYear } from '../utils/academicYear';

const LowAttendanceAlert = () => {
  const [shortageStudents, setShortageStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({
    className: '',
    section: '',
    threshold: 75,
    academicYear: getCurrentAcademicYear()
  });
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    fetchShortageStudents();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchShortageStudents = async () => {
    try {
      setLoading(true);
      const params = {
        academicYear: filters.academicYear,
        threshold: filters.threshold
      };
      if (filters.className) params.className = filters.className;
      if (filters.section) params.section = filters.section;

      const response = await api.get('/attendance/shortage', { params });
      setShortageStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching shortage students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (percentage) => {
    if (percentage < 60) return 'bg-red-600';
    if (percentage < 70) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const handleContactParent = async (item) => {
    const studentId = item.student.id;
    setNotifyingId(studentId);
    setNotifyMessage({ type: '', text: '' });

    try {
      const phone = String(item.student.parentContact || '').trim();
      if (!phone) {
        setNotifyMessage({ type: 'error', text: 'No parent contact number available.' });
        return;
      }

      await api.post('/attendance/notify-parent', {
        parentContact: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`,
        studentName: item.student.name,
        class: item.student.class,
        section: item.student.section,
        attendancePercentage: item.attendance.percentage
      });

      setNotifyMessage({ type: 'success', text: `SMS sent to ${item.student.parentName} at ${phone}` });
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Failed to send notification';
      setNotifyMessage({ type: 'error', text: msg });
    } finally {
      setNotifyingId(null);
    }
  };
  const handleNotifyTeacher = async () => {
  try {
    if (!filters.className || !filters.section) {
      alert('Please select class & section first');
      return;
    }

    await api.post('/admin-alerts/notify-teacher', {
      className: filters.className,
      section: filters.section,
      academicYear: filters.academicYear,
      count: shortageStudents.length
    });

    alert('Alert sent to class teacher');

  } catch (err) {
    console.error(err);
    console.log('FULL ERROR:', err);
console.log('SERVER ERROR:', err.response?.data);
alert(err.response?.data?.error || err.message);

  }
};


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Low Attendance Alerts</h1>
            <p className="text-sm text-gray-500 mt-1">Shows students with attendance below threshold based on saved & finalized attendance</p>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            ACTION REQUIRED: Low Attendance Alert
          </div>
        </div>

        {notifyMessage.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg ${
              notifyMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {notifyMessage.text}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={filters.className}
              onChange={(e) => setFilters({ ...filters, className: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Classes</option>
              {[...new Set(classes.map(c => c.className))].map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters({ ...filters, section: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Sections</option>
              {classes
                .filter(c => !filters.className || c.className === filters.className)
                .map(c => c.section)
                .map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Threshold (%)</label>
            <input
              type="number"
              value={filters.threshold}
              onChange={(e) => setFilters({ ...filters, threshold: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : shortageStudents.length > 0 ? (
          <>
            {/* Summary Card */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Class {filters.className || 'All'} - Urgent Attendance
              </h2>

              <p className="text-red-700 mb-4">
                {shortageStudents.length} student{shortageStudents.length !== 1 ? 's' : ''} in{' '}
                {filters.className || 'all classes'} have attendance below {filters.threshold}% threshold.
              </p>

              {/* ✅ NEW BUTTON */}
              {filters.className && filters.section && (
                <button
                  onClick={handleNotifyTeacher}
                  className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  NOTIFY CLASS TEACHER
                </button>
              )}
            </div>

            {/* Students List */}
            <div className="space-y-4">
              {shortageStudents.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center">
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
                        onClick={() => navigate(`/student-report/${item.student.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        VIEW DETAILS
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleContactParent(item)}
                        disabled={notifyingId === item.student.id}
                      >
                        {notifyingId === item.student.id ? 'Sending...' : 'CONTACT PARENTS'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No students found with attendance below {filters.threshold}%
          </div>
        )}
      </div>
    </div>
  );
};

export default LowAttendanceAlert;

