'use client'

import { useState, useCallback } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, HelpCircle, Hash, Users, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SearchResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const QUESTION_ICONS = {
  what: '❓', who: '👤', where: '📍', when: '🕐', how: '⚙️', why: '💡'
}

const SUGGESTION_QUERIES = [
  'abortion safety Buea', 'PAC complications Cameroon', 'safe abortion services',
  'post-abortion care adolescents', 'reproductive health Limbe', 'hotline numbers Cameroon',
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      const data: SearchResult = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSearch(query)
  }

  const TREND_ICON = (t: string) => t === 'rising' ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : t === 'declining' ? <TrendingDown className="h-3 w-3 text-red-500" /> : <Minus className="h-3 w-3 text-muted-foreground" />

  return (
    <div className="p-5 lg:p-6 space-y-6">
      {/* Hero search */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 p-8 lg:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Health Intelligence Search</h1>
            <p className="text-muted-foreground mb-6 text-sm">Discover what communities search for around reproductive health and PAC services</p>
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. abortion safety in Buea, PAC complications..."
                className="w-full rounded-xl border-2 bg-background py-4 pl-12 pr-32 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition"
              />
              <button type="submit" disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition hover:bg-primary/90">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            {!searched && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTION_QUERIES.map((sq) => (
                  <button key={sq} onClick={() => { setQuery(sq); doSearch(sq) }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition">
                    {sq}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      )}

      {results && !loading && (
        <div className="space-y-5">
          {/* AI Insights */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Intelligence Insights for "{results.query}"
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {results.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
                  <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{i + 1}</div>
                  <p className="text-xs text-muted-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Related questions */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" /> Questions People Ask
              </h3>
              <div className="space-y-2">
                {results.relatedQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/20 cursor-pointer transition"
                    onClick={() => { setQuery(q.question); doSearch(q.question) }}>
                    <span className="text-base">{QUESTION_ICONS[q.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{q.question}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{q.volume.toLocaleString()} searches/mo</span>
                        {TREND_ICON(q.trend)}
                        <span className={cn(q.trend === 'rising' ? 'text-emerald-500' : q.trend === 'declining' ? 'text-red-500' : '')}>{q.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular searches */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" /> Popular Searches
              </h3>
              <div className="space-y-2">
                {results.popularSearches.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{s.term}</p>
                      {s.district && <span className="text-xs text-muted-foreground">{s.district}</span>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-foreground">{s.volume.toLocaleString()}</p>
                      <p className={cn('text-[10px]', s.growth > 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {s.growth > 0 ? '+' : ''}{s.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Search volume trend */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Search Volume Trend (12mo)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={results.trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={(m) => m.slice(5)} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
                    {results.trendData.map((_, i) => <Cell key={i} fill={`hsl(${221 + i * 2} 83% ${50 + i}%)`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sentiment */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Sentiment Breakdown</h3>
              <div className="space-y-2.5">
                {results.sentimentBreakdown.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-foreground">{s.label}</span>
                      <span className="text-xs font-bold text-foreground">{s.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.value}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Demographic Search Patterns
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {results.demographicPatterns.map((d) => (
                <div key={d.group} className="rounded-lg border border-border bg-muted/20 p-4 text-center">
                  <p className="text-xs font-medium text-foreground mb-2">{d.group}</p>
                  <p className="text-xl font-bold text-foreground">{d.searchIndex}</p>
                  <p className="text-[10px] text-muted-foreground">search index</p>
                  <p className={cn('text-xs font-medium mt-1', d.sentiment < -0.1 ? 'text-red-500' : d.sentiment > 0.1 ? 'text-emerald-500' : 'text-muted-foreground')}>
                    Sentiment: {d.sentiment.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
