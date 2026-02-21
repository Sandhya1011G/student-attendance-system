import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
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
import { getCurrentAcademicYear } from '../utils/academicYear';

const Dashboard = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    academicYear: getCurrentAcademicYear(),
    board: 'CBSE'
  });

  const [overallStats, setOverallStats] = useState(null);
  const [topClasses, setTopClasses] = useState([]);
  const [bottomClasses, setBottomClasses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllRecords = () => navigate('/reports');

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('ATTENDANCE OVERVIEW & ANALYTICS', 14, 20);

    doc.setFontSize(10);
    doc.text(
      `Academic Year: ${filters.academicYear} | Board: ${filters.board} | Generated: ${new Date().toLocaleString()}`,
      14,
      28
    );

    let y = 40;

    if (overallStats) {
      doc.setFontSize(12);
      doc.text('Overall School Attendance', 14, y);
      y += 8;

      doc.text(`Present: ${overallStats.present}%`, 20, y);
      doc.text(`Absent: ${overallStats.absent}%`, 80, y);
      doc.text(`Students: ${overallStats.totalStudents}`, 140, y);

      y += 15;
    }

    if (topClasses.length > 0) {
      doc.text('Top Performing Classes', 14, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Class', 'Attendance %']],
        body: topClasses.map((cls, i) => [
          i + 1,
          cls.className,
          `${cls.percentage}%`
        ])
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    if (bottomClasses.length > 0) {
      doc.text('Bottom Performing Classes', 14, y);
      y += 5;

      autoTable(doc, {
        startY: y,
        head: [['#', 'Class', 'Attendance %']],
        body: bottomClasses.map((cls, i) => [
          i + 1,
          cls.className,
          `${cls.percentage}%`
        ])
      });
    }

    doc.save(`attendance-dashboard-${filters.academicYear}.pdf`);
  };

  const handlePrint = () => window.print();

  return (
    <div className="container mx-auto px-4 py-6">

      {/* ✅ ROLE BUTTON STRIP */}
      <div className="flex flex-wrap gap-3 mb-4">

        {/* Admin stays on dashboard */}
        <button
          onClick={() => navigate('/school-admin')}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg cursor-default hover:bg-blue-800 transition"
        >
          School Admin
        </button>

        {/* Teacher */}
        <button
          onClick={() => navigate('/teacher-login')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
        >
          Teacher
        </button>

        {/* Student */}
        <button
          onClick={() => navigate('/student-login')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition"
        >
          Student
        </button>

      </div>

      {/* HEADER */}
      <div className="bg-gray-100 rounded-xl px-4 py-4 mb-4 shadow-sm border border-gray-200 transition hover:shadow-md">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              ATTENDANCE OVERVIEW & ANALYTICS
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
              <span>ACADEMIC YEAR: <b>{filters.academicYear}</b></span>
              <span>BOARD: <b>{filters.board}</b></span>
              <span>VIEW: <b>Whole School</b></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <select
              value={filters.academicYear}
              onChange={(e) =>
                setFilters({ ...filters, academicYear: e.target.value })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>

            <select
              value={filters.board}
              onChange={(e) =>
                setFilters({ ...filters, board: e.target.value })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value="CBSE">CBSE</option>
              <option value="STATE BOARD">STATE BOARD</option>
              <option value="ICSE">ICSE</option>
            </select>

            <button
              onClick={handleDownloadPDF}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 hover:bg-black active:scale-95"
            >
              DOWNLOAD PDF
            </button>

            <button
              onClick={handlePrint}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg transition transform hover:scale-105 hover:bg-gray-800 active:scale-95"
            >
              PRINT
            </button>

          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading Dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* ✅ YOUR ORIGINAL CIRCULAR UI UNTOUCHED */}
            <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg hover:-translate-y-1">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Overall Attendance Rate
              </h2>

              <div className="flex justify-center">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border-10 border-blue-200"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-blue-600 border-t-transparent rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-900">
                      {overallStats?.present}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="text-green-600 font-semibold">
                  {overallStats?.present}% PRESENT
                </span>
                <span className="text-red-500 font-semibold">
                  {overallStats?.absent}% ABSENT
                </span>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={handleViewAllRecords}
                  className="bg-blue-900 text-white px-5 py-2 rounded-lg transition hover:bg-blue-800 hover:scale-105 active:scale-95"
                >
                  VIEW ALL RECORDS
                </button>
              </div>
            </div>

            {/* TOP */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Top Performing Classes</h2>
              {topClasses.map((cls, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span>{i + 1}. {cls.className}</span>
                  <span className="text-green-600 font-semibold">{cls.percentage}%</span>
                </div>
              ))}
            </div>

            {/* BOTTOM */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Bottom Performing Classes</h2>
              {bottomClasses.map((cls, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span>{i + 1}. {cls.className}</span>
                  <span className="text-red-500 font-semibold">{cls.percentage}%</span>
                </div>
              ))}
            </div>

          </div>

          {/* TREND */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="presentPercentage" stroke="#2563eb" name="Present %" />
                <Line type="monotone" dataKey="absentPercentage" stroke="#ef4444" name="Absent %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
