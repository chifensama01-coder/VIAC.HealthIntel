'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Info, Lightbulb, X, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react'
import type { AIInsight } from '@/lib/types'
import { evidenceFor } from '@/lib/intelligence'
import { cn } from '@/lib/utils'

interface AIInsightsPanelProps {
  insights: AIInsight[]
  loading?: boolean
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'bg-red-500/10 text-red-500' },
  high:     { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-500' },
  medium:   { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-500' },
  low:      { icon: Info, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', badge: 'bg-slate-500/10 text-slate-500' },
  positive: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-500' },
}

const TYPE_ICONS = {
  finding: Brain,
  risk: AlertTriangle,
  trend: TrendingUp,
  recommendation: Lightbulb,
}

function recommendationFor(insight: AIInsight): string {
  switch (insight.type) {
    case 'risk':
      return `Prioritise ${insight.district ?? 'this district'} for a rapid response: deploy supervisory support, verify commodity stocks, and review recent complication cases for preventable factors.`
    case 'trend':
      return 'Convene a data-review meeting with facility focal points, audit care protocols against WHO PAC standards, and track the indicator weekly until it returns within target.'
    case 'recommendation':
      return 'Translate this into a costed action: assign an owner, set a 30/60/90-day target, and add it to the regional surveillance work-plan.'
    default:
      return 'Validate the signal against case-level records, then brief the regional health team so it can be factored into the next planning cycle.'
  }
}

function SkeletonInsight() {
  return (
    <div className="space-y-2 p-3 rounded-lg border border-border">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-3 w-4/5 rounded" />
      <div className="skeleton h-3 w-3/5 rounded" />
    </div>
  )
}

export function AIInsightsPanel({ insights, loading }: AIInsightsPanelProps) {
  const [selected, setSelected] = useState<AIInsight | null>(null)

  return (
    <>
      <div className="flex flex-col h-full rounded-xl border bg-card overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Insight Engine</h3>
            <p className="text-[10px] text-muted-foreground">Auto-generated from surveillance data</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-live-dot" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonInsight key={i} />)
          ) : insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No insights available</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Apply filters to analyze data</p>
            </div>
          ) : (
            insights.map((insight) => {
              const severityConfig = SEVERITY_CONFIG[insight.severity]
              const TypeIcon = TYPE_ICONS[insight.type]
              const SeverityIcon = severityConfig.icon

              return (
                <button
                  key={insight.id}
                  onClick={() => setSelected(insight)}
                  className={cn(
                    'w-full text-left rounded-lg border p-3 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring',
                    severityConfig.border, severityConfig.bg
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn('mt-0.5 shrink-0 rounded-md p-1', severityConfig.bg)}>
                      <SeverityIcon className={cn('h-3 w-3', severityConfig.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide', severityConfig.badge)}>
                          {insight.severity}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">{insight.type}</span>
                        {insight.district && (
                          <span className="text-[10px] font-medium text-foreground/70">· {insight.district}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-snug mb-1">{insight.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{insight.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {insight.value != null ? (
                          <div className="flex items-center gap-1">
                            <TypeIcon className={cn('h-3 w-3', severityConfig.color)} />
                            <span className={cn('text-xs font-bold', severityConfig.color)}>
                              {insight.value.toFixed(1)}{insight.metric?.includes('Rate') ? '%' : ''}
                            </span>
                          </div>
                        ) : <span />}
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
                          Details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="shrink-0 border-t px-4 py-2.5 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            {loading ? 'Analyzing…' : `Insights generated from ${insights.length} analytical findings · tap any card for detail`}
          </p>
        </div>
      </div>

      {selected && <InsightModal insight={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function InsightModal({ insight, onClose }: { insight: AIInsight; onClose: () => void }) {
  const router = useRouter()
  const cfg = SEVERITY_CONFIG[insight.severity]
  const SeverityIcon = cfg.icon
  const [showEvidence, setShowEvidence] = useState(false)
  const ev = evidenceFor(insight.id, insight.severity)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-card shadow-2xl animate-fade-in">
        <div className={cn('flex items-start gap-3 rounded-t-2xl border-b p-5', cfg.bg)}>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card', cfg.border, 'border')}>
            <SeverityIcon className={cn('h-5 w-5', cfg.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', cfg.badge)}>
                {insight.severity}
              </span>
              <span className="text-xs capitalize text-muted-foreground">{insight.type}</span>
              {insight.district && <span className="text-xs font-medium text-foreground">· {insight.district}</span>}
            </div>
            <h3 className="mt-1.5 text-base font-bold text-foreground leading-snug">{insight.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-background/50 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">{insight.description}</p>

          {(insight.value != null || insight.metric) && (
            <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
              {insight.value != null && (
                <div>
                  <div className={cn('text-2xl font-bold tabular-nums', cfg.color)}>
                    {insight.value.toFixed(1)}{insight.metric?.includes('Rate') ? '%' : ''}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{insight.metric ?? 'Key metric'}</div>
                </div>
              )}
              {insight.change != null && (
                <div>
                  <div className={cn('text-2xl font-bold tabular-nums', insight.change > 0 ? 'text-red-500' : 'text-emerald-500')}>
                    {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">vs prior period</div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Lightbulb className="h-3.5 w-3.5" /> Recommended action
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{recommendationFor(insight)}</p>
          </div>

          {/* Evidence & explainability */}
          <div className="rounded-xl border bg-muted/20">
            <button onClick={() => setShowEvidence((v) => !v)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground">View evidence</span>
              <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                {ev.confidence}% confidence
              </span>
              <ChevronDown className={cn('ml-auto h-4 w-4 text-muted-foreground transition-transform', showEvidence && 'rotate-180')} />
            </button>
            {showEvidence && (
              <div className="space-y-3 border-t px-4 py-3 animate-fade-in">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Generated from</p>
                  <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                    {ev.sources.map((s) => (
                      <li key={s} className="flex items-center gap-1.5 text-xs text-foreground/90">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Facilities</p>
                    <p className="font-semibold text-foreground">{ev.facilities} contributing</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Period analysed</p>
                    <p className="font-semibold text-foreground">{ev.period}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ev.confidence}%` }} />
                      </div>
                      <span className="font-semibold text-foreground">{ev.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Analytical method</p>
                  <p className="text-xs text-foreground/90">{ev.method}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t p-4">
          <span className="text-[10px] text-muted-foreground">
            Generated {new Date(insight.timestamp).toLocaleString()}
          </span>
          <div className="flex gap-2">
            {insight.district && (
              <button
                onClick={() => { onClose(); router.push(`/dashboard/districts/${insight.district}`) }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Open district report <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
