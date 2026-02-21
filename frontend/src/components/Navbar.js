import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Determine user role and name based on localStorage
    const studentId = localStorage.getItem('studentId');
    const teacherId = localStorage.getItem('teacherId'); // This is stored as teacherMongoId from TeacherLogin
    const adminId = localStorage.getItem('adminId');

    console.log('Checking localStorage:', { studentId, teacherId, adminId });

    if (studentId) {
      setUserRole('student');
      setUserName(localStorage.getItem('studentName') || 'Student');
      console.log('User role set to: student');
    } else if (teacherId) {
      setUserRole('teacher');
      setUserName(localStorage.getItem('teacherName') || 'Teacher');
      console.log('User role set to: teacher');
    } else if (adminId) {
      setUserRole('admin');
      setUserName(localStorage.getItem('adminName') || 'Admin');
      console.log('User role set to: admin');
    } else {
      setUserRole('main');
      setUserName('Guest');
      console.log('User role set to: main/guest');
    }
  }, []);

  // Add a re-check effect to handle localStorage changes
  useEffect(() => {
    const checkRole = () => {
      const studentId = localStorage.getItem('studentId');
      const teacherId = localStorage.getItem('teacherId');
      const adminId = localStorage.getItem('adminId');

      console.log('Re-checking localStorage:', { studentId, teacherId, adminId });

      if (studentId) {
        setUserRole('student');
        setUserName(localStorage.getItem('studentName') || 'Student');
      } else if (teacherId) {
        setUserRole('teacher');
        setUserName(localStorage.getItem('teacherName') || 'Teacher');
      } else if (adminId) {
        setUserRole('admin');
        setUserName(localStorage.getItem('adminName') || 'Admin');
      } else {
        setUserRole('main');
        setUserName('Guest');
      }
    };

    // Check immediately and then every 2 seconds
    checkRole();
    const interval = setInterval(checkRole, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    setShowProfile(false);
  };

  const getNavigationItems = () => {
    return []; // No navigation items - only profile
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'student': return 'text-blue-600';
      case 'teacher': return 'text-green-600';
      case 'admin': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'student': return '👨‍🎓';
      case 'teacher': return '👨‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  return (
    <nav className="bg-primary-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-3">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          {/* Logo Section */}
          <div className="flex flex-col">
            <div className="text-xl md:text-2xl font-bold">
              XYP QUANTUM SCHOOL
            </div>
            <div className="text-xs md:text-sm opacity-80">
              Attendance Management System
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-end">
            
            {/* Profile Section - Only show for logged-in users */}
            {userRole !== 'main' && (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className={`px-3 py-1.5 rounded-md text-sm transition hover:bg-primary-light flex items-center gap-2 ${getRoleColor()}`}
                >
                  <span>{getRoleIcon()}</span>
                  <span>{userName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRoleIcon()}</span>
                        <div>
                          <div className="font-semibold text-gray-800">{userName}</div>
                          <div className={`text-sm capitalize ${getRoleColor()}`}>
                            {userRole}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
