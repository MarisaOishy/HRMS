import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Plus, Edit, Trash2, Shield, Users } from "lucide-react";
import { roles } from "../../data/mockData";

const allPermissions = [
  { id: "employees", label: "Manage Employees", description: "View, add, edit, and delete employees" },
  { id: "attendance", label: "Manage Attendance", description: "Track and manage employee attendance" },
  { id: "leaves", label: "Manage Leaves", description: "Approve and manage leave requests" },
  { id: "payroll", label: "Manage Payroll", description: "Process salaries and manage payroll" },
  { id: "recruitment", label: "Manage Recruitment", description: "Post jobs and manage candidates" },
  { id: "reports", label: "View Reports", description: "Access and generate reports" },
  { id: "settings", label: "System Settings", description: "Configure system settings" },
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and access control</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" placeholder="e.g., Manager" />
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                {allPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox id={permission.id} />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="cursor-pointer font-medium">
                        {permission.label}
                      </Label>
                      <p className="text-sm text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">Create Role</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{role.users} users assigned</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                <div className="space-y-1">
                  {role.permissions.map((perm, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {perm === "all" ? "All Permissions" : perm.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
