import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Student, AttendanceSummary, AttendanceGrade } from '../../types';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId');
  const studentName = localStorage.getItem('studentName');

  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [overallStats, setOverallStats] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (studentId) {
      fetchStudentInfo();
      fetchOverallAttendance();
    }
  }, [studentId]);

  const fetchStudentInfo = async () => {
    try {
      const res = await api.get<Student>(`/students/${studentId}`);
      setStudentInfo(res.data);
    } catch (err: any) {
      console.error('Error fetching student info:', err);
    }
  };

  const fetchOverallAttendance = async () => {
    try {
      console.log('🔄 Fetching overall attendance for student:', studentId);
      
      // Try multiple endpoints in order of preference
      let data: AttendanceSummary | null = null;
      
      try {
        // 1. Try semester endpoint first
        const semesterRes = await api.get<AttendanceSummary>(`/attendance/student/${studentId}/semester`, {
          params: {
            academicYear: '2024-2025'
          }
        });
        data = semesterRes.data;
        console.log('✅ Semester data found:', data);
      } catch (semesterErr) {
        console.log('⚠️ Semester endpoint failed, trying monthly...');
        
        try {
          // 2. Try monthly endpoint
          const monthlyRes = await api.get<AttendanceSummary>(`/attendance/student/${studentId}/monthly`, {
            params: {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
              academicYear: '2024-2025'
            }
          });
          data = monthlyRes.data;
          console.log('✅ Monthly data found:', data);
        } catch (monthlyErr) {
          console.log('⚠️ Monthly endpoint failed, trying class endpoint...');
          
          try {
            // 3. Try class endpoint as last resort
            const classRes = await api.get<AttendanceSummary>(`/attendance/class/${studentInfo?.class || '10'}/${studentInfo?.section || 'A'}`, {
              params: {
                academicYear: '2024-2025'
              }
            });
            
            // Calculate individual student's attendance from class data
            if (classRes.data && studentInfo) {
              const classData = classRes.data;
              const individualPercentage = Math.round((classData.presentDays / classData.totalDays) * 100);
              
              data = {
                percentage: individualPercentage,
                presentDays: Math.round((individualPercentage / 100) * classData.totalDays),
                absentDays: classData.totalDays - Math.round((individualPercentage / 100) * classData.totalDays),
                totalDays: classData.totalDays
              };
              console.log('✅ Class data converted to individual:', data);
            }
          } catch (classErr) {
            console.log('❌ All endpoints failed');
            throw classErr;
          }
        }
      }

      if (data) {
        setOverallStats(data);
        console.log('📊 Final attendance data set:', data);
      } else {
        console.log('❌ No attendance data found');
        setError('No attendance records found for this student');
        setOverallStats({
          percentage: 0,
          presentDays: 0,
          absentDays: 0,
          totalDays: 0
        });
      }
      
    } catch (err: any) {
      console.error('Error fetching overall attendance:', err);
      setError('Failed to load attendance data');
      setOverallStats({
        percentage: 0,
        presentDays: 0,
        absentDays: 0,
        totalDays: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceGrade = (percentage: number): AttendanceGrade => {
    if (percentage >= 95) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100', icon: '🌟' };
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100', icon: '🎯' };
    if (percentage >= 85) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100', icon: '👍' };
    if (percentage >= 75) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100', icon: '📊' };
    if (percentage >= 65) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' };
  };

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentName');
    localStorage.removeItem('userType');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-red-500 text-center">Student session missing. Please login again.</div>
        </div>
      </div>
    );
  }

  const attendanceGrade = overallStats ? getAttendanceGrade(overallStats.percentage) : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-blue-100">Welcome back, {studentInfo?.name || 'Student'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Overall Attendance Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Overall Attendance Rate</h2>
              {attendanceGrade && (
                <div className={`px-4 py-2 rounded-full ${attendanceGrade.bg} border-2 ${attendanceGrade.color.replace('text', 'border')}`}>
                  <span className="text-lg font-bold mr-2">{attendanceGrade.icon}</span>
                  <span className={`text-lg font-bold ${attendanceGrade.color}`}>
                    Grade: {attendanceGrade.grade}
                  </span>
                </div>
              )}
            </div>

            {overallStats && (
              <div className="space-y-4">
                {/* Main Attendance Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                      <div 
                        className="absolute inset-0 rounded-full border-8 transition-all duration-500"
                        style={{
                          borderColor: overallStats.percentage >= 75 ? '#10b981' : '#ef4444',
                          borderRightColor: overallStats.percentage >= 75 ? '#10b981' : '#ef4444',
                          borderBottomColor: overallStats.percentage >= 75 ? '#10b981' : '#ef4444',
                          transform: `rotate(${(overallStats.percentage / 100) * 360 - 90}deg)`,
                          transformOrigin: 'center'
                        }}
                      ></div>
                      <div className="relative z-10 text-center">
                        <div className="text-lg sm:text-2xl font-bold text-gray-800">{overallStats.percentage}%</div>
                        <div className="text-xs sm:text-sm text-gray-600">Overall Attendance</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Message */}
                <div className={`text-center p-4 rounded-lg ${
                  overallStats.percentage >= 90 ? 'bg-green-50 border-2 border-green-200' :
                  overallStats.percentage >= 75 ? 'bg-blue-50 border-2 border-blue-200' :
                  'bg-red-50 border-2 border-red-200'
                }`}>
                  <div className={`text-lg font-bold mb-2 ${
                    overallStats.percentage >= 90 ? 'text-green-700' :
                    overallStats.percentage >= 75 ? 'text-blue-700' :
                    'text-red-700'
                  }`}>
                    {overallStats.percentage >= 90 ? '🌟 Excellent Performance!' :
                     overallStats.percentage >= 75 ? '👍 Good Progress!' :
                     '⚠️ Needs Improvement'}
                  </div>
                  <div className={`text-sm ${
                    overallStats.percentage >= 90 ? 'text-green-600' :
                    overallStats.percentage >= 75 ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {overallStats.percentage >= 90 ? 'Your overall attendance is excellent! Keep up the great work!' :
                     overallStats.percentage >= 75 ? 'You\'re maintaining good attendance. Keep it up!' :
                     'Your attendance needs improvement. Regular attendance is important for success.'}
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center border-2 border-green-200">
                    <div className="text-2xl sm:text-3xl mb-2">✅</div>
                    <div className="text-sm text-gray-600 mb-1">Present Days</div>
                    <div className="text-xl sm:text-2xl font-bold text-green-700">{overallStats.presentDays}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {overallStats.totalDays > 0 ? Math.round((overallStats.presentDays / overallStats.totalDays) * 100) : 0}% rate
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center border-2 border-red-200">
                    <div className="text-2xl sm:text-3xl mb-2">❌</div>
                    <div className="text-sm text-gray-600 mb-1">Absent Days</div>
                    <div className="text-xl sm:text-2xl font-bold text-red-700">{overallStats.absentDays}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {overallStats.totalDays > 0 ? Math.round((overallStats.absentDays / overallStats.totalDays) * 100) : 0}% rate
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center border-2 border-blue-200">
                    <div className="text-2xl sm:text-3xl mb-2">📅</div>
                    <div className="text-sm text-gray-600 mb-1">Total Days</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-700">{overallStats.totalDays}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Academic Year
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">🏆 Overall Achievements</h4>
                  <div className="flex flex-wrap justify-center gap-3">
                    {overallStats.percentage >= 95 && (
                      <div className="bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-300">
                        <span className="text-sm font-bold text-yellow-800">🥇 Perfect Attendance</span>
                      </div>
                    )}
                    {overallStats.percentage >= 90 && overallStats.percentage < 95 && (
                      <div className="bg-blue-100 px-4 py-2 rounded-full border-2 border-blue-300">
                        <span className="text-sm font-bold text-blue-800">🥈 Excellent</span>
                      </div>
                    )}
                    {overallStats.percentage >= 85 && overallStats.percentage < 90 && (
                      <div className="bg-green-100 px-4 py-2 rounded-full border-2 border-green-300">
                        <span className="text-sm font-bold text-green-800">🥉 Very Good</span>
                      </div>
                    )}
                    {overallStats.percentage >= 75 && overallStats.percentage < 85 && (
                      <div className="bg-purple-100 px-4 py-2 rounded-full border-2 border-purple-300">
                        <span className="text-sm font-bold text-purple-800">👍 Good</span>
                      </div>
                    )}
                    {overallStats.absentDays === 0 && overallStats.totalDays > 0 && (
                      <div className="bg-green-100 px-4 py-2 rounded-full border-2 border-green-300">
                        <span className="text-sm font-bold text-green-800">🎯 No Absences</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/student/attendance-summary')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition"
            >
              📊 Attendance Summary
            </button>
            <button
              onClick={() => navigate('/student/my-attendance')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition"
            >
              📅 My Attendance
            </button>
            <button
              onClick={() => navigate('/student/alerts')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition"
            >
              🔔 Alerts
            </button>
            <button
              onClick={() => navigate('/student/reports')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition"
            >
              📈 Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
