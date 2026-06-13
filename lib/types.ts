// ── Core Data Types ─────────────────────────────────────────────────────────

export interface PacCase {
  id: number
  district: string
  ageGroup: string
  sex: string
  complication: boolean
  complicationType?: string
  date: string
  facilityType: string
  facilityName: string
  wealthQuintile: number   // 1-5 (poorest → richest)
  educationLevel: string
  displaced: boolean
  referralRequired: boolean
  outcomeStatus: 'recovered' | 'referred' | 'pending' | 'complication'
}

export interface DigitalTrace {
  id: number
  district: string
  searchVolume: number
  sentiment: number
  timestamp: string
  topic: string
}

export interface GeoDataPoint {
  district: string
  rate: number
  lat: number
  lng: number
  population: number
  totalCases: number
  complications: number
  adolescentCases: number
  facilitiesCount: number
  riskScore: number
}

export interface TimeSeriesPoint {
  month: string
  cases: number
  complications: number
  adolescent: number
  referrals: number
}

export interface DigitalTracePoint {
  district: string
  searchVolume: number
  sentiment: number
  topTopic: string
}

export interface DashboardSummary {
  totalCases: number
  complicationRate: number
  adolescentRate: number
  facilitiesReporting: number
  referralRate: number
  changeVsPriorPeriod: {
    cases: number
    complications: number
    adolescent: number
  }
}

export interface DashboardData {
  summary: DashboardSummary
  geoData: GeoDataPoint[]
  timeSeries: TimeSeriesPoint[]
  digitalTrace: DigitalTracePoint[]
  insights: AIInsight[]
}

export interface Filters {
  districts: string[]
  ageGroups: string[]
  sex: string
  wealthQuintiles?: number[]
  educationLevels?: string[]
  displaced?: boolean | null
  facilityTypes?: string[]
  dateRange?: { from: string; to: string }
}

// ── District Intelligence ────────────────────────────────────────────────────

export interface DistrictIntelligence {
  district: string
  overview: {
    population: number
    totalCases: number
    complicationRate: number
    adolescentRate: number
    referralRate: number
    facilitiesReporting: number
    riskLevel: 'critical' | 'high' | 'moderate' | 'low'
    riskScore: number
  }
  demographics: {
    byAge: { group: string; cases: number; rate: number }[]
    bySex: { sex: string; cases: number; pct: number }[]
    byWealth: { quintile: number; label: string; cases: number; rate: number }[]
    byEducation: { level: string; cases: number; rate: number }[]
    displaced: { count: number; pct: number }
  }
  facilities: FacilityPerformance[]
  trends: TimeSeriesPoint[]
  aiSummary: string
  keyFindings: string[]
  riskIndicators: RiskIndicator[]
  recommendations: string[]
}

export interface FacilityPerformance {
  name: string
  type: string
  cases: number
  complicationRate: number
  reportingCompliance: number
  score: number
}

export interface RiskIndicator {
  label: string
  value: number
  threshold: number
  status: 'critical' | 'warning' | 'normal'
  trend: 'up' | 'down' | 'stable'
}

// ── AI Insights ──────────────────────────────────────────────────────────────

export interface AIInsight {
  id: string
  type: 'finding' | 'risk' | 'trend' | 'recommendation'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'positive'
  title: string
  description: string
  district?: string
  metric?: string
  value?: number
  change?: number
  timestamp: string
}

// ── Search Intelligence ──────────────────────────────────────────────────────

export interface SearchResult {
  query: string
  relatedQuestions: SearchQuestion[]
  popularSearches: PopularSearch[]
  demographicPatterns: DemographicPattern[]
  trendData: { month: string; volume: number }[]
  sentimentBreakdown: { label: string; value: number; color: string }[]
  insights: string[]
}

export interface SearchQuestion {
  question: string
  category: 'what' | 'who' | 'where' | 'when' | 'how' | 'why'
  volume: number
  trend: 'rising' | 'stable' | 'declining'
}

export interface PopularSearch {
  term: string
  volume: number
  district?: string
  growth: number
}

export interface DemographicPattern {
  group: string
  searchIndex: number
  sentiment: number
}

// ── Forecasting ──────────────────────────────────────────────────────────────

export interface ForecastPoint {
  month: string
  actual?: number
  forecast?: number
  lower?: number
  upper?: number
  isProjection: boolean
}

export interface ForecastData {
  district: string
  metric: 'cases' | 'complications' | 'referrals'
  points: ForecastPoint[]
  confidenceLevel: number
  riskScore: number
  keyDrivers: string[]
}

// ── Operations / Events ──────────────────────────────────────────────────────

export interface LiveEvent {
  id: string
  type: 'hotline' | 'referral' | 'alert' | 'report' | 'admission'
  district: string
  facility?: string
  message: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  timestamp: string
}

// ── Accountability ───────────────────────────────────────────────────────────

export interface AccountabilityMetric {
  district: string
  complicationRate: { value: number; target: number; score: number }
  facilityCoverage: { value: number; target: number; score: number }
  reportingCompliance: { value: number; target: number; score: number }
  serviceAvailability: { value: number; target: number; score: number }
  overallScore: number
  rank: number
  trend: 'improving' | 'stable' | 'declining'
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'regional_manager' | 'facility_manager' | 'public_viewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  organization?: string
  title?: string
  assignedDistricts?: string[]
  assignedFacilities?: string[]
  lastLogin: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: string
}

// ── Constants ────────────────────────────────────────────────────────────────

export const DISTRICTS = ['Buea', 'Limbe', 'Bokwaongo', 'Bwassa'] as const
export const AGE_GROUPS = ['10-14', '15-19', '20-24', '25+'] as const
export const SEXES = ['all', 'female', 'male'] as const
export const FACILITY_TYPES = ['state', 'private', 'faith', 'NGO'] as const
export const WEALTH_QUINTILES = [1, 2, 3, 4, 5] as const
export const EDUCATION_LEVELS = ['none', 'primary', 'secondary', 'tertiary'] as const
export const COMPLICATION_TYPES = [
  'hemorrhage', 'infection', 'sepsis', 'injury', 'incomplete', 'other'
] as const

export const DISTRICT_COORDS: Record<string, { lat: number; lng: number; population: number }> = {
  Buea: { lat: 4.1525, lng: 9.241, population: 89000 },
  Limbe: { lat: 4.0027, lng: 9.201, population: 74000 },
  Bokwaongo: { lat: 4.125, lng: 9.275, population: 28000 },
  Bwassa: { lat: 4.08, lng: 9.185, population: 21000 },
}

export const DISTRICT_FACILITY_NAMES: Record<string, string[]> = {
  Buea: ['Buea Regional Hospital', 'Molyko Health Centre', 'Mile 17 Clinic', 'CAMHIS Buea'],
  Limbe: ['Limbe Regional Hospital', 'New Town Health Centre', 'Down Beach Clinic', 'SAJOCAH Limbe'],
  Bokwaongo: ['Bokwaongo Health Post', 'Buea Road Dispensary', 'Solidarity Clinic'],
  Bwassa: ['Bwassa Health Centre', 'Muyuka Annexe', 'Lysoka Clinic'],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  regional_manager: 'Regional Manager',
  facility_manager: 'Facility Manager',
  public_viewer: 'Public Viewer',
}

export const RISK_LEVEL_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  moderate: '#3b82f6',
  low: '#10b981',
}
