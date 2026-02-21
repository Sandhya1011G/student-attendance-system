const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Teacher = require('../models/Teacher');

router.post('/notify-teacher', async (req, res) => {
  try {
    const { className, section, academicYear, count } = req.body;

    if (!className || !section || !academicYear) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // ✅ Find class teacher
    const teacher = await Teacher.findOne({
      isClassTeacher: true,
      'classAssigned.class': className,
      'classAssigned.section': section
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Class teacher not found' });
    }

    await Alert.create({
      title: 'Low Attendance Alert',
      message: `${count} students below attendance threshold`,
      senderRole: 'ADMIN',
      senderId: teacher._id,    
      targetType: 'TEACHER',
      teacherId: teacher._id,
      academicYear
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
