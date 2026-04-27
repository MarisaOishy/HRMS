-- =============================================
-- HRMS Database Schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  join_date DATE NOT NULL,
  salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  avatar TEXT,
  address TEXT,
  emergency_contact TEXT,
  date_of_birth DATE,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  head TEXT,
  employees_count INTEGER NOT NULL DEFAULT 0,
  budget NUMERIC NOT NULL DEFAULT 0
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]',
  users_count INTEGER NOT NULL DEFAULT 0
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TEXT,
  check_out TEXT,
  status TEXT NOT NULL DEFAULT 'Present',
  hours TEXT DEFAULT '0.0',
  UNIQUE(employee_id, date)
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Leave balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  annual_leave INTEGER NOT NULL DEFAULT 20,
  sick_leave INTEGER NOT NULL DEFAULT 10,
  casual_leave INTEGER NOT NULL DEFAULT 5
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL,
  allowances NUMERIC NOT NULL DEFAULT 0,
  deductions NUMERIC NOT NULL DEFAULT 0,
  net_salary NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  pay_date DATE
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  period TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  technical_skills NUMERIC NOT NULL DEFAULT 0,
  communication NUMERIC NOT NULL DEFAULT 0,
  teamwork NUMERIC NOT NULL DEFAULT 0,
  leadership NUMERIC NOT NULL DEFAULT 0,
  reviewer TEXT,
  review_date DATE,
  comments TEXT,
  goals JSONB DEFAULT '[]'
);

-- =============================================
-- Indexes for better query performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_employee ON performance_reviews(employee_id);
