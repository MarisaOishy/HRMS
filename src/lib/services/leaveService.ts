import { supabase } from '../../lib/supabase'
import type { LeaveRequest, LeaveBalance } from '../../lib/types/database'

export async function getLeaveRequests(status?: string) {
  let query = supabase.from('leave_requests').select('*')
  if (status) {
    query = query.eq('status', status)
  }
  const { data, error } = await query.order('applied_date', { ascending: false })
  if (error) throw error
  return data as LeaveRequest[]
}

export async function getLeaveRequestsByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('applied_date', { ascending: false })
  if (error) throw error
  return data as LeaveRequest[]
}

export async function createLeaveRequest(request: Omit<LeaveRequest, 'id'>) {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data as LeaveRequest
}

export async function updateLeaveStatus(id: string, status: 'Approved' | 'Rejected') {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as LeaveRequest
}

export async function getLeaveBalances() {
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*')
  if (error) throw error
  return data as LeaveBalance[]
}

export async function getLeaveBalanceByEmployee(employeeId: string) {
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', employeeId)
    .single()
  if (error) throw error
  return data as LeaveBalance
}
