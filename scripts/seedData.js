const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const moment = require('moment');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_attendance';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create Classes
    const classes = [
      { className: '10', section: 'A', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mrs. Sharma' },
      { className: '10', section: 'B', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mr. Kumar' },
      { className: '9', section: 'A', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mrs. Patel' },
      { className: '9', section: 'B', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mr. Singh' },
      { className: '8', section: 'A', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mrs. Reddy' },
      { className: '8', section: 'C', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mr. Verma' },
    ];

    const createdClasses = await Class.insertMany(classes);
    console.log(`Created ${createdClasses.length} classes`);

    // Create Students
    const students = [
      // Class 10A
      { studentId: 'STU001', name: 'Sanjay Singh', email: 'sanjay@example.com', class: '10', section: 'A', parentName: 'Rajesh Singh', parentContact: '+918197462610', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU002', name: 'Fatima Ali', email: 'fatima@example.com', class: '10', section: 'A', parentName: 'Ahmed Ali', parentContact: '+919876543211', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU003', name: 'Rajesh Kumar', email: 'rajesh@example.com', class: '10', section: 'A', parentName: 'Vikram Kumar', parentContact: '+919876543212', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU004', name: 'Anya Sharma', email: 'anya@example.com', class: '10', section: 'A', parentName: 'Priya Sharma', parentContact: '+919876543213', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU005', name: 'Pridarh Singh', email: 'pridarh@example.com', class: '10', section: 'A', parentName: 'Amit Singh', parentContact: '+919876543214', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU006', name: 'Maya Sharma', email: 'maya@example.com', class: '10', section: 'A', parentName: 'Ravi Sharma', parentContact: '+919876543215', academicYear: '2024-2025', board: 'CBSE' },
      
      // Class 8C
      { studentId: 'STU007', name: 'Rohan Mehta', email: 'rohan@example.com', class: '8', section: 'C', parentName: 'Suresh Mehta', parentContact: '+919876543216', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU008', name: 'Priya Patel', email: 'priya@example.com', class: '8', section: 'C', parentName: 'Kiran Patel', parentContact: '+919876543217', academicYear: '2024-2025', board: 'CBSE' },
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`Created ${createdStudents.length} students`);

    // Create sample attendance records
    const attendanceRecords = [];
    const startDate = moment('2024-07-01');
    const endDate = moment('2024-10-31');
    const currentDate = moment(startDate);

    let dayIndex = 0;
    while (currentDate.isSameOrBefore(endDate)) {
      // Skip weekends
      if (currentDate.day() !== 0 && currentDate.day() !== 6) {
        const date = currentDate.toDate();

        for (const student of createdStudents) {
          // Deterministic: ~25% absent = 75% attended for low-attendance students
          const dayMod = dayIndex % 20; // 20 working days pattern
          let status = 'Present';
          if (student.studentId === 'STU001') {
            status = dayMod < 14 ? 'Present' : 'Absent'; // 70% - LOW
          } else if (student.studentId === 'STU002') {
            status = dayMod < 14 ? 'Present' : 'Absent'; // 70% - LOW
          } else if (student.studentId === 'STU003') {
            status = dayMod < 12 ? 'Present' : 'Absent'; // 60% - LOW
          } else if (student.studentId === 'STU004') {
            status = dayMod < 19 ? 'Present' : 'Absent'; // 95% - Good
          } else if (student.studentId === 'STU005') {
            status = dayMod < 13 ? 'Present' : 'Absent'; // ~68% - LOW
          } else {
            status = dayMod < 17 ? 'Present' : 'Absent'; // 85% - Good
          }

          attendanceRecords.push({
            studentId: student._id,
            studentName: student.name,
            class: student.class,
            section: student.section,
            date: date,
            status: status,
            academicYear: '2024-2025'
          });
        }
        dayIndex++;
      }
      currentDate.add(1, 'day');
    }

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < attendanceRecords.length; i += batchSize) {
      const batch = attendanceRecords.slice(i, i + batchSize);
      await Attendance.insertMany(batch);
    }
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

