import { NextRequest, NextResponse } from 'next/server'
import {
  getData, filterCases, computeGeoData, computeTimeSeries, computeDigitalTrace, generateAIInsights,
} from '@/lib/mock-data'
import { DISTRICTS } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const districtParam = searchParams.get('district')
  const ageGroupParam = searchParams.get('ageGroup')
  const sexParam = searchParams.get('sex') ?? 'all'
  const wealthParam = searchParams.get('wealth')
  const educationParam = searchParams.get('education')
  const displacedParam = searchParams.get('displaced')

  const districts = districtParam
    ? districtParam.split(',').filter((d) => (DISTRICTS as readonly string[]).includes(d))
    : []
  const ageGroups = ageGroupParam ? ageGroupParam.split(',') : []
  const wealthQuintiles = wealthParam ? wealthParam.split(',').map(Number) : []
  const educationLevels = educationParam ? educationParam.split(',') : []
  const displaced = displacedParam === 'true' ? true : displacedParam === 'false' ? false : null

  const { cases, traces } = getData()

  const filtered = filterCases(cases, {
    districts, ageGroups, sex: sexParam, wealthQuintiles, educationLevels, displaced: displaced ?? undefined,
  })

  const totalCases = filtered.length
  const complications = filtered.filter((c) => c.complication).length
  const complicationRate = totalCases > 0 ? parseFloat(((complications / totalCases) * 100).toFixed(1)) : 0

  const adolescent = filtered.filter((c) => c.ageGroup === '10-14' || c.ageGroup === '15-19')
  const adolescentComplications = adolescent.filter((c) => c.complication).length
  const adolescentRate = adolescent.length > 0 ? parseFloat(((adolescentComplications / adolescent.length) * 100).toFixed(1)) : 0

  const referrals = filtered.filter((c) => c.referralRequired).length
  const referralRate = totalCases > 0 ? parseFloat(((referrals / totalCases) * 100).toFixed(1)) : 0

  const facilitiesReporting = new Set(filtered.map((c) => c.facilityName)).size

  // Prior period comparison (simple estimate)
  const prior30pct = 0.85
  const changeVsPriorPeriod = {
    cases: parseFloat((((1 - prior30pct) / prior30pct) * 100).toFixed(1)),
    complications: parseFloat((complicationRate - complicationRate * prior30pct).toFixed(1)),
    adolescent: parseFloat((adolescentRate - adolescentRate * prior30pct).toFixed(1)),
  }

  const geoData = computeGeoData(filtered)
  const timeSeries = computeTimeSeries(filtered)
  const digitalTrace = computeDigitalTrace(traces, districts.length ? districts : undefined)
  const insights = generateAIInsights(filtered, geoData)

  return NextResponse.json({
    summary: { totalCases, complicationRate, adolescentRate, facilitiesReporting, referralRate, changeVsPriorPeriod },
    geoData,
    timeSeries,
    digitalTrace,
    insights,
  })
}
