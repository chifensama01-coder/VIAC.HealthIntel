import type {
  PacCase, DigitalTrace, GeoDataPoint, TimeSeriesPoint, DigitalTracePoint,
  DashboardSummary, AIInsight, ForecastPoint, ForecastData, LiveEvent,
  AccountabilityMetric, DistrictIntelligence, FacilityPerformance, RiskIndicator,
  SearchResult, SearchQuestion, PopularSearch, DemographicPattern,
} from './types'
import {
  DISTRICTS, AGE_GROUPS, FACILITY_TYPES, DISTRICT_COORDS,
  DISTRICT_FACILITY_NAMES, COMPLICATION_TYPES, EDUCATION_LEVELS,
} from './types'

// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────────
function makePRNG(seed: number) {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomChoice<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

// ── Base rates ────────────────────────────────────────────────────────────────
const BASE_RATES: Record<string, number> = {
  Buea: 0.22, Limbe: 0.28, Bokwaongo: 0.19, Bwassa: 0.32,
}

const AGE_MULTIPLIERS: Record<string, number> = {
  '10-14': 1.45, '15-19': 1.25, '20-24': 0.95, '25+': 0.85,
}

// ── Data generation (365 days, 5000+ cases) ──────────────────────────────────
export function generateMockData(): { cases: PacCase[]; traces: DigitalTrace[] } {
  const rng = makePRNG(42)
  const cases: PacCase[] = []
  const traces: DigitalTrace[] = []

  const today = new Date('2026-06-13')
  const startDate = addDays(today, -364)

  let caseId = 1
  let traceId = 1

  for (let day = 0; day < 365; day++) {
    const date = addDays(startDate, day)
    const dateStr = toYMD(date)

    for (const district of DISTRICTS) {
      const baseCases = Math.floor(rng() * 14) + 4

      for (let i = 0; i < baseCases; i++) {
        const ageGroup = randomChoice(rng, AGE_GROUPS)
        const sex = rng() < 0.95 ? 'female' : 'male'
        const baseRate = BASE_RATES[district]
        const modifier = AGE_MULTIPLIERS[ageGroup]
        const complication = rng() < baseRate * modifier
        const facilityType = randomChoice(rng, FACILITY_TYPES)
        const facilityNames = DISTRICT_FACILITY_NAMES[district]
        const facilityName = facilityNames[Math.floor(rng() * facilityNames.length)]
        const wealthQuintile = Math.ceil(rng() * 5) as 1 | 2 | 3 | 4 | 5
        const educationLevel = randomChoice(rng, EDUCATION_LEVELS)
        const displaced = rng() < 0.08
        const referralRequired = complication && rng() < 0.65
        const complicationType = complication ? randomChoice(rng, COMPLICATION_TYPES) : undefined
        const outcomeOptions = complication
          ? (['referred', 'complication', 'pending'] as const)
          : (['recovered'] as const)
        const outcomeStatus = randomChoice(rng, outcomeOptions)

        cases.push({
          id: caseId++,
          district,
          ageGroup,
          sex,
          complication,
          complicationType,
          date: dateStr,
          facilityType,
          facilityName,
          wealthQuintile,
          educationLevel,
          displaced,
          referralRequired,
          outcomeStatus,
        })
      }
    }

    // Digital traces
    for (const district of DISTRICTS) {
      const weekDay = date.getDay()
      const districtBase = district === 'Buea' ? 55 : district === 'Limbe' ? 45 : 30
      const weekPattern = weekDay >= 1 && weekDay <= 5 ? 1.2 : 0.75
      const noise = (rng() - 0.5) * 20
      const searchVolume = Math.min(100, Math.max(0, Math.round(districtBase * weekPattern + noise)))
      const sentiment = parseFloat(((rng() - 0.6) * 0.8).toFixed(3))
      const topicIdx = Math.floor(rng() * SEARCH_TOPICS.length)

      traces.push({
        id: traceId++,
        district,
        searchVolume,
        sentiment,
        timestamp: date.toISOString(),
        topic: SEARCH_TOPICS[topicIdx],
      })
    }
  }

  return { cases, traces }
}

const SEARCH_TOPICS = [
  'contraception', 'safe abortion', 'complication signs', 'clinic access',
  'hotline numbers', 'legal status', 'post-care', 'adolescent services',
]

let _data: ReturnType<typeof generateMockData> | null = null
export function getData() {
  if (!_data) _data = generateMockData()
  return _data
}

// ── Filter helpers ────────────────────────────────────────────────────────────
export function filterCases(
  cases: PacCase[],
  opts: {
    districts?: string[]
    ageGroups?: string[]
    sex?: string
    wealthQuintiles?: number[]
    educationLevels?: string[]
    displaced?: boolean | null
    facilityTypes?: string[]
    dateRange?: { from: string; to: string }
  }
): PacCase[] {
  return cases.filter((c) => {
    if (opts.districts?.length && !opts.districts.includes(c.district)) return false
    if (opts.ageGroups?.length && !opts.ageGroups.includes(c.ageGroup)) return false
    if (opts.sex && opts.sex !== 'all' && c.sex !== opts.sex) return false
    if (opts.wealthQuintiles?.length && !opts.wealthQuintiles.includes(c.wealthQuintile)) return false
    if (opts.educationLevels?.length && !opts.educationLevels.includes(c.educationLevel)) return false
    if (opts.displaced != null && c.displaced !== opts.displaced) return false
    if (opts.facilityTypes?.length && !opts.facilityTypes.includes(c.facilityType)) return false
    if (opts.dateRange) {
      if (c.date < opts.dateRange.from || c.date > opts.dateRange.to) return false
    }
    return true
  })
}

export function computeGeoData(cases: PacCase[]): GeoDataPoint[] {
  const byDistrict = new Map<string, { total: number; complications: number; adolescent: number; facilities: Set<string>; referrals: number }>()
  for (const district of DISTRICTS) {
    byDistrict.set(district, { total: 0, complications: 0, adolescent: 0, facilities: new Set(), referrals: 0 })
  }
  for (const c of cases) {
    const entry = byDistrict.get(c.district)
    if (!entry) continue
    entry.total++
    if (c.complication) entry.complications++
    if (c.ageGroup === '10-14' || c.ageGroup === '15-19') entry.adolescent++
    entry.facilities.add(c.facilityName)
    if (c.referralRequired) entry.referrals++
  }
  return DISTRICTS.map((district) => {
    const { total, complications, adolescent, facilities, referrals } = byDistrict.get(district)!
    const coords = DISTRICT_COORDS[district]
    const rate = total > 0 ? parseFloat(((complications / total) * 100).toFixed(1)) : 0
    return {
      district,
      rate,
      lat: coords.lat,
      lng: coords.lng,
      population: coords.population,
      totalCases: total,
      complications,
      adolescentCases: adolescent,
      facilitiesCount: facilities.size,
      riskScore: computeRiskScore(rate, adolescent / (total || 1), referrals / (total || 1)),
    }
  })
}

function computeRiskScore(compRate: number, adolescentPct: number, referralPct: number): number {
  return Math.min(100, Math.round(compRate * 1.5 + adolescentPct * 100 * 0.8 + referralPct * 100 * 0.5))
}

export function computeTimeSeries(cases: PacCase[]): TimeSeriesPoint[] {
  const byMonth = new Map<string, { cases: number; complications: number; adolescent: number; referrals: number }>()
  for (const c of cases) {
    const month = c.date.slice(0, 7)
    const entry = byMonth.get(month) ?? { cases: 0, complications: 0, adolescent: 0, referrals: 0 }
    entry.cases++
    if (c.complication) entry.complications++
    if (c.ageGroup === '10-14' || c.ageGroup === '15-19') entry.adolescent++
    if (c.referralRequired) entry.referrals++
    byMonth.set(month, entry)
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }))
}

