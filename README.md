# School Attendance Management System

A comprehensive MERN stack application for managing student attendance with real-time SMS notifications, now built with TypeScript for enhanced type safety and developer experience.

## Features

- **Student Management**: Add, update, and manage student records with parent contact information
- **Class Management**: Organize students by classes and sections
- **Attendance Marking**: Mark attendance for students by class, section, and date
- **Enhanced Reports & Analytics**: 
  - Overall school attendance dashboard
  - Class-wise attendance reports
  - Student-wise monthly and semester reports
  - **NEW**: Semester-wise attendance analytics with dual view modes
  - **NEW**: Performance insights and grade badges
  - Daily attendance trends
- **Low Attendance Alerts**: Automatic detection and SMS notifications when attendance falls below threshold
- **Multi-Platform**: 
  - Desktop web interface (React + TypeScript + Tailwind CSS)
  - Mobile app (React Native)
- **Enhanced Data Management**:
  - Finalized attendance collection for data integrity
  - Semester-based data organization
  - Real-time attendance analytics

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Twilio (SMS notifications)

### Frontend (Desktop)
- **React.js with TypeScript**
- React Router
- Tailwind CSS
- Recharts (for data visualization)
- Axios
- **NEW**: Enhanced type safety with TypeScript interfaces

### Mobile
- React Native
- Expo
- React Navigation
- React Native Paper

## Project Structure

```
Student_attendance/
├── server.js                 # Express server entry point
├── models/                   # MongoDB models
│   ├── Student.js
│   ├── Class.js
│   └── Attendance.js
├── routes/                   # API routes
│   ├── students.js
│   ├── classes.js
│   └── attendance.js
├── utils/                    # Utility functions
│   ├── attendanceCalculator.js
│   └── smsService.js
├── frontend/                 # React web app (TypeScript)
│   ├── src/
│   │   ├── components/       # All .tsx files now
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MarkAttendance.tsx
│   │   │   ├── AttendanceReport.tsx
│   │   │   ├── StudentReport.tsx
│   │   │   ├── student/
│   │   │   │   ├── AttendanceSummary.tsx  # Enhanced with semester view
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   └── MyAttendance.tsx
│   │   │   └── dashboard/
│   │   │       ├── AdminView.tsx
│   │   │       ├── StudentView.tsx
│   │   │       └── TeacherView.tsx
│   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── config/
│   │   └── utils/
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json
└── mobile/                   # React Native app
    ├── screens/
    │   ├── TeacherDashboard.js
    │   ├── AdminDashboard.js
    │   ├── StudentDashboard.js
    │   ├── NotificationScreen.js
    │   └── AttendanceDetails.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/student_attendance
PORT=5000
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
ATTENDANCE_THRESHOLD=75
```

3. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup (Desktop)

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env.local` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
DISABLE_ESLINT_PLUGIN=true
```

3. Start the React app:
```bash
npm start
```

4. **TypeScript Development**:
```bash
# Type checking
npm run type-check

# Build for production
npm run build
```

### Mobile Setup

1. Navigate to mobile directory:
```bash
cd mobile
npm install
```

2. Update API URL in `mobile/config/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

3. Start Expo:
```bash
npm start
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (soft delete)

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `GET /api/classes/:className/:section/students` - Get students in a class

### Attendance
- `POST /api/attendance/mark` - Mark attendance for students
- `GET /api/attendance/class/:className/:section` - Get attendance by class and date
- `GET /api/attendance/student/:studentId/monthly` - Get monthly attendance report
- `GET /api/attendance/student/:studentId/semester` - Get semester attendance report
- `GET /api/attendance/student/:studentId/finalized` - Get finalized attendance data
- `GET /api/attendance/class/:className/:section/finalized` - Get class finalized attendance
- `GET /api/attendance/shortage` - Get students with low attendance
- `GET /api/attendance/trend/:className/:section` - Get daily attendance trend

## Database Schema

### Student
```javascript
{
  studentId: String (unique),
  name: String,
  email: String,
  class: String,
  section: String,
  parentName: String,
  parentContact: String,
  academicYear: String,
  board: String,
  isActive: Boolean
}
```

### Class
```javascript
{
  className: String,
  section: String,
  academicYear: String,
  board: String,
  classTeacher: String,
  totalStudents: Number,
  isActive: Boolean
}
```

