// ─────────────────────────────────────────────────────────────────────────────
// HealthIntel — Intelligence layer
// Deterministic, client-safe generators for the platform's intelligence surfaces:
// data sources, digital health signals, AI knowledge monitoring, executive
// briefings, evidence/explainability, and district storytelling.
//
// Figures are realistic simulations where live APIs are not connected.
// ─────────────────────────────────────────────────────────────────────────────

export type SourceStatus = 'live' | 'syncing' | 'periodic' | 'simulated'

export interface DataSource {
  name: string
  description: string
  status: SourceStatus
  coverage: string
  lastUpdated: string
  reliability: number // 0–100
}

export interface SourceCategory {
  id: string
  title: string
  blurb: string
  icon: 'surveillance' | 'signals' | 'indicators' | 'ai'
  sources: DataSource[]
}

export const DATA_SOURCE_CATEGORIES: SourceCategory[] = [
  {
    id: 'surveillance',
    title: 'Health Surveillance',
    blurb: 'Primary case-level reporting from the health system.',
    icon: 'surveillance',
    sources: [
      { name: 'Facility reporting systems', description: 'Routine PAC submissions from state, faith, private and NGO facilities.', status: 'live', coverage: '14 facilities · 4 districts', lastUpdated: '3 min ago', reliability: 94 },
      { name: 'Post-abortion care registers', description: 'Case registers digitised at the point of care.', status: 'live', coverage: '15,408 records', lastUpdated: '12 min ago', reliability: 91 },
      { name: 'District reporting systems', description: 'District health office aggregates and validations.', status: 'periodic', coverage: '4 districts · weekly', lastUpdated: '2 days ago', reliability: 88 },
      { name: 'Community surveillance', description: 'Community health worker event reporting.', status: 'syncing', coverage: '37 CHW zones', lastUpdated: '28 min ago', reliability: 76 },
      { name: 'Referral tracking systems', description: 'Inter-facility referral and outcome tracking.', status: 'live', coverage: '4 districts', lastUpdated: '8 min ago', reliability: 85 },
    ],
  },
  {
    id: 'signals',
    title: 'Digital Health Signals',
    blurb: 'Anonymous, aggregate information-seeking behaviour.',
    icon: 'signals',
    sources: [
      { name: 'Search trend monitoring', description: 'Aggregate search interest for PAC-related queries.', status: 'live', coverage: 'Southwest Region', lastUpdated: '1 h ago', reliability: 72 },
      { name: 'Public health discussions', description: 'Anonymised volume of public health conversations.', status: 'simulated', coverage: 'Regional', lastUpdated: '4 h ago', reliability: 64 },
      { name: 'Emerging questions', description: 'Newly rising questions detected across channels.', status: 'simulated', coverage: 'Regional', lastUpdated: '2 h ago', reliability: 61 },
      { name: 'Information-seeking behaviour', description: 'Patterns in how communities seek care information.', status: 'simulated', coverage: 'Regional', lastUpdated: '5 h ago', reliability: 67 },
    ],
  },
  {
    id: 'indicators',
    title: 'Public Health Indicators',
    blurb: 'Authoritative reference datasets for benchmarking.',
    icon: 'indicators',
    sources: [
      { name: 'WHO indicators', description: 'Global reproductive health benchmarks (e.g. 20% complication threshold).', status: 'periodic', coverage: 'Global reference', lastUpdated: 'Q1 2026', reliability: 98 },
      { name: 'DHS surveys', description: 'Demographic & Health Survey reproductive indicators.', status: 'periodic', coverage: 'National', lastUpdated: '2024 round', reliability: 95 },
      { name: 'World Bank indicators', description: 'Socio-economic and health-system context indicators.', status: 'periodic', coverage: 'National', lastUpdated: '2025', reliability: 93 },
      { name: 'National health information systems', description: 'DHIS2-aligned national aggregates.', status: 'periodic', coverage: 'National', lastUpdated: 'Monthly', reliability: 90 },
      { name: 'District health reports', description: 'Official district situation reports.', status: 'periodic', coverage: '4 districts', lastUpdated: 'Weekly', reliability: 89 },
    ],
  },
  {
    id: 'ai',
    title: 'AI Knowledge Monitoring',
    blurb: 'How communities use AI assistants to seek health information.',
    icon: 'ai',
    sources: [
      { name: 'ChatGPT', description: 'Aggregate, anonymised health-question patterns.', status: 'simulated', coverage: 'Sampled', lastUpdated: '6 h ago', reliability: 58 },
      { name: 'Claude', description: 'Reproductive-health question monitoring.', status: 'simulated', coverage: 'Sampled', lastUpdated: '6 h ago', reliability: 58 },
      { name: 'Gemini', description: 'Emerging-topic detection.', status: 'simulated', coverage: 'Sampled', lastUpdated: '7 h ago', reliability: 55 },
      { name: 'Perplexity', description: 'Source-grounded question patterns.', status: 'simulated', coverage: 'Sampled', lastUpdated: '9 h ago', reliability: 54 },
    ],
  },
]

