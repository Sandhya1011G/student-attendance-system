const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');

// Get teacher details by ID
router.get('/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId required' });
    }

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      department: teacher.department,
      isClassTeacher: teacher.isClassTeacher,
      classAssigned: teacher.classAssigned,
      assignedClasses: teacher.assignedClasses,
      isActive: teacher.isActive
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ error: 'teacherId required' });
    }

    const teacher = await Teacher.findOne({
      teacherId,
      isActive: true
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      teacherMongoId: teacher._id,      // ✅ CRITICAL
      name: teacher.name,
      isClassTeacher: teacher.isClassTeacher,
      classAssigned: teacher.classAssigned
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
