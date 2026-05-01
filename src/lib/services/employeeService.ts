import { supabase } from '../../lib/supabase'
import type { Employee } from '../../lib/types/database'

/**
 * Upload an avatar image file.
 * Tries Supabase Storage bucket "avatars" first.
 * Falls back to a base-64 data URL so the feature always works.
 */
export async function uploadAvatar(file: File, employeeId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const filePath = `${employeeId}-${Date.now()}.${ext}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return data.publicUrl
  } catch {
    // Fallback: convert to data URL so it still works without a storage bucket
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }
}

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Employee[]
}

export async function getEmployeeById(id: string) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Employee
}

export async function createEmployee(employee: Omit<Employee, 'created_at'>) {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Employee
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
  if (error) throw error
}
