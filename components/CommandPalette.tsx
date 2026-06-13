'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Map, Radio, TrendingUp, Target, Search as SearchIcon,
  FileText, MessageSquare, Users, Settings, User as UserIcon, Moon, Sun,
  CornerDownLeft, MapPin, GitCompareArrows, ScrollText, Database, Bot, Info, Lock,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { DISTRICTS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Command {
  id: string
  label: string
  hint?: string
  icon: any
  group: 'Navigate' | 'Districts' | 'Actions'
  run: () => void
  keywords?: string
}

const CommandCtx = createContext<{ open: () => void } | null>(null)
export function useCommandPalette() {
  const ctx = useContext(CommandCtx)
  return ctx ?? { open: () => {} }
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => { setOpen(false); router.push(href) }
    const nav: Command[] = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Navigate', run: go('/dashboard'), keywords: 'home dashboard' },
      { id: 'briefing', label: 'Executive Briefing', icon: ScrollText, group: 'Navigate', run: go('/dashboard/briefing'), keywords: 'summary brief decision' },
      { id: 'districts', label: 'District Intelligence', icon: Map, group: 'Navigate', run: go('/dashboard/districts') },
      { id: 'compare', label: 'Compare Districts', icon: GitCompareArrows, group: 'Navigate', run: go('/dashboard/compare'), keywords: 'comparison versus vs side by side' },
      { id: 'operations', label: 'Operations Center', icon: Radio, group: 'Navigate', run: go('/dashboard/operations') },
      { id: 'forecasting', label: 'Forecasting', icon: TrendingUp, group: 'Navigate', run: go('/dashboard/forecasting') },
      { id: 'accountability', label: 'Accountability', icon: Target, group: 'Navigate', run: go('/dashboard/accountability') },
      { id: 'sources', label: 'Data Sources', icon: Database, group: 'Navigate', run: go('/dashboard/sources'), keywords: 'evidence provenance reliability' },
      { id: 'search', label: 'Health Search', icon: SearchIcon, group: 'Navigate', run: go('/dashboard/search') },
      { id: 'ai-intel', label: 'AI Intelligence', icon: Bot, group: 'Navigate', run: go('/dashboard/ai-intelligence'), keywords: 'misinformation knowledge gaps chatgpt claude' },
      { id: 'reports', label: 'Reports & Export', icon: FileText, group: 'Navigate', run: go('/dashboard/reports') },
      { id: 'assistant', label: 'AI Assistant', icon: MessageSquare, group: 'Navigate', run: go('/dashboard/assistant') },
      { id: 'users', label: 'User Management', icon: Users, group: 'Navigate', run: go('/dashboard/users') },
      { id: 'settings', label: 'Platform Settings', icon: Settings, group: 'Navigate', run: go('/dashboard/settings') },
      { id: 'account', label: 'Account Settings', icon: UserIcon, group: 'Navigate', run: go('/dashboard/account') },
      { id: 'about', label: 'About HealthIntel', icon: Info, group: 'Navigate', run: go('/dashboard/about'), keywords: 'mission contact organization' },
      { id: 'privacy', label: 'Privacy & Data Governance', icon: Lock, group: 'Navigate', run: go('/dashboard/privacy'), keywords: 'security ethics data governance' },
    ]
    const districts: Command[] = DISTRICTS.map((d) => ({
      id: `district-${d}`, label: d, hint: 'District report', icon: MapPin, group: 'Districts',
      run: () => { setOpen(false); router.push(`/dashboard/districts/${d}`) }, keywords: 'district intelligence',
    }))
    const actions: Command[] = [
      { id: 'new-report', label: 'Generate a report', icon: FileText, group: 'Actions', run: go('/dashboard/reports'), keywords: 'pdf export download' },
      { id: 'ask-ai', label: 'Ask the AI assistant', icon: MessageSquare, group: 'Actions', run: go('/dashboard/assistant'), keywords: 'chat question' },
      { id: 'toggle-theme', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: theme === 'dark' ? Sun : Moon, group: 'Actions', run: () => { setTheme(theme === 'dark' ? 'light' : 'dark') }, keywords: 'theme dark light appearance' },
    ]
    return [...nav, ...districts, ...actions]
  }, [router, theme, setTheme])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return commands
    return commands.filter((c) => (c.label + ' ' + (c.keywords ?? '') + ' ' + c.group).toLowerCase().includes(q))
  }, [commands, query])

  const groups = useMemo(() => {
    const g: Record<string, Command[]> = {}
    filtered.forEach((c) => { (g[c.group] ||= []).push(c) })
    return g
  }, [filtered])

  // Global hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); document.body.style.overflow = 'hidden' }
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { setActive(0) }, [query])

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[active]?.run() }
    else if (e.key === 'Escape') { setOpen(false) }
  }

  // flat index map for highlighting across groups
  let runningIndex = -1

  return (
    <CommandCtx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[12vh]">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border bg-card shadow-2xl animate-fade-in" onKeyDown={onListKey}>
            <div className="flex items-center gap-2 border-b px-4">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, districts, actions…"
                className="w-full bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="hidden sm:inline rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2 custom-scrollbar">
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No matches for “{query}”.</p>
              )}
              {Object.entries(groups).map(([group, items]) => (
                <div key={group} className="mb-1">
                  <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group}</div>
                  {items.map((c) => {
                    runningIndex++
                    const idx = runningIndex
                    const isActive = idx === active
                    return (
                      <button
                        key={c.id}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => c.run()}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                          isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent/50'
                        )}
                      >
                        <c.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="flex-1">{c.label}</span>
                        {c.hint && <span className="text-[10px] text-muted-foreground">{c.hint}</span>}
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground">
              <span>HealthIntel · Vision in Action Cameroon</span>
              <span className="flex items-center gap-2">
                <span><kbd className="rounded border bg-muted px-1">↑</kbd> <kbd className="rounded border bg-muted px-1">↓</kbd> navigate</span>
                <span><kbd className="rounded border bg-muted px-1">↵</kbd> select</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </CommandCtx.Provider>
  )
}
