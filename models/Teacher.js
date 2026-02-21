const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({

  teacherId: {
    type: String,
    required: true,
    unique: true
  },

  name: { type: String, required: true },
  email: String,
  phone: String,
  subject: String,
  department: String,

  // ✅ IMPORTANT FOR DASHBOARD LOGIC
  isClassTeacher: {
    type: Boolean,
    default: false
  },

  classAssigned: {
    class: String,
    section: String
  },

  // Optional → subject teachers
  assignedClasses: [
    {
      class: String,
      section: String
    }
  ],

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
