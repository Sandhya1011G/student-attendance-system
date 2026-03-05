import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../config/api';
import moment from 'moment';

interface AttendanceData {
  percentage: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
}

interface MonthlyData {
  month: string;
  percentage: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
}

interface SemesterData {
  name: string;
  startDate: string;
  endDate: string;
  monthlyData: MonthlyData[];
}

const AttendanceSummary = () => {
  const studentId = localStorage.getItem('studentId');
  const location = useLocation();
  
  const [summary, setSummary] = useState<AttendanceData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'semester' | 'monthly'>('semester');
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null);

  const academicYears = ['2025-2026', '2024-2025', '2023-2024'];

  useEffect(() => {
    if (!studentId) return;
    
    fetchStudentInfo();
    fetchAttendanceData();
  }, [studentId, selectedYear, selectedSemester, viewMode]);

  const fetchStudentInfo = async () => {
    try {
      const res = await api.get(`/students/${studentId}`);
      setStudentInfo(res.data);
    } catch (err: any) {
      console.error('Error fetching student info:', err);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching attendance data using working endpoints from StudentReport for:', {
        studentId,
        academicYear: selectedYear,
        viewMode,
        selectedSemester
      });

      let attendanceFound = false;
      
      // Use the same approach as StudentReport - working endpoints
      try {
        console.log('📚 Using semester endpoint (same as StudentReport)...');
        
        // Get semester dates (same logic as StudentReport)
        const getSemesterDates = (academicYear: string, semesterNumber: number) => {
          const [startYear, endYear] = academicYear.split('-').map(Number);
          
          if (semesterNumber === 1) {
            // Semester 1: June - December
            return {
              start: moment({ year: startYear, month: 6, day: 1 }),
              end: moment({ year: startYear, month: 11, day: 31 }),
              semesterName: 'Semester 1'
            };
          } else {
            // Semester 2: January - May
            return {
              start: moment({ year: endYear, month: 0, day: 1 }),
              end: moment({ year: endYear, month: 5, day: 30 }),
              semesterName: 'Semester 2'
            };
          }
        };

        // Create both semesters for the academic year
        const semester1Dates = getSemesterDates(selectedYear, 1);
        const semester2Dates = getSemesterDates(selectedYear, 2);
        
        console.log('📅 Semester date ranges:', {
          semester1: {
            start: semester1Dates.start.format('YYYY-MM-DD'),
            end: semester1Dates.end.format('YYYY-MM-DD')
          },
          semester2: {
            start: semester2Dates.start.format('YYYY-MM-DD'),
            end: semester2Dates.end.format('YYYY-MM-DD')
          }
        });

        // Fetch data for both semesters
        const allSemesters: SemesterData[] = [];
        
        // Fetch Semester 1 data
        try {
          const semester1Res = await api.get(`/attendance/student/${studentId}/semester`, {
            params: {
              startDate: semester1Dates.start.format('YYYY-MM-DD'),
              endDate: semester1Dates.end.format('YYYY-MM-DD'),
              academicYear: selectedYear
            }
          });

          if (semester1Res.data) {
            // Get monthly data for Semester 1
            const semester1Months: any[] = [];
            const cursor1 = semester1Dates.start.clone();

            while (cursor1.isSameOrBefore(semester1Dates.end, 'month')) {
              try {
                const monthRes = await api.get(`/attendance/student/${studentId}/monthly`, {
                  params: {
                    year: cursor1.year(),
                    month: cursor1.month() + 1,
                    academicYear: selectedYear
                  }
                });

                semester1Months.push({
                  month: cursor1.format('MMMM'),
                  monthIndex: cursor1.month(),
                  year: cursor1.year(),
                  ...monthRes.data
                });

              } catch (monthErr: any) {
                console.log(`❌ Semester 1 Month ${cursor1.format('MMMM')} failed:`, monthErr.response?.status || monthErr.message);
                semester1Months.push({
                  month: cursor1.format('MMMM'),
                  monthIndex: cursor1.month(),
                  year: cursor1.year(),
                  percentage: 0,
                  presentDays: 0,
                  absentDays: 0,
                  totalDays: 0
                });
              }

              cursor1.add(1, 'month');
            }

            const semester1MonthlyData: MonthlyData[] = semester1Months.map(month => ({
              month: month.month,
              percentage: Math.round(month.percentage || 0),
              presentDays: month.presentDays || 0,
              absentDays: month.absentDays || 0,
              totalDays: month.totalDays || (month.presentDays + month.absentDays) || 0
            }));

            allSemesters.push({
              name: semester1Dates.semesterName,
              startDate: semester1Dates.start.format('YYYY-MM-DD'),
              endDate: semester1Dates.end.format('YYYY-MM-DD'),
              monthlyData: semester1MonthlyData
            });

            console.log('✅ Semester 1 data loaded:', semester1MonthlyData.length, 'months');
          }
        } catch (err: any) {
          console.log('❌ Semester 1 fetch failed:', err.response?.status || err.message);
        }

        // Fetch Semester 2 data
        try {
          const semester2Res = await api.get(`/attendance/student/${studentId}/semester`, {
            params: {
              startDate: semester2Dates.start.format('YYYY-MM-DD'),
              endDate: semester2Dates.end.format('YYYY-MM-DD'),
              academicYear: selectedYear
            }
          });

          if (semester2Res.data) {
            // Get monthly data for Semester 2
            const semester2Months: any[] = [];
            const cursor2 = semester2Dates.start.clone();

            while (cursor2.isSameOrBefore(semester2Dates.end, 'month')) {
              try {
                const monthRes = await api.get(`/attendance/student/${studentId}/monthly`, {
                  params: {
                    year: cursor2.year(),
                    month: cursor2.month() + 1,
                    academicYear: selectedYear
                  }
                });

                semester2Months.push({
                  month: cursor2.format('MMMM'),
                  monthIndex: cursor2.month(),
                  year: cursor2.year(),
                  ...monthRes.data
                });

              } catch (monthErr: any) {
                console.log(`❌ Semester 2 Month ${cursor2.format('MMMM')} failed:`, monthErr.response?.status || monthErr.message);
                semester2Months.push({
                  month: cursor2.format('MMMM'),
                  monthIndex: cursor2.month(),
                  year: cursor2.year(),
                  percentage: 0,
                  presentDays: 0,
                  absentDays: 0,
                  totalDays: 0
                });
              }

              cursor2.add(1, 'month');
            }

            const semester2MonthlyData: MonthlyData[] = semester2Months.map(month => ({
              month: month.month,
              percentage: Math.round(month.percentage || 0),
              presentDays: month.presentDays || 0,
              absentDays: month.absentDays || 0,
              totalDays: month.totalDays || (month.presentDays + month.absentDays) || 0
            }));

            allSemesters.push({
              name: semester2Dates.semesterName,
              startDate: semester2Dates.start.format('YYYY-MM-DD'),
              endDate: semester2Dates.end.format('YYYY-MM-DD'),
              monthlyData: semester2MonthlyData
            });

            console.log('✅ Semester 2 data loaded:', semester2MonthlyData.length, 'months');
          }
        } catch (err: any) {
          console.log('❌ Semester 2 fetch failed:', err.response?.status || err.message);
        }

        // Set all semesters data
        setSemesters(allSemesters);

        // Combine all months for yearly summary
        const allMonths = allSemesters.flatMap(semester => semester.monthlyData);
        setMonthlyData(allMonths);

        // Calculate yearly summary
        const totalPresent = allMonths.reduce((sum, month) => sum + month.presentDays, 0);
        const totalAbsent = allMonths.reduce((sum, month) => sum + month.absentDays, 0);
        const totalDays = allMonths.reduce((sum, month) => sum + month.totalDays, 0);
        const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        setSummary({
          percentage: overallPercentage,
          presentDays: totalPresent,
          absentDays: totalAbsent,
          totalDays
        });

        attendanceFound = true;
        console.log('✅ Successfully loaded both semesters data:', {
          totalSemesters: allSemesters.length,
          totalMonths: allMonths.length,
          summary: { percentage: overallPercentage, presentDays: totalPresent, absentDays: totalAbsent, totalDays }
        });
      } catch (err: any) {
        console.log('❌ StudentReport approach failed:', err.response?.status || err.message);
      }

      // Alternative: Try direct finalized attendance endpoint
      if (!attendanceFound) {
        try {
          console.log('🏫 Trying direct finalized attendance endpoint...');
          
          const response = await api.get(`/attendance/student/${studentId}/finalized`, {
            params: { academicYear: selectedYear }
          });
          
          console.log('✅ Finalized attendance response:', response.data);
          
          if (response.data && response.data.finalizedAttendance) {
            const finalizedData = response.data.finalizedAttendance;
            
            // Group by month
            const monthMap = new Map<number, any>();
            
            finalizedData.forEach((record: any) => {
              const month = moment(record.date).month();
              if (!monthMap.has(month)) {
                monthMap.set(month, { presentDays: 0, absentDays: 0, totalDays: 0 });
              }
              
              const monthData = monthMap.get(month);
              if (record.status === 'Present') {
                monthData.presentDays++;
              } else if (record.status === 'Absent') {
                monthData.absentDays++;
              }
              monthData.totalDays++;
            });

            const monthlyData: MonthlyData[] = [];
            monthMap.forEach((data, month) => {
              const percentage = data.totalDays > 0 ? Math.round((data.presentDays / data.totalDays) * 100) : 0;
              monthlyData.push({
                month: moment(month + 1, 'MM').format('MMMM'),
                percentage,
                presentDays: data.presentDays,
                absentDays: data.absentDays,
                totalDays: data.totalDays
              });
            });

            setMonthlyData(monthlyData);
            
            const totalPresent = monthlyData.reduce((sum, month) => sum + month.presentDays, 0);
            const totalAbsent = monthlyData.reduce((sum, month) => sum + month.absentDays, 0);
            const totalDays = monthlyData.reduce((sum, month) => sum + month.totalDays, 0);
            const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

            setSummary({
              percentage: overallPercentage,
              presentDays: totalPresent,
              absentDays: totalAbsent,
              totalDays
            });

            attendanceFound = true;
            console.log('✅ Successfully loaded direct finalized attendance data');
          }
        } catch (err: any) {
          console.log('❌ Direct finalized endpoint failed:', err.response?.status || err.message);
        }
      }

      // If still no data, show appropriate message
      if (!attendanceFound) {
        console.log('⚠️ No attendance data found from any working endpoint');
        setError('No attendance records found. Please check if attendance has been marked and finalized.');
        setSummary({
          percentage: 0,
          presentDays: 0,
          absentDays: 0,
          totalDays: 0
        });
        setMonthlyData([]);
        setSemesters([]);
      }
      
    } catch (err: any) {
      console.error('🚨 Critical error in fetchAttendanceData:', err);
      
      setError('Failed to load attendance data. Please try again later.');
      setSummary({
        percentage: 0,
        presentDays: 0,
        absentDays: 0,
        totalDays: 0
      });
      setMonthlyData([]);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlternativeData = async () => {
    try {
      console.log('Trying alternative approach...');
      
      // Try to get from class records as fallback
      const studentRes = await api.get(`/students/${studentId}`);
      if (!studentRes.data) return;

      const { class: studentClass, section } = studentRes.data;
      
      // Get current date to determine active semester
      const currentDate = moment();
      const currentMonth = currentDate.month() + 1;
      const isSecondSemester = currentMonth >= 6; // June-Dec is semester 2
      
      const semesterStart = isSecondSemester 
        ? moment(`${selectedYear.split('-')[0]}-06-01`)
        : moment(`${parseInt(selectedYear.split('-')[0]) - 1}-11-01`);
      
      const semesterEnd = isSecondSemester
        ? moment(`${selectedYear.split('-')[0]}-10-31`)
        : moment(`${selectedYear.split('-')[0]}-05-31`);

      // Get attendance for current semester
      const classResponse = await api.get(`/attendance/class/${studentClass}/${section}/range`, {
        params: {
          startDate: semesterStart.format('YYYY-MM-DD'),
          endDate: semesterEnd.format('YYYY-MM-DD'),
          academicYear: selectedYear
        }
      });

      if (classResponse.data && classResponse.data.records) {
        // Filter this student's records
        const studentRecords = classResponse.data.records.filter(
          (record: any) => record.studentId === studentId
        );

        // Group by month
        const monthlyData: MonthlyData[] = [];
        const monthMap = new Map<number, any>();

        studentRecords.forEach((record: any) => {
          const month = moment(record.date).month();
          if (!monthMap.has(month)) {
            monthMap.set(month, {
              presentDays: 0,
              absentDays: 0,
              totalDays: 0,
              records: []
            });
          }
          
          const monthData = monthMap.get(month);
          monthData.presentDays += record.status === 'Present' ? 1 : 0;
          monthData.absentDays += record.status === 'Absent' ? 1 : 0;
          monthData.totalDays += 1;
          monthData.records.push(record);
        });

        // Convert map to array and calculate percentages
        monthMap.forEach((data, month) => {
          const percentage = data.totalDays > 0 ? Math.round((data.presentDays / data.totalDays) * 100) : 0;
          monthlyData.push({
            month: moment(month + 1, 'MM').format('MMMM'),
            percentage,
            presentDays: data.presentDays,
            absentDays: data.absentDays,
            totalDays: data.totalDays
          });
        });

        setMonthlyData(monthlyData);

        // Calculate summary
        const totalPresent = monthlyData.reduce((sum, month) => sum + month.presentDays, 0);
        const totalAbsent = monthlyData.reduce((sum, month) => sum + month.absentDays, 0);
        const totalDays = monthlyData.reduce((sum, month) => sum + month.totalDays, 0);
        const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        setSummary({
          percentage: overallPercentage,
          presentDays: totalPresent,
          absentDays: totalAbsent,
          totalDays
        });

        console.log('✅ Loaded alternative data:', { monthlyData: monthlyData.length, summary: { percentage: overallPercentage } });
      }
    } catch (err: any) {
      console.error('Error in alternative approach:', err);
    }
  };

  const getAttendanceGrade = (percentage: number) => {
    if (percentage >= 95) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100', icon: '🏆', message: 'Excellent!' };
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100', icon: '🌟', message: 'Outstanding!' };
    if (percentage >= 85) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100', icon: '👍', message: 'Very Good!' };
    if (percentage >= 75) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100', icon: '📊', message: 'Good' };
    if (percentage >= 65) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '📚', message: 'Satisfactory' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100', icon: '⚠️', message: 'Needs Improvement' };
  };

  const getPerformanceInsights = (percentage: number) => {
    if (percentage >= 95) {
      return {
        level: 'Exceptional',
        color: 'green',
        message: 'You are in the top 5% of students! Outstanding dedication to your studies.',
        tips: ['Keep up the excellent work!', 'Consider helping classmates who struggle']
      };
    }
    if (percentage >= 85) {
      return {
        level: 'Excellent',
        color: 'blue',
        message: 'Your attendance is impressive and shows great commitment.',
        tips: ['Maintain this consistency', 'You\'re a role model for others']
      };
    }
    if (percentage >= 75) {
      return {
        level: 'Good',
        color: 'yellow',
        message: 'You\'re meeting expectations. Room for improvement exists.',
        tips: ['Try to reduce absences', 'Set attendance goals for next month']
      };
    }
    return {
      level: 'Needs Attention',
      color: 'red',
      message: 'Your attendance requires immediate attention and improvement.',
      tips: ['Identify reasons for absence', 'Create a daily routine', 'Seek help if needed']
    };
  };

  if (!studentId) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-red-500 text-lg">Student session missing. Please login again.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading attendance summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-500 text-lg">No attendance data available</div>
      </div>
    );
  }

  const attendanceGrade = getAttendanceGrade(summary.percentage);
  const insights = getPerformanceInsights(summary.percentage);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          📊 Attendance Analytics
        </h2>
        <p className="text-center text-gray-600">
          {studentInfo?.name || 'Student'} • {studentInfo?.class}{studentInfo?.section || 'A'}
        </p>
      </div>

      {/* Year and Semester Selectors */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">Academic Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSemester(null); // Reset semester when year changes
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          {/* Semester Selector - Only show if semesters exist */}
          {semesters.length > 0 && (
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-gray-700">Semester:</label>
              <select
                value={selectedSemester || ''}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Semester</option>
                {semesters.map((semester, index) => (
                  <option key={index} value={index}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-semibold text-gray-700">View Mode:</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('semester')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'semester' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📚 Semester View
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📅 Monthly View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* Attendance Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-64 h-64 rounded-full border-8 border-gray-200 flex items-center justify-center shadow-xl bg-white">
              <div 
                className="absolute inset-0 rounded-full border-8 transition-all duration-700"
                style={{
                  borderColor: summary.percentage >= 75 ? '#10b981' : '#ef4444',
                  borderRightColor: summary.percentage >= 75 ? '#10b981' : '#ef4444',
                  borderBottomColor: summary.percentage >= 75 ? '#10b981' : '#ef4444',
                  transform: `rotate(${(summary.percentage / 100) * 360 - 90}deg)`,
                  transformOrigin: 'center'
                }}
              ></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl font-bold text-gray-800">{summary.percentage}%</div>
                <div className="text-sm text-gray-600 mt-2">Yearly Attendance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade and Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Grade Badge */}
          <div className="text-center">
            <div className={`inline-flex items-center px-8 py-6 rounded-full ${attendanceGrade.bg} border-2 ${attendanceGrade.color.replace('text', 'border')}`}>
              <span className="text-4xl mr-3">{attendanceGrade.icon}</span>
              <div className="text-left">
                <div className={`text-2xl font-bold ${attendanceGrade.color}`}>
                  Grade: {attendanceGrade.grade}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {attendanceGrade.message}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className={`p-6 rounded-xl bg-${insights.color}-50 border-2 border-${insights.color}-200`}>
            <h3 className={`text-lg font-bold mb-3 text-${insights.color}-800`}>
              Performance Level: {insights.level}
            </h3>
            <p className={`text-base mb-4 text-${insights.color}-700`}>
              {insights.message}
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Recommendations:</h4>
              {insights.tips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border-2 border-green-200 shadow-lg">
            <div className="text-5xl mb-3">📅</div>
            <div className="text-sm text-gray-600 mb-2 font-medium">Present Days</div>
            <div className="text-4xl font-bold text-green-700">
              {summary.presentDays}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {summary.totalDays > 0 ? Math.round((summary.presentDays / summary.totalDays) * 100) : 0}% of total
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl text-center border-2 border-red-200 shadow-lg">
            <div className="text-5xl mb-3">📉</div>
            <div className="text-sm text-gray-600 mb-2 font-medium">Absent Days</div>
            <div className="text-4xl font-bold text-red-700">
              {summary.absentDays}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {summary.totalDays > 0 ? Math.round((summary.absentDays / summary.totalDays) * 100) : 0}% of total
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center border-2 border-blue-200 shadow-lg">
            <div className="text-5xl mb-3">📊</div>
            <div className="text-sm text-gray-600 mb-2 font-medium">Total Days</div>
            <div className="text-4xl font-bold text-blue-700">
              {summary.totalDays}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Academic Year {selectedYear}
            </div>
          </div>
        </div>

        {/* Semester-wise or Monthly Breakdown */}
        {viewMode === 'semester' && semesters.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">📚 Semester-wise Breakdown</h3>
            <div className="space-y-4">
              {semesters.map((semester, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">{semester.name}</h4>
                    <div className="text-sm text-gray-600">
                      {moment(semester.startDate).format('MMM DD')} - {moment(semester.endDate).format('MMM DD')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {semester.monthlyData.map((month, monthIndex) => (
                      <div key={monthIndex} className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-semibold text-gray-600">{month.month}</div>
                        <div className="text-lg font-bold text-gray-800">{month.percentage}%</div>
                        <div className="text-xs text-gray-500">
                          {month.presentDays}/{month.totalDays} days
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600">Present Days</div>
                        <div className="text-xl font-bold text-green-600">
                          {semester.monthlyData.reduce((sum, month) => sum + month.presentDays, 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Absent Days</div>
                        <div className="text-xl font-bold text-red-600">
                          {semester.monthlyData.reduce((sum, month) => sum + month.absentDays, 0)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Total Days</div>
                        <div className="text-xl font-bold text-blue-600">
                          {semester.monthlyData.reduce((sum, month) => sum + month.totalDays, 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'monthly' && monthlyData.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">📅 Monthly Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-sm font-semibold text-gray-600 mb-2">{month.month}</div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{month.percentage}%</div>
                  <div className="text-xs text-gray-500">
                    {month.presentDays}/{month.totalDays} days
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceSummary;
