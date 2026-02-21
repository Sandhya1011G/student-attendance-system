import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../config/api';
import moment from 'moment';

const AttendanceSummary = () => {
  const studentId = localStorage.getItem('studentId');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState('2024-2025');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const academicYears = [
    '2025-2026',
    '2024-2025',
    '2023-2024'
  ];

  useEffect(() => {
    if (!studentId) return;

    fetchMonthlySummary();
  }, [studentId, selectedMonth, selectedYear]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);

      // Use existing attendance endpoint with month and year parameters
      const res = await api.get(
        `/attendance/student/${studentId}`,
        {
          params: {
            month: selectedMonth,
            academicYear: selectedYear
          }
        }
      );

      console.log('MONTHLY ATTENDANCE API RESPONSE:', res.data);
      
      // Handle different possible data structures
      if (res.data) {
        // Check if data is directly the summary object
        if (res.data.percentage !== undefined) {
          // Direct summary data structure
          setSummary({
            percentage: res.data.percentage || 0,
            presentDays: res.data.presentDays || 0,
            absentDays: res.data.absentDays || 0,
            totalDays: res.data.totalDays || 0
          });
        } 
        // Check if data is nested under attendance key
        else if (res.data.attendance && res.data.attendance.percentage !== undefined) {
          // Nested attendance data structure
          setSummary(res.data.attendance);
        }
        // Check if data is an array of attendance records
        else if (Array.isArray(res.data)) {
          // Array of daily attendance records - calculate summary
          const attendanceRecords = res.data;
          const totalDays = attendanceRecords.length;
          const presentDays = attendanceRecords.filter(record => record.status === 'Present').length;
          const absentDays = totalDays - presentDays;
          const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
          
          setSummary({
            percentage,
            presentDays,
            absentDays,
            totalDays
          });
        }
        else {
          // Fallback to empty state
          console.log('Unexpected data structure:', res.data);
          setSummary({
            percentage: 0,
            presentDays: 0,
            absentDays: 0,
            totalDays: 0
          });
        }
      } else {
        // Fallback to empty state
        setSummary({
          percentage: 0,
          presentDays: 0,
          absentDays: 0,
          totalDays: 0
        });
      }
    } catch (err) {
      console.error('Summary Error:', err);
      setSummary({
        percentage: 0,
        presentDays: 0,
        absentDays: 0,
        totalDays: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendLabel = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Needs Attention';
  };

  if (!studentId) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        Student session missing. Please login again.
      </div>
    );
  }

  if (loading || !summary) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading summary...
      </div>
    );
  }

  const present = summary.percentage ?? 0;
  const absent = (100 - present).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        📊 Monthly Attendance Summary
      </h2>

      {/* Month and Year Selectors */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Academic Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading || !summary ? (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading monthly summary...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Month Display */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {months[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>

          {/* Main Attendance Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full border-8 border-green-500"
                  style={{
                    borderRightColor: summary.percentage >= 75 ? '#10b981' : '#ef4444',
                    borderBottomColor: summary.percentage >= 75 ? '#10b981' : '#ef4444',
                    transform: `rotate(${(summary.percentage / 100) * 360 - 90}deg)`,
                    transformOrigin: 'center'
                  }}
                ></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl font-bold text-gray-800">{summary.percentage}%</div>
                  <div className="text-sm text-gray-600">Attendance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Status Card */}
          <div className={`mb-6 p-4 rounded-lg text-center ${
            summary.percentage >= 90 ? 'bg-green-100 border-2 border-green-300' :
            summary.percentage >= 75 ? 'bg-blue-100 border-2 border-blue-300' :
            'bg-red-100 border-2 border-red-300'
          }`}>
            <div className={`text-2xl font-bold mb-2 ${
              summary.percentage >= 90 ? 'text-green-800' :
              summary.percentage >= 75 ? 'text-blue-800' :
              'text-red-800'
            }`}>
              {summary.percentage >= 90 ? '🌟 Excellent Performance!' :
               summary.percentage >= 75 ? '👍 Good Job!' :
               '⚠️ Needs Improvement'}
            </div>
            <div className={`text-sm ${
              summary.percentage >= 90 ? 'text-green-700' :
              summary.percentage >= 75 ? 'text-blue-700' :
              'text-red-700'
            }`}>
              {summary.percentage >= 90 ? 'Your attendance is outstanding! Keep it up!' :
               summary.percentage >= 75 ? 'You\'re doing well with your attendance.' :
               'You need to improve your attendance to meet requirements.'}
            </div>
          </div>

          {/* Monthly Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm text-gray-600 mb-1">Present Days</div>
              <div className="text-2xl font-bold text-green-700">
                {summary.presentDays || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((summary.presentDays || 0) / (summary.totalDays || 1) * 100)}% rate
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">❌</div>
              <div className="text-sm text-gray-600 mb-1">Absent Days</div>
              <div className="text-2xl font-bold text-red-700">
                {summary.absentDays || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((summary.absentDays || 0) / (summary.totalDays || 1) * 100)}% rate
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="text-sm text-gray-600 mb-1">Total Days</div>
              <div className="text-2xl font-bold text-blue-700">
                {summary.totalDays || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Working Days in {months[selectedMonth - 1]} {selectedYear}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Monthly Progress</span>
              <span className="font-semibold">{summary.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.percentage >= 90 ? 'bg-green-500' :
                  summary.percentage >= 75 ? 'bg-blue-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${summary.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>75% (Minimum)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">🏆 Monthly Achievements</h3>
            <div className="flex justify-center gap-3 flex-wrap">
              {summary.percentage >= 95 && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
                  🥇 Perfect Month
                </div>
              )}
              {summary.percentage >= 90 && summary.percentage < 95 && (
                <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
                  🥈 Excellent
                </div>
              )}
              {summary.percentage >= 75 && summary.percentage < 90 && (
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium">
                  🥉 Good
                </div>
              )}
              {summary.percentage >= 50 && summary.percentage < 75 && (
                <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-full text-sm font-medium">
                  📈 Improving
                </div>
              )}
              {summary.percentage < 50 && (
                <div className="bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium">
                  📚 Focus Needed
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceSummary;
