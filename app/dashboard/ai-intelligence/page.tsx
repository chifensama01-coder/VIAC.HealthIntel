'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Bot, TrendingUp, ShieldAlert, HelpCircle, MapPin, Sparkles, ArrowUpRight,
} from 'lucide-react'
import {
  TOP_AI_QUESTIONS, MISINFORMATION, KNOWLEDGE_GAPS, searchTimeline,
} from '@/lib/intelligence'
import { cn } from '@/lib/utils'

const RISK_CLS = {
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  moderate: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
} as const

const GAP_CLS = {
  underserved: 'text-red-500 bg-red-500/10',
  partial: 'text-amber-500 bg-amber-500/10',
  covered: 'text-emerald-500 bg-emerald-500/10',
} as const

export default function AIIntelligencePage() {
  const timeline = searchTimeline()
  const fmtMonth = (m: string) => { const [y, mm] = m.split('-'); return new Date(+y, +mm - 1).toLocaleDateString('en', { month: 'short' }) }

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">AI Intelligence Center</h1>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-500">Forward capability</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 max-w-3xl">
          Monitoring how communities use AI assistants to seek reproductive-health information — surfacing demand,
          emerging concerns, and dangerous misconceptions before they reach the clinic.
        </p>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Health-Question Interest</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Indexed volume across AI assistants · 12 months</p>
          </div>
          <Sparkles className="h-4 w-4 text-violet-500" />
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tickFormatter={fmtMonth} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} labelFormatter={(l) => fmtMonth(String(l))} />
              <Area type="monotone" dataKey="interest" name="Interest index" stroke="#8b5cf6" strokeWidth={2} fill="url(#aiGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Top AI questions */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Top Questions Asked to AI</h2>
          </div>
          <div className="divide-y">
            {TOP_AI_QUESTIONS.map((q, i) => (
              <div key={q.question} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{q.question}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{q.concentration}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground tabular-nums">{q.frequency.toLocaleString()}</p>
                  <p className="flex items-center justify-end gap-0.5 text-[11px] font-medium text-emerald-500"><ArrowUpRight className="h-3 w-3" />{q.growth}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge gaps */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Knowledge Gaps</h2>
          </div>
          <div className="divide-y">
            {KNOWLEDGE_GAPS.map((g) => (
              <div key={g.topic} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{g.topic}</p>
                  <p className="text-[11px] text-muted-foreground">{g.repeatedQueries.toLocaleString()} repeated queries</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize', GAP_CLS[g.status])}>{g.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Misinformation monitor */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-semibold text-foreground">Misinformation Monitor</h2>
          <span className="ml-auto text-xs text-muted-foreground">Detected misconceptions & recommended responses</span>
        </div>
        <div className="divide-y">
          {MISINFORMATION.map((m) => (
            <div key={m.claim} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', RISK_CLS[m.risk])}>{m.risk}</span>
                    <span className="text-[11px] text-muted-foreground">{m.prevalence}% prevalence</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">“{m.claim}”</p>
                  <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">Reality:</span> {m.reality}</p>
                </div>
                <div className="hidden w-28 shrink-0 sm:block">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={cn('h-full rounded-full', m.risk === 'critical' ? 'bg-red-500' : m.risk === 'high' ? 'bg-amber-500' : 'bg-blue-500')} style={{ width: `${m.prevalence}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="text-xs text-foreground/90"><span className="font-semibold text-primary">Recommended response: </span>{m.response}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        AI knowledge monitoring uses anonymised, aggregate patterns only — no individual queries or identities are
        collected. This is a forward capability stream, weighted accordingly in the intelligence model.
      </p>
    </div>
  )
}
