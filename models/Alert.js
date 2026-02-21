const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },

  senderRole: {
    type: String,
    enum: ['ADMIN', 'TEACHER'],
    required: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  targetType: {
    type: String,
    enum: ['CLASS', 'STUDENT', 'TEACHER'],
    required: true
  },

  class: String,     // for CLASS alerts
  section: String,   // for CLASS alerts

  studentId: mongoose.Schema.Types.ObjectId, // for STUDENT alerts
  teacherId: mongoose.Schema.Types.ObjectId,

  academicYear: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true }); // ✅ createdAt / updatedAt auto

module.exports = mongoose.model('Alert', alertSchema);
