'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Radio, MessageCircleQuestion, Flame, ArrowUpRight, MapPin } from 'lucide-react'
import type { DigitalTracePoint } from '@/lib/types'
import { TRENDING_QUESTIONS, EMERGING_TOPICS } from '@/lib/intelligence'
import { cn } from '@/lib/utils'

interface DigitalTraceWidgetProps {
  data: DigitalTracePoint[]
  loading?: boolean
}

type SignalTab = 'signals' | 'questions' | 'topics'

function sentimentLabel(v: number) {
  if (v > 0.2) return 'Positive'
  if (v > 0.05) return 'Slightly positive'
  if (v > -0.05) return 'Neutral'
  if (v > -0.2) return 'Slightly negative'
  return 'Negative'
}

function sentimentColor(v: number) {
  if (v > 0.1) return 'text-emerald-500'
  if (v < -0.1) return 'text-red-500'
  return 'text-muted-foreground'
}

const BAR_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: DigitalTracePoint = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.district}</p>
      <p className="text-muted-foreground">Search Index: <span className="font-bold text-foreground">{d.searchVolume}/100</span></p>
      <p className={cn('mt-1', sentimentColor(d.sentiment))}>
        Sentiment: {sentimentLabel(d.sentiment)} ({d.sentiment > 0 ? '+' : ''}{d.sentiment.toFixed(2)})
      </p>
      {d.topTopic && <p className="mt-1 text-muted-foreground">Top topic: <span className="font-medium text-foreground">{d.topTopic}</span></p>}
    </div>
  )
}

const TABS: { id: SignalTab; label: string; icon: any }[] = [
  { id: 'signals', label: 'Signals', icon: Radio },
  { id: 'questions', label: 'Questions', icon: MessageCircleQuestion },
  { id: 'topics', label: 'Topics', icon: Flame },
]

const TREND_STYLE = { rising: 'text-red-500', stable: 'text-muted-foreground', falling: 'text-emerald-500' } as const
const SEV_STYLE = { high: 'text-red-500 bg-red-500/10', medium: 'text-amber-500 bg-amber-500/10', low: 'text-blue-500 bg-blue-500/10' } as const

export default function DigitalTraceWidget({ data, loading }: DigitalTraceWidgetProps) {
  const avgSentiment = data.length ? data.reduce((s, d) => s + d.sentiment, 0) / data.length : 0
  const [tab, setTab] = useState<SignalTab>('signals')

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-start justify-between border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Digital Health Signals</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Information-seeking intelligence by district</p>
          </div>
        </div>
        {!loading && data.length > 0 && tab === 'signals' && (
          <div className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
            avgSentiment > 0 ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' :
            avgSentiment < -0.05 ? 'border-red-500/20 bg-red-500/10 text-red-500' :
            'border-border bg-muted/50 text-muted-foreground'
          )}>
            {avgSentiment > 0.05 ? <TrendingUp className="h-3 w-3" /> :
             avgSentiment < -0.05 ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {sentimentLabel(avgSentiment)}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b px-3 py-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
              tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Trending questions */}
      {tab === 'questions' && (
        <div className="divide-y">
          {TRENDING_QUESTIONS.map((q) => (
            <div key={q.question} className="flex items-center gap-3 px-5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{q.question}</p>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-2.5 w-2.5" />{q.district} · {q.volume.toLocaleString()} searches</p>
              </div>
              <span className={cn('flex items-center gap-0.5 text-xs font-semibold', TREND_STYLE[q.trend])}>
                {q.growth > 0 ? '+' : ''}{q.growth}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Emerging topics */}
      {tab === 'topics' && (
        <div className="space-y-2 p-4">
          {EMERGING_TOPICS.map((t) => (
            <div key={t.topic} className="flex items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2.5">
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', SEV_STYLE[t.severity])}>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">{t.topic}</p>
                <p className="text-[10px] text-muted-foreground">{t.district} · {t.severity} priority</p>
              </div>
              <span className="text-sm font-bold text-red-500">↑ {t.growth}%</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'signals' && (
      <div className="p-5">
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-52 items-center justify-center">
            <p className="text-sm text-muted-foreground">No data for selected filters</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="district" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="searchVolume" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.map((d, i) => (
                <div key={d.district} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />
                    <span className="text-xs font-medium text-foreground">{d.district}</span>
                  </div>
                  <span className={cn('text-xs font-semibold', sentimentColor(d.sentiment))}>
                    {d.sentiment > 0 ? '+' : ''}{d.sentiment.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      )}
    </div>
  )
}
