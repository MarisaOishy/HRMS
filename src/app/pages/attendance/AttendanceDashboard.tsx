import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Download } from "lucide-react";
import { attendanceRecords, employees } from "../../data/mockData";

export default function AttendanceDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "Late").length;
  const totalEmployees = employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            Today: {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/attendance/calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar View
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{totalEmployees}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{presentCount}</p>
                <p className="text-sm text-green-600 mt-1">
                  {((presentCount / totalEmployees) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{absentCount}</p>
                <p className="text-sm text-red-600 mt-1">
                  {((absentCount / totalEmployees) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{lateCount}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {((lateCount / totalEmployees) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check In/Out */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Check-In/Out</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
            <div className="text-center">
              <p className="text-6xl font-semibold text-gray-900">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-gray-600 mt-2">{currentTime.toLocaleDateString()}</p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                Check In
              </Button>
              <Button size="lg" variant="outline">
                <XCircle className="w-5 h-5 mr-2" />
                Check Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.map((record) => {
                  const employee = employees.find((e) => e.id === record.employeeId);
                  if (!employee) return null;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.hours} hrs</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "Present"
                              ? "default"
                              : record.status === "Late"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
