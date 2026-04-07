import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { departments } from "../../data/mockData";

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage company departments</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>Add a new department to your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="deptName">Department Name</Label>
                <Input id="deptName" placeholder="e.g., Engineering" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deptHead">Department Head</Label>
                <Input id="deptHead" placeholder="Select employee" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Annual Budget</Label>
                <Input id="budget" type="number" placeholder="0" />
              </div>
              <Button className="w-full">Create Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{dept.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Head: {dept.head}</p>
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
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{dept.employees}</p>
                  <p className="text-sm text-gray-600">Employees</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Annual Budget</span>
                  <span className="font-medium">${(dept.budget / 1000)}K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Salary</span>
                  <span className="font-medium">${Math.round(dept.budget / dept.employees / 1000)}K</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">View Employees</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
