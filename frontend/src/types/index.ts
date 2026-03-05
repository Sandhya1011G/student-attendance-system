// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface AttendanceOverview {
  totalStudents: number;
  overallPresent: number;
  overallAbsent: number;
  trend?: TrendData[];
  topClasses?: ClassPerformance[];
  bottomClasses?: ClassPerformance[];
}

export interface TrendData {
  date: string;
  present: number;
  absent: number;
  percentage: number;
}

export interface ClassPerformance {
  className: string;
  percentage: number;
  totalStudents: number;
}

// Student Types
export interface Student {
  _id: string;
  name: string;
  class: string;
  section: string;
  parentName?: string;
  parentContact?: string;
  rollNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  admissionDate?: string;
  isActive: boolean;
}

export interface StudentAttendance {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  markedBy?: string;
  remarks?: string;
}

export interface AttendanceRecord {
  _id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  className: string;
  section: string;
  markedBy: string;
  remarks?: string;
  isFinalized?: boolean;
}

export interface AttendanceSummary {
  percentage: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  totalStudents: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface ClassReport {
  className: string;
  section: string;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  isFinalized: boolean;
  records?: AttendanceRecord[];
}

export interface LowAttendanceStudent {
  student: Student;
  attendance: AttendanceSummary;
  threshold: number;
}

export interface AttendanceFilters {
  className: string;
  section: string;
  date: string;
  academicYear: string;
  board: string;
}

export interface LowAttendanceFilters {
  className: string;
  section: string;
  threshold: number;
  academicYear: string;
}

// Teacher Types
export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  class?: string;
  section?: string;
  classAssigned?: {
    class: string;
    section: string;
  } | null;
  isActive: boolean;
}

export interface Class {
  _id: string;
  className: string;
  section: string;
  subject?: string;
  room?: string;
  totalStudents: number;
}

export interface ClassInfo {
  className: string;
  section: string;
  subject?: string;
  room?: string;
  totalStudents: number;
}

// Notification Types
export interface NotificationMessage {
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface Alert {
  _id: string;
  title: string;
  message: string;
  senderRole: 'TEACHER' | 'ADMIN' | 'SYSTEM';
  senderId: string;
  targetType: 'STUDENT' | 'TEACHER' | 'CLASS' | 'ALL';
  studentId?: string;
  teacherId?: string;
  class?: string;
  section?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParentNotification {
  studentId: string;
  message: string;
  sent: boolean;
  timestamp: string;
}

// Grade and Achievement Types
export interface AttendanceGrade {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  color: string;
  bg: string;
  icon: string;
}

export interface Achievement {
  type: string;
  icon: string;
  color: string;
  title: string;
  description: string;
}

// Academic Year Types
export interface AcademicYear {
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// Report Types
export interface StudentReport {
  student: Student;
  attendance: AttendanceSummary;
  monthlyData?: MonthlyAttendanceData[];
  semester?: AttendanceSummary;
  yearly?: AttendanceSummary;
}

export interface MonthlyAttendanceData {
  month: string;
  monthIndex: number;
  year: number;
  presentDays: number;
  absentDays: number;
  totalDays: number;
  percentage: number;
}

export interface SchoolReport {
  totalStudents: number;
  overallAttendance: number;
  presentToday: number;
  absentToday: number;
  classReports?: ClassReport[];
  lowAttendanceStudents?: LowAttendanceStudent[];
}

// Utility Types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SemesterDates {
  start: string;
  end: string;
}

// Component Props Types
export interface DashboardProps {
  // Add specific props as needed
}

export interface AttendanceSummaryProps {
  studentId?: string;
  academicYear?: string;
}

export interface StudentDashboardProps {
  studentId?: string;
}

export interface SchoolAdminDashboardProps {
  // Add specific props as needed
}

export interface MarkAttendanceProps {
  className: string;
  section: string;
  date: string;
}

export interface StudentReportProps {
  studentId: string;
  academicYear?: string;
}

export interface LoginProps {
  onLogin: (userType: string) => void;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  userType: 'admin' | 'teacher' | 'student';
}

export interface AttendanceForm {
  studentId: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  remarks?: string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Modal Types
export interface ModalProps<T = any> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: T;
}