### Attendance
```javascript
{
  studentId: ObjectId (ref: Student),
  studentName: String,
  class: String,
  section: String,
  date: Date,
  status: 'Present' | 'Absent',
  academicYear: String,
  remarks: String
}
```

### FinalizedAttendance (NEW)
```javascript
{
  studentId: ObjectId (ref: Student),
  class: String,
  section: String,
  date: Date,
  status: 'Present' | 'Absent',
  academicYear: String,
  semester: String,
  semesterStartDate: Date,
  semesterEndDate: Date,
  finalizedBy: String,
  finalizedAt: Date
}
```

## Features in Detail

### Attendance Marking
- Select class, section, and date
- Mark all students as Present/Absent with one click
- Individual student status toggle
- Prevents duplicate attendance for same student and date
- Automatically checks for low attendance after marking

### Enhanced Student Attendance Summary (NEW)
- **Dual View Modes**: Semester view and Monthly view
- **Semester Selection**: Choose between Semester 1 and Semester 2
- **Performance Insights**: Grade badges and actionable recommendations
- **Real-time Analytics**: Live data from finalized attendance collection
- **Visual Breakdown**: Monthly attendance within each semester
- **Error Handling**: Comprehensive fallbacks and user feedback

### Low Attendance Detection
- Automatically calculates attendance percentage
- Compares against configurable threshold (default: 75%)
- Triggers SMS notification to parent's contact number
- Can be viewed in Low Attendance Alerts section

### Reports
- **Dashboard**: Overall school statistics, top/bottom performing classes, daily trends
- **Class Report**: Attendance for a specific class on a given date
- **Student Report**: Monthly and semester-wise attendance for individual students
- **Low Attendance**: List of all students below threshold with parent contact info
- **NEW**: Semester-wise attendance analytics with performance insights

## TypeScript Enhancements

### Type Safety
- All components converted to TypeScript (.tsx)
- Comprehensive type definitions for API responses
- Enhanced error handling with proper typing
- Improved developer experience with IntelliSense

### Build Configuration
- Optimized TypeScript compilation
- ESLint configuration for code quality
- Production-ready build process
- Windows-compatible build scripts

## SMS Integration

The system uses Twilio for sending SMS notifications. When a student's attendance falls below the threshold:

1. System calculates current semester attendance
2. Compares with threshold (default 75%)
3. Sends SMS to parent's registered contact number
4. Logs the notification (even if SMS fails)

**Note**: If Twilio credentials are not configured, the system will log the SMS message to console instead.

## Validation

- Prevents duplicate attendance entries
- Validates required fields
- Error handling for API calls
- Input validation on frontend
- **NEW**: TypeScript compile-time validation

## Development Notes

- The mobile app uses Expo for easier development
- For mobile testing, update the API URL to use your computer's IP address instead of localhost
- MongoDB connection string can be local or MongoDB Atlas
- All dates are stored in UTC and converted to local time for display
- **NEW**: TypeScript provides enhanced type safety and better debugging
- **NEW**: Finalized attendance collection ensures data integrity

## Recent Updates (v2.0)

### TypeScript Migration Complete
- ✅ Full TypeScript migration of all frontend components
- ✅ Enhanced type safety and developer experience
- ✅ Improved error handling and debugging
- ✅ Production-ready build configuration

### Enhanced Attendance Features
- ✅ Semester-wise attendance analytics
- ✅ Dual view modes (Semester/Monthly)
- ✅ Performance insights and grade badges
- ✅ Real-time data from finalized attendance
- ✅ Enhanced UI with better visual hierarchy

### Technical Improvements
- ✅ Optimized build process for Windows
- ✅ Enhanced error handling
- ✅ Improved API integration
- ✅ Better user feedback and loading states

## Future Enhancements

- User authentication and authorization
- Email notifications in addition to SMS
- PDF report generation
- Bulk attendance import
- Subject-wise attendance tracking
- Holiday and leave management
- Parent portal for viewing attendance
- **NEW**: Advanced analytics dashboard
- **NEW**: Automated attendance reports
- **NEW**: Integration with school management systems

## License

ISC

## Author

School Attendance Management System - Enhanced with TypeScript

