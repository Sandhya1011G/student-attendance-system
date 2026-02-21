const express = require('express');
const router = express.Router();
const Student = require('../models/Student');


// ✅ STUDENT LOGIN (ADD THIS SECTION)
router.post('/login', async (req, res) => {
  try {
    const { studentId, academicYear } = req.body;

    if (!studentId || !academicYear) {
      return res.status(400).json({ error: 'studentId and academicYear required' });
    }

    const student = await Student.findOne({
      studentId,          // ✅ Roll number like STU908
      academicYear,
      isActive: true
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      studentId: student._id,   // ✅ VERY IMPORTANT → Mongo ObjectId
      name: student.name,
      class: student.class,
      section: student.section
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all students
router.get('/', async (req, res) => {
  try {
    const { class: className, section, academicYear } = req.query;
    const query = { isActive: true };
    
    if (className) query.class = className;
    if (section) query.section = section;
    if (academicYear) query.academicYear = academicYear;

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete student (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
