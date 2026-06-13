import { NextRequest, NextResponse } from 'next/server'
import { generateForecast } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const district = searchParams.get('district') ?? 'All'
  const metric = (searchParams.get('metric') ?? 'cases') as 'cases' | 'complications' | 'referrals'
  const data = generateForecast(district, metric)
  return NextResponse.json(data)
}
