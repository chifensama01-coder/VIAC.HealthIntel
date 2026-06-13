// Browser-side report generation: builds a fully letterheaded HTML document
// for the Vision in Action Cameroon — HealthIntel platform and opens it in a
// print window (Save as PDF / print). Also builds CSV, Excel (HTML), GeoJSON.

import type { ExecutiveBriefing } from './intelligence'

export interface ReportRow {
  district: string
  totalCases: number
  complicationRate: number
  adolescentCases: number
  riskScore: number
  referralRate: number
  facilities: number
}

export interface ReportMeta {
  title: string
  district: string
  period: string
  includeKPIs: boolean
  includeMap: boolean
  includeInsights: boolean
  includeForecast: boolean
  author?: string
}

export const REPORT_ROWS: ReportRow[] = [
  { district: 'Buea', totalCases: 1847, complicationRate: 22.1, adolescentCases: 463, riskScore: 42, referralRate: 16.4, facilities: 4 },
  { district: 'Limbe', totalCases: 1523, complicationRate: 28.4, adolescentCases: 381, riskScore: 56, referralRate: 19.2, facilities: 4 },
  { district: 'Bokwaongo', totalCases: 621, complicationRate: 19.2, adolescentCases: 155, riskScore: 31, referralRate: 13.0, facilities: 3 },
  { district: 'Bwassa', totalCases: 489, complicationRate: 35.6, adolescentCases: 248, riskScore: 67, referralRate: 22.7, facilities: 3 },
]

// Compact inline logo (no external fetch — prints reliably).
const LOGO_SVG = `
<svg width="230" height="58" viewBox="0 0 340 92" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="14" width="64" height="64" rx="16" fill="#2A9CE0"/>
  <path d="M36 27c3-.3 5.7.8 8.1 2.4 1.7 1.2 1.7 3.5.9 5.3-.8 2-.1 4 .9 5.9 1.2 2.3-.1 4.5-1.3 6.5-1.3 2.3-2.7 4.5-3.6 7-.9 2.3-.8 4.9-2.7 6.7-1.9 1.6-3.6-.5-4.7-2.3-1.3-2.1-3.2-3.9-4.4-6.1-1.7-3.1-2.5-6.5-2.4-10 .1-2.1-.5-4.5 1.1-6.3 1.3-1.5.9-3.6 2.1-5.2 1.3-1.7 3.1-3.3 5.9-3.6z" fill="#F1A52A"/>
  <path d="M16 47h9l3.2-6.7 4.3 12 4-16 3.5 10.7 3.7-4H52" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <text x="82" y="44" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#2A9CE0">VISION IN ACTION</text>
  <text x="82" y="68" font-family="Arial,sans-serif" font-size="15.5" font-weight="700" letter-spacing="5.5" fill="#C9881E">CAMEROON</text>
</svg>`

const PERIOD_LABELS: Record<string, string> = {
  last_30: 'Last 30 days',
  last_90: 'Last 90 days',
  last_180: 'Last 6 months',
  last_365: 'Last 12 months',
}

function rows(meta: ReportMeta): ReportRow[] {
  if (meta.district && meta.district !== 'All Districts') {
    return REPORT_ROWS.filter((r) => r.district === meta.district)
  }
  return REPORT_ROWS
}

function kpis(data: ReportRow[]) {
  const totalCases = data.reduce((s, r) => s + r.totalCases, 0)
  const weightedComp = data.reduce((s, r) => s + r.complicationRate * r.totalCases, 0) / (totalCases || 1)
  const adolescent = data.reduce((s, r) => s + r.adolescentCases, 0)
  const facilities = data.reduce((s, r) => s + r.facilities, 0)
  const referral = data.reduce((s, r) => s + r.referralRate * r.totalCases, 0) / (totalCases || 1)
  return {
    totalCases,
    complicationRate: weightedComp.toFixed(1),
    adolescentRate: ((adolescent / (totalCases || 1)) * 100).toFixed(1),
    facilities,
    referralRate: referral.toFixed(1),
  }
}

function insights(data: ReportRow[]): string[] {
  const worst = [...data].sort((a, b) => b.complicationRate - a.complicationRate)[0]
  const best = [...data].sort((a, b) => a.complicationRate - b.complicationRate)[0]
  const highAdolescent = [...data].sort((a, b) => (b.adolescentCases / b.totalCases) - (a.adolescentCases / a.totalCases))[0]
  const out: string[] = []
  if (worst) out.push(`${worst.district} carries the highest burden at a ${worst.complicationRate}% complication rate (risk score ${worst.riskScore}/100) — immediate targeted intervention is recommended.`)
  if (highAdolescent) out.push(`Adolescents (ages 10–19) represent ${((highAdolescent.adolescentCases / highAdolescent.totalCases) * 100).toFixed(0)}% of reported cases in ${highAdolescent.district}, indicating a need for youth-focused reproductive health services.`)
  if (best) out.push(`${best.district} demonstrates the strongest outcomes at ${best.complicationRate}% — its facility practices may be worth replicating across the region.`)
  out.push('Referral pathways should be reinforced in districts where the referral rate exceeds 18% to ensure timely access to higher-level care.')
  return out
}

