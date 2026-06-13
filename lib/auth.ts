import type { User, UserRole, AuthSession } from './types'

export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@healthintel.org': {
    password: 'admin123',
    user: {
      id: 'u1',
      name: 'Dr. Amara Diallo',
      email: 'admin@healthintel.org',
      role: 'admin',
      lastLogin: new Date().toISOString(),
    },
  },
  'regional@healthintel.org': {
    password: 'regional123',
    user: {
      id: 'u2',
      name: 'Grace Nkemdirim',
      email: 'regional@healthintel.org',
      role: 'regional_manager',
      assignedDistricts: ['Buea', 'Limbe'],
      lastLogin: new Date().toISOString(),
    },
  },
  'facility@healthintel.org': {
    password: 'facility123',
    user: {
      id: 'u3',
      name: 'Emmanuel Fon',
      email: 'facility@healthintel.org',
      role: 'facility_manager',
      assignedDistricts: ['Buea'],
      assignedFacilities: ['Buea Regional Hospital'],
      lastLogin: new Date().toISOString(),
    },
  },
  'viewer@healthintel.org': {
    password: 'viewer123',
    user: {
      id: 'u4',
      name: 'Public Viewer',
      email: 'viewer@healthintel.org',
      role: 'public_viewer',
      lastLogin: new Date().toISOString(),
    },
  },
}

export function authenticate(email: string, password: string): AuthSession | null {
  const record = MOCK_USERS[email.toLowerCase()]
  if (!record || record.password !== password) return null
  return {
    user: { ...record.user, lastLogin: new Date().toISOString() },
    token: `mock-token-${record.user.id}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  }
}

export const SESSION_KEY = 'healthintel_session'

export function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: AuthSession = JSON.parse(raw)
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function canAccessDistrict(user: User, district: string): boolean {
  if (user.role === 'admin' || user.role === 'public_viewer') return true
  return user.assignedDistricts?.includes(district) ?? false
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view:all', 'export:all', 'manage:users', 'manage:settings'],
  regional_manager: ['view:assigned', 'export:reports', 'view:accountability'],
  facility_manager: ['view:facility', 'export:facility'],
  public_viewer: ['view:public'],
}
