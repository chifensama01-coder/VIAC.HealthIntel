'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Dashboard error:', error) }, [error])

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-foreground">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This section hit an unexpected error. Your data is safe — try reloading the view.
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">ref: {error.digest}</p>
        )}
        <button onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  )
}
