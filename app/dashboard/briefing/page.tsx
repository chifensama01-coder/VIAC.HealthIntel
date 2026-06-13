'use client'

import { useEffect, useState } from 'react'
import {
  ScrollText, Download, Printer, Share2, AlertTriangle, CheckCircle2,
  ArrowRight, Activity, HelpCircle, Lightbulb, PieChart, TrendingUp, TrendingDown, Loader2,
} from 'lucide-react'
import { generateBriefing, type ExecutiveBriefing } from '@/lib/intelligence'
import { DISTRICTS, type ForecastData } from '@/lib/types'
import { openPrintBriefing } from '@/lib/report'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PRIORITY_CLS = {
  immediate: 'text-red-500 bg-red-500/10 border-red-500/20',
  high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  medium: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
} as const

export default function BriefingPage() {
  const [scope, setScope] = useState('All')
  const [brief, setBrief] = useState<ExecutiveBriefing | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    setBusy(true)
    // Pull the live 6-month forecast for the selected scope into the briefing.
    fetch(`/api/forecasting?district=${encodeURIComponent(scope)}&metric=cases`)
      .then((r) => r.json())
      .then((f: ForecastData) => {
        const lastActual = f.points?.filter((p) => !p.isProjection).at(-1)?.actual ?? 0
        const lastForecast = f.points?.filter((p) => p.isProjection).at(-1)?.forecast ?? 0
        const projectedChange = lastActual > 0 ? ((lastForecast - lastActual) / lastActual) * 100 : 0
        if (!active) return
        setBrief(generateBriefing({
          projectedChange,
          confidenceLevel: f.confidenceLevel ?? 85,
          riskScore: f.riskScore ?? 50,
          drivers: f.keyDrivers ?? [],
        }, scope))
      })
      .catch(() => { if (active) setBrief(generateBriefing(undefined, scope)) })
      .finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [scope])

  if (!brief) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Compiling executive briefing…</p>
        </div>
      </div>
    )
  }

  function downloadMarkdown(brief: ExecutiveBriefing) {
    const md = [
      `# Executive Briefing — ${brief.headline}`,
      `_Generated ${new Date(brief.generatedAt).toLocaleString()} · Vision in Action Cameroon · HealthIntel_\n`,
      `## Summary\n${brief.summary}\n`,
      `## Key Findings\n${brief.keyFindings.map((f) => `- ${f}`).join('\n')}\n`,
      `## Top Risks\n${brief.topRisks.map((r) => `- ${r.district} (${r.score}/100): ${r.reason}`).join('\n')}\n`,
      `## Recommended Actions\n${brief.actions.map((a) => `- [${a.priority.toUpperCase()}] ${a.action} — ${a.owner}`).join('\n')}\n`,
      `## Resource Allocation Priorities\n${brief.resourcePriorities.map((r) => `- ${r.district}: ${r.share}%`).join('\n')}`,
    ].join('\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `executive-briefing-${Date.now()}.md`
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    toast.success('Briefing downloaded')
  }

  async function share(brief: ExecutiveBriefing) {
    const text = `HealthIntel Executive Briefing — ${brief.headline}\n\n${brief.summary}`
    try {
      if (navigator.share) { await navigator.share({ title: 'HealthIntel Executive Briefing', text }); return }
      await navigator.clipboard.writeText(text)
      toast.success('Briefing summary copied to clipboard')
    } catch { /* user cancelled */ }
  }

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Executive Briefing</h1>
            {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Decision-ready intelligence · {scope === 'All' ? 'Southwest Region' : `${scope} district`} · Generated {new Date(brief.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadMarkdown(brief)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button onClick={() => openPrintBriefing(brief)} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent">
            <Printer className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button onClick={() => share(brief)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Scope selector */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">Scope:</span>
        {['All', ...DISTRICTS].map((d) => (
          <button key={d} onClick={() => setScope(d)}
            className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition',
              scope === d ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground')}>
            {d === 'All' ? 'All Districts' : d}
          </button>
        ))}
      </div>

      {/* Headline summary */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">At a glance · under 2 minutes</p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground">{brief.headline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{brief.summary}</p>
      </div>

      {/* What happened / why / what to do framing */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Activity, label: 'What happened', tone: 'text-blue-500 bg-blue-500/10', body: brief.keyFindings[0] },
          { icon: HelpCircle, label: 'Why it matters', tone: 'text-amber-500 bg-amber-500/10', body: brief.keyFindings[2] ?? brief.keyFindings[1] },
          { icon: Lightbulb, label: 'What to do', tone: 'text-emerald-500 bg-emerald-500/10', body: brief.actions[0].action + ' and ' + brief.actions[1].action.toLowerCase() + '.' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <div className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg', c.tone)}>
              <c.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-sm text-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Key findings */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Key Findings</h3>
          <div className="space-y-2.5">
            {brief.keyFindings.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</span>
                <p className="text-sm text-muted-foreground">{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top risks */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Top Risks</h3>
          <div className="space-y-2.5">
            {brief.topRisks.map((r) => (
              <div key={r.district} className="flex items-center gap-3 rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{r.district}</p>
                  <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                </div>
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">{r.score}/100</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6-month outlook — connected to the Forecasting module */}
      {brief.outlook && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            {brief.outlook.projectedChange >= 0
              ? <TrendingUp className="h-4 w-4 text-red-500" />
              : <TrendingDown className="h-4 w-4 text-emerald-500" />}
            <h3 className="text-sm font-semibold text-foreground">6-Month Outlook</h3>
            <span className="ml-auto text-[11px] text-muted-foreground">Live from Forecasting · horizon {brief.outlook.horizon}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className={cn('text-2xl font-bold tabular-nums', brief.outlook.projectedChange >= 0 ? 'text-red-500' : 'text-emerald-500')}>
                {brief.outlook.projectedChange > 0 ? '+' : ''}{brief.outlook.projectedChange.toFixed(1)}%
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Projected caseload change</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-2xl font-bold text-foreground tabular-nums">{brief.outlook.confidenceLevel}%</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Forecast confidence</p>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className={cn('text-2xl font-bold tabular-nums', brief.outlook.riskScore > 60 ? 'text-red-500' : brief.outlook.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500')}>
                {brief.outlook.riskScore}/100
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Projected risk score</p>
            </div>
          </div>
          {brief.outlook.drivers.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Key forecast drivers</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {brief.outlook.drivers.map((d) => (
                  <span key={d} className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-foreground/80">{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommended actions */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="border-b px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">Recommended Actions</h3>
        </div>
        <div className="divide-y">
          {brief.actions.map((a) => (
            <div key={a.action} className="flex items-center gap-3 px-5 py-3">
              <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', PRIORITY_CLS[a.priority])}>{a.priority}</span>
              <p className="min-w-0 flex-1 text-sm text-foreground">{a.action}</p>
              <span className="hidden text-xs text-muted-foreground sm:block">{a.owner}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Resource allocation */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Resource Allocation Priorities</h3>
        </div>
        <div className="space-y-3">
          {brief.resourcePriorities.map((r) => (
            <div key={r.district}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{r.district}</span>
                <span className="text-xs font-bold text-primary">{r.share}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(var(--brand-gold))] transition-all duration-700" style={{ width: `${r.share}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Suggested weighting by composite risk score — adjust against operational constraints.
        </p>
      </div>

      {/* Methodology & limitations — trust disclosure */}
      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <p className="text-xs font-semibold text-foreground">Methodology &amp; limitations</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          This briefing is generated automatically by triangulating facility surveillance, referral and hotline
          records, historical baselines, digital signals and WHO/DHS reference indicators. The complication rate is
          case-weighted; risk scores are composite indices. Findings should be validated against source registers
          before operational decisions. Confidence and source provenance for any insight are available via
          <span className="text-foreground/80"> Data Sources</span> and each insight&apos;s
          <span className="text-foreground/80"> View Evidence</span> panel.
        </p>
      </div>
    </div>
  )
}