// ── Digital Health Signals 2.0 ───────────────────────────────────────────────
export interface TrendingQuestion { question: string; volume: number; trend: 'rising' | 'stable' | 'falling'; growth: number; district: string }
export interface EmergingTopic { topic: string; direction: 'up' | 'down'; growth: number; district: string; severity: 'high' | 'medium' | 'low' }

export const TRENDING_QUESTIONS: TrendingQuestion[] = [
  { question: 'Where can I get post-abortion care?', volume: 1840, trend: 'rising', growth: 22, district: 'Buea' },
  { question: 'How safe is misoprostol?', volume: 1610, trend: 'rising', growth: 19, district: 'Limbe' },
  { question: 'What symptoms require emergency care?', volume: 1320, trend: 'rising', growth: 31, district: 'Bwassa' },
  { question: 'What causes complications after a procedure?', volume: 980, trend: 'stable', growth: 4, district: 'Buea' },
  { question: 'Is bleeding after care normal?', volume: 870, trend: 'rising', growth: 14, district: 'Bokwaongo' },
  { question: 'How much does treatment cost?', volume: 640, trend: 'falling', growth: -8, district: 'Limbe' },
]

export const EMERGING_TOPICS: EmergingTopic[] = [
  { topic: 'Referral delays', direction: 'up', growth: 24, district: 'Limbe', severity: 'high' },
  { topic: 'Adolescent access barriers', direction: 'up', growth: 18, district: 'Bwassa', severity: 'high' },
  { topic: 'Cost of emergency care', direction: 'up', growth: 12, district: 'Buea', severity: 'medium' },
  { topic: 'Misoprostol safety concerns', direction: 'up', growth: 9, district: 'Bokwaongo', severity: 'medium' },
  { topic: 'Stigma & confidentiality', direction: 'up', growth: 7, district: 'Limbe', severity: 'low' },
]

export interface GeoInterest { district: string; interest: number; topQuestion: string }
export const GEOGRAPHIC_INTEREST: GeoInterest[] = [
  { district: 'Buea', interest: 100, topQuestion: 'Where can I get post-abortion care?' },
  { district: 'Limbe', interest: 86, topQuestion: 'How safe is misoprostol?' },
  { district: 'Bwassa', interest: 74, topQuestion: 'What symptoms require emergency care?' },
  { district: 'Bokwaongo', interest: 52, topQuestion: 'Is bleeding after care normal?' },
]

// 12-month search-trend timeline (indexed 0–100)
export function searchTimeline(): { month: string; interest: number; questions: number }[] {
  const out: { month: string; interest: number; questions: number }[] = []
  const now = new Date(2026, 5, 1)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const base = 48 + (11 - i) * 3.2
    const wobble = Math.sin(i * 1.3) * 9
    const interest = Math.max(20, Math.min(100, Math.round(base + wobble)))
    out.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, interest, questions: Math.round(interest * 12 + 200) })
  }
  return out
}

// ── AI Intelligence Center ───────────────────────────────────────────────────
export interface AIQuestion { question: string; frequency: number; growth: number; concentration: string }
export const TOP_AI_QUESTIONS: AIQuestion[] = [
  { question: 'Can abortion cause infertility?', frequency: 2120, growth: 27, concentration: 'Buea, Limbe' },
  { question: 'Is bleeding after abortion normal?', frequency: 1880, growth: 18, concentration: 'Region-wide' },
  { question: 'When should I seek emergency care?', frequency: 1540, growth: 33, concentration: 'Bwassa' },
  { question: 'How long does recovery take?', frequency: 1190, growth: 11, concentration: 'Bokwaongo' },
  { question: 'What painkillers are safe to use?', frequency: 980, growth: 8, concentration: 'Limbe' },
]

