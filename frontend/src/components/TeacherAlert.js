import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const TeacherAlerts = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [form, setForm] = useState({
    title: '',
    message: '',
    studentId: ''
  });

  const className = localStorage.getItem('teacherClass');
  const section = localStorage.getItem('teacherSection');
  const teacherId = localStorage.getItem('teacherId');

  // ✅ LOAD STUDENTS
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!className || !section) return;

        const res = await api.get('/students', {
          params: {
            class: className,
            section,
            academicYear: '2024-2025'
          }
        });

        setStudents(res.data);
      } catch (err) {
        console.error('Student Load Error:', err);
      }
    };

    fetchStudents();
  }, []);

  // ✅ LOAD ALERTS SENT BY TEACHER
  const fetchAlerts = async () => {
    try {
      if (!teacherId) return;

      const res = await api.get('/alerts', {
        params: {
          senderId: teacherId,
          academicYear: '2024-2025'
        }
      });

      setAlerts(res.data);
    } catch (err) {
      console.error('Alert Load Error:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // ✅ Auto refresh every 5 seconds (for read status updates)
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  // ✅ SEND ALERT
  const handleSend = async () => {
    try {
      if (!form.title || !form.message || !form.studentId) {
        alert('Fill all fields');
        return;
      }

      await api.post('/alerts', {
        title: form.title,
        message: form.message,

        senderRole: 'TEACHER',
        senderId: teacherId,

        targetType: 'STUDENT',
        studentId: form.studentId,

        academicYear: '2024-2025'
      });

      alert('Alert sent successfully');

      setForm({ title: '', message: '', studentId: '' });

      fetchAlerts(); // refresh immediately
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to send alert');
    }
  };

  const getStudentLabel = (id) => {
    const s = students.find(st => st._id === id);

    if (!s) return id; 

    return `${s.name} (${s.studentId})`;
    };

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      {/* ✅ HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Teacher Alerts</h2>

        <button
          onClick={() => navigate('/teacher-dashboard')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>

      {/* ✅ ALERT FORM */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">Send Alert to Student</h3>

        <select
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
        >
          <option value="">Select Student</option>
          {students.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.studentId})
            </option>
          ))}
        </select>

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
        />

        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="border p-2 w-full mb-3 rounded"
        />

        <button
          onClick={handleSend}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-400"
        >
          Send Alert
        </button>
      </div>

      {/* ✅ SENT ALERTS LIST */}
      <div>
        <h3 className="font-semibold mb-3">Sent Alerts</h3>

        {alerts.length === 0 && (
          <div className="text-sm text-gray-500">No alerts sent yet</div>
        )}

        {alerts.map(alert => (
          <div
            key={alert._id}
            className="border rounded-lg p-3 mb-2 flex justify-between"
          >
            <div>
              <div className="font-semibold">{alert.title}</div>
              <div className="text-sm text-gray-600">
                To: {getStudentLabel(alert.studentId)}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(alert.createdAt).toLocaleString()}
              </div>
            </div>

            <div className={`text-sm font-semibold ${
              alert.isRead ? 'text-green-600' : 'text-red-500'
            }`}>
              {alert.isRead ? 'READ' : 'UNREAD'}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TeacherAlerts;
