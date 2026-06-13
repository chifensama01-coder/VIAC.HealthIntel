'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import {
  Settings as SettingsIcon, Save, Bell, SlidersHorizontal, Globe,
  Palette, ShieldAlert, Loader2, Sun, Moon,
} from 'lucide-react'
import toast from 'react-hot-toast'

const SETTINGS_KEY = 'healthintel_settings'

interface PlatformSettings {
  platformName: string
  region: string
  timezone: string
  complicationThreshold: number
  adolescentAlertThreshold: number
  autoRefresh: boolean
  emailAlerts: boolean
  weeklyDigest: boolean
  criticalAlerts: boolean
}

const DEFAULTS: PlatformSettings = {
  platformName: 'HealthIntel — PAC Surveillance',
  region: 'Southwest Region, Cameroon',
  timezone: 'Africa/Douala (WAT)',
  complicationThreshold: 20,
  adolescentAlertThreshold: 30,
  autoRefresh: true,
  emailAlerts: true,
  weeklyDigest: false,
  criticalAlerts: true,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [s, setS] = useState<PlatformSettings>(DEFAULTS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch { /* ignore */ }
  }, [])

  function set<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    setSaving(false)
    toast.success('Settings saved')
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">Restricted area</h2>
          <p className="mt-1 text-sm text-muted-foreground">Platform settings are available to administrators only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Platform Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure surveillance behaviour and notifications</p>
        </div>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
        </button>
      </div>

      {/* General */}
      <section className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">General</h3></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Platform name</span>
            <input value={s.platformName} onChange={(e) => set('platformName', e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Region</span>
            <input value={s.region} onChange={(e) => set('region', e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Timezone</span>
            <input value={s.timezone} onChange={(e) => set('timezone', e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
        </div>
      </section>

      {/* Thresholds */}
      <section className="rounded-xl border bg-card p-5 space-y-2">
        <div className="flex items-center gap-2 pb-1"><SlidersHorizontal className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Surveillance thresholds</h3></div>
        <div className="grid gap-4 sm:grid-cols-2 pt-1">
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              Complication-rate alert <span className="text-primary font-bold">{s.complicationThreshold}%</span>
            </span>
            <input type="range" min={5} max={40} value={s.complicationThreshold}
              onChange={(e) => set('complicationThreshold', Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]" />
            <span className="text-[10px] text-muted-foreground">WHO benchmark is 20%</span>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              Adolescent-share alert <span className="text-primary font-bold">{s.adolescentAlertThreshold}%</span>
            </span>
            <input type="range" min={10} max={60} value={s.adolescentAlertThreshold}
              onChange={(e) => set('adolescentAlertThreshold', Number(e.target.value))}
              className="w-full accent-[hsl(var(--primary))]" />
            <span className="text-[10px] text-muted-foreground">Flag districts above this share of ages 10–19</span>
          </label>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 pb-1"><Bell className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Notifications</h3></div>
        <div className="divide-y">
          <Row title="Auto-refresh data" desc="Refresh surveillance figures automatically">
            <Toggle checked={s.autoRefresh} onChange={(v) => set('autoRefresh', v)} />
          </Row>
          <Row title="Email alerts" desc="Email me when thresholds are breached">
            <Toggle checked={s.emailAlerts} onChange={(v) => set('emailAlerts', v)} />
          </Row>
          <Row title="Critical alerts" desc="Immediate alerts for critical-risk districts">
            <Toggle checked={s.criticalAlerts} onChange={(v) => set('criticalAlerts', v)} />
          </Row>
          <Row title="Weekly digest" desc="A weekly summary every Monday">
            <Toggle checked={s.weeklyDigest} onChange={(v) => set('weeklyDigest', v)} />
          </Row>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 pb-1"><Palette className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Appearance</h3></div>
        <Row title="Theme" desc="Switch between light and dark mode">
          <div className="inline-flex rounded-lg border p-0.5">
            <button onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${theme === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${theme === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
          </div>
        </Row>
      </section>
    </div>
  )
}