export interface MisinfoItem { claim: string; reality: string; risk: 'critical' | 'high' | 'moderate'; prevalence: number; response: string }
export const MISINFORMATION: MisinfoItem[] = [
  { claim: 'Abortion always causes permanent infertility', reality: 'Safe, complete post-abortion care rarely affects future fertility.', risk: 'high', prevalence: 41, response: 'Publish a vetted fertility-myths explainer; brief CHWs and hotline staff.' },
  { claim: 'Heavy bleeding for days is always normal', reality: 'Prolonged heavy bleeding is a danger sign requiring urgent review.', risk: 'critical', prevalence: 33, response: 'Push danger-sign messaging via SMS/radio; reinforce referral triggers.' },
  { claim: 'Herbal remedies can safely replace clinical care', reality: 'Unsupervised remedies increase the risk of severe complications.', risk: 'critical', prevalence: 26, response: 'Community engagement with traditional practitioners; clarify safe pathways.' },
  { claim: 'Adolescents cannot access confidential care', reality: 'Youth-friendly, confidential services are available and encouraged.', risk: 'moderate', prevalence: 22, response: 'Promote youth-friendly service points; train providers on confidentiality.' },
]

export interface KnowledgeGap { topic: string; repeatedQueries: number; status: 'underserved' | 'partial' | 'covered' }
export const KNOWLEDGE_GAPS: KnowledgeGap[] = [
  { topic: 'Where to access care confidentially', repeatedQueries: 1320, status: 'underserved' },
  { topic: 'Recognising danger signs early', repeatedQueries: 1180, status: 'underserved' },
  { topic: 'Cost and financial support options', repeatedQueries: 760, status: 'partial' },
  { topic: 'Safe medication use & dosing', repeatedQueries: 690, status: 'partial' },
  { topic: 'Follow-up & contraception', repeatedQueries: 410, status: 'covered' },
]

// ── Evidence / Explainability ────────────────────────────────────────────────
export interface Evidence {
  sources: string[]
  facilities: number
  period: string
  confidence: number
  method: string
}
export function evidenceFor(seed: string, severity?: string): Evidence {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const confidence = 78 + (h % 18) // 78–95
  const facilities = 8 + (h % 7)
  const method = severity === 'critical'
    ? 'Threshold breach detection + 12-month trend regression'
    : 'Weighted aggregation with anomaly detection'
  return {
    sources: [
      'Facility reports',
      'Referral & hotline records',
      'Historical surveillance data',
      'Search & digital signals',
      'Population & WHO indicators',
    ],
    facilities,
    period: 'Rolling 90 days (12-month baseline)',
    confidence,
    method,
  }
}

// ── District storytelling ────────────────────────────────────────────────────
export interface DistrictStory { situation: string; risks: string[]; trends: string[]; interventions: string[] }
export function districtStory(o: {
  district: string; totalCases: number; complicationRate: number; adolescentRate: number;
  referralRate: number; riskLevel: string; riskScore: number;
}): DistrictStory {
  const sev = o.complicationRate > 30 ? 'the highest complication burden in the region'
    : o.complicationRate > 25 ? 'an above-average complication burden'
    : o.complicationRate > 20 ? 'a complication rate just above the WHO benchmark'
    : 'a complication rate within the WHO benchmark'
  const adol = o.adolescentRate >= 40 ? `Adolescents account for roughly ${o.adolescentRate.toFixed(0)}% of reported cases — about half the caseload — pointing to significant gaps in youth-focused reproductive health services.`
    : `Adolescents represent ${o.adolescentRate.toFixed(0)}% of reported cases, a meaningful share requiring targeted outreach.`
  return {
    situation: `${o.district} reports ${sev}, with a ${o.complicationRate.toFixed(1)}% complication rate across ${o.totalCases.toLocaleString()} monitored PAC cases. ${adol} The district currently carries a ${o.riskLevel} risk profile (${o.riskScore}/100).`,
    risks: [
      `Complication rate ${o.complicationRate > 20 ? 'above' : 'near'} the WHO 20% benchmark`,
      `Referral rate of ${o.referralRate.toFixed(1)}% ${o.referralRate > 18 ? 'signals capacity strain in higher-level care' : 'within manageable range'}`,
      o.adolescentRate > 30 ? 'Disproportionate adolescent caseload' : 'Stable age distribution',
    ],
    trends: [
      o.complicationRate > 25 ? 'Complications trending upward over recent months' : 'Complications broadly stable quarter-on-quarter',
      'Information-seeking on danger signs and access is rising in this district',
    ],
    interventions: [
      o.riskLevel === 'critical' || o.riskLevel === 'high' ? `Deploy a rapid clinical-support team to ${o.district}` : `Maintain supportive supervision in ${o.district}`,
      o.adolescentRate > 30 ? 'Expand youth-friendly, confidential service points' : 'Sustain community engagement',
      o.referralRate > 18 ? 'Strengthen and resource referral pathways' : 'Monitor referral timeliness',
    ],
  }
}

