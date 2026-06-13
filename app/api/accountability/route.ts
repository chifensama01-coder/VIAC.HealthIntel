import { NextResponse } from 'next/server'
import { getAccountabilityData } from '@/lib/mock-data'

export async function GET() {
  const data = getAccountabilityData()
  return NextResponse.json(data)
}