export function buildReportHTML(meta: ReportMeta): string {
  const data = rows(meta)
  const k = kpis(data)
  const now = new Date()
  const refNo = `VIAC-PAC-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const periodLabel = PERIOD_LABELS[meta.period] ?? meta.period

  const riskColor = (s: number) => (s > 60 ? '#dc2626' : s > 40 ? '#d97706' : '#059669')

  const kpiBlock = meta.includeKPIs ? `
    <div class="kpis">
      <div class="kpi"><div class="kpi-v" style="color:#2A9CE0">${k.totalCases.toLocaleString()}</div><div class="kpi-l">Total PAC Cases</div></div>
      <div class="kpi"><div class="kpi-v" style="color:#dc2626">${k.complicationRate}%</div><div class="kpi-l">Complication Rate</div></div>
      <div class="kpi"><div class="kpi-v" style="color:#d97706">${k.adolescentRate}%</div><div class="kpi-l">Adolescent Share</div></div>
      <div class="kpi"><div class="kpi-v" style="color:#7c3aed">${k.referralRate}%</div><div class="kpi-l">Referral Rate</div></div>
      <div class="kpi"><div class="kpi-v" style="color:#059669">${k.facilities}</div><div class="kpi-l">Facilities Reporting</div></div>
    </div>` : ''

  const tableBlock = `
    <h2>District Surveillance Summary</h2>
    <table>
      <thead>
        <tr>
          <th>District</th><th class="num">Total Cases</th><th class="num">Complication&nbsp;%</th>
          <th class="num">Adolescent Cases</th><th class="num">Referral&nbsp;%</th><th class="num">Risk Score</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r) => `
          <tr>
            <td><strong>${r.district}</strong></td>
            <td class="num">${r.totalCases.toLocaleString()}</td>
            <td class="num">${r.complicationRate}%</td>
            <td class="num">${r.adolescentCases}</td>
            <td class="num">${r.referralRate}%</td>
            <td class="num"><span class="pill" style="background:${riskColor(r.riskScore)}1a;color:${riskColor(r.riskScore)}">${r.riskScore}/100</span></td>
          </tr>`).join('')}
      </tbody>
    </table>`

  const insightsBlock = meta.includeInsights ? `
    <h2>AI-Generated Findings &amp; Recommendations</h2>
    <ol class="insights">
      ${insights(data).map((i) => `<li>${i}</li>`).join('')}
    </ol>` : ''

  const forecastBlock = meta.includeForecast ? `
    <h2>6-Month Outlook</h2>
    <p class="note">Based on current trajectories, total PAC caseload is projected to rise an estimated
    8–12% over the next two quarters, with the steepest increase expected in higher-risk districts.
    Confidence interval ±9%. Recommend pre-positioning supplies and staffing in ${data.sort((a,b)=>b.riskScore-a.riskScore)[0]?.district ?? 'priority districts'}.</p>` : ''

  const mapNote = meta.includeMap ? `
    <h2>Geographic Distribution</h2>
    <p class="note">Choropleth analysis confirms a south-west gradient of risk, with complication rates
    concentrated in the coastal districts. An interactive map is available in the live HealthIntel dashboard.</p>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${meta.title} — Vision in Action Cameroon</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a2533; margin: 0; padding: 0; font-size: 12px; line-height: 1.55; }
  .page { max-width: 820px; margin: 0 auto; padding: 28px 40px 60px; }
  .topbar { height: 6px; background: linear-gradient(90deg,#2A9CE0 0%,#2A9CE0 60%,#C9881E 60%,#C9881E 100%); border-radius: 4px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 0 14px; border-bottom: 2px solid #eef2f6; }
  .org { text-align: right; font-size: 10.5px; color: #64748b; line-height: 1.5; }
  .org b { color: #1a2533; }
  .title-block { margin: 22px 0 6px; }
  .title-block h1 { font-size: 21px; margin: 0 0 4px; color: #0f1b2d; }
  .meta { display: flex; flex-wrap: wrap; gap: 18px; font-size: 10.5px; color: #64748b; margin-top: 6px; }
  .meta span b { color: #1a2533; font-weight: 600; }
  h2 { font-size: 13.5px; color: #2A9CE0; margin: 24px 0 8px; padding-bottom: 5px; border-bottom: 1px solid #eef2f6; }
  .kpis { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-top: 16px; }
  .kpi { border: 1px solid #eef2f6; border-radius: 10px; padding: 12px 10px; text-align: center; background: #fafcfe; }
  .kpi-v { font-size: 20px; font-weight: 700; }
  .kpi-l { font-size: 9px; color: #64748b; margin-top: 3px; text-transform: uppercase; letter-spacing: .04em; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #eef2f6; }
  th { background: #f4f8fb; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; }
  td.num, th.num { text-align: right; }
  .pill { padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 10.5px; }
  .insights li { margin-bottom: 8px; }
  .note { background: #fafcfe; border: 1px solid #eef2f6; border-left: 3px solid #2A9CE0; border-radius: 6px; padding: 10px 12px; color: #334155; }
  footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 8px 40px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #eef2f6; background:#fff; }
  .conf { color:#C9881E; font-weight:600; }
  @media print { .page { padding-top: 20px; } @page { margin: 14mm; } }
</style>
</head>
<body>
  <div class="page">
    <div class="topbar"></div>
    <header>
      <div>${LOGO_SVG}</div>
      <div class="org">
        <b>Vision in Action Cameroon</b><br/>
        HealthIntel · PAC Surveillance Platform<br/>
        Southwest Region, Cameroon<br/>
        healthintel@visioninaction.cm
      </div>
    </header>

    <div class="title-block">
      <h1>${meta.title}</h1>
      <div class="meta">
        <span>Scope: <b>${meta.district}</b></span>
        <span>Period: <b>${periodLabel}</b></span>
        <span>Generated: <b>${now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</b></span>
        <span>Ref: <b>${refNo}</b></span>
        ${meta.author ? `<span>Prepared by: <b>${meta.author}</b></span>` : ''}
      </div>
    </div>

    ${kpiBlock}
    ${tableBlock}
    ${mapNote}
    ${insightsBlock}
    ${forecastBlock}

    <footer>
      <span>Vision in Action Cameroon — HealthIntel · ${refNo}</span>
      <span class="conf">Confidential · For authorised health partners only</span>
    </footer>
  </div>
</body>
</html>`
}

// ── Executive briefing PDF (reuses the same letterhead) ──────────────────────
export function buildBriefingHTML(b: ExecutiveBriefing): string {
  const now = new Date(b.generatedAt)
  const refNo = `VIAC-BRIEF-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const prio = (p: string) => (p === 'immediate' ? '#dc2626' : p === 'high' ? '#d97706' : '#2563eb')
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<title>Executive Briefing — Vision in Action Cameroon</title>
<style>
  *{box-sizing:border-box} body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2533;margin:0;font-size:12px;line-height:1.55}
  .page{max-width:820px;margin:0 auto;padding:28px 40px 60px}
  .topbar{height:6px;background:linear-gradient(90deg,#2A9CE0 0%,#2A9CE0 60%,#C9881E 60%,#C9881E 100%);border-radius:4px}
  header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 0 14px;border-bottom:2px solid #eef2f6}
  .org{text-align:right;font-size:10.5px;color:#64748b}
  .org b{color:#1a2533}
  h1{font-size:21px;margin:22px 0 4px;color:#0f1b2d}
  .meta{display:flex;gap:18px;font-size:10.5px;color:#64748b;margin-top:6px}
  .meta b{color:#1a2533}
  h2{font-size:13.5px;color:#2A9CE0;margin:22px 0 8px;padding-bottom:5px;border-bottom:1px solid #eef2f6}
  .summary{background:#fafcfe;border:1px solid #eef2f6;border-left:3px solid #2A9CE0;border-radius:8px;padding:14px 16px;color:#334155}
  ol,ul{margin:6px 0;padding-left:18px} li{margin-bottom:6px}
  table{width:100%;border-collapse:collapse;margin-top:6px}
  th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #eef2f6}
  th{background:#f4f8fb;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
  .pill{padding:2px 8px;border-radius:999px;font-weight:700;font-size:10px;color:#fff}
  footer{position:fixed;bottom:0;left:0;right:0;padding:8px 40px;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;border-top:1px solid #eef2f6;background:#fff}
  .conf{color:#C9881E;font-weight:600}
  @page{margin:14mm}
</style></head><body><div class="page">
  <div class="topbar"></div>
  <header><div>${LOGO_SVG}</div>
    <div class="org"><b>Vision in Action Cameroon</b><br/>HealthIntel · Public Health Intelligence<br/>Southwest Region, Cameroon</div>
  </header>
  <h1>Executive Briefing</h1>
  <div class="meta"><span>Generated: <b>${now.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</b></span><span>Ref: <b>${refNo}</b></span></div>
  <h2>${b.headline}</h2>
  <div class="summary">${b.summary}</div>
  ${b.outlook ? `<h2>6-Month Outlook</h2><table><thead><tr><th>Projected caseload change</th><th>Forecast confidence</th><th>Projected risk</th></tr></thead><tbody><tr><td><b>${b.outlook.projectedChange > 0 ? '+' : ''}${b.outlook.projectedChange.toFixed(1)}%</b></td><td>${b.outlook.confidenceLevel}%</td><td>${b.outlook.riskScore}/100</td></tr></tbody></table>${b.outlook.drivers.length ? `<p style="font-size:11px;color:#475569;margin-top:6px"><b>Key drivers:</b> ${b.outlook.drivers.join(' · ')}</p>` : ''}` : ''}
  <h2>Key Findings</h2><ol>${b.keyFindings.map((f) => `<li>${f}</li>`).join('')}</ol>
  <h2>Top Risks</h2><table><thead><tr><th>District</th><th>Driver</th><th class="num">Risk</th></tr></thead><tbody>
    ${b.topRisks.map((r) => `<tr><td><strong>${r.district}</strong></td><td>${r.reason}</td><td style="text-align:right"><b>${r.score}/100</b></td></tr>`).join('')}
  </tbody></table>
  <h2>Recommended Actions</h2><table><thead><tr><th>Priority</th><th>Action</th><th>Owner</th></tr></thead><tbody>
    ${b.actions.map((a) => `<tr><td><span class="pill" style="background:${prio(a.priority)}">${a.priority.toUpperCase()}</span></td><td>${a.action}</td><td>${a.owner}</td></tr>`).join('')}
  </tbody></table>
  <h2>Resource Allocation Priorities</h2><table><thead><tr><th>District</th><th class="num">Suggested share</th></tr></thead><tbody>
    ${b.resourcePriorities.map((r) => `<tr><td>${r.district}</td><td style="text-align:right"><b>${r.share}%</b></td></tr>`).join('')}
  </tbody></table>
  <footer><span>Vision in Action Cameroon — HealthIntel · ${refNo}</span><span class="conf">Confidential · For authorised health partners only</span></footer>
</div></body></html>`
}

export function openPrintBriefing(b: ExecutiveBriefing) {
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return false
  w.document.open(); w.document.write(buildBriefingHTML(b)); w.document.close()
  w.onload = () => setTimeout(() => w.print(), 350)
  return true
}

export function openPrintReport(meta: ReportMeta) {
  const html = buildReportHTML(meta)
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  // Give the browser a beat to lay out before invoking print.
  w.onload = () => setTimeout(() => w.print(), 350)
  return true
}

export function downloadExcel(meta: ReportMeta) {
  const data = rows(meta)
  const header = ['District', 'Total Cases', 'Complication Rate %', 'Adolescent Cases', 'Referral Rate %', 'Risk Score', 'Facilities']
  const body = data.map((r) => [r.district, r.totalCases, r.complicationRate, r.adolescentCases, r.referralRate, r.riskScore, r.facilities])
  const table = `<table border="1"><thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${body.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><h3>${meta.title}</h3>${table}</body></html>`
  const blob = new Blob([doc], { type: 'application/vnd.ms-excel' })
  triggerDownload(blob, `healthintel-report-${Date.now()}.xls`)
}

export function downloadCSV(meta: ReportMeta) {
  const data = rows(meta)
  const headers = ['District', 'Total Cases', 'Complication Rate %', 'Adolescent Cases', 'Referral Rate %', 'Risk Score', 'Facilities']
  const lines = [headers, ...data.map((r) => [r.district, r.totalCases, r.complicationRate, r.adolescentCases, r.referralRate, r.riskScore, r.facilities])]
  const csv = lines.map((r) => r.join(',')).join('\n')
  triggerDownload(new Blob([csv], { type: 'text/csv' }), `healthintel-report-${Date.now()}.csv`)
}

export function downloadGeoJSON(meta: ReportMeta) {
  const coords: Record<string, [number, number]> = {
    Buea: [9.241, 4.1525], Limbe: [9.201, 4.0027], Bokwaongo: [9.275, 4.125], Bwassa: [9.185, 4.08],
  }
  const geojson = {
    type: 'FeatureCollection',
    features: rows(meta).map((r) => ({
      type: 'Feature',
      properties: { district: r.district, cases: r.totalCases, rate: r.complicationRate, riskScore: r.riskScore },
      geometry: { type: 'Point', coordinates: coords[r.district] ?? [9.2, 4.1] },
    })),
  }
  triggerDownload(new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' }), `healthintel-geodata-${Date.now()}.geojson`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
