'use client'

import { useState, useEffect } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Target, Award, AlertTriangle } from 'lucide-react'
import type { AccountabilityMetric } from '@/lib/types'
import { cn } from '@/lib/utils'

const METRICS = [
  { key: 'complicationRate' as const, label: 'Complication Rate', description: 'Below 20% target', icon: AlertTriangle, invert: true },
  { key: 'facilityCoverage' as const, label: 'Facility Coverage', description: '≥ 80% target', icon: Target },
  { key: 'reportingCompliance' as const, label: 'Reporting Compliance', description: '≥ 85% target', icon: Target },
  { key: 'serviceAvailability' as const, label: 'Service Availability', description: '≥ 90% target', icon: Target },
]

function GaugeCard({ value, target, label, invert = false }: { value: number; target: number; label: string; invert?: boolean }) {
  const pct = Math.min(100, (value / target) * 100)
  const isGood = invert ? value <= target : value >= target
  const color = isGood ? '#10b981' : value >= target * 0.8 ? '#f59e0b' : '#ef4444'
  const data = [{ value: pct, fill: color }]

  return (
    <div className="text-center">
      <div className="relative h-24 w-24 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="60%" outerRadius="90%" startAngle={180} endAngle={0} data={data}>
            <RadialBar dataKey="value" background={{ fill: 'hsl(var(--muted))' }} cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{value.toFixed(0)}{label.includes('Rate') ? '%' : '%'}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score > 75 ? 'text-emerald-500 bg-emerald-500/10' : score > 55 ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10'
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold', color)}>{score}</span>
}

export default function AccountabilityPage() {
  const [data, setData] = useState<AccountabilityMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/accountability')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const TREND_ICON = (t: string) => t === 'improving' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : t === 'declining' ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Accountability Scorecard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">District performance against WHO and national health targets</p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, j) => <div key={j} className="skeleton h-20 rounded-xl" />)}</div>
          </div>
        ))}</div>
      ) : (
        <>
          {/* Ranking table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="border-b px-5 py-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">District Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">District</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Complication Rate</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Coverage</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Reporting</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Services</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Overall Score</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((m) => (
                    <tr key={m.district} className="hover:bg-muted/20 transition">
                      <td className="px-5 py-4">
                        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                          m.rank === 1 ? 'bg-amber-500/20 text-amber-500' :
                          m.rank === 2 ? 'bg-slate-500/20 text-slate-500' :
                          m.rank === 3 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'
                        )}>#{m.rank}</span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground">{m.district}</td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className={cn('font-bold text-sm', m.complicationRate.value > 25 ? 'text-red-500' : m.complicationRate.value > 20 ? 'text-amber-500' : 'text-emerald-500')}>
                            {m.complicationRate.value.toFixed(1)}%
                          </span>
                          <p className="text-xs text-muted-foreground">target: 20%</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className={cn('font-bold text-sm', m.facilityCoverage.value >= 80 ? 'text-emerald-500' : 'text-amber-500')}>{m.facilityCoverage.value}%</span>
                          <p className="text-xs text-muted-foreground">target: 80%</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className={cn('font-bold text-sm', m.reportingCompliance.value >= 85 ? 'text-emerald-500' : 'text-amber-500')}>{m.reportingCompliance.value}%</span>
                          <p className="text-xs text-muted-foreground">target: 85%</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <span className={cn('font-bold text-sm', m.serviceAvailability.value >= 90 ? 'text-emerald-500' : 'text-amber-500')}>{m.serviceAvailability.value}%</span>
                          <p className="text-xs text-muted-foreground">target: 90%</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center"><ScoreBadge score={m.overallScore} /></td>
                      <td className="px-4 py-4 text-center">{TREND_ICON(m.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gauge cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {data.map((m) => (
              <div key={m.district} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{m.district}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <ScoreBadge score={m.overallScore} />
                      <span className="text-xs text-muted-foreground">/ 100 overall score</span>
                      {TREND_ICON(m.trend)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {METRICS.map(({ key, label, invert }) => {
                    const metric = m[key]
                    return (
                      <div key={key}>
                        <GaugeCard
                          value={metric.value}
                          target={metric.target}
                          label={label.split(' ')[0]}
                          invert={invert}
                        />
                        <div className="text-center mt-1">
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden mx-auto w-16">
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(100, (metric.score / 100) * 100)}%`,
                              background: metric.score > 70 ? '#10b981' : metric.score > 50 ? '#f59e0b' : '#ef4444'
                            }} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">score: {metric.score}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
