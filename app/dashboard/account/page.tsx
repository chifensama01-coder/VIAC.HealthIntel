'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS } from '@/lib/types'
import {
  User as UserIcon, Mail, Phone, Building2, Briefcase, Shield,
  MapPin, Save, Lock, Loader2, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const { user, updateUser } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    organization: user?.organization ?? 'Vision in Action Cameroon',
    title: user?.title ?? '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const initials = (profile.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    await new Promise((r) => setTimeout(r, 600))
    updateUser({
      name: profile.name.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      organization: profile.organization.trim(),
      title: profile.title.trim(),
    })
    setSavingProfile(false)
    toast.success('Profile updated')
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pw.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    await new Promise((r) => setTimeout(r, 700))
    setSavingPw(false)
    setPw({ current: '', next: '', confirm: '' })
    toast.success('Password changed')
  }

  return (
    <div className="mx-auto max-w-4xl p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information and security</p>
      </div>

      {/* Identity header card */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xl font-bold ring-2 ring-primary/20">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold text-foreground truncate">{profile.name || '—'}</div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Shield className="h-3 w-3" />
              {user ? ROLE_LABELS[user.role] : ''}
            </span>
            {user?.assignedDistricts?.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="rounded-xl border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" icon={UserIcon}>
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="input" placeholder="Your name" required />
          </Field>
          <Field label="Email address" icon={Mail}>
            <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="input" placeholder="you@organization.org" required />
          </Field>
          <Field label="Phone number" icon={Phone}>
            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className="input" placeholder="+237 …" />
          </Field>
          <Field label="Job title" icon={Briefcase}>
            <input value={profile.title} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
              className="input" placeholder="e.g. Surveillance Officer" />
          </Field>
          <Field label="Organization" icon={Building2}>
            <input value={profile.organization} onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
              className="input" />
          </Field>
          <Field label="Role" icon={Shield}>
            <input value={user ? ROLE_LABELS[user.role] : ''} disabled
              className="input opacity-60 cursor-not-allowed" />
          </Field>
        </div>
        <div className="flex justify-end pt-1">
          <button type="submit" disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>

      {/* Password form */}
      <form onSubmit={savePassword} className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className="input" />
          </Field>
          <Field label="New password">
            <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className="input" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className="input" />
          </Field>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Use at least 6 characters
          </p>
          <button type="submit" disabled={savingPw}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-60">
            {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Update password
          </button>
        </div>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: box-shadow .15s ease;
        }
        :global(.input:focus) {
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }
      `}</style>
    </div>
  )
}

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}{label}
      </span>
      {children}
    </label>
  )
}
