'use client'

import { useEffect, useState } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { TimeSeriesPoint } from '@/lib/types'

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[]
  loading?: boolean
}

function readComplicationThreshold(): number {
  if (typeof window === 'undefined') return 20
  try {
    const raw = localStorage.getItem('healthintel_settings')
    if (raw) return Number(JSON.parse(raw).complicationThreshold) || 20
  } catch { /* ignore */ }
  return 20
}

function fmt(month: string) {
  const [y, m] = month.split('-')
  return new Date(+y, +m - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' })
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">{label && fmt(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
      {payload[0]?.value > 0 && payload[1]?.value > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-muted-foreground">Rate: </span>
          <span className="font-bold text-foreground">
            {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}

export default function TimeSeriesChart({ data, loading }: TimeSeriesChartProps) {
  const [threshold, setThreshold] = useState(20)
  useEffect(() => { setThreshold(readComplicationThreshold()) }, [])

  // Epi-threshold overlay: complications expected at the WHO/benchmark rate.
  // Complications plotted above this line are above the acceptable benchmark.
  const chartData = data.map((d) => ({ ...d, threshold: Math.round((d.cases * threshold) / 100) }))

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Case & Complication Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly PAC surveillance · WHO benchmark overlay</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />Cases</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Complications</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded-full bg-amber-500" style={{ borderTop: '2px dashed' }} />{threshold}% benchmark</span>
        </div>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">No data for selected filters</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tickFormatter={fmt} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cases" name="Total Cases" stroke="#3b82f6" strokeWidth={2} fill="url(#gradCases)" dot={false} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="complications" name="Complications" stroke="#ef4444" strokeWidth={2} fill="url(#gradComps)" dot={false} activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="threshold" name={`WHO benchmark (${threshold}%)`} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
