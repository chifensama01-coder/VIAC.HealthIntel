'use client'

import { Radar, Map, Activity, ShieldCheck, PieChart, BadgeCheck, Database, Lock, Building2 } from 'lucide-react'

const VALUE_PROPS = [
  { icon: Radar, title: 'Detect emerging risks earlier', desc: 'Surface complication and demand signals before they escalate.' },
  { icon: Map, title: 'Improve district-level decisions', desc: 'Geographic intelligence pinpoints where to act first.' },
  { icon: Activity, title: 'Monitor service coverage', desc: 'Track facility reporting and access gaps in real time.' },
  { icon: ShieldCheck, title: 'Strengthen accountability', desc: 'Facility scorecards make performance transparent.' },
  { icon: PieChart, title: 'Support resource allocation', desc: 'Direct staff and supplies to the highest-need districts.' },
]

const TRUST = [
  { icon: BadgeCheck, label: 'Aligned with WHO benchmarks' },
  { icon: Database, label: 'DHIS2-compatible data model' },
  { icon: Lock, label: 'Privacy-first · anonymised & aggregate' },
  { icon: Building2, label: '14 facilities · 4 districts reporting' },
]

export function WhyThisMatters() {
  return (
    <section className="rounded-2xl border bg-card p-5 lg:p-6">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">Why HealthIntel?</span>
        <h2 className="text-lg font-bold text-foreground lg:text-xl">
          Public health intelligence for surveillance, forecasting &amp; decision support
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          HealthIntel turns fragmented post-abortion care reporting into a single, decision-ready picture —
          helping Vision in Action Cameroon and its partners act earlier, allocate better, and stay accountable.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {VALUE_PROPS.map((v) => (
          <div key={v.title}
            className="group rounded-xl border bg-background/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <v.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-sm font-semibold leading-snug text-foreground">{v.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4">
        {TRUST.map((t) => (
          <span key={t.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <t.icon className="h-3.5 w-3.5 text-emerald-500" />{t.label}
          </span>
        ))}
      </div>
    </section>
  )
}
