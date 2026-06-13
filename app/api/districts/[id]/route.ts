import { NextRequest, NextResponse } from 'next/server'
import { getData, getDistrictIntelligence } from '@/lib/mock-data'
import { DISTRICTS } from '@/lib/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const district = decodeURIComponent(id)

  if (!(DISTRICTS as readonly string[]).includes(district)) {
    return NextResponse.json({ error: 'District not found' }, { status: 404 })
  }

  const { cases } = getData()
  const intelligence = getDistrictIntelligence(district, cases)
  return NextResponse.json(intelligence)
}