export function computeDigitalTrace(traces: DigitalTrace[], districts?: string[]): DigitalTracePoint[] {
  const filtered = districts?.length ? traces.filter((t) => districts.includes(t.district)) : traces
  const byDistrict = new Map<string, { volumeSum: number; sentimentSum: number; count: number; topics: Record<string, number> }>()
  for (const t of filtered) {
    const entry = byDistrict.get(t.district) ?? { volumeSum: 0, sentimentSum: 0, count: 0, topics: {} }
    entry.volumeSum += t.searchVolume
    entry.sentimentSum += t.sentiment
    entry.count++
    entry.topics[t.topic] = (entry.topics[t.topic] ?? 0) + 1
    byDistrict.set(t.district, entry)
  }
  return Array.from(byDistrict.entries()).map(([district, v]) => {
    const topTopic = Object.entries(v.topics).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'N/A'
    return {
      district,
      searchVolume: Math.round(v.volumeSum / v.count),
      sentiment: parseFloat((v.sentimentSum / v.count).toFixed(3)),
      topTopic,
    }
  })
}

// ── AI Insights Generator ─────────────────────────────────────────────────────
export function generateAIInsights(cases: PacCase[], geoData: GeoDataPoint[]): AIInsight[] {
  const insights: AIInsight[] = []
  const total = cases.length
  if (total === 0) return insights

  const complications = cases.filter((c) => c.complication).length
  const compRate = (complications / total) * 100
  const adolescent = cases.filter((c) => ['10-14', '15-19'].includes(c.ageGroup))
  const adolescentPct = (adolescent.length / total) * 100
  const highestBurden = [...geoData].sort((a, b) => b.rate - a.rate)[0]
  const lowestBurden = [...geoData].sort((a, b) => a.rate - b.rate)[0]

  if (highestBurden) {
    insights.push({
      id: 'i1',
      type: 'risk',
      severity: highestBurden.rate > 30 ? 'critical' : 'high',
      title: `${highestBurden.district} presents the highest burden`,
      description: `${highestBurden.district} has a complication rate of ${highestBurden.rate.toFixed(1)}%, significantly above the regional average. Immediate targeted intervention is recommended.`,
      district: highestBurden.district,
      metric: 'complicationRate',
      value: highestBurden.rate,
      timestamp: new Date().toISOString(),
    })
  }

  if (adolescentPct > 30) {
    insights.push({
      id: 'i2',
      type: 'finding',
      severity: adolescentPct > 40 ? 'critical' : 'high',
      title: `Adolescents represent ${adolescentPct.toFixed(0)}% of reported cases`,
      description: `Patients aged 10–19 account for a disproportionate share of PAC cases, indicating gaps in adolescent sexual and reproductive health services and contraceptive access.`,
      metric: 'adolescentRate',
      value: adolescentPct,
      timestamp: new Date().toISOString(),
    })
  }

  if (compRate > 25) {
    insights.push({
      id: 'i3',
      type: 'trend',
      severity: 'high',
      title: `Regional complication rate at ${compRate.toFixed(1)}%`,
      description: `The overall complication rate exceeds the WHO-recommended threshold of 20%. This warrants urgent review of care protocols and facility-level quality improvement measures.`,
      metric: 'complicationRate',
      value: compRate,
      timestamp: new Date().toISOString(),
    })
  }

  const displaced = cases.filter((c) => c.displaced)
  if (displaced.length > 0) {
    const displacedCompRate = (displaced.filter((c) => c.complication).length / displaced.length) * 100
    if (displacedCompRate > compRate * 1.2) {
      insights.push({
        id: 'i4',
        type: 'finding',
        severity: 'high',
        title: 'Displaced populations face higher complication risk',
        description: `Internally displaced persons show a ${displacedCompRate.toFixed(1)}% complication rate vs. ${compRate.toFixed(1)}% overall, suggesting inadequate access to quality care in humanitarian settings.`,
        metric: 'displacedComplicationRate',
        value: displacedCompRate,
        timestamp: new Date().toISOString(),
      })
    }
  }

  if (lowestBurden && lowestBurden.rate < 20) {
    insights.push({
      id: 'i5',
      type: 'recommendation',
      severity: 'positive',
      title: `${lowestBurden.district} demonstrates best-practice outcomes`,
      description: `With a complication rate of only ${lowestBurden.rate.toFixed(1)}%, ${lowestBurden.district} offers a replicable model. Consider cross-district learning visits and protocol documentation.`,
      district: lowestBurden.district,
      metric: 'complicationRate',
      value: lowestBurden.rate,
      timestamp: new Date().toISOString(),
    })
  }

  insights.push({
    id: 'i6',
    type: 'recommendation',
    severity: 'medium',
    title: 'Expand facility reporting coverage',
    description: `Current reporting shows ${new Set(cases.map((c) => c.facilityName)).size} active facilities. Strengthening data reporting from private-sector and faith-based facilities would improve surveillance completeness by an estimated 40%.`,
    timestamp: new Date().toISOString(),
  })

  return insights
}

