import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  /** Role derived from user_metadata.role; defaults to 'Admin' for HRMS */
  role: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: 'Admin',
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null
  const role = (user?.user_metadata?.role as string) || 'Admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/** Convenience check: true if role is Admin or HR */
export function isAdminOrHR(role: string): boolean {
  return role === 'Admin' || role === 'HR'
}
