'use client'

import { useMemo } from 'react'
import {
  Database, Activity, Radar, BookOpen, Bot, ShieldCheck, CheckCircle2,
} from 'lucide-react'
import { DATA_SOURCE_CATEGORIES, type SourceStatus, type SourceCategory } from '@/lib/intelligence'
import { cn } from '@/lib/utils'

const CAT_ICON: Record<SourceCategory['icon'], any> = {
  surveillance: Activity, signals: Radar, indicators: BookOpen, ai: Bot,
}

const STATUS_META: Record<SourceStatus, { label: string; cls: string; dot: string }> = {
  live:      { label: 'Live', cls: 'text-emerald-500 bg-emerald-500/10', dot: 'bg-emerald-500 animate-live-dot' },
  syncing:   { label: 'Syncing', cls: 'text-blue-500 bg-blue-500/10', dot: 'bg-blue-500 animate-pulse' },
  periodic:  { label: 'Periodic', cls: 'text-amber-500 bg-amber-500/10', dot: 'bg-amber-500' },
  simulated: { label: 'Modelled', cls: 'text-violet-500 bg-violet-500/10', dot: 'bg-violet-500' },
}

function reliabilityColor(r: number) {
  return r >= 90 ? 'text-emerald-500' : r >= 75 ? 'text-amber-500' : 'text-violet-500'
}

export default function DataSourcesPage() {
  const stats = useMemo(() => {
    const all = DATA_SOURCE_CATEGORIES.flatMap((c) => c.sources)
    const live = all.filter((s) => s.status === 'live').length
    const avg = Math.round(all.reduce((s, x) => s + x.reliability, 0) / all.length)
    return { total: all.length, live, avg, categories: DATA_SOURCE_CATEGORIES.length }
  }, [])

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Data Sources Center</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 max-w-3xl">
          Every insight on this platform is triangulated from multiple independent sources. This page documents
          where the intelligence comes from, how current it is, and how reliable each stream is.
        </p>
      </div>

      {/* Trust strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Connected sources', value: stats.total, icon: Database },
          { label: 'Live streams', value: stats.live, icon: Activity },
          { label: 'Source categories', value: stats.categories, icon: Radar },
          { label: 'Avg. reliability', value: `${stats.avg}%`, icon: ShieldCheck },
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

      {/* Methodology note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Triangulated intelligence methodology</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              HealthIntel combines case-level surveillance, digital signals, authoritative indicators and AI knowledge
              monitoring. No single source is treated as ground truth — findings are corroborated across streams and
              weighted by reliability before being surfaced as insights.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-5">
        {DATA_SOURCE_CATEGORIES.map((cat) => {
          const Icon = CAT_ICON[cat.icon]
          return (
            <div key={cat.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="flex items-center gap-3 border-b px-5 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{cat.title}</h2>
                  <p className="text-xs text-muted-foreground">{cat.blurb}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{cat.sources.length} sources</span>
              </div>

              <div className="divide-y">
                {cat.sources.map((s) => {
                  const st = STATUS_META[s.status]
                  return (
                    <div key={s.name} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium', st.cls)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />{st.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-5 text-xs">
                        <div className="text-right">
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-medium text-foreground">{s.coverage}</p>
                        </div>
                        <div className="hidden text-right sm:block">
                          <p className="text-muted-foreground">Updated</p>
                          <p className="font-medium text-foreground">{s.lastUpdated}</p>
                        </div>
                        <div className="w-24">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Reliability</span>
                            <span className={cn('font-bold', reliabilityColor(s.reliability))}>{s.reliability}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${s.reliability}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Indicator glossary — definitions for analysts & partners */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-3.5">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Indicator Definitions</h2>
          <span className="ml-auto text-xs text-muted-foreground">How each metric is calculated</span>
        </div>
        <div className="divide-y">
          {[
            { term: 'Complication rate', def: 'Share of monitored PAC cases presenting serious complications. WHO benchmark ≤ 20%.' },
            { term: 'Adolescent share', def: 'Proportion of cases among patients aged 10–19, indicating need for youth-focused services.' },
            { term: 'Referral rate', def: 'Share of cases referred to a higher-level facility — a proxy for severity and capacity gaps.' },
            { term: 'Risk score', def: 'Composite 0–100 index combining complication rate, adolescent share and referral pressure.' },
            { term: 'Reliability score', def: 'Confidence in a source stream based on completeness, timeliness and validation status.' },
            { term: 'Region rate (case-weighted)', def: 'District rates weighted by case volume so larger districts influence the regional figure proportionally.' },
          ].map((g) => (
            <div key={g.term} className="grid gap-1 px-5 py-3 sm:grid-cols-[200px_1fr]">
              <p className="text-sm font-medium text-foreground">{g.term}</p>
              <p className="text-xs text-muted-foreground">{g.def}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
        Modelled streams are clearly labelled and used where direct integrations are pending. Each source is weighted
        by its reliability score before contributing to an insight, so confidence reflects the underlying evidence.
      </div>
    </div>
  )
}
