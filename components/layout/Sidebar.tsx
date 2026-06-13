'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Map, Search, TrendingUp, Target,
  FileText, MessageSquare, Radio, LogOut, ChevronRight,
  Users, Settings, X, ScrollText, Database, Bot
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { BrandHeader } from '@/components/Brand'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Executive Briefing', href: '/dashboard/briefing', icon: ScrollText },
  { label: 'District Intelligence', href: '/dashboard/districts', icon: Map },
  { label: 'Operations Center', href: '/dashboard/operations', icon: Radio },
  { label: 'Forecasting', href: '/dashboard/forecasting', icon: TrendingUp },
  { label: 'Accountability', href: '/dashboard/accountability', icon: Target },
  { label: 'Data Sources', href: '/dashboard/sources', icon: Database },
  { label: 'Health Search', href: '/dashboard/search', icon: Search },
  { label: 'AI Intelligence', href: '/dashboard/ai-intelligence', icon: Bot },
  { label: 'Reports & Export', href: '/dashboard/reports', icon: FileText },
  { label: 'AI Assistant', href: '/dashboard/assistant', icon: MessageSquare },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link href="/dashboard" className="flex items-center" onClick={onClose}>
            <BrandHeader compact />
          </Link>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Platform
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : '')} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5" />}
              </Link>
            )
          })}

          {user?.role === 'admin' && (
            <>
              <div className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Administration
              </div>
              {[
                { label: 'User Management', href: '/dashboard/users', icon: Users },
                { label: 'Platform Settings', href: '/dashboard/settings', icon: Settings },
              ].map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : '')} />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5" />}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Bottom user section */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg p-1">
            <Link
              href="/dashboard/account"
              onClick={onClose}
              className="flex flex-1 items-center gap-3 rounded-lg p-1.5 min-w-0 transition-colors hover:bg-accent/50"
              title="Account settings"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-xs font-medium text-foreground">{user?.name}</div>
                <div className="truncate text-[10px] text-muted-foreground capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-md p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5 px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-health-green animate-live-dot" />
            <span className="text-[10px] text-muted-foreground">Live data · Southwest Region</span>
          </div>
        </div>
      </aside>
    </>
  )
}
