import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { DollarSign, TrendingUp, Users, Calendar, Download, Eye } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { payrollData } from "../../data/mockData";

const monthlyData = [
  { month: "Oct", amount: 890000 },
  { month: "Nov", amount: 920000 },
  { month: "Dec", amount: 935000 },
  { month: "Jan", amount: 945000 },
  { month: "Feb", amount: 950000 },
  { month: "Mar", amount: 952000 },
];

export default function PayrollDashboard() {
  const totalPayroll = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
  const avgSalary = Math.round(totalPayroll / payrollData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee salaries and payroll</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/payroll/table">
              <Calendar className="w-4 h-4 mr-2" />
              View Table
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
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  ${(952000).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">+3.2% from last month</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Salary</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">${avgSalary.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Per employee</p>
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
                <p className="text-sm text-gray-600">Employees Paid</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">115</p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Payday</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">30</p>
                <p className="text-sm text-gray-500 mt-1">April 2026</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { dept: "Engineering", amount: 4500000 },
                  { dept: "Sales", amount: 2875000 },
                  { dept: "Marketing", amount: 1350000 },
                  { dept: "Product", amount: 1200000 },
                  { dept: "Design", amount: 680000 },
                  { dept: "HR", amount: 528000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="dept" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payslips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Payslips</CardTitle>
          <Link to="/payroll/table" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payrollData.map((payroll) => (
              <div
                key={payroll.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{payroll.employeeName}</p>
                  <p className="text-sm text-gray-600">{payroll.month}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${payroll.netSalary.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {payroll.status}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/payroll/payslip/${payroll.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
