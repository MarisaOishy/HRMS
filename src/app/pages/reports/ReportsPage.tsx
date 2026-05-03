import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Download, FileText, Calendar, TrendingUp, Users, Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

import { getEmployees } from "../../../lib/services/employeeService";
import { getLeaveRequests } from "../../../lib/services/leaveService";
import { getAttendanceRecords } from "../../../lib/services/attendanceService";
import { getPayrollData } from "../../../lib/services/payrollService";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("attendance");
  const [timePeriod, setTimePeriod] = useState("6months");

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, leaveRes, attRes, payRes] = await Promise.all([
        getEmployees(),
        getLeaveRequests(),
        getAttendanceRecords(),
        getPayrollData(),
      ]);
      setEmployees(empRes);
      setLeaves(leaveRes);
      setAttendance(attRes);
      setPayroll(payRes);
    } catch (error: any) {
      toast.error("Failed to load report data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Metrics
  const activeEmployees = useMemo(() => employees.filter((e) => e.status === "Active").length, [employees]);
  const totalLeaves = leaves.length;
  const totalPayroll = useMemo(() => payroll.reduce((acc, curr) => acc + (curr.net_salary || 0), 0), [payroll]);

  const avgAttendance = useMemo(() => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    return Math.round((present / attendance.length) * 1000) / 10;
  }, [attendance]);

  // Chart Data: Department Distribution
  const departmentDistribution = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((emp) => {
      map.set(emp.department, (map.get(emp.department) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [employees]);

  // Chart Data: Leave Types Distribution
  const leaveTypes = useMemo(() => {
    const map = new Map<string, number>();
    leaves.forEach((l) => {
      map.set(l.type, (map.get(l.type) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [leaves]);

  // Chart Data: Employee Growth
  const employeeGrowth = useMemo(() => {
    const countsByMonth: Record<string, number> = {};
    employees.forEach((emp) => {
      if (!emp.join_date) return;
      // Convert YYYY-MM-DD to short month string, e.g. "Jan", "Feb"
      const date = new Date(emp.join_date);
      const month = date.toLocaleString("en-US", { month: "short" });
      countsByMonth[month] = (countsByMonth[month] || 0) + 1;
    });
    // For simplicity, just output the aggregated counts per month observed.
    // In a real app, you would sort by chronological month and do a cumulative sum.
    return Object.entries(countsByMonth).map(([month, count]) => ({ month, count }));
  }, [employees]);

  // Chart Data: Attendance Trend
  const attendanceTrend = useMemo(() => {
    const dataByMonth: Record<string, { present: number; absent: number }> = {};
    attendance.forEach((att) => {
      if (!att.date) return;
      const date = new Date(att.date);
      const month = date.toLocaleString("en-US", { month: "short" });
      if (!dataByMonth[month]) dataByMonth[month] = { present: 0, absent: 0 };

      if (att.status === "Absent") {
        dataByMonth[month].absent += 1;
      } else {
        dataByMonth[month].present += 1;
      }
    });
    return Object.entries(dataByMonth).map(([month, stats]) => ({ month, ...stats }));
  }, [attendance]);

  const formatMillions = (value: number) => {
    if (value >= 1000000) return `Tk ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Tk ${(value / 1000).toFixed(1)}K`;
    return `Tk ${value}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">View detailed insights and export reports</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendance">Attendance Report</SelectItem>
                <SelectItem value="leave">Leave Report</SelectItem>
                <SelectItem value="payroll">Payroll Report</SelectItem>
                <SelectItem value="performance">Performance Report</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Custom Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-16 flex items-center justify-center text-gray-500">
            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
            Loading analytics data from modules...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Attendance</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">{avgAttendance}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leaves</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">{totalLeaves}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payroll</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">{formatMillions(totalPayroll)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Employees</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">{activeEmployees}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Present"
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Absent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Employee Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No department data available.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leave Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {leaveTypes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leaveTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leaveTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No leave data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info("PDF export initiated...")}>
              <FileText className="w-6 h-6" />
              <span>PDF Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info("CSV export initiated...")}>
              <FileText className="w-6 h-6" />
              <span>CSV Export</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info("Excel export initiated...")}>
              <FileText className="w-6 h-6" />
              <span>Excel Export</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => toast.info("Raw data download initiated...")}>
              <Download className="w-6 h-6" />
              <span>Raw Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
