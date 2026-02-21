const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');


// ✅ CREATE ALERT (ADMIN / TEACHER)
router.post('/', async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET ALERTS FOR STUDENT
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res.status(400).json({ error: 'academicYear required' });
    }

    const alerts = await Alert.find({
      academicYear,
      targetType: 'STUDENT',
      studentId: new mongoose.Types.ObjectId(studentId)
    }).sort({ createdAt: -1 });

    res.json(alerts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ GET ALERTS FOR CLASS (Teacher Dashboard)
router.get('/class/:className/:section', async (req, res) => {
  try {
    const { className, section } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res.status(400).json({ error: 'academicYear required' });
    }

    const alerts = await Alert.find({
      academicYear,
      targetType: 'CLASS',
      class: className,
      section
    }).sort({ createdAt: -1 });

    res.json(alerts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { senderId, academicYear } = req.query;

    const query = {};
    if (senderId) query.senderId = senderId;
    if (academicYear) query.academicYear = academicYear;

    const alerts = await Alert.find(query).sort({ createdAt: -1 });

    res.json(alerts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ MARK ALERT AS READ
router.put('/:id/read', async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
