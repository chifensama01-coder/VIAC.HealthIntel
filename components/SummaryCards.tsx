'use client'

import { Activity, AlertCircle, Users, Building2, ArrowUp, ArrowDown, ArrowRightLeft, Info } from 'lucide-react'
import type { DashboardSummary } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/lib/useCountUp'

interface SummaryCardsProps {
  summary: DashboardSummary
  loading?: boolean
}

const METRICS = [
  {
    key: 'totalCases' as const,
    label: 'Total PAC Cases',
    icon: Activity,
    iconColor: 'text-blue-500',
    glowColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    format: (v: number) => Math.round(v).toLocaleString(),
    sub: 'Active surveillance period',
    changeKey: 'cases' as const,
    tooltip: 'Total post-abortion care cases recorded across all reporting facilities in the selected period',
  },
  {
    key: 'complicationRate' as const,
    label: 'Complication Rate',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    glowColor: 'bg-red-500',
    iconBg: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    format: (v: number) => `${v.toFixed(1)}%`,
    sub: 'Overall · WHO threshold 20%',
    changeKey: 'complications' as const,
    threshold: 20,
    thresholdLabel: '20% threshold',
    tooltip: 'Percentage of PAC cases presenting with serious complications. WHO target is ≤20%',
  },
  {
    key: 'adolescentRate' as const,
    label: 'Adolescent Rate',
    icon: Users,
    iconColor: 'text-amber-500',
    glowColor: 'bg-amber-500',
    iconBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    format: (v: number) => `${v.toFixed(1)}%`,
    sub: 'Ages 10–19 of total cases',
    changeKey: 'adolescent' as const,
    tooltip: 'Share of cases among adolescents aged 10–19. High rates signal need for youth-focused services',
  },
  {
    key: 'referralRate' as const,
    label: 'Referral Rate',
    icon: ArrowRightLeft,
    iconColor: 'text-purple-500',
    glowColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    format: (v: number) => `${v.toFixed(1)}%`,
    sub: 'Cases requiring higher-level care',
    tooltip: 'Percentage of cases referred to a higher-level facility, indicating severity or capacity gaps',
  },
  {
    key: 'facilitiesReporting' as const,
    label: 'Active Facilities',
    icon: Building2,
    iconColor: 'text-emerald-500',
    glowColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    format: (v: number) => Math.round(v).toString(),
    sub: 'Reporting to surveillance system',
    tooltip: 'Number of health facilities actively submitting data to the surveillance platform',
  },
]

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-28 rounded" />
        <div className="skeleton h-9 w-9 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-3 w-36 rounded" />
    </div>
  )
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {METRICS.map((m) => <SkeletonCard key={m.key} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {METRICS.map((m) => {
        const value = summary[m.key] as number
        const change = m.changeKey ? summary.changeVsPriorPeriod?.[m.changeKey as keyof typeof summary.changeVsPriorPeriod] : undefined
        return <MetricCard key={m.key} metric={m} value={value} change={change} />
      })}
    </div>
  )
}

function MetricCard({ metric, value, change }: { metric: typeof METRICS[number]; value: number; change?: number }) {
  const { label, icon: Icon, iconColor, glowColor, iconBg, borderColor, format, sub, tooltip } = metric
  const threshold = 'threshold' in metric ? metric.threshold : undefined
  const thresholdLabel = 'thresholdLabel' in metric ? metric.thresholdLabel : undefined
  const animated = useCountUp(value)
  const isOver = threshold != null && value > threshold
  const displayColor = isOver ? 'text-red-500' : iconColor

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        borderColor
      )}
    >
      <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.06] transition-transform duration-300 group-hover:scale-150', glowColor)} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1">
          <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
          {tooltip && (
            <div className="group/tip relative hidden sm:block">
              <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              <div className="pointer-events-none absolute left-4 top-0 z-50 w-48 rounded-lg border bg-popover p-2.5 text-[11px] text-popover-foreground shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className={cn('text-3xl font-bold tracking-tight tabular-nums', displayColor)}>
          {format(animated)}
        </span>
        {change != null && (
          <div className={cn(
            'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
            change > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
          )}>
            {change > 0 ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
            {Math.abs(change).toFixed(0)}%
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>

      {threshold != null && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{thresholdLabel}</span>
            <span className={cn('text-[10px] font-medium', isOver ? 'text-red-500' : 'text-emerald-500')}>
              {isOver ? 'Over threshold' : 'Within target'}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', isOver ? 'bg-red-500' : 'bg-emerald-500')}
              style={{ width: `${Math.min(100, (value / (threshold * 1.5)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
