'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown, Info } from 'lucide-react'
import type { ForecastData } from '@/lib/types'
import { DISTRICTS } from '@/lib/types'
import { cn } from '@/lib/utils'

const METRIC_OPTS = [
  { value: 'cases', label: 'Total Cases' },
  { value: 'complications', label: 'Complications' },
  { value: 'referrals', label: 'Referrals' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const isProjection = payload[0]?.payload?.isProjection
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
        {label?.slice(0, 7)}
        {isProjection && <span className="rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px]">Forecast</span>}
      </p>
      {payload.map((p: any) => p.value != null && (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-bold text-foreground">{Math.round(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function ForecastingPage() {
  const [district, setDistrict] = useState('All')
  const [metric, setMetric] = useState<'cases' | 'complications' | 'referrals'>('cases')
  const [data, setData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/forecasting?district=${encodeURIComponent(district)}&metric=${metric}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [district, metric])

  const lastActual = data?.points.filter((p) => !p.isProjection).at(-1)?.actual ?? 0
  const lastForecast = data?.points.filter((p) => p.isProjection).at(-1)?.forecast ?? 0
  const projectedChange = lastActual > 0 ? ((lastForecast - lastActual) / lastActual) * 100 : 0

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Forecasting & Predictive Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">6-month projections based on historical surveillance trends</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-500">
          <Info className="h-3.5 w-3.5" />
          {data?.confidenceLevel ?? 85}% confidence
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">District</label>
          <div className="flex gap-1 flex-wrap">
            {['All', ...DISTRICTS].map((d) => (
              <button key={d} onClick={() => setDistrict(d)}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition border',
                  d === district ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                )}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Metric</label>
          <div className="flex gap-1">
            {METRIC_OPTS.map((m) => (
              <button key={m.value} onClick={() => setMetric(m.value as any)}
                className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition border',
                  m.value === metric ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                )}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Current Level</p>
          <p className="text-2xl font-bold text-foreground mt-1">{lastActual.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Last observed</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">6-Month Forecast</p>
          <p className="text-2xl font-bold text-foreground mt-1">{lastForecast.toLocaleString()}</p>
          <div className={cn('mt-1 flex items-center gap-1 text-xs font-medium', projectedChange > 0 ? 'text-red-500' : 'text-emerald-500')}>
            {projectedChange > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(projectedChange).toFixed(1)}% projected
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Confidence Level</p>
          <p className="text-2xl font-bold text-foreground mt-1">{data?.confidenceLevel ?? 85}%</p>
          <p className="text-xs text-muted-foreground mt-1">Statistical confidence</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Risk Score</p>
          <p className={cn('text-2xl font-bold mt-1', (data?.riskScore ?? 50) > 60 ? 'text-red-500' : (data?.riskScore ?? 50) > 40 ? 'text-amber-500' : 'text-emerald-500')}>
            {data?.riskScore ?? '—'}/100
          </p>
          <p className="text-xs text-muted-foreground mt-1">Projected risk</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold mb-1">{METRIC_OPTS.find((m) => m.value === metric)?.label} Forecast — {district === 'All' ? 'All Districts' : district}</h3>
        <p className="text-xs text-muted-foreground mb-4">Shaded area represents confidence interval (±15%)</p>
        {loading ? (
          <div className="h-72 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data?.points} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {/* Confidence band (area between upper and lower) */}
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confBand)" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" />
              {/* Actual data */}
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} connectNulls={false} />
              {/* Forecast */}
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              {/* Now line */}
              <ReferenceLine x={data?.points.find((p) => !p.isProjection)?.month} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6 bg-blue-500" /> Historical (actual)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-6 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }} /> 6-month forecast</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-6 rounded bg-blue-500/10" /> Confidence interval</span>
        </div>
      </div>

      {/* Key drivers */}
      {data?.keyDrivers && (
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold mb-3">Key Forecast Drivers</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.keyDrivers.map((d, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</div>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