// ── District Intelligence ─────────────────────────────────────────────────────
export function getDistrictIntelligence(district: string, cases: PacCase[]): DistrictIntelligence {
  const rng = makePRNG(district.length * 31)
  const districtCases = cases.filter((c) => c.district === district)
  const total = districtCases.length
  const complications = districtCases.filter((c) => c.complication).length
  const adolescent = districtCases.filter((c) => ['10-14', '15-19'].includes(c.ageGroup))
  const coords = DISTRICT_COORDS[district]

  const compRate = total > 0 ? (complications / total) * 100 : 0
  const adolescentRate = total > 0 ? (adolescent.length / total) * 100 : 0
  const referrals = districtCases.filter((c) => c.referralRequired).length
  const referralRate = total > 0 ? (referrals / total) * 100 : 0

  const riskScore = computeRiskScore(compRate, adolescent.length / (total || 1), referrals / (total || 1))
  const riskLevel = riskScore > 60 ? 'critical' : riskScore > 40 ? 'high' : riskScore > 20 ? 'moderate' : 'low'

  const byAge = AGE_GROUPS.map((group) => {
    const groupCases = districtCases.filter((c) => c.ageGroup === group)
    const groupComp = groupCases.filter((c) => c.complication).length
    return {
      group,
      cases: groupCases.length,
      rate: groupCases.length > 0 ? (groupComp / groupCases.length) * 100 : 0,
    }
  })

  const bySex = ['female', 'male'].map((sex) => {
    const sexCases = districtCases.filter((c) => c.sex === sex)
    return { sex, cases: sexCases.length, pct: total > 0 ? (sexCases.length / total) * 100 : 0 }
  })

  const byWealth = [1, 2, 3, 4, 5].map((q) => {
    const qCases = districtCases.filter((c) => c.wealthQuintile === q)
    const qComp = qCases.filter((c) => c.complication).length
    const labels = ['Poorest', 'Poor', 'Middle', 'Rich', 'Richest']
    return {
      quintile: q,
      label: labels[q - 1],
      cases: qCases.length,
      rate: qCases.length > 0 ? (qComp / qCases.length) * 100 : 0,
    }
  })

  const byEducation = ['none', 'primary', 'secondary', 'tertiary'].map((level) => {
    const eCases = districtCases.filter((c) => c.educationLevel === level)
    const eComp = eCases.filter((c) => c.complication).length
    return {
      level: level.charAt(0).toUpperCase() + level.slice(1),
      cases: eCases.length,
      rate: eCases.length > 0 ? (eComp / eCases.length) * 100 : 0,
    }
  })

  const displaced = districtCases.filter((c) => c.displaced)

  const facilityNames = DISTRICT_FACILITY_NAMES[district] ?? []
  const facilities: FacilityPerformance[] = facilityNames.map((name) => {
    const fCases = districtCases.filter((c) => c.facilityName === name)
    const fComp = fCases.filter((c) => c.complication).length
    const fRate = fCases.length > 0 ? (fComp / fCases.length) * 100 : 0
    const compliance = Math.round(70 + rng() * 30)
    return {
      name,
      type: FACILITY_TYPES[Math.floor(rng() * FACILITY_TYPES.length)],
      cases: fCases.length,
      complicationRate: fRate,
      reportingCompliance: compliance,
      score: Math.round(100 - fRate * 1.5 + compliance * 0.3),
    }
  })

  const trends = computeTimeSeries(districtCases)

  const riskIndicators: RiskIndicator[] = [
    {
      label: 'Complication Rate',
      value: compRate,
      threshold: 20,
      status: compRate > 30 ? 'critical' : compRate > 20 ? 'warning' : 'normal',
      trend: rng() > 0.5 ? 'up' : 'down',
    },
    {
      label: 'Adolescent Case Share',
      value: adolescentRate,
      threshold: 30,
      status: adolescentRate > 40 ? 'critical' : adolescentRate > 30 ? 'warning' : 'normal',
      trend: rng() > 0.4 ? 'up' : 'stable',
    },
    {
      label: 'Referral Rate',
      value: referralRate,
      threshold: 15,
      status: referralRate > 25 ? 'critical' : referralRate > 15 ? 'warning' : 'normal',
      trend: rng() > 0.6 ? 'up' : 'stable',
    },
    {
      label: 'Reporting Compliance',
      value: Math.round(75 + rng() * 20),
      threshold: 80,
      status: rng() > 0.6 ? 'warning' : 'normal',
      trend: 'stable',
    },
  ]

  const findings = [
    `Complication rate of ${compRate.toFixed(1)}% ${compRate > 20 ? 'exceeds' : 'is below'} the 20% WHO threshold.`,
    `${adolescentRate.toFixed(0)}% of cases involve adolescent patients (aged 10–19).`,
    `${displaced.length} cases (${total > 0 ? ((displaced.length / total) * 100).toFixed(1) : 0}%) involve displaced persons.`,
    `${facilities.length} facilities actively reporting in this district.`,
  ]

  const recommendations = [
    `${riskLevel === 'critical' ? 'Immediately deploy' : 'Strengthen'} clinical support teams to ${district}.`,
    `Expand adolescent-friendly PAC services at ${facilities[0]?.name ?? 'key facilities'}.`,
    `Establish community health worker outreach in underserved sub-districts.`,
    `Improve data completeness: target 95%+ monthly reporting compliance.`,
  ]

  const aiSummary = `${district} presents a ${riskLevel} risk profile with a ${compRate.toFixed(1)}% complication rate across ${total.toLocaleString()} PAC cases in the surveillance period. ${adolescentRate > 30 ? `Adolescent patients represent ${adolescentRate.toFixed(0)}% of the caseload — a critical indicator requiring targeted youth-focused programming. ` : ''}${displaced.length > 0 ? `Displaced populations (${displaced.length} cases) face disproportionate barriers to care. ` : ''}Key priorities include ${riskLevel !== 'low' ? 'urgent clinical quality improvement, ' : ''}facility capacity strengthening, and enhanced community engagement.`

  return {
    district,
    overview: {
      population: coords.population,
      totalCases: total,
      complicationRate: compRate,
      adolescentRate,
      referralRate,
      facilitiesReporting: facilities.length,
      riskLevel,
      riskScore,
    },
    demographics: { byAge, bySex, byWealth, byEducation, displaced: { count: displaced.length, pct: total > 0 ? (displaced.length / total) * 100 : 0 } },
    facilities,
    trends,
    aiSummary,
    keyFindings: findings,
    riskIndicators,
    recommendations,
  }
}

