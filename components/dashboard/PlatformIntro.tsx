'use client'

import { useEffect, useState } from 'react'
import {
  Activity, Map as MapIcon, TrendingUp, ShieldCheck, ChevronUp, ChevronDown,
} from 'lucide-react'

const STORAGE_KEY = 'healthintel_intro_collapsed'

function useCountUp(target: number, run: boolean, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, duration])
  return val
}

const FEATURES = [
  { icon: MapIcon, label: 'District intelligence', desc: 'Geographic risk mapping' },
  { icon: TrendingUp, label: 'Forecasting', desc: '6-month projections' },
  { icon: ShieldCheck, label: 'Accountability', desc: 'Facility scorecards' },
  { icon: Activity, label: 'Live signals', desc: 'Real-time surveillance' },
]

export function PlatformIntro({ totalCases }: { totalCases?: number }) {
  const [collapsed, setCollapsed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === '1')
    setReady(true)
  }, [])

  function toggle() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  const cases = useCountUp(totalCases ?? 15408, ready && !collapsed)
  const districts = useCountUp(4, ready && !collapsed)
  const facilities = useCountUp(14, ready && !collapsed)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20"
      style={{ background: 'linear-gradient(115deg, hsl(202 74% 22%) 0%, hsl(208 60% 14%) 45%, hsl(34 60% 22%) 100%)' }}>
      {/* animated brand gradient sheen (kept above the base bg, below content) */}
      <div className="gradient-pan absolute inset-0 opacity-80"
        style={{ background: 'linear-gradient(115deg, hsl(202 74% 22%) 0%, hsl(208 60% 14%) 45%, hsl(34 60% 22%) 100%)' }} />
      <div className="absolute inset-0 opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle at 12% 20%, hsl(var(--brand-blue)/0.55) 0%, transparent 45%), radial-gradient(circle at 88% 85%, hsl(var(--brand-gold)/0.45) 0%, transparent 45%)' }} />

      {/* floating ECG ribbon */}
      <svg className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-30" viewBox="0 0 400 160" fill="none" preserveAspectRatio="xMidYMid slice">
        <path className="ecg-line" d="M0 80 H70 l12 -42 14 84 16 -64 12 42 H180 l12 -42 14 84 16 -64 12 42 H320 l12 -42 14 84 16 -64 12 42 H440"
          stroke="hsl(var(--brand-gold))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="relative p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-gold))] animate-live-dot" />
              Vision in Action Cameroon
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-white lg:text-[28px]">
              Post-Abortion Care <span className="text-[hsl(var(--brand-gold))]">Surveillance Intelligence</span>
            </h1>
            {!collapsed && (
              <p className="mt-2 text-sm leading-relaxed text-white/80 animate-fade-in">
                HealthIntel tracks PAC cases across the Southwest Region in real time — mapping where
                complications cluster, who is most affected, and how to respond. Explore districts,
                forecast demand, and hold facilities accountable, all from one place.
              </p>
            )}
          </div>
          <button onClick={toggle}
            className="shrink-0 rounded-lg border border-white/20 bg-white/10 p-1.5 text-white/80 backdrop-blur-sm transition hover:bg-white/20"
            title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-5 grid gap-4 animate-fade-in lg:grid-cols-[auto_1fr] lg:items-center">
            {/* live counters */}
            <div className="flex gap-6">
              {[
                { v: cases.toLocaleString(), l: 'Cases monitored' },
                { v: districts, l: 'Districts' },
                { v: facilities, l: 'Facilities' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-white tabular-nums">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wide text-white/60">{s.l}</div>
                </div>
              ))}
            </div>

            {/* feature pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:justify-self-end">
              {FEATURES.map((f) => (
                <div key={f.label}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm transition hover:border-[hsl(var(--brand-gold))]/50 hover:bg-white/10">
                  <f.icon className="h-4 w-4 text-[hsl(var(--brand-gold))] transition-transform group-hover:scale-110" />
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-white">{f.label}</div>
                    <div className="text-[10px] text-white/60">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
