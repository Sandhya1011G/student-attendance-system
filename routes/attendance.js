const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const FinalizedAttendance = require('../models/FinalizedAttendance');
const { calculateAttendancePercentage, calculateMonthlyAttendance, getClassAttendanceByDate, getSchoolOverview } = require('../utils/attendanceCalculator');
const { sendAttendanceAlert } = require('../utils/smsService');
const moment = require('moment');

// Mark attendance for students
router.post('/mark', async (req, res) => {
  try {
    const { className, section, date, attendanceList, academicYear = '2024-2025' } = req.body;

    if (!className || !section || !date || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ error: 'Missing required fields: className, section, date, attendanceList' });
    }

    const attendanceDate = moment.utc(date).startOf('day');
    const dateStr = attendanceDate.format('YYYY-MM-DD');

    // Reject if already finalized
    const isFinalized = await FinalizedAttendance.exists({
      class: className,
      section,
      date: dateStr,
      academicYear
    });
    if (isFinalized) {
      return res.status(403).json({ error: 'Attendance for this date is finalized and cannot be edited' });
    }
    const results = [];
    const errors = [];

    for (const item of attendanceList) {
      try {
        const { studentId, status, remarks } = item;

        if (!studentId || !status) {
          errors.push({ studentId, error: 'Missing studentId or status' });
          continue;
        }

        if (!['Present', 'Absent'].includes(status)) {
          errors.push({ studentId, error: 'Status must be Present or Absent' });
          continue;
        }

        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        // Check for duplicate attendance (UTC day range)
        const dayStart = attendanceDate.toDate();
        const dayEnd = moment.utc(date).endOf('day').toDate();
        const existingAttendance = await Attendance.findOne({
          studentId,
          date: { $gte: dayStart, $lte: dayEnd }
        });

        if (existingAttendance) {
          // Update existing attendance
          existingAttendance.status = status;
          existingAttendance.remarks = remarks || existingAttendance.remarks;
          await existingAttendance.save();
          results.push(existingAttendance);
        } else {
          // Create new attendance record
          const attendance = new Attendance({
            studentId,
            studentName: student.name,
            class: className,
            section: section,
            date: attendanceDate.toDate(),
            status,
            academicYear,
            remarks
          });
          await attendance.save();
          results.push(attendance);
        }
      } catch (error) {
        // On duplicate key (E11000), try to find and update - handles race conditions
        if (error.code === 11000) {
          try {
            const dayStart = attendanceDate.toDate();
            const dayEnd = moment.utc(date).endOf('day').toDate();
            const existing = await Attendance.findOne({
              studentId: item.studentId,
              date: { $gte: dayStart, $lte: dayEnd }
            });
            if (existing) {
              existing.status = item.status;
              existing.remarks = item.remarks || existing.remarks;
              await existing.save();
              results.push(existing);
            } else {
              errors.push({ studentId: item.studentId, error: error.message });
            }
          } catch (retryErr) {
            errors.push({ studentId: item.studentId, error: retryErr.message });
          }
        } else {
          errors.push({ studentId: item.studentId, error: error.message });
        }
      }
    }

    // Check for attendance shortage after marking (for all students updated)
    if (results.length > 0) {
      const uniqueStudentIds = [...new Set(results.map(r => r.studentId.toString()))];
      await Promise.all(uniqueStudentIds.map((sid) => checkAndNotifyLowAttendance(sid, academicYear)));
    }

    res.json({
      success: true,
      marked: results.length,
      errors: errors.length > 0 ? errors : undefined,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance by class and date
router.get('/class/:className/:section', async (req, res) => {
  try {
    const { className, section } = req.params;
    const { date, academicYear = '2024-2025' } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const dateStr = moment.utc(date).format('YYYY-MM-DD');
    const attendanceData = await getClassAttendanceByDate(className, section, date, academicYear);

    const isFinalized = await FinalizedAttendance.exists({
      class: className,
      section,
      date: dateStr,
      academicYear
    });

    res.json({ ...attendanceData, isFinalized: !!isFinalized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Finalize attendance for a class and date
router.post('/finalize', async (req, res) => {
  try {
    const { className, section, date, academicYear = '2024-2025' } = req.body;

    if (!className || !section || !date) {
      return res.status(400).json({ error: 'Missing required fields: className, section, date' });
    }

    const dateStr = moment.utc(date).format('YYYY-MM-DD');

    const existing = await FinalizedAttendance.findOne({
      class: className,
      section,
      date: dateStr,
      academicYear
    });

    if (existing) {
      return res.status(400).json({ error: 'Attendance for this date is already finalized' });
    }

    await FinalizedAttendance.create({
      class: className,
      section,
      date: dateStr,
      academicYear
    });

    res.json({ success: true, message: 'Attendance finalized successfully' });
  } catch (error) {
    const msg = error.code === 11000 ? 'Attendance for this date is already finalized' : error.message;
    res.status(500).json({ error: msg });
  }
});

// Send SMS notification to parent about low attendance
router.post('/notify-parent', async (req, res) => {
  try {
    const { parentContact, studentName, class: className, section, attendancePercentage } = req.body;

    if (!parentContact || !studentName) {
      return res.status(400).json({ error: 'Missing required fields: parentContact, studentName' });
    }

    const classDisplay = className ? `${className}${section || ''}` : 'N/A';
    const percentage = parseFloat(attendancePercentage) || 0;

    const sent = await sendAttendanceAlert(
      parentContact,
      studentName,
      classDisplay,
      percentage
    );

    if (sent) {
      res.json({ success: true, message: 'SMS notification sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send SMS. Check MSG91 configuration and ensure MSG91_AUTH_KEY is set in .env' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get school dashboard overview (from finalized attendance only)
router.get('/overview', async (req, res) => {
  try {
    const { academicYear = '2024-2025' } = req.query;
    const overview = await getSchoolOverview(academicYear);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly attendance report for a student
router.get('/student/:studentId/monthly', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { year, month, academicYear = '2024-2025' } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month parameters are required' });
    }

    const attendanceData = await calculateMonthlyAttendance(
      studentId,
      parseInt(year),
      parseInt(month),
      academicYear
    );

    // Add records array for calendar compatibility
    const startDate = moment.utc({ year: parseInt(year), month: parseInt(month) - 1, day: 1 }).startOf('month');
    const endDate = moment.utc({ year: parseInt(year), month: parseInt(month) - 1, day: 1 }).endOf('month');
    
    const attendanceRecords = await Attendance.find({
      studentId,
      academicYear,
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const records = attendanceRecords.map(record => ({
      studentId: record.studentId,
      studentName: record.studentName,
      status: record.status,
      date: record.date
    }));

    res.json({ ...attendanceData, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get semester attendance report for a student
router.get('/student/:studentId/semester', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, academicYear = '2024-2025' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate parameters are required' });
    }

    const attendanceData = await calculateAttendancePercentage(
      studentId,
      startDate,
      endDate,
      academicYear
    );

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        section: student.section
      },
      attendance: attendanceData,
      threshold: parseFloat(process.env.ATTENDANCE_THRESHOLD || 75),
      isBelowThreshold: attendanceData.percentage < parseFloat(process.env.ATTENDANCE_THRESHOLD || 75)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance shortage students
router.get('/shortage', async (req, res) => {
  try {
    const { className, section, academicYear = '2024-2025', threshold } = req.query;
    const attendanceThreshold = parseFloat(threshold || process.env.ATTENDANCE_THRESHOLD || 75);

    const query = { isActive: true, academicYear };
    if (className) query.class = className;
    if (section) query.section = section;

    const students = await Student.find(query);
    const shortageStudents = [];

    // Use academic year for date range: "2024-2025" = July 1, 2024 to June 30, 2025
    // Cap end date at today so we don't include future dates (use UTC for consistency)
    const [startY, endY] = (academicYear || '2024-2025').split('-').map(Number);
    let semesterStart = moment.utc({ year: startY, month: 6, day: 1 }).startOf('day'); // July 1
    let semesterEnd = moment.utc({ year: endY, month: 5, day: 30 }).endOf('day'); // June 30
    const today = moment.utc().endOf('day');
    if (semesterEnd.isAfter(today)) semesterEnd = today;

    for (const student of students) {
      const attendanceData = await calculateAttendancePercentage(
        student._id.toString(),
        semesterStart.format('YYYY-MM-DD'),
        semesterEnd.format('YYYY-MM-DD'),
        academicYear
      );

      if (attendanceData.percentage < attendanceThreshold && attendanceData.totalDays > 0) {
        shortageStudents.push({
          student: {
            id: student._id,
            name: student.name,
            studentId: student.studentId,
            class: student.class,
            section: student.section,
            parentName: student.parentName,
            parentContact: student.parentContact
          },
          attendance: attendanceData,
          isBelowThreshold: true
        });
      }
    }

    res.json({
      threshold: attendanceThreshold,
      count: shortageStudents.length,
      students: shortageStudents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily attendance trend for a class
router.get('/trend/:className/:section', async (req, res) => {
  try {
    const { className, section } = req.params;
    const { startDate, endDate, academicYear = '2024-2025' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate parameters are required' });
    }

    const start = moment.utc(startDate).startOf('day');
    const end = moment.utc(endDate).endOf('day');

    const [allRecords, finalizedList] = await Promise.all([
      Attendance.find({
        class: className,
        section: section,
        date: { $gte: start.toDate(), $lte: end.toDate() },
        academicYear
      }).sort({ date: 1 }),
      FinalizedAttendance.find({
        class: className,
        section,
        academicYear,
        date: { $gte: start.format('YYYY-MM-DD'), $lte: end.format('YYYY-MM-DD') }
      })
    ]);

    const finalizedDates = new Set(finalizedList.map(f => f.date));
    const attendanceRecords = allRecords.filter(r =>
      finalizedDates.has(moment.utc(r.date).format('YYYY-MM-DD'))
    );

    // Group by date (UTC)
    const dailyData = {};
    attendanceRecords.forEach(record => {
      const dateKey = moment.utc(record.date).format('YYYY-MM-DD');
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          present: 0,
          absent: 0,
          total: 0
        };
      }
      dailyData[dateKey].total++;
      if (record.status === 'Present') dailyData[dateKey].present++;
      else dailyData[dateKey].absent++;
    });

    const trend = Object.values(dailyData).map(day => {
      const attended = day.present;
      return {
        date: day.date,
        present: day.present,
        absent: day.absent,
        total: day.total,
        presentPercentage: day.total > 0 ? ((day.present / day.total) * 100).toFixed(2) : 0,
        absentPercentage: day.total > 0 ? ((day.absent / day.total) * 100).toFixed(2) : 0,
        attendedPercentage: day.total > 0 ? ((attended / day.total) * 100).toFixed(2) : 0
      };
    });

    res.json({
      className,
      section,
      startDate,
      endDate,
      trend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check and notify low attendance
async function checkAndNotifyLowAttendance(studentId, academicYear) {
  try {
    const student = await Student.findById(studentId);
    if (!student) return;

    const currentDate = moment();
    const semesterStart = moment(currentDate).month(6).date(1); // July 1st
    const semesterEnd = moment(currentDate).month(11).date(31); // December 31st

    if (currentDate.month() < 6) {
      semesterStart.subtract(1, 'year');
      semesterEnd.subtract(1, 'year');
    }

    const attendanceData = await calculateAttendancePercentage(
      studentId,
      semesterStart.format('YYYY-MM-DD'),
      semesterEnd.format('YYYY-MM-DD'),
      academicYear
    );

    const threshold = parseFloat(process.env.ATTENDANCE_THRESHOLD || 75);

    // Only send notification if attendance is below threshold and we have enough data
    if (attendanceData.percentage < threshold && attendanceData.totalDays >= 5) {
      await sendAttendanceAlert(
        student.parentContact,
        student.name,
        `${student.class}${student.section}`,
        attendanceData.percentage
      );
    }
  } catch (error) {
    console.error('Error checking attendance shortage:', error.message);
  }
}

module.exports = router;

