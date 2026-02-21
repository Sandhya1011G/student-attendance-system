import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { getCurrentAcademicYear } from '../utils/academicYear';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [filters, setFilters] = useState({
    className: '',
    section: '',
    date: new Date().toISOString().split('T')[0],
    academicYear: getCurrentAcademicYear()
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isFinalized, setIsFinalized] = useState(false);
  const [overallStats, setOverallStats] = useState(null);
  const [topClasses, setTopClasses] = useState([]);
  const [bottomClasses, setBottomClasses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  
  // Reports tab state
  const [reportType, setReportType] = useState('class-wise');
  const [dateRange, setDateRange] = useState('today');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [schoolStats, setSchoolStats] = useState({
    totalStudents: 0,
    overallAttendance: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [classReportData, setClassReportData] = useState(null);
  const [loadingClassReport, setLoadingClassReport] = useState(false);
  const [lowAttendanceData, setLowAttendanceData] = useState([]);
  const [loadingLowAttendance, setLoadingLowAttendance] = useState(false);
  const [notifyingId, setNotifyingId] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState({ type: '', text: '' });
  const [lowAttendanceFilters, setLowAttendanceFilters] = useState({
    className: '',
    section: '',
    threshold: 75,
    academicYear: getCurrentAcademicYear()
  });

  useEffect(() => {
    fetchClasses();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (filters.className && filters.section && activeTab === 'attendance') {
      fetchStudents();
    }
  }, [filters.className, filters.section, activeTab]);

  // Monitor isFinalized state changes
  useEffect(() => {
    console.log('isFinalized state changed:', isFinalized); // Debug log
  }, [isFinalized]);

  // Fetch all students when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports' && reportType === 'student-wise') {
      fetchAllStudents();
    }
  }, [activeTab, reportType, filters.academicYear]);

  // Fetch low attendance data when low attendance tab is active
  useEffect(() => {
    if (activeTab === 'low-attendance') {
      fetchLowAttendance();
    }
  }, [activeTab, lowAttendanceFilters]);

  // Filter students when search or class filter changes
  useEffect(() => {
    if (activeTab === 'reports' && reportType === 'student-wise') {
      const filtered = allStudents.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase());
        const matchesClass = !studentClassFilter || student.class + student.section === studentClassFilter;
        return matchesSearch && matchesClass;
      });
      setFilteredStudents(filtered);
    }
  }, [allStudents, studentSearch, studentClassFilter, activeTab, reportType]);

  const fetchAllStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await api.get('/students/all', {
        params: { academicYear: filters.academicYear }
      });
      
      const studentsWithAttendance = response.data.map(student => ({
        ...student,
        presentDays: Math.floor(Math.random() * 200) + 50, // Mock data
        absentDays: Math.floor(Math.random() * 20) + 5, // Mock data
        attendancePercentage: Math.floor(Math.random() * 30) + 70 // Mock data
      }));
      
      setAllStudents(studentsWithAttendance);
      setFilteredStudents(studentsWithAttendance);
      
      // Calculate school stats
      const totalStudents = studentsWithAttendance.length;
      const avgAttendance = studentsWithAttendance.reduce((sum, student) => sum + student.attendancePercentage, 0) / totalStudents;
      const presentToday = Math.floor(totalStudents * 0.85); // Mock data
      const absentToday = totalStudents - presentToday; // Mock data
      
      setSchoolStats({
        totalStudents,
        overallAttendance: Math.round(avgAttendance),
        presentToday,
        absentToday
      });
      
    } catch (error) {
      console.error('Error fetching all students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchClassReport = async () => {
    if (!filters.className || !filters.section) return;
    
    try {
      setLoadingClassReport(true);
      const response = await api.get(`/attendance/class/${filters.className}/${filters.section}`, {
        params: { date: filters.date, academicYear: filters.academicYear }
      });
      
      setClassReportData(response.data);
      console.log('Class report data:', response.data); // Debug log
      
    } catch (error) {
      console.error('Error fetching class report:', error);
      setMessage('Error loading class report');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoadingClassReport(false);
    }
  };

  const handleViewClassReports = () => {
    fetchClassReport();
  };

  const handleViewStudentReport = (student) => {
    navigate('/student-report/' + student._id, {
      state: {
        academicYear: filters.academicYear
      }
    });
  };

  const handleDownloadSchoolReport = () => {
    // Generate PDF report for school
    console.log('Downloading school report...');
  };

  const fetchLowAttendance = async () => {
    try {
      setLoadingLowAttendance(true);
      const params = {
        academicYear: lowAttendanceFilters.academicYear,
        threshold: lowAttendanceFilters.threshold
      };
      if (lowAttendanceFilters.className) params.className = lowAttendanceFilters.className;
      if (lowAttendanceFilters.section) params.section = lowAttendanceFilters.section;
      
      const response = await api.get('/attendance/shortage', { params });
      
      // Ensure we always have an array - match LowAttendanceAlert structure
      const data = Array.isArray(response.data.students) ? response.data.students : [];
      setLowAttendanceData(data);
      console.log('Low attendance data:', data);
      
    } catch (error) {
      console.error('Error fetching low attendance data:', error);
      setLowAttendanceData([]); // Set empty array on error
      setMessage('Error loading low attendance data');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoadingLowAttendance(false);
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
      if (!lowAttendanceFilters.className || !lowAttendanceFilters.section) {
        alert('Please select class & section first');
        return;
      }

      await api.post('/admin-alerts/notify-teacher', {
        className: lowAttendanceFilters.className,
        section: lowAttendanceFilters.section,
        academicYear: lowAttendanceFilters.academicYear,
        count: lowAttendanceData.length
      });

      setNotifyMessage({ type: 'success', text: 'Alert sent to class teacher' });

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message || 'Failed to send alert';
      setNotifyMessage({ type: 'error', text: msg });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const overviewRes = await api.get('/attendance/overview', {
        params: { academicYear: filters.academicYear }
      });
      const data = overviewRes.data;

      const present = data.overallPresent ?? 0;
      const absent = Number((100 - present).toFixed(1));

      setOverallStats({
        present,
        absent,
        totalStudents: data.totalStudents ?? 0
      });

      setTrendData(data.trend || []);
      setTopClasses(data.topClasses || []);
      setBottomClasses(data.bottomClasses || []);
    } catch (error) {
      console.error('Dashboard Error:', error);
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

  const fetchStudents = async () => {
    if (!filters.className || !filters.section) return;
    
    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: { class: filters.className, section: filters.section }
      });
      setStudents(response.data);
      
      // Initialize attendance for all students
      const initialAttendance = response.data.map(student => ({
        studentId: student._id,
        studentName: student.name,
        status: 'Present'
      }));
      setAttendance(initialAttendance);
      
      // Check if attendance is already finalized
      const finalizedRes = await api.get('/attendance/finalized', {
        params: {
          class: filters.className,
          section: filters.section,
          date: filters.date,
          academicYear: filters.academicYear
        }
      });
      
      console.log('Finalized check response:', finalizedRes.data); // Debug log
      const isFinalized = !!finalizedRes.data.isFinalized;
      console.log('Is attendance finalized?', isFinalized); // Debug log
      setIsFinalized(isFinalized);
      
      if (isFinalized) {
        console.log('Loading existing attendance data...'); // Debug log
        // Load existing attendance
        const attendanceRes = await api.get(`/attendance/class/${filters.className}/${filters.section}`, {
          params: { date: filters.date, academicYear: filters.academicYear }
        });
        
        console.log('Existing attendance response:', attendanceRes.data); // Debug log
        
        if (attendanceRes.data.records) {
          const existingAttendance = attendanceRes.data.records.map(record => ({
            studentId: record.studentId,
            studentName: record.studentName,
            status: record.status
          }));
          setAttendance(existingAttendance);
          console.log('Loaded existing attendance:', existingAttendance); // Debug log
        }
      } else {
        console.log('Attendance not finalized, allowing admin to mark attendance'); // Debug log
      }
      
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    console.log('handleStatusChange called:', { studentId, status, isFinalized, currentAttendance: attendance.length }); // Debug log
    
    // Multiple layers of protection
    if (isFinalized) {
      console.log('BLOCKING: Attendance is finalized - status change not allowed'); // Debug log
      return;
    }
    
    // Additional safety check
    if (attendance.length === 0) {
      console.log('BLOCKING: No attendance data loaded yet'); // Debug log
      return;
    }
    
    console.log('ALLOWING: Status change proceeding'); // Debug log
    setAttendance(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, status }
          : item
      )
    );
  };

  const handleBulkStatusChange = (status) => {
    console.log('handleBulkStatusChange called:', { status, isFinalized, currentAttendance: attendance.length }); // Debug log
    
    // Multiple layers of protection
    if (isFinalized) {
      console.log('BLOCKING: Attendance is finalized - bulk status change not allowed'); // Debug log
      return;
    }
    
    // Additional safety check
    if (attendance.length === 0) {
      console.log('BLOCKING: No attendance data loaded yet'); // Debug log
      return;
    }
    
    console.log('ALLOWING: Bulk status change proceeding'); // Debug log
    setAttendance(prev => 
      prev.map(item => ({ ...item, status }))
    );
  };

  const handleFinalizeAttendance = async () => {
    console.log('handleFinalizeAttendance called:', { isFinalized }); // Debug log
    if (isFinalized) {
      console.log('Blocking finalization - attendance already finalized'); // Debug log
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/attendance/finalize', {
        className: filters.className,
        section: filters.section,
        date: filters.date,
        academicYear: filters.academicYear
      });
      
      setIsFinalized(true);
      setMessage('Attendance finalized successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error finalizing attendance:', error);
      setMessage('Error finalizing attendance');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    console.log('handleSaveAttendance called:', { isFinalized }); // Debug log
    if (isFinalized) {
      console.log('Blocking save - attendance already finalized'); // Debug log
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/attendance/mark', {
        className: filters.className,
        section: filters.section,
        date: filters.date,
        attendanceList: attendance,
        academicYear: filters.academicYear
      });
      
      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage('Error saving attendance');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReports = () => {
    navigate('/attendance-report', {
      state: {
        className: filters.className,
        section: filters.section,
        date: filters.date,
        academicYear: filters.academicYear
      }
    });
  };

  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mark Attendance Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    ✅
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Mark Attendance
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Record daily student attendance for any class
                </p>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Open Mark Attendance
                </button>
              </div>

              {/* Reports Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    📊
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Reports
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  View attendance reports and analytics for all classes
                </p>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Open Reports
                </button>
              </div>

              {/* Low Attendance Card */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    ⚠️
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Low Attendance
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Monitor students with attendance below threshold
                </p>
                <button
                  onClick={() => setActiveTab('low-attendance')}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Open Low Attendance
                </button>
              </div>
            </div>

            {/* Daily Attendance Trend */}
            {trendData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">📈 Daily Attendance Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="attendedPercentage" stroke="#3b82f6" name="Attended %" />
                    <Line type="monotone" dataKey="presentPercentage" stroke="#10b981" name="Present %" />
                    <Line type="monotone" dataKey="absentPercentage" stroke="#ef4444" name="Absent %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Class Performance */}
            {(topClasses.length > 0 || bottomClasses.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topClasses.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">🏆 Top Performing Classes</h2>
                    <div className="space-y-3">
                      {topClasses.map((cls, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div>
                            <span className="font-semibold text-green-800">{i + 1}. {cls.className}</span>
                            <span className="text-green-600 ml-2">{cls.percentage}%</span>
                          </div>
                          <div className="text-green-600 font-medium">
                            Excellent Performance
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bottomClasses.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">📉 Classes Needing Attention</h2>
                    <div className="space-y-3">
                      {bottomClasses.map((cls, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div>
                            <span className="font-semibold text-red-800">{i + 1}. {cls.className}</span>
                            <span className="text-red-600 ml-2">{cls.percentage}%</span>
                          </div>
                          <div className="text-red-600 font-medium">
                            Below Target - Action Required
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">MARK ATTENDANCE</h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={filters.className ? `${filters.className}-${filters.section}` : ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) {
                      const [c, s] = v.split('-');
                      setFilters(prev => ({ ...prev, className: c, section: s }));
                    } else {
                      setFilters(prev => ({ ...prev, className: '', section: '' }));
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                  {filters.academicYear}
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {filters.className && filters.section && !isFinalized && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => handleBulkStatusChange('Present')}
                  disabled={isFinalized}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleBulkStatusChange('Absent')}
                  disabled={isFinalized}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Mark All Absent
                </button>
              </div>
            )}

            {/* Students List */}
            {filters.className && filters.section && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Students ({students.length})
                  </h3>
                  {isFinalized && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      ✓ Finalized
                    </span>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center py-8">Loading students...</div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No students found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">Student Name</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{item.studentName}</td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item.studentId, 'Present')}
                                  disabled={isFinalized}
                                  className={`min-w-[3rem] h-8 px-3 text-sm font-semibold rounded ${
                                    item.status === 'Present'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  } ${isFinalized ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(item.studentId, 'Absent')}
                                  disabled={isFinalized}
                                  className={`min-w-[3rem] h-8 px-3 text-sm font-semibold rounded ${
                                    item.status === 'Absent'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  } ${isFinalized ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action Buttons */}
                {students.length > 0 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-3">
                      {!isFinalized && (
                        <>
                          <button
                            onClick={handleSaveAttendance}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            Save Attendance
                          </button>
                          <button
                            onClick={handleFinalizeAttendance}
                            disabled={loading}
                            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
                          >
                            Finalize Attendance
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={handleViewReports}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      View Reports
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">ATTENDANCE REPORTS</h2>
            
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                >
                  <option value="class-wise">Class-wise Reports</option>
                  <option value="student-wise">All Students Reports</option>
                  <option value="summary">School Summary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                  {filters.academicYear}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {/* Class-wise Reports */}
            {reportType === 'class-wise' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
                    <select
                      value={filters.className ? `${filters.className}-${filters.section}` : ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) {
                          const [c, s] = v.split('-');
                          setFilters(prev => ({ ...prev, className: c, section: s }));
                          setClassReportData(null); // Clear previous report data
                        } else {
                          setFilters(prev => ({ ...prev, className: '', section: '' }));
                          setClassReportData(null); // Clear previous report data
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, date: e.target.value }));
                        setClassReportData(null); // Clear previous report data
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                      {filters.academicYear}
                    </div>
                  </div>
                </div>

                <div className="text-center py-12">
                  <button
                    onClick={handleViewClassReports}
                    disabled={loadingClassReport}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-medium disabled:opacity-50"
                  >
                    {loadingClassReport ? 'Loading Report...' : 'Generate Report'}
                  </button>
                </div>

                {/* Display Report Data */}
                {classReportData && (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Attendance Report - {filters.className}{filters.section}
                      </h3>
                      {classReportData.isFinalized && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          ✓ Finalized
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Date: {new Date(filters.date).toLocaleDateString()} | 
                      Academic Year: {filters.academicYear}
                    </div>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <h4 className="text-lg font-bold text-blue-600">{classReportData.totalStudents || 0}</h4>
                        <p className="text-sm text-gray-600">Total Students</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 text-center">
                        <h4 className="text-lg font-bold text-green-600">{classReportData.presentCount || 0}</h4>
                        <p className="text-sm text-gray-600">Present</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 text-center">
                        <h4 className="text-lg font-bold text-red-600">{classReportData.absentCount || 0}</h4>
                        <p className="text-sm text-gray-600">Absent</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 text-center">
                        <h4 className="text-lg font-bold text-purple-600">{classReportData.attendancePercentage || 0}%</h4>
                        <p className="text-sm text-gray-600">Attendance %</p>
                      </div>
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Student Details</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-3 text-left">Student Name</th>
                              <th className="px-4 py-3 text-center">Status</th>
                              <th className="px-4 py-3 text-center">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classReportData.records && classReportData.records.map((record, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{record.studentName}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    record.status === 'Present' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-600">{filters.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                      >
                        🖨️ Print Report
                      </button>
                      <button
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.setFontSize(12);
                          doc.text(`Attendance Report - ${filters.className}${filters.section}`, 14, 20);
                          doc.text(`Date: ${new Date(filters.date).toLocaleDateString()}`, 14, 30);
                          doc.text(`Academic Year: ${filters.academicYear}`, 14, 40);
                          doc.text(`Total Students: ${classReportData.totalStudents || 0}`, 14, 50);
                          doc.text(`Present: ${classReportData.presentCount || 0}`, 14, 60);
                          doc.text(`Absent: ${classReportData.absentCount || 0}`, 14, 70);
                          doc.text(`Attendance %: ${classReportData.attendancePercentage || 0}%`, 14, 80);
                          
                          if (classReportData.records) {
                            autoTable(doc, {
                              startY: 100,
                              head: [['Student Name', 'Status', 'Date']],
                              body: classReportData.records.map(record => [
                                record.studentName,
                                record.status,
                                filters.date
                              ])
                            });
                          }
                          
                          doc.save(`attendance-report-${filters.className}${filters.section}-${filters.date}.pdf`);
                        }}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        📥 Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Students Reports */}
            {reportType === 'student-wise' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Enter student name..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Filter</label>
                    <select
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                    >
                      <option value="">All Classes</option>
                      {classes.map(c => (
                        <option key={`${c.className}-${c.section}`} value={`${c.className}-${c.section}`}>
                          {c.className}{c.section}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                      {filters.academicYear}
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    All Students ({allStudents.length})
                  </h3>
                  
                  {loadingStudents ? (
                    <div className="text-center py-8">Loading students...</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No students found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left">Student Name</th>
                            <th className="px-4 py-3 text-left">Class</th>
                            <th className="px-4 py-3 text-center">Present Days</th>
                            <th className="px-4 py-3 text-center">Absent Days</th>
                            <th className="px-4 py-3 text-center">Attendance %</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{student.name}</td>
                              <td className="px-4 py-3">{student.class}{student.section}</td>
                              <td className="px-4 py-3 text-center text-green-600">{student.presentDays || 0}</td>
                              <td className="px-4 py-3 text-center text-red-600">{student.absentDays || 0}</td>
                              <td className="px-4 py-3 text-center font-semibold">
                                <span className={student.attendancePercentage >= 75 ? 'text-green-600' : student.attendancePercentage >= 50 ? 'text-amber-600' : 'text-red-600'}>
                                  {student.attendancePercentage || 0}%
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleViewStudentReport(student)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                                >
                                  View Report
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* School Summary */}
            {reportType === 'summary' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Students</h3>
                    <p className="text-3xl font-bold text-blue-600">{schoolStats.totalStudents || 0}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Attendance</h3>
                    <p className="text-3xl font-bold text-green-600">{schoolStats.overallAttendance || 0}%</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Present Today</h3>
                    <p className="text-3xl font-bold text-green-600">{schoolStats.presentToday || 0}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Absent Today</h3>
                    <p className="text-3xl font-bold text-red-600">{schoolStats.absentToday || 0}</p>
                  </div>
                </div>

                <div className="text-center py-12">
                  <button
                    onClick={handleDownloadSchoolReport}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-lg font-medium"
                  >
                    Download School Report
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'low-attendance':
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
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
            
            {/* Filters - Complete from LowAttendanceAlert */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={lowAttendanceFilters.className}
                  onChange={(e) => setLowAttendanceFilters({ ...lowAttendanceFilters, className: e.target.value })}
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
                  value={lowAttendanceFilters.section}
                  onChange={(e) => setLowAttendanceFilters({ ...lowAttendanceFilters, section: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">All Sections</option>
                  {classes
                    .filter(c => !lowAttendanceFilters.className || c.className === lowAttendanceFilters.className)
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
                  value={lowAttendanceFilters.threshold}
                  onChange={(e) => setLowAttendanceFilters({ ...lowAttendanceFilters, threshold: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={lowAttendanceFilters.academicYear}
                  onChange={(e) => setLowAttendanceFilters({ ...lowAttendanceFilters, academicYear: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>

            {loadingLowAttendance ? (
              <div className="text-center py-12">Loading...</div>
            ) : !Array.isArray(lowAttendanceData) || lowAttendanceData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No students found with attendance below {lowAttendanceFilters.threshold}%
              </div>
            ) : (
              <>
                {/* Summary Card */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-red-800 mb-2">
                    Class {lowAttendanceFilters.className || 'All'} - Urgent Attendance
                  </h2>

                  <p className="text-red-700 mb-4">
                    {lowAttendanceData.length} student{lowAttendanceData.length !== 1 ? 's' : ''} in{' '}
                    {lowAttendanceFilters.className || 'all classes'} have attendance below {lowAttendanceFilters.threshold}% threshold.
                  </p>

                  {/* Notify Teacher Button */}
                  {lowAttendanceFilters.className && lowAttendanceFilters.section && (
                    <button
                      onClick={handleNotifyTeacher}
                      className="px-5 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                      NOTIFY CLASS TEACHER
                    </button>
                  )}
                </div>

                {/* Students List - Enhanced Cards */}
                <div className="space-y-4">
                  {lowAttendanceData.map((item, index) => (
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
                            onClick={() => handleViewStudentReport(item.student)}
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

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      const doc = new jsPDF();
                      doc.setFontSize(12);
                      doc.text('Low Attendance Report', 14, 20);
                      doc.text(`Academic Year: ${lowAttendanceFilters.academicYear}`, 14, 30);
                      doc.text(`Threshold: Below ${lowAttendanceFilters.threshold}%`, 14, 40);
                      doc.text(`Class: ${lowAttendanceFilters.className || 'All Classes'}`, 14, 50);
                      doc.text(`Total Students: ${Array.isArray(lowAttendanceData) ? lowAttendanceData.length : 0}`, 14, 60);
                      
                      if (Array.isArray(lowAttendanceData) && lowAttendanceData.length > 0) {
                        autoTable(doc, {
                          startY: 90,
                          head: [['Student Name', 'Class', 'Parent Contact', 'Attendance %', 'Present Days', 'Total Days']],
                          body: lowAttendanceData.map(item => [
                            item.student.name,
                            item.student.class + item.student.section,
                            item.student.parentContact || 'N/A',
                            item.attendance.percentage + '%',
                            item.attendance.presentDays,
                            item.attendance.totalDays
                          ])
                        });
                      }
                      
                      doc.save(`low-attendance-report-${lowAttendanceFilters.academicYear}.pdf`);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    📥 Download Report
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    🖨️ Print Report
                  </button>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SCHOOL ADMIN DASHBOARD
              </h1>
              <p className="text-gray-600">Complete Attendance Control & Analytics</p>
            </div>
            
            {/* Admin Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Academic Year</p>
                <p className="font-semibold">{filters.academicYear}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Board</p>
                <p className="font-semibold">{filters.board || 'CBSE'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Access Level</p>
                <p className="font-semibold text-green-600">ADMINISTRATOR</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('low-attendance')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'low-attendance'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Low Attendance
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition"
            >
              Back to Main Dashboard
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