// ── Forecasting ───────────────────────────────────────────────────────────────
export function generateForecast(district: string, metric: 'cases' | 'complications' | 'referrals'): ForecastData {
  const rng = makePRNG(district.length * 17 + metric.length)
  const { cases } = getData()
  const districtCases = district === 'All' ? cases : cases.filter((c) => c.district === district)
  const ts = computeTimeSeries(districtCases)

  const historicalPoints: ForecastPoint[] = ts.slice(-9).map((p) => ({
    month: p.month,
    actual: metric === 'cases' ? p.cases : metric === 'complications' ? p.complications : p.referrals,
    isProjection: false,
  }))

  const lastActual = historicalPoints[historicalPoints.length - 1]?.actual ?? 100
  const trend = (rng() - 0.45) * 0.08

  const forecastPoints: ForecastPoint[] = []
  for (let i = 1; i <= 6; i++) {
    const baseMonth = addDays(new Date(historicalPoints[historicalPoints.length - 1]?.month + '-01'), i * 30)
    const month = toYMD(baseMonth).slice(0, 7)
    const forecast = Math.max(0, Math.round(lastActual * (1 + trend * i) + (rng() - 0.5) * 20))
    const uncertainty = Math.round(forecast * 0.15 * Math.sqrt(i))
    forecastPoints.push({
      month,
      forecast,
      lower: Math.max(0, forecast - uncertainty),
      upper: forecast + uncertainty,
      isProjection: true,
    })
  }

  return {
    district,
    metric,
    points: [...historicalPoints, ...forecastPoints],
    confidenceLevel: 85,
    riskScore: Math.round(40 + rng() * 40),
    keyDrivers: [
      'Seasonal healthcare utilization patterns',
      'Facility reporting compliance trends',
      'Adolescent population dynamics',
      'Displacement and migration patterns',
    ],
  }
}

