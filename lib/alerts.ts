import type { GeoDataPoint } from './types'

// ── Alert model ──────────────────────────────────────────────────────────────
export interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  category: 'Complication' | 'Adolescent' | 'Risk' | 'Coverage' | 'System'
  title: string
  message: string
  district?: string
  metric?: string
  value?: number
  threshold?: number
  ts: string // ISO
}

export interface AlertThresholds {
  complication: number // %
  adolescent: number   // % share of ages 10–19
  risk: number         // risk score 0–100
}

export const DEFAULT_THRESHOLDS: AlertThresholds = { complication: 20, adolescent: 30, risk: 60 }

const SETTINGS_KEY = 'healthintel_settings'
const READ_KEY = 'healthintel_read_alerts'

/** Read alert thresholds from the user's saved Platform Settings (with fallbacks). */
export function getThresholds(): AlertThresholds {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_THRESHOLDS
    const s = JSON.parse(raw)
    return {
      complication: Number(s.complicationThreshold) || DEFAULT_THRESHOLDS.complication,
      adolescent: Number(s.adolescentAlertThreshold) || DEFAULT_THRESHOLDS.adolescent,
      risk: DEFAULT_THRESHOLDS.risk,
    }
  } catch {
    return DEFAULT_THRESHOLDS
  }
}

// Deterministic "minutes ago" from an id, so timestamps feel stable across reloads.
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
function stamp(id: string, maxMinutes: number): string {
  const mins = hash(id) % maxMinutes
  return new Date(Date.now() - mins * 60_000).toISOString()
}

/** Derive the live alert feed from surveillance data + configured thresholds. */
export function computeAlerts(geo: GeoDataPoint[], t: AlertThresholds): Alert[] {
  const alerts: Alert[] = []

  for (const d of geo) {
    const adolescentShare = d.totalCases ? (d.adolescentCases / d.totalCases) * 100 : 0

    if (d.rate > t.complication) {
      const critical = d.rate > t.complication * 1.5
      const id = `comp-${d.district}`
      alerts.push({
        id,
        severity: critical ? 'critical' : 'warning',
        category: 'Complication',
        title: `${d.district}: complication rate ${d.rate.toFixed(1)}%`,
        message: `Above the ${t.complication}% threshold${critical ? ' by a wide margin — recommend immediate review of care protocols and facility supervision.' : '. Monitor closely and verify case records.'}`,
        district: d.district, metric: 'Complication Rate', value: d.rate, threshold: t.complication,
        ts: stamp(id, 180),
      })
    }

    if (adolescentShare > t.adolescent) {
      const id = `adol-${d.district}`
      alerts.push({
        id,
        severity: 'warning',
        category: 'Adolescent',
        title: `${d.district}: adolescents ${adolescentShare.toFixed(0)}% of cases`,
        message: `Adolescent (10–19) share exceeds the ${t.adolescent}% alert level — signals a gap in youth-focused reproductive health services.`,
        district: d.district, metric: 'Adolescent Share', value: adolescentShare, threshold: t.adolescent,
        ts: stamp(id, 360),
      })
    }

    if (d.riskScore > t.risk) {
      const id = `risk-${d.district}`
      alerts.push({
        id,
        severity: 'critical',
        category: 'Risk',
        title: `${d.district} flagged high-risk (${d.riskScore}/100)`,
        message: `Composite risk score is above ${t.risk}. Prioritise this district for a rapid response and resource pre-positioning.`,
        district: d.district, metric: 'Risk Score', value: d.riskScore, threshold: t.risk,
        ts: stamp(id, 240),
      })
    }
  }

  // Region-level signals
  const totalCases = geo.reduce((s, d) => s + d.totalCases, 0)
  if (totalCases > 0) {
    const regionRate = geo.reduce((s, d) => s + d.rate * d.totalCases, 0) / totalCases
    if (regionRate > t.complication) {
      const id = 'region-comp'
      alerts.push({
        id, severity: 'warning', category: 'Complication',
        title: `Regional complication rate at ${regionRate.toFixed(1)}%`,
        message: `The Southwest Region average is above the WHO-recommended ${t.complication}% benchmark.`,
        metric: 'Complication Rate', value: regionRate, threshold: t.complication,
        ts: stamp(id, 90),
      })
    }
  }

  // System / coverage notices
  alerts.push({
    id: 'sys-sync', severity: 'info', category: 'System',
    title: 'Surveillance data synced',
    message: `Latest facility submissions processed across ${geo.length} districts.`,
    ts: stamp('sys-sync', 45),
  })
  alerts.push({
    id: 'sys-bulletin', severity: 'success', category: 'Coverage',
    title: 'Weekly surveillance summary ready',
    message: 'This week’s PAC bulletin is available in Reports & Export.',
    ts: stamp('sys-bulletin', 600),
  })

  // Newest first
  return alerts.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
}

// ── Read-state persistence ───────────────────────────────────────────────────
export function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')) } catch { return new Set() }
}
export function saveReadIds(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids))) } catch { /* ignore */ }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - +new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