// ── Executive Briefing ───────────────────────────────────────────────────────
export interface BriefRow { district: string; totalCases: number; complicationRate: number; adolescentShare: number; referralRate: number; riskScore: number }
export const BRIEF_ROWS: BriefRow[] = [
  { district: 'Buea', totalCases: 3897, complicationRate: 24.6, adolescentShare: 49.8, referralRate: 16.4, riskScore: 85 },
  { district: 'Limbe', totalCases: 3824, complicationRate: 30.4, adolescentShare: 49.5, referralRate: 22.7, riskScore: 95 },
  { district: 'Bokwaongo', totalCases: 3863, complicationRate: 21.6, adolescentShare: 48.6, referralRate: 13.0, riskScore: 78 },
  { district: 'Bwassa', totalCases: 3824, complicationRate: 35.6, adolescentShare: 50.2, referralRate: 24.1, riskScore: 100 },
]

export interface ForecastSummary {
  projectedChange: number   // % change over the horizon
  confidenceLevel: number   // %
  riskScore: number         // 0–100
  drivers: string[]
}

export interface BriefingOutlook {
  projectedChange: number
  confidenceLevel: number
  riskScore: number
  horizon: string
  drivers: string[]
}

export interface ExecutiveBriefing {
  generatedAt: string
  headline: string
  summary: string
  keyFindings: string[]
  topRisks: { district: string; reason: string; score: number }[]
  actions: { action: string; priority: 'immediate' | 'high' | 'medium'; owner: string }[]
  resourcePriorities: { district: string; share: number }[]
  outlook?: BriefingOutlook
}

