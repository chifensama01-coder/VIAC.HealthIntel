import { NextResponse } from 'next/server'
import { generateLiveEvent } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      function send(data: object) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // Controller already closed
        }
      }

      // Send 3 initial events immediately
      for (let i = 0; i < 3; i++) {
        send(generateLiveEvent())
      }

      // Then send new events every 8 seconds
      const interval = setInterval(() => {
        try {
          send(generateLiveEvent())
        } catch {
          clearInterval(interval)
        }
      }, 8000)

      // Keep-alive ping every 20 seconds
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(ping)
        }
      }, 20000)

      // Cleanup when client disconnects
      return () => {
        clearInterval(interval)
        clearInterval(ping)
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
