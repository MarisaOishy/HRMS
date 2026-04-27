import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { createEmployee } from "../../../lib/services/employeeService";
import { toast } from "sonner";

const deptMap: Record<string, string> = {
  engineering: "Engineering", product: "Product", design: "Design",
  marketing: "Marketing", sales: "Sales", hr: "Human Resources",
};

export default function EmployeeAddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !employeeId || !joinDate || !department || !role || !salary) {
      toast.error("Please fill in all required fields"); return;
    }
    setLoading(true);
    try {
      await createEmployee({
        id: employeeId, name: `${firstName} ${lastName}`, email, phone,
        date_of_birth: dob || "", gender: gender || "", address: address || "",
        join_date: joinDate, department: deptMap[department] || department, role,
        salary: Number(salary), status: "Active",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + " " + lastName)}&background=3b82f6&color=fff&size=150`,
        emergency_contact: emergencyPhone || "",
      });
      toast.success("Employee added successfully!");
      navigate("/employees");
    } catch (error: any) {
      toast.error("Failed to add employee: " + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/employees" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to employees
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900">Add New Employee</h1>
        <p className="text-gray-600 mt-1">Fill in the employee information</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <Button type="button" variant="outline" size="sm">Upload Photo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="john.doe@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="123 Main St, City, State, ZIP" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Employment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input id="employeeId" placeholder="EMP009" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date *</Label>
                <Input id="joinDate" type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position *</Label>
                <Input id="role" placeholder="Software Engineer" value={role} onChange={(e) => setRole(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary *</Label>
                <Input id="salary" type="number" placeholder="75000" value={salary} onChange={(e) => setSalary(e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone</Label>
              <Input id="emergencyPhone" type="tel" placeholder="+1 (555) 987-6543" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? "Adding..." : "Add Employee"}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link to="/employees">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