// ── Accountability ────────────────────────────────────────────────────────────
export function getAccountabilityData(): AccountabilityMetric[] {
  const rng = makePRNG(999)
  const { cases } = getData()
  const geoData = computeGeoData(cases)

  return DISTRICTS.map((district, i) => {
    const geo = geoData.find((g) => g.district === district)!
    const compScore = Math.max(0, Math.round(100 - geo.rate * 2.5))
    const coverageVal = Math.round(60 + rng() * 35)
    const reportingVal = Math.round(65 + rng() * 30)
    const serviceVal = Math.round(70 + rng() * 25)

    const overallScore = Math.round((compScore + coverageVal + reportingVal + serviceVal) / 4)

    return {
      district,
      complicationRate: { value: geo.rate, target: 20, score: compScore },
      facilityCoverage: { value: coverageVal, target: 80, score: coverageVal },
      reportingCompliance: { value: reportingVal, target: 85, score: reportingVal },
      serviceAvailability: { value: serviceVal, target: 90, score: serviceVal },
      overallScore,
      rank: 0,
      trend: (rng() > 0.5 ? 'improving' : rng() > 0.25 ? 'stable' : 'declining') as 'improving' | 'stable' | 'declining',
    }
  })
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((m, i) => ({ ...m, rank: i + 1 }))
}

