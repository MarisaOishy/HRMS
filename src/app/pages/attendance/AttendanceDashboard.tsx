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
  getTodayRecord,
  getEmployeeByEmail,
  parseTime12h,
  type AttendanceWithEmployee,
  type CreateAttendanceInput,
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

  const todayISO = new Date().toISOString().split("T")[0];

  // ── Self-service Check In / Check Out state ───────────────
  const [myEmployeeId, setMyEmployeeId] = useState<string | null>(null);
  const [myEmployeeName, setMyEmployeeName] = useState<string>("");
  const [myTodayRecord, setMyTodayRecord] = useState<AttendanceRecord | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [myStatusLabel, setMyStatusLabel] = useState<string>("");
  const [myWorkingTime, setMyWorkingTime] = useState<string>("");

  // Derive states from today's record
  const hasCheckedIn = !!myTodayRecord && myTodayRecord.check_in !== '-';
  const hasCheckedOut = !!myTodayRecord && myTodayRecord.check_out !== '-' && myTodayRecord.check_out !== undefined;

  // ── Form state for HR record management ───────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formStatus, setFormStatus] = useState<CreateAttendanceInput["status"]>("Present");
  const [formCheckIn, setFormCheckIn] = useState("");
  const [formCheckOut, setFormCheckOut] = useState("");

  const resetForm = () => {
    setShowForm(false);
    setEditingRecordId(null);
    setFormEmployeeId("");
    setFormStatus("Present");
    setFormCheckIn("");
    setFormCheckOut("");
  };

  // ── Calculate live working time when checked in but not out ─
  const [liveWorkingTime, setLiveWorkingTime] = useState<string>("");

  useEffect(() => {
    if (hasCheckedIn && !hasCheckedOut && myTodayRecord) {
      const timer = setInterval(() => {
        const inT = parseTime12h(myTodayRecord.check_in);
        if (inT) {
          const now = new Date();
          let diffMs = now.getTime() - inT.getTime();
          if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
          const totalMins = Math.floor(diffMs / (1000 * 60));
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          setLiveWorkingTime(`${hrs} hrs ${mins} mins`);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setLiveWorkingTime("");
    }
  }, [hasCheckedIn, hasCheckedOut, myTodayRecord]);

  // ── Resolve current auth user → employee + today's record ─
  useEffect(() => {
    async function resolveEmployee() {
      if (!user?.email) return;
      try {
        const emp = await getEmployeeByEmail(user.email);
        if (emp) {
          setMyEmployeeId(emp.id);
          setMyEmployeeName(emp.name);
          const todayRec = await getTodayRecord(emp.id);
          setMyTodayRecord(todayRec);
          if (todayRec) {
            // Restore status label
            setMyStatusLabel(todayRec.status.includes('Late') ? 'Late' : 'On Time');
            // Restore working time if already checked out
            if (todayRec.check_out && todayRec.check_out !== '-') {
              const inT = parseTime12h(todayRec.check_in);
              const outT = parseTime12h(todayRec.check_out);
              if (inT && outT) {
                let diffMs = outT.getTime() - inT.getTime();
                if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
                const totalMins = Math.floor(diffMs / (1000 * 60));
                const hrs = Math.floor(totalMins / 60);
                const mins = totalMins % 60;
                setMyWorkingTime(`${hrs} hrs ${mins} mins`);
              }
            }
          }
        }
      } catch {
        // Employee not linked — self-service won't be available
      }
    }
    resolveEmployee();
  }, [user]);

  // ── Self Check In handler ─────────────────────────────────
  const handleSelfCheckIn = async () => {
    if (!myEmployeeId) {
      toast.error("Your account is not linked to an employee profile.");
      return;
    }
    setCheckInLoading(true);
    try {
      const { record, statusLabel } = await selfCheckIn(myEmployeeId);
      setMyTodayRecord(record);
      setMyStatusLabel(statusLabel);
      setMyWorkingTime("");
      toast.success(`Checked in at ${record.check_in} — ${statusLabel}`);
      await fetchData(); // Refresh the table
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckInLoading(false);
    }
  };

  // ── Self Check Out handler ────────────────────────────────
  const handleSelfCheckOut = async () => {
    if (!myEmployeeId) {
      toast.error("Your account is not linked to an employee profile.");
      return;
    }
    if (!hasCheckedIn) {
      toast.error("You must check in before checking out.");
      return;
    }
    setCheckOutLoading(true);
    try {
      const { record, workingTime } = await selfCheckOut(myEmployeeId);
      setMyTodayRecord(record);
      setMyWorkingTime(workingTime);
      toast.success(`Checked out at ${record.check_out} — Worked: ${workingTime}`);
      await fetchData(); // Refresh the table
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCheckOutLoading(false);
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

  // ── Computed stats ────────────────────────────────────────
  const presentCount = records.filter((r) => r.status.includes("Present")).length;
  const lateCount = records.filter((r) => r.status === "Present (Late)" || r.status === "Late").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const leaveCount = records.filter((r) => r.status === "Leave").length;

  // ── HR: Create / Update handler ───────────────────────────
  const handleSubmit = async () => {
    if (!formEmployeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (formStatus === "Present" && (!formCheckIn || !formCheckOut)) {
      toast.error("Check In and Check Out times are required for Present status");
      return;
    }

    setActionLoading(true);
    try {
      const isPresent = formStatus === "Present";
      const finalCheckIn = isPresent && formCheckIn ? formatTimeFromInput(formCheckIn) : "-";
      const finalCheckOut = isPresent && formCheckOut ? formatTimeFromInput(formCheckOut) : "-";

      if (editingRecordId) {
        await updateAttendance(editingRecordId, {
          status: formStatus,
          check_in: finalCheckIn,
          check_out: finalCheckOut,
        });
        toast.success("Attendance record updated");
      } else {
        await createAttendance({
          employee_id: formEmployeeId,
          date: todayISO,
          status: formStatus,
          check_in: finalCheckIn,
          check_out: finalCheckOut,
        });
        toast.success("Attendance record created");
      }
      resetForm();
      await fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── HR: Edit handler (populate form from existing record) ─
  const handleEdit = (record: AttendanceWithEmployee) => {
    const isMockAbsent = record.id.startsWith("absent-");
    setEditingRecordId(isMockAbsent ? null : record.id);
    setFormEmployeeId(record.employee_id);
    setFormStatus(record.status.includes("Late") ? "Present" : record.status as CreateAttendanceInput["status"]);
    setFormCheckIn(record.check_in === "-" ? "" : formatTimeForInput(record.check_in));
    setFormCheckOut(record.check_out === "-" ? "" : formatTimeForInput(record.check_out));
    setShowForm(true);
  };

  // ── HR: Delete handler ────────────────────────────────────
  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return;
    setActionLoading(true);
    try {
      await deleteAttendance(recordId);
      toast.success("Attendance record deleted");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

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
          {canManage && (
            <Button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Attendance
            </Button>
          )}
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

      {/* HR Attendance Management Form (only visible to Admin/HR) */}
      {canManage && showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecordId ? "Edit Attendance Record" : "Add Attendance Record"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Employee Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  disabled={!!editingRecordId}
                >
                  <option value="">Select employee...</option>
                  {employees
                    .filter((emp) => emp.status === "Active")
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as CreateAttendanceInput["status"])}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Check-in/Check-out Times (only visible if Present) */}
              {formStatus === "Present" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In *</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formCheckIn}
                      onChange={(e) => setFormCheckIn(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out *</label>
                    <input
                      type="time"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formCheckOut}
                      onChange={(e) => setFormCheckOut(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingRecordId ? "Update Record" : "Create Record"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Self-Service Check In / Check Out Card ──────────── */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
            {/* User Greeting (Left side on desktop) */}
            <div className="hidden lg:block w-1/4">
              {myEmployeeName && (
                <div>
                  <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Welcome Back</p>
                  <p className="text-xl font-semibold text-white truncate">{myEmployeeName}</p>
                </div>
              )}
            </div>

            {/* Live Clock Section (Centered) */}
            <div className="text-center flex-1">
              <p className="text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-sm">
                {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
              <p className="text-blue-100 mt-1 text-sm font-medium">
                {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              {/* Mobile Greeting */}
              {myEmployeeName && (
                <p className="text-blue-200 mt-3 text-sm lg:hidden">
                  Welcome, <span className="font-semibold text-white">{myEmployeeName}</span>
                </p>
              )}
            </div>

            {/* Check In / Check Out Buttons (Right side on desktop) */}
            <div className="w-full lg:w-1/4 flex justify-center lg:justify-end">
              {myEmployeeId && (
                <div className="flex gap-3">
                <Button
                  id="btn-check-in"
                  onClick={handleSelfCheckIn}
                  disabled={hasCheckedIn || checkInLoading}
                  className={`px-6 py-6 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                    hasCheckedIn
                      ? "bg-white/20 text-white/60 cursor-not-allowed border border-white/20"
                      : "bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 active:scale-95"
                  }`}
                >
                  {checkInLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5 mr-2" />
                  )}
                  Check In
                </Button>
                <Button
                  id="btn-check-out"
                  onClick={handleSelfCheckOut}
                  disabled={!hasCheckedIn || hasCheckedOut || checkOutLoading}
                  className={`px-6 py-6 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                    !hasCheckedIn || hasCheckedOut
                      ? "bg-white/20 text-white/60 cursor-not-allowed border border-white/20"
                      : "bg-white text-red-600 hover:bg-red-50 hover:scale-105 active:scale-95"
                  }`}
                >
                  {checkOutLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5 mr-2" />
                  )}
                  Check Out
                </Button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Status Info Bar — shown after check-in */}
        {myEmployeeId && hasCheckedIn && (
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* Check-In Time */}
              <div className="p-5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-50">
                  <LogIn className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Check In</p>
                  <p className="text-lg font-semibold text-gray-900">{myTodayRecord?.check_in ?? '-'}</p>
                </div>
              </div>

              {/* Check-Out Time */}
              <div className="p-5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-50">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Check Out</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {hasCheckedOut ? myTodayRecord?.check_out : '—'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="p-5 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${
                  myStatusLabel === 'Late' ? 'bg-amber-50' : 'bg-emerald-50'
                }`}>
                  {myStatusLabel === 'Late' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
                  <p className={`text-lg font-semibold ${
                    myStatusLabel === 'Late' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {myStatusLabel || '—'}
                  </p>
                </div>
              </div>

              {/* Working Duration */}
              <div className="p-5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50">
                  <Timer className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Working Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {hasCheckedOut
                      ? myWorkingTime
                      : hasCheckedIn
                        ? (liveWorkingTime || 'Calculating...')
                        : '—'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {/* Not linked notice */}
        {!myEmployeeId && user && (
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Your account is not linked to an employee profile. Contact HR to enable self-service check-in.</span>
            </div>
          </CardContent>
        )}
      </Card>

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
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
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
                          <span>{record.hours} hrs</span>
                          {parseFloat(record.hours) > 0 && parseFloat(record.hours) < 8 && record.check_out !== "-" && (
                            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 text-[10px] px-1.5 py-0 leading-tight">
                              Incomplete
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {parseFloat(record.overtime_hours) > 0 ? (
                          <span className="text-green-600 font-medium">+{record.overtime_hours} hrs</span>
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
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                              disabled={record.id.startsWith("absent-") && false}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {!record.id.startsWith("absent-") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(record.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
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
