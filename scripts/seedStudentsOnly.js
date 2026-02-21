
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('../models/Student');
const Class = require('../models/Class');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_attendance';

async function seedStudentsOnly() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Student.deleteMany({});
    await Class.deleteMany({});
    console.log('Cleared existing students and classes');

    const classes = [
      { className: '10', section: 'A', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mrs. Sharma' },
      { className: '10', section: 'B', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mr. Kumar' },
      { className: '9', section: 'A', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mrs. Patel' },
      { className: '8', section: 'C', academicYear: '2024-2025', board: 'CBSE', classTeacher: 'Mr. Verma' },
    ];

    await Class.insertMany(classes);
    console.log(`Created ${classes.length} classes`);

    const students = [
      { studentId: 'STU001', name: 'Sagar Singh', class: '10', section: 'A', parentName: 'Rajesh Singh', parentContact: '+919876543210', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU002', name: 'Fatima Ali', class: '10', section: 'A', parentName: 'Ahmed Ali', parentContact: '+919876543211', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU003', name: 'Rajesh Kumar', class: '10', section: 'A', parentName: 'Vikram Kumar', parentContact: '+919876543212', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU004', name: 'Anya Sharma', class: '10', section: 'A', parentName: 'Priya Sharma', parentContact: '+919876543213', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU005', name: 'Pridarh Singh', class: '10', section: 'A', parentName: 'Amit Singh', parentContact: '+919876543214', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU006', name: 'Maya Sharma', class: '10', section: 'A', parentName: 'Ravi Sharma', parentContact: '+919876543215', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU007', name: 'Rohan Mehta', class: '8', section: 'C', parentName: 'Suresh Mehta', parentContact: '+919876543216', academicYear: '2024-2025', board: 'CBSE' },
      { studentId: 'STU008', name: 'Priya Patel', class: '8', section: 'C', parentName: 'Kiran Patel', parentContact: '+919876543217', academicYear: '2024-2025', board: 'CBSE' },
    ];

    await Student.insertMany(students);
    console.log(`Created ${students.length} students`);

    console.log('\nDone! Next steps:');
    console.log('1. Go to Mark Attendance');
    console.log('2. Select Class 10A, pick dates (e.g. this week)');
    console.log('3. Mark students - give some Absent to create low attendance');
    console.log('4. Click Save Changes, then Finalize Attendance');
    console.log('5. Repeat for more dates if needed');
    console.log('6. Open Low Attendance - it will show students below 75%');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedStudentsOnly();
