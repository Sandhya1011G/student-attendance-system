import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const StudentLogin = () => {
  const navigate = useNavigate();

  const [rollNumber, setRollNumber] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
  try {
    setError('');

    if (!rollNumber.trim()) {
      setError('Please enter Roll Number');
      return;
    }

    const res = await api.post('/students/login', {
      studentId: rollNumber.trim().toUpperCase(),   // ✅ normalize input
      academicYear: '2024-2025'
    });

    const student = res.data;

// ✅ STORE SESSION (VERY IMPORTANT)
localStorage.setItem('studentId', student.studentId);   // Mongo ObjectId
localStorage.setItem('studentName', student.name);
localStorage.setItem('studentClass', student.class);
localStorage.setItem('studentSection', student.section);

// ✅ Navigate WITHOUT state dependency
navigate('/student-dashboard');


  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || 'Login failed');
  }
};


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Student Login
        </h2>

        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg mb-4"
        />

        {error && (
          <div className="text-red-500 text-sm mb-3">{error}</div>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800"
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

export default StudentLogin;
