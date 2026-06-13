import { NextRequest, NextResponse } from 'next/server'
import { getAssistantResponse } from '@/lib/mock-data'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  }
  // Simulate AI processing delay
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800))
  const response = getAssistantResponse(message)
  return NextResponse.json({ response })
}
