import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../config/api';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceReport = () => {
  const [filters, setFilters] = useState({
    className: '',
    section: '',
    date: new Date().toISOString().split('T')[0],
    academicYear: getCurrentAcademicYear()
  });
  const [classes, setClasses] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // 'teacher' or 'admin'
  const [teacherData, setTeacherData] = useState(null);
  const navigate = useNavigate();

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
    if (filters.className && filters.section && filters.date) {
      fetchReport();
    }
  }, [filters]);

  const fetchTeacherData = async (teacherId) => {
    try {
      const response = await api.get(`/teachers/${teacherId}`);
      const teacher = response.data;
      setTeacherData(teacher);
      
      // Auto-set teacher's assigned class
      if (teacher.classAssigned && teacher.classAssigned.class && teacher.classAssigned.section) {
        setFilters(prev => ({
          ...prev,
          className: teacher.classAssigned.class,
          section: teacher.classAssigned.section
        }));
      }
      
      // Fetch all classes for admin reference (but teacher won't see dropdown)
      fetchClasses();
    } catch (error) {
      console.error('Error fetching teacher data:', error);
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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/class/${filters.className}/${filters.section}`, {
        params: { date: filters.date, academicYear: filters.academicYear }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllReports = () => {
    try {
      setLoading(true);
      
      if (!reportData || !reportData.records) {
        alert('No data available for report generation');
        setLoading(false);
        return;
      }

      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        console.error('jsPDF library not loaded');
        alert('PDF library not available. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      console.log('Starting PDF generation...');
      
      // Create PDF using jsPDF like other components
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('CLASS ATTENDANCE REPORT', 14, 20);
      
      // Add class info
      doc.setFontSize(12);
      doc.text(`Class: ${filters.className}${filters.section}`, 14, 35);
      doc.text(`Date: ${new Date(filters.date).toLocaleDateString()}`, 14, 45);
      doc.text(`Academic Year: ${filters.academicYear}`, 14, 55);
      doc.text(`Teacher: ${teacherData?.name || 'Teacher'}`, 14, 65);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 14, 80);
      doc.setFontSize(12);
      doc.text(`Total Students: ${reportData.totalStudents}`, 14, 90);
      doc.text(`Present: ${reportData.presentCount}`, 14, 100);
      doc.text(`Absent: ${reportData.absentCount}`, 14, 110);
      doc.text(`Attendance Percentage: ${reportData.attendancePercentage}%`, 14, 120);
      
      // Add student table
      doc.setFontSize(14);
      doc.text('Student Details', 14, 140);
      
      // Prepare table data
      const tableData = reportData.records.map((record, index) => [
        index + 1,
        record.studentName,
        record.status || 'Not marked'
      ]);
      
      // Add table using autoTable if available
      if (typeof autoTable !== 'undefined') {
        console.log('Using autoTable for PDF generation...');
        autoTable(doc, {
          head: [['#', 'Student Name', 'Status']],
          body: tableData,
          startY: 150,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
      } else {
        console.log('autoTable not available, using manual table...');
        // Fallback: Manual table creation
        let yPosition = 150;
        doc.setFontSize(10);
        
        // Table header
        doc.text('#   Student Name                    Status', 14, yPosition);
        yPosition += 10;
        
        // Table rows
        tableData.forEach(row => {
          const line = `${row[0].toString().padEnd(3)}   ${row[1].padEnd(30)}   ${row[2]}`;
          doc.text(line, 14, yPosition);
          yPosition += 8;
          
          // Add new page if needed
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Add footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY || 250 : 250;
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, finalY + 20);
      
      // Save the PDF
      const fileName = `All_Students_Report_${filters.className}${filters.section}_${filters.date}.pdf`;
      console.log('Saving PDF as:', fileName);
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating bulk PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">CLASS ATTENDANCE REPORT</h1>
          
          {/* Back Button - Role-based */}
          <button
            onClick={() => userRole === 'teacher' ? navigate('/teacher-dashboard') : navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back
          </button>
        </div>

        {/* Class Selection - Only show for admins */}
        {userRole === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <select
                  value={filters.academicYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Teacher View - No class selection */}
        {userRole === 'teacher' && teacherData && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Class</label>
                <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-800 font-medium">
                  {filters.className}{filters.section}
                </div>
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
                <select
                  value={filters.academicYear}
                  onChange={(e) => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800"
                >
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reportData ? (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Overall Attendance Rate</h2>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {reportData.attendancePercentage}%
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                    <span className="text-green-600">{reportData.presentCount} Present</span>
                    <span className="text-red-600">{reportData.absentCount} Absent</span>
                    {(reportData.notMarkedCount || 0) > 0 && (
                      <span className="text-gray-500">{reportData.notMarkedCount} Not marked</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Students:</span>
                    <span className="font-semibold">{reportData.totalStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Present:</span>
                    <span className="font-semibold text-green-600">{reportData.presentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absent:</span>
                    <span className="font-semibold text-red-600">{reportData.absentCount}</span>
                  </div>
                  {(reportData.notMarkedCount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span>Not marked:</span>
                      <span className="font-semibold text-gray-600">{reportData.notMarkedCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold">{filters.date ? new Date(filters.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  {reportData.isFinalized && (
                    <div className="flex justify-between">
                      <span className="text-amber-600 font-semibold">✓ Finalized</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bulk Download Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Download All Reports</h3>
                  <p className="text-sm text-blue-600">Generate a comprehensive PDF report for all students</p>
                </div>
                <button
                  onClick={handleDownloadAllReports}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download All Reports
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white border rounded-lg overflow-hidden">
              <h2 className="text-xl font-semibold p-4 bg-gray-50">Student Attendance Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Student Name</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.records || []).map((record, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{record.studentName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded ${
                            record.status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {record.status || 'Not marked'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const selectedMonth = new Date(filters.date).getMonth() + 1;

                              const semester =
                                selectedMonth >= 7 && selectedMonth <= 12 ? 'SEM1' : 'SEM2';

                              navigate(`/student-report/${record.studentId}`, {
                                state: {
                                  semester,
                                  selectedDate: filters.date
                                }
                              });
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select class, section, and date to view report
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;

