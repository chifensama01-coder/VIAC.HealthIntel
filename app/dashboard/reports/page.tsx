'use client'

import { useState } from 'react'
import {
  FileText, Download, FileSpreadsheet, Map as MapIcon, Globe,
  CheckCircle2, Loader2, Brain, BarChart2, Printer
} from 'lucide-react'
import { DISTRICTS } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  openPrintReport, downloadCSV, downloadExcel, downloadGeoJSON, type ReportMeta,
} from '@/lib/report'
import toast from 'react-hot-toast'

type ExportFormat = 'pdf' | 'csv' | 'excel' | 'geojson'

interface ReportConfig {
  title: string
  district: string
  period: string
  includeMap: boolean
  includeKPIs: boolean
  includeInsights: boolean
  includeForecast: boolean
  format: ExportFormat
}

const FORMAT_OPTS: { value: ExportFormat; label: string; icon: any; desc: string }[] = [
  { value: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: 'Raw data for Excel / R / STATA' },
  { value: 'pdf', label: 'PDF', icon: FileText, desc: 'Executive report (A4 format)' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, desc: 'Multi-sheet workbook' },
  { value: 'geojson', label: 'GeoJSON', icon: Globe, desc: 'Geographic data for GIS tools' },
]

function ToggleCard({ label, desc, enabled, onChange, icon: Icon }: any) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
        enabled ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:border-primary/30'
      )}>
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
        enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className={cn('ml-auto mt-1 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition',
        enabled ? 'border-primary bg-primary' : 'border-muted-foreground')}>
        {enabled && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
      </div>
    </button>
  )
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<ReportConfig>({
    title: 'PAC Surveillance Report',
    district: 'All Districts',
    period: 'last_90',
    includeMap: true,
    includeKPIs: true,
    includeInsights: true,
    includeForecast: false,
    format: 'pdf',
  })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<string | null>(null)

  async function generateReport() {
    setGenerating(true)
    setGenerated(null)
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))

    const meta: ReportMeta = {
      title: config.title,
      district: config.district,
      period: config.period,
      includeKPIs: config.includeKPIs,
      includeMap: config.includeMap,
      includeInsights: config.includeInsights,
      includeForecast: config.includeForecast,
      author: user?.name,
    }

    try {
      if (config.format === 'pdf') {
        const ok = openPrintReport(meta)
        setGenerated(ok
          ? 'Report opened in a new tab — use “Save as PDF” or print from the dialog.'
          : 'Pop-up blocked. Please allow pop-ups for this site, then try again.')
        if (!ok) toast.error('Allow pop-ups to open the PDF')
      } else if (config.format === 'csv') {
        downloadCSV(meta)
        setGenerated('CSV exported successfully.')
      } else if (config.format === 'excel') {
        downloadExcel(meta)
        setGenerated('Excel workbook exported successfully.')
      } else {
        downloadGeoJSON(meta)
        setGenerated('GeoJSON exported successfully.')
      }
    } catch {
      setGenerated('Something went wrong generating the report. Please try again.')
    }

    setGenerating(false)
  }

  const PERIOD_OPTS = [
    { value: 'last_30', label: 'Last 30 days' },
    { value: 'last_90', label: 'Last 90 days' },
    { value: 'last_180', label: 'Last 6 months' },
    { value: 'last_365', label: 'Last 12 months' },
  ]

  return (
    <div className="p-5 lg:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Reports & Export Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Generate and download surveillance reports in multiple formats</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Config panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic config */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Report Configuration</h3>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Report Title</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">District</label>
                <select
                  value={config.district}
                  onChange={(e) => setConfig((c) => ({ ...c, district: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>All Districts</option>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">Time Period</label>
                <select
                  value={config.period}
                  onChange={(e) => setConfig((c) => ({ ...c, period: e.target.value }))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PERIOD_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content toggles */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Include in Report</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <ToggleCard label="KPI Summary" desc="Total cases, rates, and trends" icon={BarChart2} enabled={config.includeKPIs} onChange={(v: boolean) => setConfig((c) => ({ ...c, includeKPIs: v }))} />
              <ToggleCard label="Geographic Map" desc="Choropleth map with district data" icon={MapIcon} enabled={config.includeMap} onChange={(v: boolean) => setConfig((c) => ({ ...c, includeMap: v }))} />
              <ToggleCard label="AI Insights" desc="AI-generated findings and recommendations" icon={Brain} enabled={config.includeInsights} onChange={(v: boolean) => setConfig((c) => ({ ...c, includeInsights: v }))} />
              <ToggleCard label="Forecast Data" desc="6-month predictive analytics" icon={BarChart2} enabled={config.includeForecast} onChange={(v: boolean) => setConfig((c) => ({ ...c, includeForecast: v }))} />
            </div>
          </div>

          {/* Format */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Export Format</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORMAT_OPTS.map((f) => {
                const Icon = f.icon
                return (
                  <button key={f.value} onClick={() => setConfig((c) => ({ ...c, format: f.value }))}
                    className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
                      config.format === f.value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                    )}>
                    <Icon className={cn('h-6 w-6', config.format === f.value ? 'text-primary' : 'text-muted-foreground')} />
                    <span className="text-sm font-semibold text-foreground">{f.label}</span>
                    <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Generate panel */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Report Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium text-foreground text-right max-w-[60%] truncate">{config.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">District</span>
                <span className="font-medium text-foreground">{config.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period</span>
                <span className="font-medium text-foreground">{PERIOD_OPTS.find((p) => p.value === config.period)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground">{FORMAT_OPTS.find((f) => f.value === config.format)?.label}</span>
              </div>
              <div className="border-t border-border mt-3 pt-3">
                <span className="text-xs text-muted-foreground">Sections included:</span>
                <div className="mt-1 space-y-1">
                  {config.includeKPIs && <div className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />KPI Summary</div>}
                  {config.includeMap && <div className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Geographic Map</div>}
                  {config.includeInsights && <div className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />AI Insights</div>}
                  {config.includeForecast && <div className="flex items-center gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Forecast Data</div>}
                </div>
              </div>
            </div>

            <button
              onClick={generateReport}
              disabled={generating}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : config.format === 'pdf' ? (
                <><Printer className="h-4 w-4" /> Generate &amp; Print / Save PDF</>
              ) : (
                <><Download className="h-4 w-4" /> Generate &amp; Download</>
              )}
            </button>

            {generated && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-500">{generated}</p>
              </div>
            )}
          </div>

          {/* Saved reports placeholder */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Recent Reports</h3>
            <div className="space-y-2">
              {[
                { name: 'Q1 2026 Regional Summary', date: '2026-04-01', format: 'PDF' as const, district: 'All Districts' },
                { name: 'Buea District Report', date: '2026-03-15', format: 'PDF' as const, district: 'Buea' },
                { name: 'Raw Surveillance Data', date: '2026-03-01', format: 'CSV' as const, district: 'All Districts' },
              ].map((r) => (
                <button key={r.name}
                  onClick={() => {
                    const meta: ReportMeta = {
                      title: r.name, district: r.district, period: 'last_90',
                      includeKPIs: true, includeMap: true, includeInsights: true, includeForecast: false,
                      author: user?.name,
                    }
                    if (r.format === 'CSV') downloadCSV(meta)
                    else openPrintReport(meta)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition hover:border-primary/40 hover:bg-accent/30">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.date} · {r.format}</p>
                  </div>
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
