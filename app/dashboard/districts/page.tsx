'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Map, TrendingUp, TrendingDown, Minus, ArrowRight, AlertTriangle, CheckCircle2, AlertCircle, GitCompareArrows } from 'lucide-react'
import type { AccountabilityMetric } from '@/lib/types'
import { cn } from '@/lib/utils'

const RISK_META: Record<string, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', icon: AlertTriangle },
  high:     { label: 'High',     color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertCircle },
  moderate: { label: 'Moderate', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30', icon: AlertCircle },
  low:      { label: 'Low',      color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
}

const DISTRICT_DESCRIPTIONS: Record<string, string> = {
  Buea:      'Urban health hub · Regional hospital anchor · Mt. Cameroon corridor',
  Bokwaongo: 'Peri-urban · Strong facility network · Mixed population profile',
  Limbe:     'Coastal district · Port city · High adolescent caseload',
  Bwassa:    'Semi-rural · Limited facility access · Displaced community hotspot',
}

function ScoreBar({ score }: { score: number }) {
  const color = score > 70 ? 'bg-emerald-500' : score > 55 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">Accountability Score</span>
        <span className={cn('text-xs font-bold', score > 70 ? 'text-emerald-500' : score > 55 ? 'text-amber-500' : 'text-red-500')}>{score}/100</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function DistrictsPage() {
  const [metrics, setMetrics] = useState<AccountabilityMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/accountability')
      .then((r) => r.json())
      .then(setMetrics)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-5 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Map className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">District Intelligence Center</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Select a district to explore detailed PAC surveillance intelligence, demographics, and facility performance.
          </p>
        </div>
        <Link href="/dashboard/compare"
          className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10">
          <GitCompareArrows className="h-4 w-4" /> Compare districts
        </Link>
      </div>

      {/* Region summary strip */}
      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">4</p>
            <p className="text-xs text-muted-foreground mt-0.5">Health Districts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">14</p>
            <p className="text-xs text-muted-foreground mt-0.5">Reporting Facilities</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">SW</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cameroon Region</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">Live</p>
            <p className="text-xs text-muted-foreground mt-0.5">Surveillance Active</p>
          </div>
        </div>
      </div>

      {/* District cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-36 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-8 w-full rounded-lg mt-4" />
              </div>
            ))
          : metrics.map((m) => {
              const riskLevel = m.overallScore > 70 ? 'low' : m.overallScore > 55 ? 'moderate' : m.overallScore > 40 ? 'high' : 'critical'
              const { label: riskLabel, color: riskColor, bg: riskBg, icon: RiskIcon } = RISK_META[riskLevel]
              const TrendIcon = m.trend === 'improving' ? TrendingUp : m.trend === 'declining' ? TrendingDown : Minus
              const trendColor = m.trend === 'improving' ? 'text-emerald-500' : m.trend === 'declining' ? 'text-red-500' : 'text-muted-foreground'

              return (
                <div key={m.district} className="group rounded-xl border bg-card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition-all duration-200">
                  {/* District header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{m.district}</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {DISTRICT_DESCRIPTIONS[m.district] ?? 'Southwest Region District'}
                      </p>
                    </div>
                    <span className={cn('shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold', riskBg, riskColor)}>
                      <RiskIcon className="h-2.5 w-2.5" />
                      {riskLabel}
                    </span>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{m.complicationRate.value.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">Complication Rate</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{m.reportingCompliance.value}%</p>
                      <p className="text-[10px] text-muted-foreground">Reporting</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{m.facilityCoverage.value}%</p>
                      <p className="text-[10px] text-muted-foreground">Facility Coverage</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
                      <p className="text-lg font-bold text-foreground">{m.serviceAvailability.value}%</p>
                      <p className="text-[10px] text-muted-foreground">Service Avail.</p>
                    </div>
                  </div>

                  {/* Trend badge */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} />
                    <span className={cn('text-xs font-medium capitalize', trendColor)}>{m.trend}</span>
                    <span className="text-[10px] text-muted-foreground">vs prior period</span>
                  </div>

                  <ScoreBar score={m.overallScore} />

                  <Link
                    href={`/dashboard/districts/${m.district}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/15 transition group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    View Full Report
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
      </div>

      {/* How to use guide */}
      <div className="rounded-xl border border-dashed bg-muted/20 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">What each district report contains</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">1</span>
            <p><strong className="text-foreground">Overview</strong> — Monthly case trends and key risk indicator gauges</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">2</span>
            <p><strong className="text-foreground">Demographics</strong> — Age, sex, wealth quintile, education, and displaced persons breakdowns</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">3</span>
            <p><strong className="text-foreground">Facilities</strong> — Per-facility compliance scores and complication rates</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">4</span>
            <p><strong className="text-foreground">AI Insights</strong> — Automatically generated findings and action recommendations</p>
          </div>
        </div>
      </div>
    </div>
  )
}
