'use client'

import { Menu, Sun, Moon, RefreshCw, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useCommandPalette } from '@/components/CommandPalette'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import { DemoModeToggle } from '@/components/DemoMode'

const PAGE_LABELS: [string, string][] = [
  ['/dashboard/compare', 'District Comparison'],
  ['/dashboard/briefing', 'Executive Briefing'],
  ['/dashboard/sources', 'Data Sources Center'],
  ['/dashboard/ai-intelligence', 'AI Intelligence Center'],
  ['/dashboard/districts', 'District Intelligence'],
  ['/dashboard/operations', 'Operations Center'],
  ['/dashboard/forecasting', 'Forecasting & Predictions'],
  ['/dashboard/accountability', 'Accountability Scorecard'],
  ['/dashboard/search', 'Health Intelligence Search'],
  ['/dashboard/reports', 'Reports & Export'],
  ['/dashboard/assistant', 'AI Assistant'],
  ['/dashboard/users', 'User Management'],
  ['/dashboard/settings', 'Platform Settings'],
  ['/dashboard/account', 'Account Settings'],
  ['/dashboard', 'Overview Dashboard'],
]

interface TopNavProps {
  onMenuClick: () => void
  onRefresh?: () => void
  loading?: boolean
  lastUpdated?: Date | null
}

export function TopNav({ onMenuClick, onRefresh, loading, lastUpdated }: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const { open: openCommand } = useCommandPalette()
  const pathname = usePathname()
  const label = PAGE_LABELS.find(([key]) => pathname.startsWith(key))?.[1] ?? 'Dashboard'
  const isDistrictDetail = pathname.startsWith('/dashboard/districts/') && pathname.split('/').length > 3
  const districtName = isDistrictDetail ? decodeURIComponent(pathname.split('/').pop() ?? '') : null

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur-sm gap-4 shrink-0">
      <button onClick={onMenuClick} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-foreground truncate">
          {districtName ? `${districtName} · Intelligence Report` : label}
        </h2>
        {lastUpdated && <p className="text-xs text-muted-foreground hidden sm:block">Updated {lastUpdated.toLocaleTimeString()}</p>}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={openCommand}
          className="mr-1 hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground md:flex"
          title="Search (Ctrl/⌘ K)">
          <Search className="h-3.5 w-3.5" />
          <span>Search…</span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <button onClick={openCommand}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition md:hidden" title="Search">
          <Search className="h-4 w-4" />
        </button>
        {onRefresh && (
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground border hover:bg-accent hover:text-foreground transition disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
        <DemoModeToggle />
        <NotificationsBell />
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition" title="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-health-green animate-live-dot" />Live · Southwest Region
        </span>
      </div>
    </header>
  )
}
