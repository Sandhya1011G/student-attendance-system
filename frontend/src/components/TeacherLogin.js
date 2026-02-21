import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const TeacherLogin = () => {
  const navigate = useNavigate();

  const [teacherIdInput, setTeacherIdInput] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');

      if (!teacherIdInput.trim()) {
        setError('Enter Teacher ID');
        return;
      }

      const res = await api.post('/teachers/login', {
        teacherId: teacherIdInput.trim().toUpperCase()
      });

      const teacher = res.data;

      /* ✅ STORE SESSION CORRECTLY */
      localStorage.setItem('teacherId', teacher.teacherMongoId);   // ⭐ MOST IMPORTANT
      localStorage.setItem('teacherName', teacher.name);
      localStorage.setItem('isClassTeacher', teacher.isClassTeacher);

      if (teacher.classAssigned) {
        localStorage.setItem('teacherClass', teacher.classAssigned.class);
        localStorage.setItem('teacherSection', teacher.classAssigned.section);
      }

      navigate('/teacher-dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">

        <h2 className="text-2xl font-bold mb-5">Teacher Login</h2>

        <input
          placeholder="Enter Teacher ID (TCH001)"
          value={teacherIdInput}
          onChange={((e) => setTeacherIdInput(e.target.value))}
          className="border p-2 w-full mb-3 rounded"
        />

        {error && (
          <div className="text-red-600 text-sm mb-3">{error}</div>
        )}

        <button
          onClick={handleLogin}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Main Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default TeacherLogin;
