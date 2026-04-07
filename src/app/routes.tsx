import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard
import DashboardPage from "./pages/dashboard/DashboardPage";

// Employee Management
import EmployeeListPage from "./pages/employees/EmployeeListPage";
import EmployeeAddPage from "./pages/employees/EmployeeAddPage";
import EmployeeEditPage from "./pages/employees/EmployeeEditPage";
import EmployeeProfilePage from "./pages/employees/EmployeeProfilePage";

// Attendance Management
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import AttendanceCalendar from "./pages/attendance/AttendanceCalendar";

// Leave Management
import LeaveRequestPage from "./pages/leave/LeaveRequestPage";
import LeaveApprovalPage from "./pages/leave/LeaveApprovalPage";
import LeaveHistoryPage from "./pages/leave/LeaveHistoryPage";

// Payroll Management
import PayrollDashboard from "./pages/payroll/PayrollDashboard";
import PayslipPage from "./pages/payroll/PayslipPage";
import PayrollTablePage from "./pages/payroll/PayrollTablePage";

// Departments & Roles
import DepartmentsPage from "./pages/departments/DepartmentsPage";
import RolesPage from "./pages/roles/RolesPage";

// Recruitment
import JobPostingsPage from "./pages/recruitment/JobPostingsPage";
import CandidatesPage from "./pages/recruitment/CandidatesPage";
import CandidateDetailsPage from "./pages/recruitment/CandidateDetailsPage";

// Performance
import PerformanceReviewsPage from "./pages/performance/PerformanceReviewsPage";
import PerformanceFeedbackPage from "./pages/performance/PerformanceFeedbackPage";

// Notifications & Messaging
import NotificationsPage from "./pages/notifications/NotificationsPage";
import MessagesPage from "./pages/messages/MessagesPage";

// Settings
import ProfileSettingsPage from "./pages/settings/ProfileSettingsPage";
import CompanySettingsPage from "./pages/settings/CompanySettingsPage";
import SecuritySettingsPage from "./pages/settings/SecuritySettingsPage";

// Reports & Analytics
import ReportsPage from "./pages/reports/ReportsPage";

// Not Found
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "reset-password", Component: ResetPasswordPage },
    ],
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: DashboardPage },
      
      // Employees
      { path: "employees", Component: EmployeeListPage },
      { path: "employees/add", Component: EmployeeAddPage },
      { path: "employees/edit/:id", Component: EmployeeEditPage },
      { path: "employees/profile/:id", Component: EmployeeProfilePage },
      
      // Attendance
      { path: "attendance", Component: AttendanceDashboard },
      { path: "attendance/calendar", Component: AttendanceCalendar },
      
      // Leave
      { path: "leave/request", Component: LeaveRequestPage },
      { path: "leave/approval", Component: LeaveApprovalPage },
      { path: "leave/history", Component: LeaveHistoryPage },
      
      // Payroll
      { path: "payroll", Component: PayrollDashboard },
      { path: "payroll/payslip/:id", Component: PayslipPage },
      { path: "payroll/table", Component: PayrollTablePage },
      
      // Departments & Roles
      { path: "departments", Component: DepartmentsPage },
      { path: "roles", Component: RolesPage },
      
      // Recruitment
      { path: "recruitment/jobs", Component: JobPostingsPage },
      { path: "recruitment/candidates", Component: CandidatesPage },
      { path: "recruitment/candidates/:id", Component: CandidateDetailsPage },
      
      // Performance
      { path: "performance/reviews", Component: PerformanceReviewsPage },
      { path: "performance/feedback", Component: PerformanceFeedbackPage },
      
      // Notifications & Messages
      { path: "notifications", Component: NotificationsPage },
      { path: "messages", Component: MessagesPage },
      
      // Settings
      { path: "settings/profile", Component: ProfileSettingsPage },
      { path: "settings/company", Component: CompanySettingsPage },
      { path: "settings/security", Component: SecuritySettingsPage },
      
      // Reports
      { path: "reports", Component: ReportsPage },
      
      // Not Found
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
