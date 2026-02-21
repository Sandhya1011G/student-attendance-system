const mongoose = require('mongoose');

const finalizedAttendanceSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: '2024-2025'
  },
  finalizedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

finalizedAttendanceSchema.index({ class: 1, section: 1, date: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FinalizedAttendance', finalizedAttendanceSchema);