export function generateBriefing(forecast?: ForecastSummary, district: string = 'All'): ExecutiveBriefing {
  const isAll = district === 'All'
  const scoped = isAll ? BRIEF_ROWS : BRIEF_ROWS.filter((r) => r.district === district)
  const rows = scoped.length ? scoped : BRIEF_ROWS

  const total = rows.reduce((s, r) => s + r.totalCases, 0)
  const byComp = [...rows].sort((a, b) => b.complicationRate - a.complicationRate)
  const worst = byComp[0]
  const second = byComp[1]
  const byRisk = [...rows].sort((a, b) => b.riskScore - a.riskScore)
  const adolAvg = rows.reduce((s, r) => s + r.adolescentShare, 0) / rows.length
  const regionRate = rows.reduce((s, r) => s + r.complicationRate * r.totalCases, 0) / total
  const highReferral = [...rows].sort((a, b) => b.referralRate - a.referralRate)[0]

  // Resource priorities are always region-wide (where to allocate across districts).
  const riskTotal = BRIEF_ROWS.reduce((s, r) => s + r.riskScore, 0)
  const resourcePriorities = [...BRIEF_ROWS]
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((r) => ({ district: r.district, share: Math.round((r.riskScore / riskTotal) * 100) }))

  // Forecast-aware additions (connected to the Forecasting module when provided).
  const change = forecast ? Math.round(forecast.projectedChange) : null
  const dir = change != null ? (change > 0 ? 'rise' : change < 0 ? 'ease' : 'hold steady') : null
  const scopeWord = isAll ? 'regional' : `${worst.district}'s`
  const forecastSentence = change != null
    ? ` Looking ahead, ${scopeWord} caseload is projected to ${dir} an estimated ${Math.abs(change)}% over the next six months (±15%, ${forecast!.confidenceLevel}% confidence).`
    : ''

  const level = worst.complicationRate > 30 ? 'the highest' : worst.complicationRate > 25 ? 'an above-average' : worst.complicationRate > 20 ? 'an elevated' : 'a within-benchmark'

  let headline: string
  let summary: string
  let findings: string[]
  let topRisks: ExecutiveBriefing['topRisks']
  const actions: ExecutiveBriefing['actions'] = []

  if (isAll) {
    const buea = BRIEF_ROWS.find((r) => r.district === 'Buea')!
    const bueaShare = ((buea.totalCases / BRIEF_ROWS.reduce((s, r) => s + r.totalCases, 0)) * 100).toFixed(0)
    headline = `${worst.district} carries the region's highest complication burden`
    summary = `Across ${total.toLocaleString()} monitored PAC cases, the regional complication rate stands at ${regionRate.toFixed(1)}% — above the WHO 20% benchmark. ${worst.district} reports the highest rate at ${worst.complicationRate}%, while ${buea.district} accounts for ${bueaShare}% of all monitored cases. Adolescents represent roughly ${adolAvg.toFixed(0)}% of incidents region-wide, and referral delays are increasing in ${highReferral.district}. Priority actions are expanding youth-focused outreach and strengthening referral pathways in the highest-risk districts.${forecastSentence}`
    findings = [
      `Regional complication rate is ${regionRate.toFixed(1)}% — ${(regionRate - 20).toFixed(1)} points above the WHO benchmark.`,
      `${worst.district} (${worst.complicationRate}%) and ${second.district} (${second.complicationRate}%) are the two highest-burden districts.`,
      `Adolescents (10–19) make up ~${adolAvg.toFixed(0)}% of reported cases across all four districts.`,
      `Referral rate is highest in ${highReferral.district} at ${highReferral.referralRate}%, signalling capacity strain.`,
    ]
    topRisks = byRisk.slice(0, 3).map((r) => ({
      district: r.district,
      reason: `${r.complicationRate}% complication rate · ${r.adolescentShare.toFixed(0)}% adolescent share`,
      score: r.riskScore,
    }))
    actions.push(
      { action: `Deploy a rapid clinical-support team to ${worst.district}`, priority: 'immediate', owner: 'Regional Health Delegation' },
      { action: `Strengthen referral pathways and transport in ${highReferral.district}`, priority: 'immediate', owner: 'District Medical Officers' },
      { action: 'Expand youth-friendly reproductive health outreach region-wide', priority: 'high', owner: 'Adolescent Health Programme' },
      { action: 'Launch danger-sign awareness campaign via SMS and radio', priority: 'high', owner: 'Health Promotion Unit' },
      { action: 'Audit complication causes against WHO PAC protocols', priority: 'medium', owner: 'Quality Improvement Team' },
    )
  } else {
    const d = worst // single scoped district
    headline = `${d.district}: ${level} complication burden in the region`
    summary = `${d.district} reports a ${d.complicationRate}% complication rate across ${d.totalCases.toLocaleString()} monitored PAC cases — ${d.complicationRate > 20 ? 'above' : 'within'} the WHO 20% benchmark. Adolescents account for roughly ${d.adolescentShare.toFixed(0)}% of cases and the referral rate stands at ${d.referralRate}%. The district currently carries a composite risk score of ${d.riskScore}/100.${forecastSentence}`
    findings = [
      `Complication rate is ${d.complicationRate}% — ${(d.complicationRate - 20).toFixed(1)} points ${d.complicationRate > 20 ? 'above' : 'below'} the WHO benchmark.`,
      `Adolescents (10–19) represent ~${d.adolescentShare.toFixed(0)}% of reported cases.`,
      `Referral rate is ${d.referralRate}% — ${d.referralRate > 18 ? 'signalling capacity strain in higher-level care' : 'within a manageable range'}.`,
      `Composite risk score is ${d.riskScore}/100.`,
    ]
    topRisks = [{
      district: d.district,
      reason: `${d.complicationRate}% complication rate · ${d.adolescentShare.toFixed(0)}% adolescent share · ${d.referralRate}% referral`,
      score: d.riskScore,
    }]
    actions.push(
      { action: `${d.riskScore > 60 ? 'Deploy a rapid clinical-support team to' : 'Strengthen supportive supervision in'} ${d.district}`, priority: d.riskScore > 60 ? 'immediate' : 'high', owner: 'District Medical Officer' },
      { action: `${d.referralRate > 18 ? 'Reinforce and resource referral pathways' : 'Monitor referral timeliness'} in ${d.district}`, priority: d.referralRate > 18 ? 'immediate' : 'medium', owner: 'Facility Focal Points' },
      { action: `${d.adolescentShare > 30 ? 'Expand youth-friendly, confidential services' : 'Sustain community engagement'} in ${d.district}`, priority: 'high', owner: 'Adolescent Health Programme' },
      { action: `Audit ${d.district} complication causes against WHO PAC protocols`, priority: 'medium', owner: 'Quality Improvement Team' },
    )
  }

  if (change != null) findings.push(`Six-month forecast projects a ${change > 0 ? '+' : ''}${change}% change in caseload at ${forecast!.confidenceLevel}% confidence.`)
  if (change != null && change >= 5) {
    actions.splice(2, 0, {
      action: `Pre-position commodities and surge staffing ahead of a projected ${change}% caseload increase`,
      priority: 'high', owner: 'Supply Chain & Operations',
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    headline,
    summary,
    keyFindings: findings,
    topRisks,
    actions,
    resourcePriorities,
    outlook: forecast ? {
      projectedChange: forecast.projectedChange,
      confidenceLevel: forecast.confidenceLevel,
      riskScore: forecast.riskScore,
      horizon: '6 months',
      drivers: forecast.drivers,
    } : undefined,
  }
}
