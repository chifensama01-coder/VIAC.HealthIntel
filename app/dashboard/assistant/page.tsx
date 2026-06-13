'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Loader2, Bot, User, Sparkles, Plus, MessageSquare,
  Trash2, PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string // ISO timestamp
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  updatedAt: number
}

const STORAGE_KEY = 'healthintel_chats'

const GREETING =
  "Hello! I'm the HealthIntel AI Assistant. I can help you analyze PAC surveillance data, compare districts, generate reports, and answer questions about the platform.\n\nTry asking me something like \"Which district has the highest risk?\" or \"Compare Buea and Limbe\"."

const STARTER_PROMPTS = [
  'Which district has the highest complication rate?',
  'Compare Buea and Limbe',
  'Generate a summary report for all districts',
  'Show me adolescent health indicators',
  'What is the risk profile for Bwassa?',
  'Which facility types have the most complications?',
]

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function relativeDay(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : '')}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm',
        isUser
          ? 'rounded-tr-sm bg-primary text-primary-foreground'
          : 'rounded-tl-sm bg-card border border-border text-foreground'
      )}>
        {msg.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mb-1">{line.slice(2, -2)}</p>
          if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>
          if (line.startsWith('|')) return <code key={i} className="block text-xs font-mono whitespace-pre">{line}</code>
          return line ? <p key={i} className="mb-1 last:mb-0">{line}</p> : <br key={i} />
        })}
        <p className={cn('mt-2 text-[10px]', isUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground')}>
          {timeLabel(msg.ts)}
        </p>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load saved conversations
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: Conversation[] = JSON.parse(raw)
        setConversations(parsed)
        setActiveId(parsed[0]?.id ?? null)
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist whenever conversations change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)) } catch { /* ignore */ }
  }, [conversations, hydrated])

  const active = conversations.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const newChat = useCallback(() => {
    setActiveId(null)
    setInput('')
    setHistoryOpen(false)
  }, [])

  function deleteChat(id: string) {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id)
      if (id === activeId) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: new Date().toISOString() }

    let convoId = activeId
    if (convoId && conversations.some((c) => c.id === convoId)) {
      setConversations((prev) => prev.map((c) =>
        c.id === convoId ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() } : c
      ))
    } else {
      convoId = `chat-${Date.now()}`
      const title = text.length > 42 ? text.slice(0, 42) + '…' : text
      const convo: Conversation = { id: convoId, title, messages: [userMsg], updatedAt: Date.now() }
      setConversations((prev) => [convo, ...prev])
      setActiveId(convoId)
    }

    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const { response } = await res.json()
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, ts: new Date().toISOString() }
      setConversations((prev) => prev.map((c) =>
        c.id === convoId ? { ...c, messages: [...c.messages, aiMsg], updatedAt: Date.now() } : c
      ))
    } catch {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', ts: new Date().toISOString() }
      setConversations((prev) => prev.map((c) =>
        c.id === convoId ? { ...c, messages: [...c.messages, errMsg], updatedAt: Date.now() } : c
      ))
    } finally {
      setLoading(false)
    }
  }

  const showGreeting = messages.length === 0

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* History panel */}
      <aside className={cn(
        'absolute z-30 h-full w-72 shrink-0 flex-col border-r bg-card lg:static lg:flex lg:translate-x-0 transition-transform',
        historyOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      )}>
        <div className="p-3">
          <button onClick={newChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New chat
          </button>
        </div>
        <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Recent chats
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
          {conversations.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">No saved chats yet</p>
          )}
          {conversations.map((c) => (
            <div key={c.id}
              className={cn('group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors',
                c.id === activeId ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}
              onClick={() => { setActiveId(c.id); setHistoryOpen(false) }}>
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{c.title}</div>
                <div className="text-[10px] text-muted-foreground/80">{relativeDay(c.updatedAt)}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteChat(c.id) }}
                className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive transition"
                title="Delete chat">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {historyOpen && <div className="absolute inset-0 z-20 bg-background/60 lg:hidden" onClick={() => setHistoryOpen(false)} />}

      {/* Chat column */}
      <div className="flex h-full flex-1 flex-col">
        {/* Header */}
        <div className="border-b bg-card px-5 py-4 flex items-center gap-3 shrink-0">
          <button onClick={() => setHistoryOpen((v) => !v)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden">
            <PanelLeft className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">AI Health Intelligence Assistant</h2>
            <p className="text-xs text-muted-foreground truncate">Powered by HealthIntel Analytics Engine · Context-aware responses</p>
          </div>
          <button onClick={newChat}
            className="ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition">
            <Plus className="h-3.5 w-3.5" /> New chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {showGreeting && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-foreground">
                {GREETING.split('\n').map((line, i) => line ? <p key={i} className="mb-1 last:mb-0">{line}</p> : <br key={i} />)}
              </div>
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4 text-foreground" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts */}
        {showGreeting && (
          <div className="border-t bg-muted/20 px-5 py-3">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t bg-card p-4 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about districts, trends, comparisons, or generate reports..."
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 transition hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            AI-generated insights · Not a substitute for clinical judgement
          </p>
        </div>
      </div>
    </div>
  )
}
