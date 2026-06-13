'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, AlertTriangle, Info, CheckCircle2, Users, Activity, CheckCheck, X,
} from 'lucide-react'
import type { DashboardData } from '@/lib/types'
import {
  computeAlerts, getThresholds, getReadIds, saveReadIds, relativeTime, type Alert,
} from '@/lib/alerts'
import { cn } from '@/lib/utils'

const SEV = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' },
  warning:  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  info:     { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  success:  { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
} as const

const CAT_ICON = {
  Complication: AlertTriangle,
  Adolescent: Users,
  Risk: AlertTriangle,
  Coverage: CheckCircle2,
  System: Activity,
} as const

export function NotificationsBell() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard-data')
      if (!res.ok) return
      const data: DashboardData = await res.json()
      setAlerts(computeAlerts(data.geoData, getThresholds()))
    } catch { /* offline / ignore */ }
  }, [])

  useEffect(() => {
    setReadIds(getReadIds())
    load()
    const interval = setInterval(load, 60_000) // refresh every minute
    return () => clearInterval(interval)
  }, [load])

  // Recompute when settings change (thresholds) or reopening
  useEffect(() => {
    if (open) { setReadIds(getReadIds()); load() }
  }, [open, load])

  // Close on outside click / Esc
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [open])

  const unread = alerts.filter((a) => !readIds.has(a.id))
  const unreadCount = unread.length
  const criticalCount = unread.filter((a) => a.severity === 'critical').length

  function markAllRead() {
    const all = new Set(alerts.map((a) => a.id))
    setReadIds(all); saveReadIds(all)
  }
  function markRead(id: string) {
    const next = new Set(readIds); next.add(id)
    setReadIds(next); saveReadIds(next)
  }
  function openAlert(a: Alert) {
    markRead(a.id)
    setOpen(false)
    if (a.district) router.push(`/dashboard/districts/${a.district}`)
    else if (a.category === 'Coverage') router.push('/dashboard/reports')
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition"
        title="Alerts" aria-label={`Alerts${unreadCount ? `, ${unreadCount} unread` : ''}`}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white border-2 border-background',
            criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-card shadow-2xl animate-fade-in z-50">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Alerts</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-7 w-7 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">You’re all caught up</p>
                <p className="text-xs text-muted-foreground/60">No active surveillance alerts</p>
              </div>
            ) : (
              alerts.map((a) => {
                const sev = SEV[a.severity]
                const CatIcon = CAT_ICON[a.category] ?? Info
                const isRead = readIds.has(a.id)
                return (
                  <button key={a.id} onClick={() => openAlert(a)}
                    className={cn('flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent/40',
                      !isRead && 'bg-primary/[0.04]')}>
                    <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', sev.bg)}>
                      <CatIcon className={cn('h-3.5 w-3.5', sev.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className={cn('text-xs leading-snug text-foreground', !isRead && 'font-semibold')}>{a.title}</p>
                        {!isRead && <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', sev.dot)} />}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">{a.message}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground/70">
                        <span className="uppercase tracking-wide">{a.category}</span>
                        <span>·</span>
                        <span>{relativeTime(a.ts)}</span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t px-4 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              Thresholds are configured in <span className="text-foreground/80">Platform Settings</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
