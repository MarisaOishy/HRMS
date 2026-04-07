# 🏢 HR Management System (HRMS)

This is the code bundle for the HR Management System.

## 📌 Overview
A modern, responsive HR Management System (HRMS) for managing employees, attendance, payroll, recruitment, and performance in a centralized platform.

## 🚀 Getting Started

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

---

## 🔥 Features & Functionalities

### 🔐 Authentication & Authorization
- User registration (Admin, HR, Employee)
- Login / Logout
- Forgot & Reset Password
- Role-Based Access Control (RBAC)
- JWT authentication + bcrypt password hashing

### 📊 Dashboard
- Overview cards (Total Employees, Attendance Summary, Leave Stats, Payroll Summary)
- Charts (Attendance trends, Employee growth)
- Recent activity feed

### 👥 Employee Management
- Employee list (search, filter, pagination)
- Add / Edit employee
- Employee profile & document upload
- Department & role assignment

### 🕒 Attendance Management
- Check-in / Check-out system
- Attendance dashboard (present, absent, late)
- Daily attendance table & calendar view
- Auto status calculation

### 🌴 Leave Management
- Leave request form & history
- Leave balance tracking
- Leave approval/rejection (Admin/HR)
- Leave types (casual, sick, annual)

### 💰 Payroll Management
- Salary overview dashboard
- Payroll table (monthly salaries)
- Payslip generation (PDF)
- Bonus & deductions
- Tax calculation support

### 🏢 Department & Roles
- Department creation & listing
- Role & permission management
- RBAC (read/write/update/delete)

### 📢 Recruitment Module
- Job posting & application tracking
- Candidate list & resume upload
- Hiring pipeline (applied → interviewed → hired)

### 📈 Performance Management
- Performance review system & rating system
- KPI tracking
- Feedback form
- Review cycles (monthly/quarterly)

### 🔔 Notifications & Messaging
- Notification panel & real-time alerts
- Internal messaging (chat system)
- WebSocket integration (Socket.io)

### ⚙️ Settings
- Profile & company settings
- Security settings (password, 2FA)

### 📊 Reports & Analytics
- Custom reports dashboard
- Filters, analytics & export options (PDF, CSV)

### 🎨 UI System
- Reusable components (buttons, tables, modals)
- Light / Dark mode
- Loading states, empty states
- Responsive design

---

## 🗄️ Database Design

### Recommended Database: MongoDB
- Flexible schema
- Fast development (MERN stack)
- Good for nested data

### Main Collections
- **Users**: `_id`, `name`, `email`, `password`, `role`, `departmentId`, `profileImage`, `createdAt`