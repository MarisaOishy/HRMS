import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Mock attendance data for calendar
const attendanceData: Record<string, "present" | "absent" | "leave" | "holiday"> = {
  "2026-04-01": "present",
  "2026-04-02": "present",
  "2026-04-03": "present",
  "2026-04-04": "leave",
  "2026-04-05": "holiday",
  "2026-04-06": "present",
  "2026-04-07": "present",
  "2026-04-08": "present",
  "2026-04-09": "present",
  "2026-04-10": "present",
  "2026-04-11": "absent",
  "2026-04-12": "holiday",
  "2026-04-13": "present",
  "2026-04-14": "present",
};

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 6)); // April 6, 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getStatusColor = (status?: "present" | "absent" | "leave" | "holiday") => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 border-green-300";
      case "absent":
        return "bg-red-100 text-red-700 border-red-300";
      case "leave":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "holiday":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-white text-gray-900 border-gray-200";
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = attendanceData[dateString];
    const isToday = day === 6; // April 6, 2026

    days.push(
      <div
        key={day}
        className={`p-2 border rounded-lg text-center ${getStatusColor(status)} ${
          isToday ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="font-semibold">{day}</div>
        {status && (
          <div className="text-xs mt-1 capitalize">{status}</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/attendance"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to attendance
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Attendance Calendar</h1>
        <p className="text-gray-600 mt-1">View your attendance history</p>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span className="text-sm text-gray-700">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span className="text-sm text-gray-700">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
              <span className="text-sm text-gray-700">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              <span className="text-sm text-gray-700">Holiday</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {months[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-700 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">{days}</div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Present Days</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Absent Days</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Leave Days</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">92%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
