import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { getCurrentAcademicYear } from '../utils/academicYear';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isFinalized, setIsFinalized] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [academicYear] = useState(getCurrentAcademicYear());
  const [userRole, setUserRole] = useState('admin'); // 'teacher' or 'admin'
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    // Check if user is teacher or admin
    const teacherMongoId = localStorage.getItem('teacherId');
    if (teacherMongoId) {
      setUserRole('teacher');
      fetchTeacherData(teacherMongoId);
    } else {
      setUserRole('admin');
      fetchClasses();
    }
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudentsAndAttendance();
    } else {
      setStudents([]);
      setAttendanceList([]);
      setIsFinalized(false);
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const fetchTeacherData = async (teacherId) => {
    try {
      const response = await api.get(`/teachers/${teacherId}`);
      const teacher = response.data;
      setTeacherData(teacher);
      
      // Auto-select teacher's assigned class
      if (teacher.classAssigned && teacher.classAssigned.class && teacher.classAssigned.section) {
        setSelectedClass(teacher.classAssigned.class);
        setSelectedSection(teacher.classAssigned.section);
      }
      
      // Fetch all classes for admin reference (but teacher won't see dropdown)
      fetchClasses();
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setMessage({ type: 'error', text: 'Failed to load teacher information' });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      setLoadingData(true);
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get(`/classes/${selectedClass}/${selectedSection}/students`),
        api.get(`/attendance/class/${selectedClass}/${selectedSection}`, {
          params: { date: selectedDate, academicYear }
        }).catch(() => ({ data: null }))
      ]);

      const studentsData = studentsRes.data;
      setStudents(studentsData);

      const attendanceData = attendanceRes?.data;
      const recordsMap = (attendanceData?.records || []).reduce((acc, r) => {
        acc[String(r.studentId)] = r.status;
        return acc;
      }, {});

      setIsFinalized(!!attendanceData?.isFinalized);

      const initialAttendance = studentsData.map((student, idx) => ({
        studentId: student._id,
        studentName: student.name,
        rollNo: student.studentId || String(idx + 1),
        status: recordsMap[String(student._id)] || ''
      }));
      setAttendanceList(initialAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch students' });
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceList(prevList =>
      prevList.map(item =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isFinalized) return;

    if (!selectedClass || !selectedSection || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select class, section, and date' });
      return;
    }

    if (attendanceList.length === 0) {
      setMessage({ type: 'error', text: 'No students found' });
      return;
    }

    const unmarked = attendanceList.filter(item => !item.status);
    if (unmarked.length > 0) {
      setMessage({ type: 'error', text: `Please select a status for all students. ${unmarked.length} unmarked.` });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = attendanceList
        .filter(item => item.status)
        .map(item => ({ studentId: String(item.studentId), status: item.status }));
      const response = await api.post('/attendance/mark', {
        className: selectedClass,
        section: selectedSection,
        date: selectedDate,
        attendanceList: payload,
        academicYear
      });

      const errCount = response.data.errors?.length || 0;
      const msg = errCount > 0
        ? `Saved ${response.data.marked} students. ${errCount} failed.`
        : `Attendance saved for ${response.data.marked} students. You can edit until finalized.`;
      setMessage({ type: 'success', text: msg });
      if (response.data.marked > 0) fetchStudentsAndAttendance();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save attendance' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (e) => {
    e.preventDefault();
    if (isFinalized) return;

    if (!selectedClass || !selectedSection || !selectedDate) {
      setMessage({ type: 'error', text: 'Please select class, section, and date' });
      return;
    }

    if (attendanceList.length === 0) {
      setMessage({ type: 'error', text: 'No students found' });
      return;
    }

    const unmarked = attendanceList.filter(item => !item.status);
    if (unmarked.length > 0) {
      setMessage({ type: 'error', text: `Please mark all students before finalizing. ${unmarked.length} unmarked.` });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = attendanceList
        .filter(item => item.status)
        .map(item => ({ studentId: String(item.studentId), status: item.status }));
      await api.post('/attendance/mark', {
        className: selectedClass,
        section: selectedSection,
        date: selectedDate,
        attendanceList: payload,
        academicYear
      });

      await api.post('/attendance/finalize', {
        className: selectedClass,
        section: selectedSection,
        date: selectedDate,
        academicYear
      });

      setMessage({ type: 'success', text: 'Attendance finalized. No further edits allowed.' });
      setIsFinalized(true);
      fetchStudentsAndAttendance();
    } catch (error) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to finalize';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = (status) => {
    setAttendanceList(prevList =>
      prevList.map(item => ({ ...item, status }))
    );
  };

  const markedCount = attendanceList.filter(i => i.status).length;
  const pendingCount = attendanceList.length - markedCount;
  const presentCount = attendanceList.filter(i => i.status === 'Present').length;
  const absentCount = attendanceList.filter(i => i.status === 'Absent').length;

  // Don't show class selection for teachers - they have auto-detected class
  const showClassSelection = userRole === 'admin';

  return (
    <div className="min-h-screen bg-[#e8f5e9]">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => userRole === 'teacher' ? navigate('/teacher-dashboard') : navigate(-1)}
            className="mb-4 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
              <p className="text-gray-600 text-sm">Mark and manage student attendance</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Class & Date - Only show for admins */}
          {showClassSelection && (
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={selectedClass ? `${selectedClass}-${selectedSection}` : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) {
                      const [c, s] = v.split('-');
                      setSelectedClass(c);
                      setSelectedSection(s);
                    } else {
                      setSelectedClass('');
                      setSelectedSection('');
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={`${c.className}-${c.section}`} value={`${c.className}-${c.section}`}>
                      {c.className}{c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                  required
                />
              </div>
            </div>
          )}

          {/* Date only for teachers - class is auto-detected */}
          {!showClassSelection && teacherData && (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Class</label>
                  <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                    {selectedClass}{selectedSection}
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {message.text && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {loadingData && (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          )}

          {!loadingData && students.length > 0 && (
            <>
              {isFinalized && (
                <div className="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" clipRule="evenodd" /></svg>
                  <span className="font-semibold">View Only — Attendance is finalized and cannot be edited</span>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-500 text-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
                    <span className="text-sm font-medium opacity-90">Total Students</span>
                  </div>
                  <div className="text-2xl font-bold">{attendanceList.length}</div>
                </div>
                <div className="bg-blue-500 text-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <span className="text-sm font-medium opacity-90">Marked</span>
                  </div>
                  <div className="text-2xl font-bold">{markedCount}</div>
                  <div className="text-sm opacity-90">{pendingCount} pending</div>
                </div>
                <div className="bg-blue-500 text-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-green-300" />
                    <span className="text-sm font-medium opacity-90">Present</span>
                  </div>
                  <div className="text-2xl font-bold">{presentCount}</div>
                </div>
                <div className="bg-red-500 text-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium opacity-90">Absent</span>
                  </div>
                  <div className="text-2xl font-bold">{absentCount}</div>
                </div>
              </div>

              {/* Bulk Buttons - hidden when finalized */}
              {!isFinalized && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => toggleAll('Present')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">
                  Mark All Present
                </button>
                <button type="button" onClick={() => toggleAll('Absent')} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">
                  Mark All Absent
                </button>
              </div>
              )}

              {/* Student Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mark Attendance</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceList.map((item) => (
                        <tr key={item.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-800">{item.rollNo || '-'}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{item.studentName}</td>
                          <td className="px-4 py-3">
                            {isFinalized ? (
                              <span className={`inline-flex px-3 py-1 rounded text-sm font-medium ${
                                item.status === 'Present' ? 'bg-green-100 text-green-800' :
                                item.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {item.status || '—'}
                              </span>
                            ) : (
                              <div className="flex gap-1">
                                <button type="button" onClick={() => handleStatusChange(item.studentId, 'Present')}
                                  className={`min-w-[2rem] h-8 px-2 text-sm font-semibold rounded ${item.status === 'Present' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>P</button>
                                <button type="button" onClick={() => handleStatusChange(item.studentId, 'Absent')}
                                  className={`min-w-[2rem] h-8 px-2 text-sm font-semibold rounded ${item.status === 'Absent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>A</button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.status ? (
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                item.status === 'Present' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Not marked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Buttons - hidden when finalized */}
              {!isFinalized && (
              <div className="flex justify-end gap-3">
                <button type="submit" disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleFinalize} disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Finalize Attendance
                </button>
              </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;