// ── Live Events ───────────────────────────────────────────────────────────────
let _eventId = 1000

export function generateLiveEvent(): LiveEvent {
  const rng = makePRNG(Date.now() % 100000)
  const types = ['hotline', 'referral', 'alert', 'report', 'admission'] as const
  const type = randomChoice(rng, types)
  const district = randomChoice(rng, DISTRICTS)
  const facilities = DISTRICT_FACILITY_NAMES[district]
  const facility = facilities[Math.floor(rng() * facilities.length)]

  const messages: Record<string, string[]> = {
    hotline: [`Hotline call received from ${district} — patient seeking PAC guidance`, `Anonymous query from ${district} regarding complication symptoms`],
    referral: [`Emergency referral from ${facility} to regional hospital`, `Transfer request: ${facility} → Buea Regional Hospital`],
    alert: [`High complication rate alert in ${district} (7-day rolling)`, `Stockout alert: MVA supplies low at ${facility}`],
    report: [`Monthly data submission received from ${facility}`, `${district} submitted Q2 surveillance report`],
    admission: [`New PAC admission at ${facility}`, `Walk-in presentation at ${facility} — assessment initiated`],
  }

  const severities: Record<string, LiveEvent['severity']> = {
    alert: 'critical', referral: 'warning', hotline: 'info', report: 'success', admission: 'info',
  }

  return {
    id: `evt-${_eventId++}`,
    type,
    district,
    facility,
    message: randomChoice(rng, messages[type]),
    severity: severities[type],
    timestamp: new Date().toISOString(),
  }
}

