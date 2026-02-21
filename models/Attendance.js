const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  academicYear: {
    type: String,
    required: true,
    default: '2024-2025'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance for same student and date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Index for faster queries
attendanceSchema.index({ class: 1, section: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ studentId: 1, academicYear: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

