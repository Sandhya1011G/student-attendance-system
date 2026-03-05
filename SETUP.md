# Setup Guide

## Quick Start

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/student_attendance
PORT=5000
ATTENDANCE_THRESHOLD=75
```

For SMS notifications (optional):
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 3. Start MongoDB
Make sure MongoDB is running on your system or use MongoDB Atlas connection string.

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

This will create:
- Sample classes (10A, 10B, 9A, 9B, 8A, 8C)
- Sample students with parent contact information
- Sample attendance records from July to October 2024

### 5. Start Backend Server
```bash
npm start
# or for development
npm run dev
```

The server will run on `http://localhost:5000`

### 6. Setup Frontend (Desktop) - TypeScript Enhanced

```bash
cd frontend
npm install
```

#### 6.1 Configure Frontend Environment
Create `.env.local` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
DISABLE_ESLINT_PLUGIN=true
```

#### 6.2 Start Development Server
```bash
npm start
```

The React app will run on `http://localhost:3000`

#### 6.3 TypeScript Development Commands
```bash
# Type checking (recommended during development)
npm run type-check

# Build for production
npm run build

# Start production build
npm run start
```

### 7. Setup Mobile App

```bash
cd mobile
npm install
```

Update `mobile/config/api.js` with your server IP address:
```javascript
const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
```

Start Expo:
```bash
npm start
```

## Testing the Application

### 1. Access Dashboard
- Open `http://localhost:3000` in your browser
- You should see the enhanced attendance dashboard with TypeScript-powered components

### 2. Mark Attendance
- Navigate to "Mark Attendance"
- Select Class: 10, Section: A, Date: Today
- Mark students as Present/Absent
- Click "Save Attendance"

### 3. View Enhanced Reports
- Navigate to "Reports"
- Select Class, Section, and Date
- View attendance statistics with enhanced visualizations

### 4. Test Student Attendance Summary (NEW)
- Navigate to Student Dashboard
- Access "Attendance Summary" 
- Test semester selection (Semester 1 & Semester 2)
- Switch between Semester view and Monthly view
- View performance insights and grade badges

### 5. Check Low Attendance Alerts
- Navigate to "Low Attendance"
- View students below threshold
- System automatically sends SMS (if configured) or logs to console

## TypeScript Development

### Type Checking
Run type checking to catch errors during development:
```bash
cd frontend
npm run type-check
```

### Build Process
The build process is optimized for TypeScript:
```bash
# Development build with type checking
npm run build

# Production build
npm run build
```

### ESLint Configuration
ESLint is configured to work with TypeScript:
```json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "exhaustive-deps": "off",
    "no-unused-vars": "off"
  }
}
```

## API Testing

You can test the API endpoints using:
- Postman
- curl
- Browser (for GET requests)

Example:
```bash
# Get all students
curl http://localhost:5000/api/students

# Get low attendance students
curl http://localhost:5000/api/attendance/shortage?threshold=75

# Get student finalized attendance (NEW)
curl http://localhost:5000/api/attendance/student/STUDENT001/finalized

# Get class finalized attendance (NEW)
curl http://localhost:5000/api/attendance/class/10/A/finalized
```

## Enhanced Features

### Semester-wise Attendance Analytics
- **Dual View Modes**: Switch between Semester and Monthly views
- **Semester Selection**: Choose between Semester 1 and Semester 2
- **Performance Insights**: Grade badges and recommendations
- **Real-time Data**: Fetches from finalized attendance collection

### TypeScript Benefits
- **Type Safety**: Compile-time error checking
- **Better IntelliSense**: Enhanced autocomplete and documentation
- **Improved Refactoring**: Safe code modifications
- **Better Debugging**: Clear error messages and stack traces

### Enhanced Error Handling
- **Comprehensive Fallbacks**: Multiple API endpoint attempts
- **User Feedback**: Clear error messages and loading states
- **Debug Logging**: Detailed console logs for troubleshooting
- **Graceful Degradation**: App continues working even with partial failures

## Troubleshooting

### TypeScript Compilation Issues
```bash
# Check for TypeScript errors
npm run type-check

# Clear TypeScript cache
npx tsc --build --clean

# Rebuild
npm run build
```

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP whitelist includes your IP

### Frontend Not Connecting to Backend
- Check `REACT_APP_API_URL` in frontend `.env.local`
- Ensure backend server is running
- Check CORS settings
- Verify TypeScript compilation is successful

### Mobile App Not Connecting
- Update API URL with your computer's IP address (not localhost)
- Ensure phone and computer are on same network
- Check firewall settings

### SMS Not Sending
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- SMS will be logged to console if Twilio is not configured

### Attendance Data Not Showing
- Check if attendance has been marked and finalized
- Verify finalized attendance collection exists in database
- Check browser console for API errors
- Ensure TypeScript compilation is successful

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Update MongoDB connection string
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Enable HTTPS
6. Set up proper error logging

### Frontend (TypeScript)
1. Build the application:
```bash
cd frontend
npm run build
```

2. Serve the build files with a web server (Nginx, Apache, etc.)
3. Configure environment variables for production
4. Enable gzip compression
5. Set up proper caching headers

### TypeScript Production Considerations
- Ensure all TypeScript errors are resolved before deployment
- Use `npm run build` to create optimized production bundle
- Monitor TypeScript compilation in CI/CD pipeline
- Keep TypeScript definitions updated

## Development Workflow

### TypeScript Best Practices
1. **Always run type-check** before committing:
```bash
npm run type-check
```

2. **Use meaningful interfaces** for API responses:
```typescript
interface Student {
  studentId: string;
  name: string;
  class: string;
  section: string;
}
```

3. **Handle API errors properly**:
```typescript
try {
  const response = await api.get('/students');
  setStudents(response.data);
} catch (error: any) {
  console.error('API Error:', error);
  setError('Failed to load students');
}
```

### Git Workflow
```bash
# Check TypeScript before committing
npm run type-check

# Add changes
git add .

# Commit with descriptive message
git commit -m "Add TypeScript attendance summary component"

# Push to repository
git push origin main
```

## Recent Updates

### v2.0 - TypeScript Migration Complete
- ✅ Full TypeScript migration of all frontend components
- ✅ Enhanced AttendanceSummary with semester-wise analytics
- ✅ Dual view modes (Semester/Monthly)
- ✅ Performance insights and grade badges
- ✅ Improved error handling and user feedback
- ✅ Production-ready build configuration
- ✅ Windows-compatible build scripts

### Enhanced API Endpoints
- ✅ `/attendance/student/:id/finalized` - Get finalized attendance data
- ✅ `/attendance/class/:class/:section/finalized` - Get class finalized attendance
- ✅ Enhanced semester and monthly endpoints
- ✅ Better error handling and response formatting

## Support

For issues related to:
- **TypeScript**: Check browser console and run `npm run type-check`
- **API**: Verify backend logs and test endpoints directly
- **Database**: Check MongoDB connection and collection structure
- **Build**: Ensure all dependencies are installed and TypeScript compiles successfully

