import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Plus } from "lucide-react";
import { leaveRequests, leaveBalances } from "../../data/mockData";

export default function LeaveHistoryPage() {
  const balance = leaveBalances[0]; // Current user
  const userLeaves = leaveRequests.filter((r) => r.employeeId === "EMP001");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Leave History</h1>
          <p className="text-gray-600 mt-1">View your leave requests and balance</p>
        </div>
        <Button asChild>
          <Link to="/leave/request">
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Link>
        </Button>
      </div>

      {/* Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Your Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-4xl font-semibold text-blue-700">{balance.annualLeave}</p>
              <p className="text-sm text-gray-600 mt-2">Annual Leave</p>
              <p className="text-xs text-gray-500 mt-1">Available days</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-4xl font-semibold text-green-700">{balance.sickLeave}</p>
              <p className="text-sm text-gray-600 mt-2">Sick Leave</p>
              <p className="text-xs text-gray-500 mt-1">Available days</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <p className="text-4xl font-semibold text-purple-700">{balance.casualLeave}</p>
              <p className="text-sm text-gray-600 mt-2">Casual Leave</p>
              <p className="text-xs text-gray-500 mt-1">Available days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userLeaves.length > 0 ? (
              userLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">{leave.type}</Badge>
                      <Badge
                        variant={
                          leave.status === "Approved"
                            ? "default"
                            : leave.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">
                      {leave.startDate} to {leave.endDate} ({leave.days} days)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                    <p className="text-xs text-gray-400 mt-2">Applied on {leave.appliedDate}</p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No leave requests found</p>
                <Button className="mt-4" asChild>
                  <Link to="/leave/request">Request Your First Leave</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
