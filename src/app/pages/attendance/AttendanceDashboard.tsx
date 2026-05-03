import { useState, useEffect, useCallback } from "react";
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
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Download, Loader2, Users, Plus, Pencil, Trash2, LogIn, LogOut, Timer, AlertTriangle } from "lucide-react";
import {
  getAttendanceWithEmployees,
  getAllEmployees,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  selfCheckIn,
  selfCheckOut,
  parseTime12h,
  type AttendanceWithEmployee,
} from "../../../lib/services/attendanceService";
import { useAuth, isAdminOrHR } from "../../contexts/AuthContext";
import { toast } from "sonner";
import type { Employee, AttendanceRecord } from "../../../lib/types/database";

type EmployeePick = Pick<Employee, "id" | "name" | "role" | "avatar" | "status">;

const STATUS_OPTIONS = ["Present", "Absent", "Leave"] as const;

export default function AttendanceDashboard() {
  const { role, user } = useAuth();
  const canManage = isAdminOrHR(role);

  // ── Live clock ────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Data state ────────────────────────────────────────────
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<EmployeePick[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // todayISO is derived from currentTime so it automatically
  // changes when the clock crosses midnight
  const todayISO = currentTime.toISOString().split("T")[0];

  // ── Toggle Handlers ───────────────────────────────────────
  const handleToggleCheckIn = async (employeeId: string) => {
    setActionLoading(true);
    try {
      const { record, statusLabel } = await selfCheckIn(employeeId);
      toast.success(`Checked in at ${record.check_in} — ${statusLabel}`);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheckOut = async (employeeId: string) => {
    setActionLoading(true);
    try {
      const { record, workingTime } = await selfCheckOut(employeeId);
      toast.success(`Checked out at ${record.check_out} — Worked: ${workingTime}`);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Fetch data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [attendanceData, empList] = await Promise.all([
        getAttendanceWithEmployees(todayISO),
        getAllEmployees(),
      ]);
      setRecords(attendanceData);
      setEmployees(empList);
      setTotalEmployees(empList.length);
    } catch (error: any) {
      toast.error("Failed to load attendance: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [todayISO]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch when the date changes (midnight rollover)
  const [previousDate, setPreviousDate] = useState(todayISO);
  useEffect(() => {
    if (todayISO !== previousDate) {
      setPreviousDate(todayISO);
      // Date has changed — re-fetch attendance for the new day
      fetchData();
    }
  }, [todayISO, previousDate, fetchData]);

  // ── Time Formatting Helpers ───────────────────────────────
  const formatTimeForInput = (timeString: string) => {
    if (!timeString || timeString === "-") return "";
    const match = timeString.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!match) return "";
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const period = match[3]?.toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${mins}`;
  };

  const formatTimeFromInput = (time24h: string) => {
    if (!time24h) return "";
    const [h, m] = time24h.split(":");
    let hours = parseInt(h, 10);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${m} ${period}`;
  };

  const formatDuration = (hoursStr: string) => {
    const val = parseFloat(hoursStr);
    if (isNaN(val) || val === 0) return "-";
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  // ── Computed stats ────────────────────────────────────────
  const presentCount = records.filter((r) => r.status.includes("Present")).length;
  const lateCount = records.filter((r) => r.status === "Present (Late)" || r.status === "Late").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const leaveCount = records.filter((r) => r.status === "Leave").length;

  // ── Export CSV ─────────────────────────────────────────────
  const handleExport = () => {
    if (records.length === 0) {
      toast.error("No attendance data to export");
      return;
    }

    const headers = ["Employee Name", "Role", "Check In", "Check Out", "Hours", "Overtime", "Status"];

    const escapeCSV = (value: string | number) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = records.map((r) => [
      r.employee_name,
      r.employee_role,
      r.check_in,
      r.check_out,
      r.hours,
      r.overtime_hours,
      r.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${todayISO}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${records.length} record(s) to CSV`);
  };

  // ── Badge variant helper ──────────────────────────────────
  const statusVariant = (status: string) => {
    switch (status) {
      case "Present":
        return "default" as const;
      case "Present (Late)":
      case "Late":
        return "secondary" as const;
      case "Absent":
        return "destructive" as const;
      case "Leave":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  // ── Early Departure helper ────────────────────────────────
  const isEarlyDeparture = (checkOutTime: string) => {
    if (!checkOutTime || checkOutTime === "-") return false;
    const match = checkOutTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return false;
    let hours = parseInt(match[1], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    // 5:00 PM is 17:00
    return hours < 17;
  };

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
          <Button variant="outline" onClick={handleExport}>
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
                <Users className="w-6 h-6" />
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
                  {totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : "0.0"}%
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
                  {totalEmployees > 0 ? ((absentCount / totalEmployees) * 100).toFixed(1) : "0.0"}%
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
                  {totalEmployees > 0 ? ((lateCount / totalEmployees) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-500">Loading attendance...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No attendance data for today</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={record.employee_avatar}
                            alt={record.employee_name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(record.employee_name)}&background=3b82f6&color=fff`;
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{record.employee_name}</p>
                            <p className="text-sm text-gray-500">{record.employee_role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.check_in}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{record.check_out}</span>
                          {isEarlyDeparture(record.check_out) && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-[10px] px-1.5 py-0 leading-tight">
                              Left Early
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{formatDuration(record.hours)}</span>
                          {parseFloat(record.hours) > 0 && parseFloat(record.hours) < 8 && record.check_out !== "-" && (
                            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-[10px] px-1.5 py-0 leading-tight">
                              Incomplete
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {parseFloat(record.overtime_hours) > 0 ? (
                          <span className="text-green-600 font-medium">+{formatDuration(record.overtime_hours)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          {record.status === 'Leave' ? (
                            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 w-24 justify-center py-1.5">On Leave</Badge>
                          ) : record.check_in === '-' ? (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 w-24"
                              onClick={() => handleToggleCheckIn(record.employee_id)}
                              disabled={actionLoading}
                            >
                              Check In
                            </Button>
                          ) : record.check_out === '-' ? (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 w-24"
                              onClick={() => handleToggleCheckOut(record.employee_id)}
                              disabled={actionLoading}
                            >
                              Check Out
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 w-24 justify-center py-1.5">Completed</Badge>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
