import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MarkAttendance from './components/MarkAttendance';
import AttendanceReport from './components/AttendanceReport';
import StudentReport from './components/StudentReport';
import LowAttendanceAlert from './components/LowAttendanceAlert';
import Navbar from './components/Navbar';
import StudentLogin from './components/StudentLogin';
import StudentView from './components/dashboard/StudentView';
import TeacherLogin from './components/TeacherLogin';
import TeacherAlerts from './components/TeacherAlert';
import TeacherView from './components/dashboard/TeacherView';
import TeacherAdminAlerts from './components/teacher/TeacherAdminAlerts';
import SchoolAdminDashboard from './components/SchoolAdminDashboard';



function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mark-attendance" element={<MarkAttendance />} />
          <Route path="/reports" element={<AttendanceReport />} />
          <Route path="/student-report/:studentId" element={<StudentReport />} />
          <Route path="/low-attendance" element={<LowAttendanceAlert />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-dashboard" element={<StudentView />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/teacher-alerts" element={<TeacherAlerts />} />
          <Route path="/teacher-dashboard" element={<TeacherView />} />
          <Route
            path="/teacher-admin-alerts"
            element={<TeacherAdminAlerts />}
          />
          <Route path="/school-admin" element={<SchoolAdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

