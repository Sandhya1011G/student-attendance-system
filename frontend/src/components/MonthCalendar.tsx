import React, { useEffect, useState } from 'react';
import api from '../config/api';
import moment from 'moment';
import { MonthlyAttendanceData } from '../types';

interface MonthCalendarProps {
  monthData: MonthlyAttendanceData;
  studentId: string;
  academicYear: string;
  onClose: () => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ monthData, studentId, academicYear, onClose }) => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchMonthRecords();
  }, [monthData]);

  const fetchMonthRecords = async () => {
    try {
      const res = await api.get(`/attendance/student/${studentId}/monthly`, {
        params: {
          year: monthData.year,
          month: monthData.monthIndex + 1,
          academicYear
        }
      });

      setRecords(res.data.records || []);
    } catch (err: any) {
      console.error('Calendar Error:', err);
    }
  };

  const getDaysInMonth = () => {
    return moment({ year: monthData.year, month: monthData.monthIndex }).daysInMonth();
  };

  const getAttendanceStatus = (day: number) => {
    const record = records.find(r => 
      moment(r.date).date() === day
    );
    return record?.status || 'No Data';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-800';
      case 'Absent': return 'bg-red-100 text-red-800';
      case 'Late': return 'bg-yellow-100 text-yellow-800';
      case 'Leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCalendar = (): (number | null)[][] => {
    const daysInMonth = getDaysInMonth();
    const firstDay = moment({ year: monthData.year, month: monthData.monthIndex, day: 1 });
    const startDay = firstDay.day();

    const calendar: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      currentWeek.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        calendar.push([...currentWeek]);
        currentWeek = [];
      }
    }

    // Add remaining days of the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      calendar.push([...currentWeek]);
    }

    return calendar;
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendar().map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square border rounded flex items-center justify-center text-sm ${
                day ? getStatusColor(getAttendanceStatus(day)) : 'border-gray-200'
              }`}
            >
              {day && (
                <div className="text-center">
                  <div className="font-medium">{day}</div>
                  <div className="text-xs">
                    {getAttendanceStatus(day).charAt(0)}
                  </div>
                </div>
              )}
            </div>
          ))
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Present: {monthData.presentDays} | Absent: {monthData.absentDays} | Total: {monthData.totalDays}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MonthCalendar;
