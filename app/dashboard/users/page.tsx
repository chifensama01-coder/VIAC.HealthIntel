'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { MOCK_USERS } from '@/lib/auth'
import { ROLE_LABELS, DISTRICTS, type User, type UserRole } from '@/lib/types'
import {
  Users, UserPlus, Search, Shield, Trash2, Mail, MapPin,
  ShieldAlert, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ManagedUser extends User {
  status: 'active' | 'invited' | 'suspended'
}

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'border-primary/30 bg-primary/10 text-primary',
  regional_manager: 'border-violet-500/30 bg-violet-500/10 text-violet-500',
  facility_manager: 'border-teal-500/30 bg-teal-500/10 text-teal-500',
  public_viewer: 'border-slate-400/30 bg-slate-400/10 text-slate-500',
}

const STATUS_STYLES: Record<ManagedUser['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-500',
  invited: 'bg-amber-500/10 text-amber-500',
  suspended: 'bg-red-500/10 text-red-500',
}

function seedUsers(): ManagedUser[] {
  return Object.values(MOCK_USERS).map((r, i) => ({
    ...r.user,
    status: i === 3 ? 'invited' : 'active',
  }))
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>(seedUsers)
  const [query, setQuery] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [invite, setInvite] = useState<{ name: string; email: string; role: UserRole }>({
    name: '', email: '', role: 'facility_manager',
  })

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, query])

  const counts = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    active: users.filter((u) => u.status === 'active').length,
    invited: users.filter((u) => u.status === 'invited').length,
  }), [users])

  function changeRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    toast.success('Role updated')
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast.success('User removed')
  }

  function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!invite.name.trim() || !invite.email.trim()) return toast.error('Name and email are required')
    const newUser: ManagedUser = {
      id: `u${Date.now()}`,
      name: invite.name.trim(),
      email: invite.email.trim(),
      role: invite.role,
      lastLogin: '',
      status: 'invited',
    }
    setUsers((prev) => [newUser, ...prev])
    setInvite({ name: '', email: '', role: 'facility_manager' })
    setShowInvite(false)
    toast.success(`Invitation sent to ${newUser.email}`)
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">Restricted area</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            User management is available to administrators only.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage team members, roles and access</p>
        </div>
        <button onClick={() => setShowInvite((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <UserPlus className="h-4 w-4" /> Invite user
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total users', value: counts.total, icon: Users },
          { label: 'Administrators', value: counts.admins, icon: Shield },
          { label: 'Active', value: counts.active, icon: Check },
          { label: 'Pending invites', value: counts.invited, icon: Mail },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={sendInvite} className="rounded-xl border bg-card p-5 animate-fade-in">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Invite a new user</h3>
            <button type="button" onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input value={invite.name} onChange={(e) => setInvite((i) => ({ ...i, name: e.target.value }))}
              placeholder="Full name"
              className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="email" value={invite.email} onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))}
              placeholder="Email address"
              className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={invite.role} onChange={(e) => setInvite((i) => ({ ...i, role: e.target.value as UserRole }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="mt-3 flex justify-end">
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Mail className="h-4 w-4" /> Send invitation
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email…"
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Districts</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring ${ROLE_STYLES[u.role]}`}
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                        <option key={r} value={r} className="bg-card text-foreground">{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {u.assignedDistricts?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {u.assignedDistricts.map((d) => (
                          <span key={d} className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />{d}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">All / —</span>}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => removeUser(u.id)}
                      disabled={u.id === user.id}
                      title={u.id === user.id ? "You can't remove yourself" : 'Remove user'}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {DISTRICTS.length} districts under surveillance · Changes apply to this session
      </p>
    </div>
  )
}
