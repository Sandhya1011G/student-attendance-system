import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminView = ({ data }) => {

  const present = data.overallPresent ?? 0;
  const absent = (100 - present).toFixed(1);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Overall Attendance Rate</h2>
          <div className="text-3xl font-bold text-blue-900 text-center">{present}%</div>
          <div className="text-sm text-center mt-2">
            <span className="text-green-600">{present}% Present</span> |{' '}
            <span className="text-red-500">{absent}% Absent</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Top Classes</h2>
          {data.topClasses?.map((cls, i) => (
            <div key={i} className="flex justify-between border-b py-1">
              <span>{cls.className}</span>
              <span className="text-green-600">{cls.percentage}%</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Low Attendance</h2>
          <div className="text-sm text-gray-500">
            View low attendance students in Reports
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="presentPercentage" stroke="#2563eb" />
            <Line type="monotone" dataKey="absentPercentage" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default AdminView;
