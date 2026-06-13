import { NextResponse } from 'next/server'
import { getData, computeGeoData } from '@/lib/mock-data'

export async function GET() {
  const { cases, traces } = getData()
  const geoData = computeGeoData(cases)
  return NextResponse.json({
    message: 'HealthIntel Platform — Data ready.',
    status: 'ok',
    counts: {
      cases: cases.length,
      traces: traces.length,
      districts: geoData.length,
    },
    summary: geoData.map((d) => ({
      district: d.district,
      cases: d.totalCases,
      rate: d.rate,
      riskScore: d.riskScore,
    })),
  })
}

export async function POST() {
  return GET()
}
