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

### 6. Setup Frontend (Desktop)

```bash
cd frontend
npm install
npm start
```

The React app will run on `http://localhost:3000`

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
- You should see the attendance dashboard

### 2. Mark Attendance
- Navigate to "Mark Attendance"
- Select Class: 10, Section: A, Date: Today
- Mark students as Present/Absent
- Click "Save Attendance"

### 3. View Reports
- Navigate to "Reports"
- Select Class, Section, and Date
- View attendance statistics

### 4. Check Low Attendance Alerts
- Navigate to "Low Attendance"
- View students below threshold
- System automatically sends SMS (if configured) or logs to console

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
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, ensure IP whitelist includes your IP

### Frontend Not Connecting to Backend
- Check `REACT_APP_API_URL` in frontend `.env`
- Ensure backend server is running
- Check CORS settings

### Mobile App Not Connecting
- Update API URL with your computer's IP address (not localhost)
- Ensure phone and computer are on same network
- Check firewall settings

### SMS Not Sending
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- SMS will be logged to console if Twilio is not configured

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update MongoDB connection string
3. Configure proper CORS origins
4. Use environment variables for all sensitive data
5. Enable HTTPS
6. Set up proper error logging

