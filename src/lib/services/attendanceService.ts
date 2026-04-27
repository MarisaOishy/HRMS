import { supabase } from '../../lib/supabase'
import type { AttendanceRecord } from '../../lib/types/database'

export async function getAttendanceRecords(date?: string) {
  let query = supabase.from('attendance_records').select('*')
  if (date) {
    query = query.eq('date', date)
  }
  const { data, error } = await query.order('date', { ascending: false })
  if (error) throw error
  return data as AttendanceRecord[]
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

export async function checkIn(employeeId: string) {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const { data, error } = await supabase
    .from('attendance_records')
    .insert({
      employee_id: employeeId,
      date: today,
      check_in: now,
      check_out: '-',
      status: 'Present',
      hours: '0.0',
    })
    .select()
    .single()
  if (error) throw error
  return data as AttendanceRecord
}

export async function checkOut(recordId: string) {
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const { data, error } = await supabase
    .from('attendance_records')
    .update({
      check_out: now,
      status: 'Present',
    })
    .eq('id', recordId)
    .select()
    .single()
  if (error) throw error
  return data as AttendanceRecord
}
