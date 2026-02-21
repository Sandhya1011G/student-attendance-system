import React, { useEffect, useState } from 'react';
import api from '../config/api';
import moment from 'moment';

const MonthCalendar = ({ monthData, studentId, academicYear, onClose }) => {
  const [records, setRecords] = useState([]);

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
    } catch (err) {
      console.error('MonthCalendar - Error:', err);
    }
  };

  const daysInMonth = moment({ year: monthData.year, month: monthData.monthIndex }).daysInMonth();
  const firstDay = moment({ year: monthData.year, month: monthData.monthIndex, day: 1 }).day();

  const getStatus = (day) => {
    const dateObj = moment({ 
        year: monthData.year, 
        month: monthData.monthIndex, 
        day 
    });

    const dateStr = dateObj.format('YYYY-MM-DD');
    const rec = records.find(
        r => moment(r.date).format('YYYY-MM-DD') === dateStr
    );

    console.log(`Day ${day} (${dateStr}): Found record:`, rec ? rec.status : 'No record'); // Debug log

    if (rec) {
      return rec.status;
    }

    // ✅ Sunday = No Class
    if (dateObj.day() === 0) {
      return 'NoClass';
    }

    // For weekdays with no record, mark as unmarked (show as light gray)
    return 'Unmarked';
    };

   const renderIndicator = (status) => {
    const base = "w-3 h-3 rounded-full mx-auto mt-1";
    
    if (status === 'Present') return <div className={`${base} bg-green-500`} />;
    if (status === 'Absent') return <div className={`${base} bg-red-500`} />;
    if (status === 'NoClass') return <div className={`${base} bg-gray-300`} />;
    
    // For unmarked weekdays, don't show any indicator
    return null;
    };

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const status = getStatus(d);

    cells.push(
      <div
        key={d}
        className="h-16 border rounded-lg flex flex-col items-center justify-center hover:bg-gray-50"
      >
        <div className="text-sm font-medium">{d}</div>
        {renderIndicator(status)}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[720px] p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {monthData.month} {monthData.year}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-lg"
          >
            ✖
          </button>
        </div>

        {/* WEEKDAYS */}
        <div className="grid grid-cols-7 mb-2 text-sm font-semibold text-gray-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2">
              {day}
            </div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-2">
          {cells}
        </div>

        {/* LEGEND */}
        <div className="flex justify-center gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Present
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Absent
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                No Class
            </div>
        </div>
      </div>
    </div>
  );
};

export default MonthCalendar;
