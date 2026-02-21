import React, { useState } from 'react';
import api from '../config/api';

const AdminAlerts = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    class: '',
    section: ''
  });

  const handleSend = async () => {
    try {
      if (!form.title || !form.message || !form.class || !form.section) {
        alert('Fill all fields');
        return;
      }

      await api.post('/alerts', {
        title: form.title,
        message: form.message,

        senderRole: 'ADMIN',
        senderId: 'ADMIN_PANEL', // can be real admin ID later

        targetType: 'CLASS',
        class: form.class,
        section: form.section,

        academicYear: '2024-2025'
      });

      alert('Alert sent to class successfully');

      setForm({ title: '', message: '', class: '', section: '' });

    } catch (err) {
      console.error(err);
      alert('Failed to send alert');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Send Class Alert</h2>

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

      <div className="flex gap-3">
        <input
          placeholder="Class"
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
          className="border p-2 w-full rounded"
        />

        <input
          placeholder="Section"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        onClick={handleSend}
        className="mt-4 bg-blue-900 text-white px-4 py-2 rounded"
      >
        Send Alert
      </button>
    </div>
  );
};

export default AdminAlerts;
