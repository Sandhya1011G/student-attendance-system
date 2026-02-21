const Attendance = require('../models/Attendance');
const FinalizedAttendance = require('../models/FinalizedAttendance');
const moment = require('moment');

/**
 * Check if a specific attendance record is finalized
 */
async function isRecordFinalized(record) {
  const dateStr = moment.utc(record.date).format('YYYY-MM-DD');

  return FinalizedAttendance.exists({
    class: record.class,
    section: record.section,
    academicYear: record.academicYear,
    date: dateStr
  });
}

/**
 * Calculate attendance percentage for a student (SAFE VERSION)
 */
async function calculateAttendancePercentage(studentId, startDate, endDate, academicYear) {
  try {
    const start = moment.utc(startDate).startOf('day');
    const end = moment.utc(endDate).endOf('day');

    const attendanceRecords = await Attendance.find({
      studentId,
      academicYear,
      date: { $gte: start.toDate(), $lte: end.toDate() }
    });

    const finalizedRecords = [];

    for (const record of attendanceRecords) {
      const finalized = await isRecordFinalized(record);
      if (finalized) finalizedRecords.push(record);
    }

    const totalDays = finalizedRecords.length;
    const presentDays = finalizedRecords.filter(r => r.status === 'Present').length;
    const absentDays = finalizedRecords.filter(r => r.status === 'Absent').length;

    const attendedDays = presentDays;

    const percentage = totalDays > 0
      ? ((attendedDays / totalDays) * 100).toFixed(2)
      : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendedDays,
      percentage: parseFloat(percentage),
      presentPercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0,
      absentPercentage: totalDays > 0 ? ((absentDays / totalDays) * 100).toFixed(2) : 0
    };

  } catch (error) {
    throw new Error(`Attendance calculation failed: ${error.message}`);
  }
}

/**
 * Monthly calculation (unchanged but safer)
 */
async function calculateMonthlyAttendance(studentId, year, month, academicYear) {
  const startDate = moment.utc({ year, month: month - 1, day: 1 }).startOf('month');
  const endDate = moment.utc({ year, month: month - 1, day: 1 }).endOf('month');

  return calculateAttendancePercentage(
    studentId,
    startDate.format('YYYY-MM-DD'),
    endDate.format('YYYY-MM-DD'),
    academicYear
  );
}

/**
 * Class attendance by date (SAFE)
 */
async function getClassAttendanceByDate(className, section, date, academicYear) {
  try {
    const Student = require('../models/Student');

    const dateStr = moment.utc(date).format('YYYY-MM-DD');

    const isFinalized = await FinalizedAttendance.exists({
      class: className,
      section,
      academicYear,
      date: dateStr
    });

    const students = await Student.find({
      class: className,
      section,
      isActive: true
    }).sort({ name: 1 });

    if (!isFinalized) {
      return {
        date,
        className,
        section,
        totalStudents: students.length,
        records: students.map(s => ({
          studentId: s._id,
          studentName: s.name,
          status: 'Not finalized'
        })),
        attendancePercentage: 0
      };
    }

    const dayStart = moment.utc(date).startOf('day');
    const dayEnd = moment.utc(date).endOf('day');

    const attendanceRecords = await Attendance.find({
      class: className,
      section,
      academicYear,
      date: { $gte: dayStart.toDate(), $lte: dayEnd.toDate() }
    });

    const recordMap = {};
    attendanceRecords.forEach(r => {
      recordMap[String(r.studentId)] = r.status;
    });

    let presentCount = 0;
    let absentCount = 0;

    const records = students.map(student => {
      const status = recordMap[String(student._id)] || 'Absent';

      if (status === 'Present') presentCount++;
      else absentCount++;

      return {
        studentId: student._id,
        studentName: student.name,
        status
      };
    });

    const attended = presentCount;
    const total = attendanceRecords.length;

    const percentage = total > 0
      ? ((attended / total) * 100).toFixed(2)
      : 0;

    return {
      date,
      className,
      section,
      totalStudents: students.length,
      presentCount,
      absentCount,
      totalMarked: total,
      attendancePercentage: parseFloat(percentage),
      attendedCount: attended,
      records: students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        status: recordMap[String(student._id)] || 'Absent'
      }))
    };

  } catch (error) {
    throw new Error(`Class attendance failed: ${error.message}`);
  }
}

/**
 * School overview (SAFE & FAST)
 */
async function getSchoolOverview(academicYear) {
  try {
    const records = await Attendance.find({ academicYear });

    const classStats = {};
    const dateStats = {};

    for (const record of records) {
      const finalized = await FinalizedAttendance.exists({
        class: record.class,
        section: record.section,
        academicYear: record.academicYear,
        date: moment.utc(record.date).format('YYYY-MM-DD')
      });

      if (!finalized) continue;

      const classKey = `${record.class}${record.section}`;
      const dateKey = moment.utc(record.date).format('YYYY-MM-DD');

      if (!classStats[classKey]) {
        classStats[classKey] = { attended: 0, total: 0 };
      }

      if (!dateStats[dateKey]) {
        dateStats[dateKey] = { attended: 0, total: 0 };
      }

      const attended = ['Present'].includes(record.status);

      classStats[classKey].total++;
      dateStats[dateKey].total++;

      if (attended) {
        classStats[classKey].attended++;
        dateStats[dateKey].attended++;
      }
    }

    const overallTotals = Object.values(classStats).reduce(
      (acc, s) => {
        acc.attended += s.attended;
        acc.total += s.total;
        return acc;
      },
      { attended: 0, total: 0 }
    );

    const overallPresent = overallTotals.total > 0
      ? ((overallTotals.attended / overallTotals.total) * 100).toFixed(1)
      : 0;

    const classList = Object.entries(classStats).map(([className, s]) => ({
      className,
      percentage: s.total > 0
        ? ((s.attended / s.total) * 100).toFixed(1)
        : 0
    }));

    classList.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

    const trend = Object.entries(dateStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, s]) => ({
        date,
        presentPercentage: s.total > 0
          ? ((s.attended / s.total) * 100).toFixed(1)
          : 0,
        absentPercentage: s.total > 0
          ? (((s.total - s.attended) / s.total) * 100).toFixed(1)
          : 0
      }));

    return {
      overallPresent: parseFloat(overallPresent),
      overallAbsent: 100 - parseFloat(overallPresent),
      topClasses: classList.slice(0, 5),
      bottomClasses: classList.slice(-5).reverse(),
      trend
    };

  } catch (error) {
    throw new Error(`Overview failed: ${error.message}`);
  }
}


module.exports = {
  calculateAttendancePercentage,
  calculateMonthlyAttendance,
  getClassAttendanceByDate,
  getSchoolOverview
};
