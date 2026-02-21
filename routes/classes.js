const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Student = require('../models/Student');

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { academicYear } = req.query;
    const query = { isActive: true };
    
    if (academicYear) query.academicYear = academicYear;

    const classes = await Class.find(query).sort({ className: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new class
router.post('/', async (req, res) => {
  try {
    const classData = new Class(req.body);
    await classData.save();
    res.status(201).json(classData);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Class-section combination already exists for this academic year' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json(classData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get students in a class
router.get('/:className/:section/students', async (req, res) => {
  try {
    const { className, section } = req.params;
    const { academicYear } = req.query;
    
    const query = {
      class: className,
      section: section,
      isActive: true
    };
    
    if (academicYear) query.academicYear = academicYear;

    const students = await Student.find(query).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

