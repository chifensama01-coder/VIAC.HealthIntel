'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import SummaryCards from '@/components/SummaryCards'
import TimeSeriesChart from '@/components/TimeSeriesChart'
import DigitalTraceWidget from '@/components/DigitalTraceWidget'
import { DemographicFilterPanel } from '@/components/DemographicFilterPanel'
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel'
import { PlatformIntro } from '@/components/dashboard/PlatformIntro'
import { WhyThisMatters } from '@/components/dashboard/WhyThisMatters'
import { SiteFooter } from '@/components/SiteFooter'
import type { DashboardData, Filters } from '@/lib/types'
import { Filter, SlidersHorizontal, RefreshCw } from 'lucide-react'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl border bg-card">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-2 text-xs text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
})

const DEFAULT_DATA: DashboardData = {
  summary: { totalCases: 0, complicationRate: 0, adolescentRate: 0, facilitiesReporting: 0, referralRate: 0, changeVsPriorPeriod: { cases: 0, complications: 0, adolescent: 0 } },
  geoData: [],
  timeSeries: [],
  digitalTrace: [],
  insights: [],
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchData = useCallback(async (filters: Filters = { districts: [], ageGroups: [], sex: 'all' }) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.districts.length) params.set('district', filters.districts.join(','))
      if (filters.ageGroups.length) params.set('ageGroup', filters.ageGroups.join(','))
      if (filters.sex !== 'all') params.set('sex', filters.sex)
      if (filters.wealthQuintiles?.length) params.set('wealth', filters.wealthQuintiles.join(','))
      if (filters.educationLevels?.length) params.set('education', filters.educationLevels.join(','))
      if (filters.displaced != null) params.set('displaced', String(filters.displaced))

      const res = await fetch(`/api/dashboard-data?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json: DashboardData = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <div className="flex h-full">
        {/* Filters sidebar (desktop) */}
        <aside className={`hidden lg:flex w-72 shrink-0 flex-col border-r bg-card overflow-y-auto`}>
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters</span>
          </div>
          <DemographicFilterPanel onApply={fetchData} loading={loading} />
        </aside>

        {/* Mobile filter overlay */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-80 bg-card border-r overflow-y-auto">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters</span>
                </div>
                <button onClick={() => setFiltersOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">Close</button>
              </div>
              <DemographicFilterPanel onApply={(f) => { fetchData(f); setFiltersOpen(false) }} loading={loading} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-6 space-y-5">
            {/* Platform intro — explains what HealthIntel is */}
            <PlatformIntro totalCases={data.summary.totalCases || undefined} />

            {/* Why this matters — value for decision-makers */}
            <WhyThisMatters />

            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground">Regional Overview</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Southwest Region, Cameroon · PAC Surveillance · {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile filters button */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
                <button
                  onClick={() => fetchData()}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <SummaryCards summary={data.summary} loading={loading} />

            {/* Map + AI Insights — equal-height row; AI panel scrolls internally */}
            <div className="grid gap-5 xl:grid-cols-3 xl:h-[580px]">
              <div className="xl:col-span-2 min-h-[360px] xl:h-full">
                <MapComponent geoData={data.geoData} loading={loading} />
              </div>
              <div className="xl:col-span-1 min-h-0 xl:h-full">
                <AIInsightsPanel insights={data.insights} loading={loading} />
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-5 lg:grid-cols-2">
              <TimeSeriesChart data={data.timeSeries} loading={loading} />
              <DigitalTraceWidget data={data.digitalTrace} loading={loading} />
            </div>

            <SiteFooter />
          </div>
        </div>
      </div>
    </>
  )
}
