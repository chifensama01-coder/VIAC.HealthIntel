'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { GitCompareArrows, ArrowLeftRight, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { DISTRICTS, type DistrictIntelligence } from '@/lib/types'
import { cn } from '@/lib/utils'

type Intel = DistrictIntelligence

const METRICS: {
  key: keyof Intel['overview']
  label: string
  fmt: (v: number) => string
  lowerIsBetter: boolean
  hint: string
}[] = [
  { key: 'totalCases', label: 'Total PAC Cases', fmt: (v) => v.toLocaleString(), lowerIsBetter: false, hint: 'Caseload volume' },
  { key: 'complicationRate', label: 'Complication Rate', fmt: (v) => `${v.toFixed(1)}%`, lowerIsBetter: true, hint: 'Lower is better · WHO ≤20%' },
  { key: 'adolescentRate', label: 'Adolescent Share', fmt: (v) => `${v.toFixed(1)}%`, lowerIsBetter: true, hint: 'Ages 10–19' },
  { key: 'referralRate', label: 'Referral Rate', fmt: (v) => `${v.toFixed(1)}%`, lowerIsBetter: true, hint: 'Severity / capacity gaps' },
  { key: 'facilitiesReporting', label: 'Facilities Reporting', fmt: (v) => String(v), lowerIsBetter: false, hint: 'Coverage' },
  { key: 'riskScore', label: 'Risk Score', fmt: (v) => `${v}/100`, lowerIsBetter: true, hint: 'Composite risk' },
]

function DistrictSelect({ value, onChange, exclude }: { value: string; onChange: (v: string) => void; exclude?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      {DISTRICTS.map((d) => <option key={d} value={d} disabled={d === exclude}>{d}</option>)}
    </select>
  )
}

export default function ComparePage() {
  const [a, setA] = useState<string>('Buea')
  const [b, setB] = useState<string>('Limbe')
  const [dataA, setDataA] = useState<Intel | null>(null)
  const [dataB, setDataB] = useState<Intel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      fetch(`/api/districts/${encodeURIComponent(a)}`).then((r) => r.json()),
      fetch(`/api/districts/${encodeURIComponent(b)}`).then((r) => r.json()),
    ]).then(([ra, rb]) => {
      if (!active) return
      setDataA(ra); setDataB(rb)
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [a, b])

  function swap() { setA(b); setB(a) }

  const trend = useMemo(() => {
    if (!dataA?.trends || !dataB?.trends) return []
    return dataA.trends.map((p, i) => ({
      month: p.month,
      aCases: p.cases,
      bCases: dataB.trends[i]?.cases ?? 0,
      aComp: p.complications,
      bComp: dataB.trends[i]?.complications ?? 0,
    }))
  }, [dataA, dataB])

  const fmtMonth = (m: string) => { const [y, mm] = m.split('-'); return new Date(+y, +mm - 1).toLocaleDateString('en', { month: 'short' }) }

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GitCompareArrows className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">District Comparison</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Compare two districts side by side across key surveillance indicators.</p>
        </div>
        <Link href="/dashboard/districts" className="text-xs font-medium text-primary hover:underline">← All districts</Link>
      </div>

      {/* Selectors */}
      <div className="flex items-center justify-center gap-3 rounded-xl border bg-card p-4">
        <DistrictSelect value={a} onChange={setA} exclude={b} />
        <button onClick={swap} title="Swap"
          className="rounded-lg border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <DistrictSelect value={b} onChange={setB} exclude={a} />
      </div>

      {loading || !dataA || !dataB ? (
        <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metric comparison */}
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <div className="px-4 py-3">Indicator</div>
              <div className="px-4 py-3 text-center text-foreground">{a}</div>
              <div className="px-4 py-3 text-center text-foreground">{b}</div>
            </div>
            {METRICS.map((m) => {
              const va = dataA.overview[m.key] as number
              const vb = dataB.overview[m.key] as number
              const equal = va === vb
              const aWins = equal ? false : m.lowerIsBetter ? va < vb : va > vb
              const bWins = equal ? false : !aWins
              return (
                <div key={String(m.key)} className="grid grid-cols-[1.2fr_1fr_1fr] border-b last:border-0 items-center">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.hint}</p>
                  </div>
                  <Cell value={m.fmt(va)} win={aWins} />
                  <Cell value={m.fmt(vb)} win={bWins} />
                </div>
              )
            })}
          </div>

          {/* Verdict cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ d: a, intel: dataA }, { d: b, intel: dataB }].map(({ d, intel }) => {
              const lvl = intel.overview.riskLevel
              const color = lvl === 'critical' ? 'text-red-500' : lvl === 'high' ? 'text-amber-500' : lvl === 'moderate' ? 'text-blue-500' : 'text-emerald-500'
              const lowerRisk = intel.overview.riskScore <= (d === a ? dataB.overview.riskScore : dataA.overview.riskScore)
              return (
                <div key={d} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground">{d}</h3>
                    {lowerRisk && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                        <Trophy className="h-3 w-3" /> Lower risk
                      </span>
                    )}
                  </div>
                  <p className={cn('mt-1 text-xs font-semibold capitalize', color)}>{lvl} risk · {intel.overview.riskScore}/100</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4">{intel.aiSummary}</p>
                  <Link href={`/dashboard/districts/${d}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    Full report <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Trend overlay */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="border-b px-5 py-4">
              <h3 className="text-sm font-semibold text-foreground">Case Trends — {a} vs {b}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly PAC cases over the surveillance period</p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12 }}
                    labelFormatter={(l) => fmtMonth(String(l))}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="aCases" name={`${a} cases`} stroke="#2A9CE0" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="bCases" name={`${b} cases`} stroke="#C9881E" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Cell({ value, win }: { value: string; win: boolean }) {
  return (
    <div className="px-4 py-3 text-center">
      <span className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold',
        win ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'text-foreground')}>
        {value}
        {win && <Trophy className="h-3 w-3" />}
      </span>
    </div>
  )
}
