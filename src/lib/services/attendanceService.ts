import { supabase } from '../../lib/supabase'
import type { AttendanceRecord, Employee, LeaveRequest } from '../../lib/types/database'

// ── Enriched type returned to UI ────────────────────────────
export interface AttendanceWithEmployee extends AttendanceRecord {
  employee_name: string
  employee_role: string
  employee_avatar: string
  overtime_hours: string
}

// ── Configuration ────────────────────────────────────────────
const SHIFT_START = { hours: 9, minutes: 0 } // 9:00 AM
const SHIFT_END = { hours: 17, minutes: 0 } // 5:00 PM
const GRACE_PERIOD_MINS = 15 // Late after 9:15 AM
const STANDARD_WORK_HOURS = 8
const LUNCH_BREAK_HOURS = 1

// ── Helpers ─────────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Parse a time string like "09:15 AM", "9:15", or "14:30" into a Date for today */
export function parseTime12h(time: string): Date | null {
  if (!time || time === '-') return null
  const match = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const mins = parseInt(match[2], 10)
  const period = match[3]?.toUpperCase()
  
  if (period) {
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
  }
  
  const d = new Date()
  d.setHours(hours, mins, 0, 0)
  return d
}

/** 
 * Calculate net working hours between two time strings.
 */
function calculateHours(checkIn: string, checkOut: string): string {
  const inT = parseTime12h(checkIn)
  const outT = parseTime12h(checkOut)
  if (!inT || !outT) return '0.00'
  
  let diff = (outT.getTime() - inT.getTime()) / (1000 * 60 * 60)
  if (diff < 0) diff += 24 // Handle overnight shifts if any
  
  return Math.max(0, diff).toFixed(2)
}

/** Calculate overtime based on net working hours */
function calculateOvertime(netHours: string): string {
  const hours = parseFloat(netHours)
  if (hours > STANDARD_WORK_HOURS) {
    return (hours - STANDARD_WORK_HOURS).toFixed(2)
  }
  return '0.00'
}

/** 
 * Automatic late detection with Grace Period Handling
 */
function determineStatus(status: string, checkIn: string): string {
  // If HR explicitly marks Absent/Leave, respect it
  if (status === 'Absent' || status === 'Leave') return status;
  
  const inTime = parseTime12h(checkIn);
  if (!inTime) return status;
  
  const shiftStart = new Date();
  shiftStart.setHours(SHIFT_START.hours, SHIFT_START.minutes + GRACE_PERIOD_MINS, 0, 0);
  
  if (inTime > shiftStart) {
    return 'Present (Late)';
  }
  return 'Present';
}

// ── Query functions ─────────────────────────────────────────

export async function getAttendanceRecords(date?: string) {
  let query = supabase.from('attendance_records').select('*')
  if (date) {
    query = query.eq('date', date)
  }
  const { data, error } = await query.order('date', { ascending: false })
  if (error) throw error
  return data as AttendanceRecord[]
}

/** Get attendance records with employee info, integrating Leave Requests automatically */
export async function getAttendanceWithEmployees(date: string): Promise<AttendanceWithEmployee[]> {
  // Fetch today's attendance
  const { data: records, error: recErr } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('date', date)
    .order('check_in', { ascending: true })
  if (recErr) throw recErr

  // Fetch all active employees
  const { data: employees, error: empErr } = await supabase
    .from('employees')
    .select('id, name, role, avatar, status')
    .order('name')
  if (empErr) throw empErr

  // Fetch approved leaves overlapping with this date (Leave Integration)
  const { data: leaves, error: leaveErr } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('status', 'Approved')
    .lte('start_date', date)
    .gte('end_date', date)
  if (leaveErr) throw leaveErr

  const recordMap = new Map<string, AttendanceRecord>()
  for (const r of (records ?? [])) {
    recordMap.set(r.employee_id, r as AttendanceRecord)
  }
  
  const leaveMap = new Set<string>()
  for (const l of (leaves ?? [])) {
    leaveMap.add(l.employee_id)
  }

  // Build combined list
  const result: AttendanceWithEmployee[] = (employees ?? []).map((emp: any) => {
    const rec = recordMap.get(emp.id)
    if (rec) {
      return {
        ...rec,
        employee_name: emp.name,
        employee_role: emp.role,
        employee_avatar: emp.avatar,
        overtime_hours: calculateOvertime(rec.hours),
      }
    }
    
    // Auto-generate status based on leave integration
    const isLeave = leaveMap.has(emp.id)
    
    return {
      id: `absent-${emp.id}`,
      employee_id: emp.id,
      date,
      check_in: '-',
      check_out: '-',
      status: isLeave ? 'Leave' : 'Absent',
      hours: '0.00',
      employee_name: emp.name,
      employee_role: emp.role,
      employee_avatar: emp.avatar,
      overtime_hours: '0.00',
    }
  })

  return result
}

export async function getAttendanceByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
  if (error) throw error
  return data as AttendanceRecord[]
}

export async function getAllEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, role, avatar, status')
    .order('name')
  if (error) throw error
  return data as Pick<Employee, 'id' | 'name' | 'role' | 'avatar' | 'status'>[]
}

// ── HR-managed attendance: Create/Update ────────────────────

