'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, ArrowRightLeft, Bell, FileText, UserPlus, Radio, Activity, MapPin } from 'lucide-react'
import type { LiveEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPE_CONFIG = {
  hotline: { icon: Phone, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Hotline Call' },
  referral: { icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Referral' },
  alert: { icon: Bell, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Alert' },
  report: { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Report Submitted' },
  admission: { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Admission' },
}

const SEV_COLORS = {
  critical: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
  success: 'border-l-emerald-500',
}

function EventCard({ event, isNew }: { event: LiveEvent; isNew: boolean }) {
  const config = TYPE_CONFIG[event.type]
  const Icon = config.icon

  return (
    <div className={cn(
      'border-l-4 rounded-lg border bg-card p-4 transition-all duration-500',
      SEV_COLORS[event.severity],
      isNew && 'animate-fade-in ring-1 ring-primary/30 bg-primary/5'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wide', config.color)}>{config.label}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />
              {event.district}
            </div>
          </div>
          <p className="text-sm text-foreground">{event.message}</p>
          {event.facility && <p className="text-xs text-muted-foreground mt-1">{event.facility}</p>}
        </div>
        <time className="text-[10px] text-muted-foreground whitespace-nowrap">
          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </time>
      </div>
    </div>
  )
}

const STATS_INIT = { hotline: 0, referral: 0, alert: 0, report: 0, admission: 0 }

export default function OperationsPage() {
  const [events, setEvents] = useState<(LiveEvent & { isNew: boolean })[]>([])
  const [connected, setConnected] = useState(false)
  const [counts, setCounts] = useState(STATS_INIT)
  const [filterType, setFilterType] = useState<string>('all')
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let isMounted = true

    function connect() {
      if (!isMounted) return
      const es = new EventSource('/api/events')
      esRef.current = es

      es.onopen = () => { if (isMounted) setConnected(true) }

      es.onerror = () => {
        if (!isMounted) return
        setConnected(false)
        es.close()
        esRef.current = null
        // Reconnect after 5 seconds
        reconnectTimer = setTimeout(() => { if (isMounted) connect() }, 5000)
      }

      es.onmessage = (e) => {
        if (!isMounted) return
        try {
          const event: LiveEvent = JSON.parse(e.data)
          setEvents((prev) => [{ ...event, isNew: true }, ...prev].slice(0, 100))
          setCounts((prev) => ({ ...prev, [event.type]: (prev[event.type as keyof typeof prev] ?? 0) + 1 }))
          setTimeout(() => {
            setEvents((prev) => prev.map((ev) => ev.id === event.id ? { ...ev, isNew: false } : ev))
          }, 2000)
        } catch {}
      }
    }

    connect()

    return () => {
      isMounted = false
      if (reconnectTimer) clearTimeout(reconnectTimer)
      esRef.current?.close()
      esRef.current = null
      setConnected(false)
    }
  }, [])

  const filtered = filterType === 'all' ? events : events.filter((e) => e.type === filterType)

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Operations Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live event stream from the surveillance network</p>
        </div>
        <div className={cn(
          'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
          connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-red-500/30 bg-red-500/10 text-red-500'
        )}>
          <div className={cn('h-2 w-2 rounded-full', connected ? 'bg-emerald-500 animate-live-dot' : 'bg-red-500')} />
          {connected ? 'Live · Connected' : 'Reconnecting...'}
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(TYPE_CONFIG).map(([type, config]) => {
          const Icon = config.icon
          const count = counts[type as keyof typeof counts]
          return (
            <button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all hover:shadow-md',
                filterType === type ? `${config.bg} ${config.border}` : 'bg-card'
              )}>
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg mb-2', config.bg)}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{config.label}s</div>
            </button>
          )
        })}
      </div>

      {/* Event feed */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-2.5">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Live Event Feed</h3>
            <div className="flex gap-1">
              <button onClick={() => setFilterType('all')}
                className={cn('rounded-full px-2.5 py-1 text-xs font-medium transition', filterType === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
                All
              </button>
              {Object.entries(TYPE_CONFIG).map(([type, c]) => (
                <button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)}
                  className={cn('rounded-full px-2.5 py-1 text-xs font-medium transition', filterType === type ? `${c.bg} ${c.color}` : 'text-muted-foreground hover:bg-accent')}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
            {filtered.length === 0 ? (
              <div className="rounded-xl border bg-card flex items-center justify-center h-32">
                <div className="text-center">
                  <Radio className="h-6 w-6 text-muted-foreground mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Waiting for events...</p>
                </div>
              </div>
            ) : (
              filtered.map((event) => <EventCard key={event.id} event={event} isNew={event.isNew} />)
            )}
          </div>
        </div>

        {/* Summary panel */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Session Summary</h3>
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total events</span>
              <span className="font-bold text-foreground">{events.length}</span>
            </div>
            {Object.entries(counts).filter(([, v]) => v > 0).map(([type, count]) => {
              const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
              const pct = events.length > 0 ? (count / events.length) * 100 : 0
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={config.color}>{config.label}</span>
                    <span className="text-foreground font-medium">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full', config.bg.replace('/10', ''))} style={{ width: `${pct}%`, background: config.color.replace('text-', '') }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Latest critical */}
          <div className="rounded-xl border bg-card p-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Latest Alerts</h4>
            <div className="space-y-2">
              {events.filter((e) => e.severity === 'critical').slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-start gap-2">
                  <Bell className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">{e.message}</p>
                </div>
              ))}
              {events.filter((e) => e.severity === 'critical').length === 0 && (
                <p className="text-xs text-muted-foreground">No critical alerts yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
