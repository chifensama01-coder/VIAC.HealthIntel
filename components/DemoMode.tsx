'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Presentation, X, Radio, Compass, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const KEY = 'healthintel_present_mode'

interface PresentCtx { demo: boolean; toggle: () => void; setDemo: (v: boolean) => void }
const Ctx = createContext<PresentCtx>({ demo: false, toggle: () => {}, setDemo: () => {} })
export const useDemoMode = () => useContext(Ctx)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demo, setDemoState] = useState(false)

  useEffect(() => { setDemoState(localStorage.getItem(KEY) === '1') }, [])

  const setDemo = (v: boolean) => { setDemoState(v); localStorage.setItem(KEY, v ? '1' : '0') }
  const toggle = () => setDemo(!demo)

  return <Ctx.Provider value={{ demo, toggle, setDemo }}>{children}</Ctx.Provider>
}

/** Top-bar toggle button. */
export function DemoModeToggle() {
  const { demo, toggle } = useDemoMode()
  return (
    <button onClick={toggle} title="Presentation mode"
      className={cn('flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition',
        demo ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}>
      <Presentation className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{demo ? 'Presenting' : 'Presentation'}</span>
    </button>
  )
}

const ACTIVITY = [
  'Buea Regional Hospital submitted 3 new PAC reports',
  'Referral logged · Limbe → Regional Hospital',
  'Hotline inquiry · adolescent care access · Bwassa',
  'Complication threshold check passed · Bokwaongo',
  'Search signal rising · "danger signs" · Limbe',
  'Community surveillance update · 2 new events',
  'Weekly bulletin generated · Southwest Region',
  'Forecast refreshed · 6-month projection updated',
]

const TOUR = [
  { title: 'Executive Briefing', body: 'Start here for an under-2-minute, decision-ready summary: what happened, why it matters, and what to do. Choose any district scope and export it as a PDF.' },
  { title: 'Overview & Risk Map', body: 'Live KPIs and a geographic risk map. Click any district to open its full intelligence report, complete with a narrative District Story.' },
  { title: 'AI Insight Engine', body: 'Auto-generated findings — open any insight to see its evidence, contributing sources and a confidence score.' },
  { title: 'Data Sources', body: 'Every figure is triangulated from surveillance, digital signals, public-health indicators and AI knowledge monitoring — with reliability scores for each stream.' },
  { title: 'Forecasting & Accountability', body: 'Project six-month demand and hold facilities accountable with scorecards. Forecasts feed directly into the Executive Briefing.' },
  { title: 'Quick navigation', body: 'Press Ctrl/⌘ K anywhere to jump to any page, district or action instantly. The bell shows live threshold alerts.' },
]

/** Slim live banner + rotating activity ticker + quick guided tour. Renders only when on. */
export function DemoBanner() {
  const { demo, setDemo } = useDemoMode()
  const [idx, setIdx] = useState(0)
  const [tourOpen, setTourOpen] = useState(false)
  const [step, setStep] = useState(0)
  const wasOn = useRef(demo)

  // Auto-launch the guided tour the moment presentation mode is switched on.
  useEffect(() => {
    if (demo && !wasOn.current) { setTourOpen(true); setStep(0) }
    wasOn.current = demo
  }, [demo])

  useEffect(() => {
    if (!demo) return
    const t = setInterval(() => setIdx((i) => (i + 1) % ACTIVITY.length), 3500)
    return () => clearInterval(t)
  }, [demo])

  if (!demo) return null

  return (
    <>
      <div className="flex items-center gap-3 border-b border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-2">
        <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          <Presentation className="h-3 w-3" /> Presentation Mode
        </span>

        <div className="ml-1 hidden min-w-0 flex-1 items-center gap-1.5 text-[11px] text-muted-foreground md:flex">
          <Radio className="h-3 w-3 shrink-0 text-emerald-500 animate-live-dot" />
          <span className="shrink-0 font-medium text-foreground/70">Live activity:</span>
          <span key={idx} className="truncate animate-fade-in">{ACTIVITY[idx]}</span>
        </div>

        <button onClick={() => { setTourOpen(true); setStep(0) }}
          className="ml-auto flex items-center gap-1 rounded-md border border-primary/30 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10">
          <Compass className="h-3 w-3" /> Guided tour
        </button>
        <button onClick={() => setDemo(false)} title="Exit presentation mode"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {tourOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setTourOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">{step + 1}</span>
              <h3 className="text-base font-bold text-foreground">{TOUR[step].title}</h3>
              <span className="ml-auto text-[11px] text-muted-foreground">{step + 1} / {TOUR.length}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{TOUR[step].body}</p>
            {/* progress dots */}
            <div className="mt-4 flex gap-1">
              {TOUR.map((_, i) => (
                <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-muted')} />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button onClick={() => setTourOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Skip tour</button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="rounded-lg border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">Back</button>
                )}
                {step < TOUR.length - 1 ? (
                  <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={() => setTourOpen(false)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
