import { Link, useParams } from "react-router";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { payrollData, employees } from "../../data/mockData";

export default function PayslipPage() {
  const { id } = useParams();
  const payroll = payrollData.find((p) => p.id === id);
  const employee = payroll ? employees.find((e) => e.id === payroll.employeeId) : null;

  if (!payroll || !employee) {
    return <div>Payslip not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/payroll"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to payroll
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip */}
      <Card>
        <CardContent className="p-8">
          {/* Company Header */}
          <div className="text-center border-b pb-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">HR</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HRMS Pro</h1>
            <p className="text-gray-600 mt-1">123 Business Ave, San Francisco, CA 94102</p>
            <p className="text-lg font-semibold text-blue-600 mt-4">PAYSLIP</p>
          </div>

          {/* Employee & Payment Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Employee Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="font-medium">{employee.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium">{employee.role}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pay Period:</span>
                  <span className="font-medium">{payroll.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pay Date:</span>
                  <span className="font-medium">{payroll.payDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Bank Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">{payroll.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Basic Salary</span>
                  <span className="font-medium">${payroll.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Allowances</span>
                  <span className="font-medium">${payroll.allowances.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total Earnings</span>
                  <span>${(payroll.basicSalary + payroll.allowances).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Income Tax</span>
                  <span className="font-medium">${(payroll.deductions * 0.6).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Social Security</span>
                  <span className="font-medium">${(payroll.deductions * 0.3).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Health Insurance</span>
                  <span className="font-medium">${(payroll.deductions * 0.1).toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span>${payroll.deductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-2">Net Pay</p>
            <p className="text-4xl font-bold text-gray-900">${payroll.netSalary.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-2">Amount payable for {payroll.month}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p className="mt-1">For queries, contact hr@company.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
