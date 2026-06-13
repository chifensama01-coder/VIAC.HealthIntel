import { cn } from '@/lib/utils'

/**
 * Vision in Action Cameroon — brand assets.
 * Swap /public/logo-mark.svg or /public/logo-full.svg with the official
 * artwork at any time; sizes below stay intact.
 */

export function BrandMark({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/logo-mark.svg"
      alt="Vision in Action Cameroon"
      className={cn('h-9 w-9 rounded-xl shadow-sm', className)}
    />
  )
}

export function BrandLockup({ className }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/logo-full.svg"
      alt="Vision in Action Cameroon"
      className={cn('h-12 w-auto', className)}
    />
  )
}

/** Sidebar / topbar wordmark: org mark + product name. */
export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={compact ? 'h-8 w-8' : 'h-9 w-9'} />
      <div className="leading-none">
        <div className="text-sm font-bold text-foreground">HealthIntel</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          Vision in Action Cameroon
        </div>
      </div>
    </div>
  )
}
