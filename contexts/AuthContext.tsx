'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthSession, User } from '@/lib/types'
import { getSession, clearSession, saveSession, authenticate } from '@/lib/auth'

interface AuthContextValue {
  user: User | null
  session: AuthSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getSession()
    setSession(stored)
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = authenticate(email, password)
    if (!result) return { success: false, error: 'Invalid credentials. Please check your email and password.' }
    saveSession(result)
    setSession(result)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    router.push('/login')
  }, [router])

  const updateUser = useCallback((patch: Partial<User>) => {
    setSession((prev) => {
      if (!prev) return prev
      const next: AuthSession = { ...prev, user: { ...prev.user, ...patch } }
      saveSession(next)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, session, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
