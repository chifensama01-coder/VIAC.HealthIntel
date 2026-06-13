'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar,
} from 'recharts'
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Info, TrendingUp, TrendingDown,
  Users, Building2, Map, Brain, Target, Activity, ChevronRight
} from 'lucide-react'
import { DISTRICTS } from '@/lib/types'
import type { DistrictIntelligence } from '@/lib/types'
import { districtStory } from '@/lib/intelligence'
import { cn } from '@/lib/utils'

const RISK_COLORS = { critical: '#ef4444', high: '#f59e0b', moderate: '#3b82f6', low: '#10b981' }
const STATUS_COLORS = { critical: '#ef4444', warning: '#f59e0b', normal: '#10b981' }
const AGE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

function StatCard({ label, value, sub, color = 'text-foreground', icon: Icon }: any) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function DistrictStoryCard({ overview, district }: { overview: DistrictIntelligence['overview']; district: string }) {
  const story = districtStory({
    district,
    totalCases: overview.totalCases,
    complicationRate: overview.complicationRate,
    adolescentRate: overview.adolescentRate,
    referralRate: overview.referralRate,
    riskLevel: overview.riskLevel,
    riskScore: overview.riskScore,
  })
  const blocks = [
    { label: 'Major risks', items: story.risks, color: 'text-red-500', dot: 'bg-red-500' },
    { label: 'Emerging trends', items: story.trends, color: 'text-amber-500', dot: 'bg-amber-500' },
    { label: 'Recommended interventions', items: story.interventions, color: 'text-emerald-500', dot: 'bg-emerald-500' },
  ]
  return (
    <div className="rounded-xl border border-primary/20 bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">District Story</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Narrative intelligence</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{story.situation}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {blocks.map((b) => (
          <div key={b.label}>
            <p className={cn('text-[11px] font-semibold uppercase tracking-wide', b.color)}>{b.label}</p>
            <ul className="mt-1.5 space-y-1">
              {b.items.map((it, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/90">
                  <span className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', b.dot)} />{it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-500 border-red-500/30',
    high: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    moderate: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize', colors[level] ?? colors.moderate)}>
      {level}
    </span>
  )
}

export default function DistrictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const district = decodeURIComponent(id)
  const [data, setData] = useState<DistrictIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'facilities' | 'insights'>('overview')

  useEffect(() => {
    if (!(DISTRICTS as readonly string[]).includes(district)) {
      router.push('/dashboard')
      return
    }
    fetch(`/api/districts/${encodeURIComponent(district)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [district, router])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading intelligence report...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { overview, demographics, facilities, trends, aiSummary, keyFindings, riskIndicators, recommendations } = data

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ] as const

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground hover:bg-accent hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{district}</h1>
              <RiskBadge level={overview.riskLevel} />
            </div>
            <p className="text-sm text-muted-foreground">District Intelligence Report · Southwest Region, Cameroon</p>
          </div>
        </div>
        {/* District switcher */}
        <div className="hidden sm:flex items-center gap-1">
          {DISTRICTS.map((d) => (
            <Link key={d} href={`/dashboard/districts/${d}`}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition',
                d === district ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}>
              {d}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Total Cases" value={overview.totalCases.toLocaleString()} icon={Activity} />
        <StatCard label="Complication Rate" value={`${overview.complicationRate.toFixed(1)}%`}
          color={overview.complicationRate > 25 ? 'text-red-500' : overview.complicationRate > 20 ? 'text-amber-500' : 'text-emerald-500'} />
        <StatCard label="Adolescent Rate" value={`${overview.adolescentRate.toFixed(0)}%`}
          color={overview.adolescentRate > 35 ? 'text-red-500' : 'text-amber-500'} />
        <StatCard label="Referral Rate" value={`${overview.referralRate.toFixed(1)}%`} />
        <StatCard label="Facilities" value={overview.facilitiesReporting.toString()} icon={Building2} />
        <StatCard label="Risk Score" value={`${overview.riskScore}/100`}
          color={overview.riskScore > 60 ? 'text-red-500' : overview.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
              activeTab === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}>
            <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
        <DistrictStoryCard overview={overview} district={district} />
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Trend chart */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gcases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(m) => m.slice(5)} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="cases" name="Cases" stroke="#3b82f6" strokeWidth={2} fill="url(#gcases)" dot={false} />
                <Area type="monotone" dataKey="complications" name="Complications" stroke="#ef4444" strokeWidth={2} fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk indicators */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Risk Indicators</h3>
            <div className="space-y-3">
              {riskIndicators.map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{r.label}</span>
                    <div className="flex items-center gap-2">
                      {r.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-red-500" /> : r.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> : null}
                      <span className="text-xs font-bold" style={{ color: STATUS_COLORS[r.status] }}>
                        {r.value.toFixed(1)}{r.label.includes('Rate') || r.label.includes('Share') || r.label.includes('Compliance') ? '%' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (r.value / (r.threshold * 1.5)) * 100)}%`, background: STATUS_COLORS[r.status] }} />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Threshold: {r.threshold}{r.label.includes('Rate') || r.label.includes('Share') || r.label.includes('Compliance') ? '%' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'demographics' && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* By age */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Cases by Age Group</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demographics.byAge} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="group" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="cases" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {demographics.byAge.map((_, i) => <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By wealth */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Complication Rate by Wealth Quintile</h3>
            <div className="space-y-3">
              {demographics.byWealth.map((w) => (
                <div key={w.quintile}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{w.label}</span>
                    <span className="text-xs font-bold text-foreground">{w.rate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500" style={{ width: `${Math.min(100, w.rate / 0.4)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Displaced */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Displaced Persons</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f59e0b" strokeWidth="3"
                    strokeDasharray={`${demographics.displaced.pct} ${100 - demographics.displaced.pct}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-foreground">{demographics.displaced.pct.toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">{demographics.displaced.count}</p>
                <p className="text-sm text-muted-foreground">Displaced cases</p>
                <p className="text-xs text-muted-foreground mt-1">Higher barrier to care access</p>
              </div>
            </div>
          </div>

          {/* By education */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Cases by Education Level</h3>
            <div className="space-y-3">
              {demographics.byEducation.map((e) => (
                <div key={e.level} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-muted-foreground shrink-0">{e.level}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (e.cases / overview.totalCases) * 100 * 3)}%` }} />
                  </div>
                  <span className="text-xs font-medium text-foreground w-10 text-right">{e.cases}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'facilities' && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="border-b px-5 py-3">
            <h3 className="text-sm font-semibold">Facility Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Facility</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Cases</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Comp. Rate</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Reporting</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {facilities.map((f) => (
                  <tr key={f.name} className="hover:bg-muted/20">
                    <td className="px-5 py-3 font-medium text-foreground">{f.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 capitalize">{f.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">{f.cases.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('font-semibold', f.complicationRate > 25 ? 'text-red-500' : f.complicationRate > 20 ? 'text-amber-500' : 'text-emerald-500')}>
                        {f.complicationRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${f.reportingCompliance}%` }} />
                        </div>
                        <span className="text-foreground">{f.reportingCompliance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('font-bold', f.score > 70 ? 'text-emerald-500' : f.score > 50 ? 'text-amber-500' : 'text-red-500')}>
                        {f.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* AI Summary */}
          <div className="lg:col-span-2 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">AI-Generated Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
          </div>

          {/* Key findings */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Key Findings</h3>
            <div className="space-y-2.5">
              {keyFindings.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</div>
                  <p className="text-sm text-muted-foreground">{f}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Recommendations</h3>
            <div className="space-y-2.5">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-sm text-muted-foreground">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
