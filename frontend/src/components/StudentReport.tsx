import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../config/api';
import moment from 'moment';
import MonthCalendar from './MonthCalendar';
import { getCurrentAcademicYear } from '../utils/academicYear';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentReport = () => {
  const params = useParams();
  const location = useLocation();

  const studentId =
    location.state?.studentId ||   // ✅ Student login flow
    params.studentId ||            // ✅ Direct route flow
    localStorage.getItem('studentId'); // ✅ Refresh safety

    
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [semesterData, setSemesterData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());

  const [semester, setSemester] = useState(
    location.state?.semester || 'SEM1'
  );

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // ✅ Auto semester detection if direct access
  useEffect(() => {
    if (!location.state?.semester) {
      const month = new Date().getMonth() + 1;
      const autoSemester = month >= 7 ? 'SEM1' : 'SEM2';
      setSemester(autoSemester);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [studentId, semester, academicYear]);

  const getSemesterDates = () => {
    const [startYear, endYear] = academicYear.split('-').map(Number);

    if (semester === 'SEM1') {
      return {
        start: moment({ year: startYear, month: 6, day: 1 }),
        end: moment({ year: startYear, month: 11, day: 31 })
      };
    }

    return {
      start: moment({ year: endYear, month: 0, day: 1 }),
      end: moment({ year: endYear, month: 5, day: 30 })
    };
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const studentRes = await api.get(`/students/${studentId}`);
      setStudent(studentRes.data);

      const { start, end } = getSemesterDates();

      const semesterRes = await api.get(`/attendance/student/${studentId}/semester`, {
        params: {
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD'),
          academicYear
        }
      });

      setSemesterData(semesterRes.data);

      const months: any[] = [];
      const cursor = start.clone();

      while (cursor.isSameOrBefore(end, 'month')) {
        const monthRes = await api.get(`/attendance/student/${studentId}/monthly`, {
          params: {
            year: cursor.year(),
            month: cursor.month() + 1,
            academicYear
          }
        });

        months.push({
          month: cursor.format('MMMM').toUpperCase(),
          monthIndex: cursor.month(),
          year: cursor.year(),
          ...monthRes.data
        });

        cursor.add(1, 'month');
      }

      setMonthlyData(months);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const openCalendar = (month) => {
    setSelectedMonth(month);
    setShowCalendar(true);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    return 'Poor';
  };

  // ✅ DOWNLOAD PDF RESTORED
  const handleDownloadPDF = () => {
    if (!student || !semesterData) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text('Student Attendance Report', 105, 20);
    
    // Student Information
    doc.setFontSize(12);
    doc.text('Student Name:', 20, 40);
    doc.text(student.name, 80, 40);
    
    doc.text('Class:', 20, 50);
    doc.text(`${student.class}${student.section}`, 80, 50);
    
    doc.text('Academic Year:', 20, 60);
    doc.text(academicYear, 80, 60);
    
    doc.text('Semester:', 20, 70);
    doc.text(semester === 'SEM1' ? 'Semester 1' : 'Semester 2', 80, 70);
    
    // Attendance Summary
    doc.setFontSize(14);
    doc.text('Attendance Summary', 20, 90);
    
    doc.setFontSize(11);
    doc.text('Total Working Days:', 20, 105);
    doc.text(semesterData.attendance.totalDays.toString(), 85, 105);
    
    doc.text('Present Days:', 20, 115);
    doc.text(semesterData.attendance.presentDays.toString(), 85, 115);
    
    doc.text('Absent Days:', 20, 125);
    doc.text(semesterData.attendance.absentDays.toString(), 85, 125);
    
    doc.text('Attendance Percentage:', 20, 135);
    doc.text(`${semesterData.attendance.percentage}%`, 85, 135);
    
    // Monthly Details Header
    doc.setFontSize(14);
    doc.text('Monthly Attendance Details', 20, 155);
    
    // Table Headers
    doc.setFontSize(11);
    let yPosition = 170;
    
    // Table Header
    doc.text('Month', 20, yPosition);
    doc.text('Present', 60, yPosition);
    doc.text('Absent', 100, yPosition);
    doc.text('Total', 130, yPosition);
    doc.text('Percentage', 160, yPosition);
    
    yPosition += 10;
    
    // Table Data
    monthlyData.forEach((m, index) => {
      doc.text(m.month, 20, yPosition);
      doc.text(m.presentDays.toString(), 60, yPosition);
      doc.text(m.absentDays.toString(), 100, yPosition);
      doc.text(m.totalDays.toString(), 130, yPosition);
      doc.text(`${m.percentage}%`, 160, yPosition);
      
      yPosition += 8;
      
      // Add new page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(11);
        doc.text('Month', 20, yPosition);
        doc.text('Present', 60, yPosition);
        doc.text('Absent', 100, yPosition);
        doc.text('Total', 130, yPosition);
        doc.text('Percentage', 160, yPosition);
        yPosition += 10;
      }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, yPosition + 20);
    doc.text('XYP QUANTUM SCHOOL', 20, yPosition + 30);

    doc.save(`Attendance_${student.name}.pdf`);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!student) return <div className="p-10 text-center text-red-600">Student not found</div>;

 return (
  <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">

    <button
      onClick={() => navigate(-1)}
      className="mb-3 px-3 py-2 bg-gray-600 text-white rounded text-sm"
    >
      ← Back
    </button>

    {/* ✅ CARD FIX */}
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 max-w-full overflow-hidden">

      {/* ✅ TITLE FIX */}
      <h1 className="text-lg sm:text-3xl font-bold text-gray-800 mb-2">
        MY SEMESTER ATTENDANCE - {student.name.toUpperCase()} - {semester === 'SEM1' ? 'SEMESTER 1' : 'SEMESTER 2'}
      </h1>

      <p className="text-gray-600 mb-3 text-sm sm:text-base">
        CLASS: {student.class}{student.section}
      </p>

      {/* ✅ DROPDOWN FIX */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mb-3">

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto"
        >
          <option value="SEM1">Semester 1 (Jul – Dec)</option>
          <option value="SEM2">Semester 2 (Jan – Jun)</option>
        </select>

        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-auto"
        >
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>
      </div>

      {/* ✅ TABLE FIX (MOST IMPORTANT) */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border text-center text-xs sm:text-sm mb-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1">MONTH</th>
              <th className="px-2 py-1">TOTAL</th>
              <th className="px-2 py-1">PRESENT</th>
              <th className="px-2 py-1">ABSENT</th>
              <th className="px-2 py-1">%</th>
              <th className="px-2 py-1">STATUS</th>
              <th className="px-2 py-1">VIEW</th>
            </tr>
          </thead>

          <tbody>
            {monthlyData.map((m, i) => (
              <tr key={i} className="border-t">
                <td>{m.month}</td>
                <td>{m.totalDays}</td>
                <td>{m.presentDays}</td>
                <td>{m.absentDays}</td>
                <td>{m.percentage}%</td>
                <td className={getStatusColor(m.percentage)}>
                  {getStatusText(m.percentage)}
                </td>
                <td>
                  <button onClick={() => openCalendar(m)}>👁</button>
                </td>
              </tr>
            ))}

            {semesterData && (
              <tr className="border-t font-semibold bg-gray-50">
                <td>TOTAL</td>
                <td>{semesterData.attendance.totalDays}</td>
                <td>{semesterData.attendance.presentDays}</td>
                <td>{semesterData.attendance.absentDays}</td>
                <td>{semesterData.attendance.percentage}%</td>
                <td>{getStatusText(semesterData.attendance.percentage)}</td>
                <td>—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ FOOTER FIX */}
      {semesterData && (
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">

          <p className="text-sm sm:text-2xl font-bold">
            SEMESTER ATTENDANCE: {semesterData.attendance.percentage}%
          </p>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          >
            DOWNLOAD PDF
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 italic mt-2">
        Official attendance records are maintained by the school administration.
      </p>
    </div>

    {showCalendar && selectedMonth && (
      <MonthCalendar
        monthData={selectedMonth}
        studentId={studentId}
        academicYear={academicYear}
        onClose={() => setShowCalendar(false)}
      />
    )}
  </div>
);
};

export default StudentReport;
