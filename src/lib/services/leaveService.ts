import { supabase } from '../../lib/supabase'
import type { LeaveRequest, LeaveBalance, Employee } from '../../lib/types/database'

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

export async function getEmployeeByEmailForLeave(email: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, email')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data as Pick<Employee, 'id' | 'name' | 'email'> | null
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

export async function deductLeaveBalance(employeeId: string, leaveType: string, days: number) {
  // First, get the current balance
  const balance = await getLeaveBalanceByEmployee(employeeId);
  
  // Map leave type to the correct column
  let columnToUpdate = '';
  if (leaveType.toLowerCase().includes('annual')) columnToUpdate = 'annual_leave';
  else if (leaveType.toLowerCase().includes('sick')) columnToUpdate = 'sick_leave';
  else if (leaveType.toLowerCase().includes('casual')) columnToUpdate = 'casual_leave';
  else return; // Don't deduct for unpaid/parental etc if not in balance table

  // Calculate new balance
  const currentDays = balance[columnToUpdate as keyof LeaveBalance] as number;
  const newDays = Math.max(0, currentDays - days);

  // Update
  const { data, error } = await supabase
    .from('leave_balances')
    .update({ [columnToUpdate]: newDays })
    .eq('employee_id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data as LeaveBalance;
}