// ── Search Intelligence ───────────────────────────────────────────────────────
export function getSearchIntelligence(query: string): SearchResult {
  const rng = makePRNG(query.length * 13)
  const lq = query.toLowerCase()

  const questions: SearchQuestion[] = [
    { question: `What are the signs of complications after ${lq}?`, category: 'what', volume: Math.round(800 + rng() * 400), trend: 'rising' },
    { question: `Where can I get safe ${lq} services in Cameroon?`, category: 'where', volume: Math.round(600 + rng() * 300), trend: 'rising' },
    { question: `Who provides post-abortion care near Buea?`, category: 'who', volume: Math.round(450 + rng() * 200), trend: 'stable' },
    { question: `How much does PAC treatment cost at public facilities?`, category: 'how', volume: Math.round(350 + rng() * 150), trend: 'stable' },
    { question: `When should I seek emergency care for complications?`, category: 'when', volume: Math.round(500 + rng() * 250), trend: 'rising' },
    { question: `Why are complication rates higher in Bwassa?`, category: 'why', volume: Math.round(200 + rng() * 100), trend: 'declining' },
  ]

  const popular: PopularSearch[] = [
    { term: `${lq} Buea clinic`, volume: 1240, district: 'Buea', growth: 12 },
    { term: `safe abortion Cameroon`, volume: 980, growth: 8 },
    { term: `PAC hotline number`, volume: 856, growth: 23 },
    { term: `${lq} complications symptoms`, volume: 743, growth: 5 },
    { term: `free reproductive health services`, volume: 612, growth: 15 },
    { term: `Limbe health center ${lq}`, volume: 489, district: 'Limbe', growth: -3 },
    { term: `adolescent health services Cameroon`, volume: 378, growth: 31 },
    { term: `contraception after abortion`, volume: 334, growth: 9 },
  ]

  const demographic: DemographicPattern[] = [
    { group: 'Women 15-24', searchIndex: 142, sentiment: -0.2 },
    { group: 'Women 25-34', searchIndex: 98, sentiment: -0.1 },
    { group: 'Adolescents <18', searchIndex: 67, sentiment: -0.35 },
    { group: 'Healthcare providers', searchIndex: 45, sentiment: 0.1 },
    { group: 'Community health workers', searchIndex: 38, sentiment: 0.2 },
  ]

  const trendData = Array.from({ length: 12 }, (_, i) => {
    const base = new Date('2025-07-01')
    base.setMonth(base.getMonth() + i)
    return {
      month: toYMD(base).slice(0, 7),
      volume: Math.round(400 + rng() * 300 + i * 15),
    }
  })

  return {
    query,
    relatedQuestions: questions,
    popularSearches: popular,
    demographicPatterns: demographic,
    trendData,
    sentimentBreakdown: [
      { label: 'Negative', value: 38, color: '#ef4444' },
      { label: 'Slightly negative', value: 27, color: '#f59e0b' },
      { label: 'Neutral', value: 20, color: '#6b7280' },
      { label: 'Slightly positive', value: 10, color: '#06b6d4' },
      { label: 'Positive', value: 5, color: '#10b981' },
    ],
    insights: [
      `Search volume for "${query}" has grown 18% in the last 6 months.`,
      'Buea accounts for 44% of all geo-tagged health searches in the region.',
      'Searches peak on Mondays and Tuesdays — post-weekend healthcare needs.',
      'Adolescents (15–19) show a 67% higher search index than other age groups.',
      'Complication symptom queries spike 2–3 days after local awareness campaigns.',
    ],
  }
}