export interface CreateAttendanceInput {
  employee_id: string
  date: string
  status: 'Present' | 'Absent' | 'Late' | 'Present (Late)' | 'Leave'
  check_in?: string
  check_out?: string
}

export async function createAttendance(input: CreateAttendanceInput): Promise<AttendanceRecord> {
  const { employee_id, date, status, check_in, check_out } = input

  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('employee_id', employee_id)
    .eq('date', date)
    .maybeSingle()

  if (existing) {
    throw new Error('Attendance record already exists for this employee on this date')
  }

  const ci = check_in || '-'
  const co = check_out || '-'
  const hours = (ci !== '-' && co !== '-') ? calculateHours(ci, co) : '0.00'
  const finalStatus = determineStatus(status, ci); // Auto-generates Late/Present safely

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      employee_id,
      date,
      check_in: ci,
      check_out: co,
      status: finalStatus,
      hours,
    })
    .select()
    .single()
  if (error) throw error
  return data as AttendanceRecord
}

export interface UpdateAttendanceInput {
  status?: 'Present' | 'Absent' | 'Late' | 'Present (Late)' | 'Leave'
  check_in?: string
  check_out?: string
}

export async function updateAttendance(recordId: string, input: UpdateAttendanceInput): Promise<AttendanceRecord> {
  const { data: current, error: fetchErr } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('id', recordId)
    .single()
  if (fetchErr) throw fetchErr
  if (!current) throw new Error('Attendance record not found')

  const ci = input.check_in ?? current.check_in
  const co = input.check_out ?? current.check_out
  const hours = (ci !== '-' && co !== '-') ? calculateHours(ci, co) : '0.00'
  
  const statusToUse = input.status !== undefined ? input.status : current.status;
  const finalStatus = determineStatus(statusToUse, ci);

  const { data, error } = await supabase
    .from('attendance_records')
    .update({
      status: finalStatus,
      check_in: ci,
      check_out: co,
      hours,
    })
    .eq('id', recordId)
    .select()
    .single()
  if (error) throw error
  return data as AttendanceRecord
}

export async function deleteAttendance(recordId: string): Promise<void> {
  const { error } = await supabase
    .from('attendance_records')
    .delete()
    .eq('id', recordId)
  if (error) throw error
}

// ── Self-service Check In / Check Out ────────────────────────

/** Format a Date object to "HH:MM AM/PM" */
function formatTimeTo12h(date: Date): string {
  let hours = date.getHours()
  const mins = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`
}

/** Find employee record linked to the current auth user's email */
export async function getEmployeeByEmail(email: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, role, avatar, status')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Get today's attendance record for a specific employee */
export async function getTodayRecord(employeeId: string): Promise<AttendanceRecord | null> {
  const today = todayISO()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle()
  if (error) throw error
  return data as AttendanceRecord | null
}

/** 
 * Self-service Check In.
 * - Captures current system time
 * - If check-in is after 9:00 AM → status = "Present (Late)"
 * - Otherwise → status = "Present" (On Time)
 * - Prevents duplicate check-in for the same day
 */
export async function selfCheckIn(employeeId: string): Promise<{ record: AttendanceRecord; statusLabel: string }> {
  const today = todayISO()

  // Prevent duplicate check-in
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle()

  if (existing) {
    throw new Error('You have already checked in today.')
  }

  const now = new Date()
  const checkInTime = formatTimeTo12h(now)

  // Determine status: Late if after 9:00 AM (no grace period for self-service)
  const nineAM = new Date()
  nineAM.setHours(9, 0, 0, 0)
  const isLate = now > nineAM
  const status = isLate ? 'Present (Late)' : 'Present'
  const statusLabel = isLate ? 'Late' : 'On Time'

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      employee_id: employeeId,
      date: today,
      check_in: checkInTime,
      check_out: '-',
      status,
      hours: '0.00',
    })
    .select()
    .single()
  if (error) throw error
  return { record: data as AttendanceRecord, statusLabel }
}

/** 
 * Self-service Check Out.
 * - Captures current system time
 * - Calculates total working duration = Check-Out − Check-In
 * - Returns result in "X hrs Y mins" format
 * - Prevents check-out without check-in
 */
export async function selfCheckOut(employeeId: string): Promise<{ record: AttendanceRecord; workingTime: string }> {
  const today = todayISO()

  // Find today's record
  const { data: existing, error: fetchErr } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .maybeSingle()
  if (fetchErr) throw fetchErr

  if (!existing) {
    throw new Error('You must check in before checking out.')
  }

  if (existing.check_out && existing.check_out !== '-') {
    throw new Error('You have already checked out today.')
  }

  const now = new Date()
  const checkOutTime = formatTimeTo12h(now)

  // Calculate working hours
  const hours = calculateHours(existing.check_in, checkOutTime)

  // Calculate human-readable working time
  const inT = parseTime12h(existing.check_in)
  const outT = now
  let diffMs = 0
  if (inT) {
    diffMs = outT.getTime() - inT.getTime()
    if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000
  }
  const totalMins = Math.floor(diffMs / (1000 * 60))
  const hrs = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  const workingTime = `${hrs} hrs ${mins} mins`

  const { data, error } = await supabase
    .from('attendance_records')
    .update({
      check_out: checkOutTime,
      hours,
    })
    .eq('id', existing.id)
    .select()
    .single()
  if (error) throw error
  return { record: data as AttendanceRecord, workingTime }
}
