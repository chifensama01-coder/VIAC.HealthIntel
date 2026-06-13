import { NextRequest, NextResponse } from 'next/server'
import { getSearchIntelligence } from '@/lib/mock-data'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') ?? 'abortion safety'
  const data = getSearchIntelligence(query)
  return NextResponse.json(data)
}