// ── AI Assistant ──────────────────────────────────────────────────────────────
export function getAssistantResponse(message: string): string {
  const lm = message.toLowerCase()
  const { cases } = getData()
  const geoData = computeGeoData(cases)

  if (lm.includes('highest') && (lm.includes('complication') || lm.includes('risk'))) {
    const top = [...geoData].sort((a, b) => b.rate - a.rate)[0]
    return `**${top.district}** currently has the highest complication rate at **${top.rate.toFixed(1)}%** with ${top.totalCases.toLocaleString()} total cases. This is ${top.rate > 25 ? 'significantly above' : 'above'} the WHO recommended threshold of 20%. I recommend reviewing facility protocols in ${top.district} and deploying additional clinical support.`
  }

  if (lm.includes('compare') || lm.includes('vs') || lm.includes('versus')) {
    const districts = geoData.filter((d) => lm.includes(d.district.toLowerCase()))
    if (districts.length >= 2) {
      const [a, b] = districts
      return `**Comparison: ${a.district} vs ${b.district}**\n\n| Metric | ${a.district} | ${b.district} |\n|--------|---------|--------|\n| Total Cases | ${a.totalCases.toLocaleString()} | ${b.totalCases.toLocaleString()} |\n| Complication Rate | ${a.rate.toFixed(1)}% | ${b.rate.toFixed(1)}% |\n| Adolescent Cases | ${a.adolescentCases} | ${b.adolescentCases} |\n| Risk Score | ${a.riskScore}/100 | ${b.riskScore}/100 |\n\n${a.rate > b.rate ? a.district : b.district} presents a higher risk profile and should be prioritized for intervention.`
    }
  }

  if (lm.includes('summary') || lm.includes('report') || lm.includes('overview')) {
    const total = cases.length
    const comp = cases.filter((c) => c.complication).length
    const adol = cases.filter((c) => ['10-14', '15-19'].includes(c.ageGroup)).length
    return `**Regional Summary Report**\n\n- **Total PAC Cases:** ${total.toLocaleString()}\n- **Overall Complication Rate:** ${((comp / total) * 100).toFixed(1)}%\n- **Adolescent Share:** ${((adol / total) * 100).toFixed(0)}%\n- **Districts Monitored:** ${DISTRICTS.length}\n- **Highest Burden:** ${geoData.sort((a, b) => b.rate - a.rate)[0]?.district}\n- **Best Performing:** ${geoData.sort((a, b) => a.rate - b.rate)[0]?.district}\n\nKey recommendation: Prioritize targeted interventions in Bwassa and Limbe while documenting and scaling successful practices from Bokwaongo.`
  }

  for (const d of DISTRICTS) {
    if (lm.includes(d.toLowerCase())) {
      const geo = geoData.find((g) => g.district === d)!
      return `**${d} District Summary**\n\n${d} currently reports **${geo.totalCases.toLocaleString()} PAC cases** with a complication rate of **${geo.rate.toFixed(1)}%**. The district's risk score is **${geo.riskScore}/100** (${geo.riskScore > 60 ? 'Critical' : geo.riskScore > 40 ? 'High' : 'Moderate'}). ${geo.adolescentCases} adolescent cases have been recorded, representing ${((geo.adolescentCases / geo.totalCases) * 100).toFixed(0)}% of the total caseload. There are ${geo.facilitiesCount} active reporting facilities.`
    }
  }

  if (lm.includes('adolescent') || lm.includes('youth') || lm.includes('young')) {
    const adolCases = cases.filter((c) => ['10-14', '15-19'].includes(c.ageGroup))
    const adolComp = adolCases.filter((c) => c.complication).length
    return `**Adolescent Health Analysis**\n\nPatients aged 10–19 represent **${((adolCases.length / cases.length) * 100).toFixed(0)}%** of all PAC cases (${adolCases.length.toLocaleString()} cases). Their complication rate is **${adolCases.length > 0 ? ((adolComp / adolCases.length) * 100).toFixed(1) : 0}%**, higher than the regional average. This highlights critical gaps in adolescent sexual health education and contraceptive access. Recommended actions: establish youth-friendly health corners at all facilities, partner with schools for awareness campaigns, and expand confidential counseling services.`
  }

  return `I can help you analyze the PAC surveillance data. Here are some questions you can ask:\n\n- "Which district has the highest complication rate?"\n- "Compare Buea and Limbe"\n- "Show me adolescent health trends"\n- "Generate a summary report"\n- "What is the risk profile for Bwassa?"\n\nCurrent data covers **${cases.length.toLocaleString()} cases** across **${DISTRICTS.length} districts** in the Southwest Region.`
}
