'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Send, MapPin, Heart } from 'lucide-react'
import { BrandLockup } from '@/components/Brand'
import toast from 'react-hot-toast'

const PLATFORM_LINKS = [
  { label: 'Executive Briefing', href: '/dashboard/briefing' },
  { label: 'District Intelligence', href: '/dashboard/districts' },
  { label: 'Forecasting', href: '/dashboard/forecasting' },
  { label: 'Data Sources', href: '/dashboard/sources' },
]

const ORG_LINKS = [
  { label: 'About', href: '/dashboard/about' },
  { label: 'Contact us', href: '/dashboard/about#contact' },
  { label: 'Privacy', href: '/dashboard/privacy' },
]

export function SiteFooter() {
  const [email, setEmail] = useState('')

  function subscribe(e: React.FormEvent) {
    e.preventDefault()
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!ok) return toast.error('Please enter a valid email address')
    setEmail('')
    toast.success('Subscribed — thank you for following our work')
  }

  return (
    <footer className="mt-6 rounded-2xl border bg-card">
      <div className="grid gap-8 p-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:p-8">
        {/* Brand + mission */}
        <div>
          <div className="rounded-xl bg-white/95 p-3 inline-block shadow-sm">
            <BrandLockup className="h-10 w-auto" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">HealthIntel Platform</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
            Public Health Intelligence for Surveillance, Forecasting and Decision Support.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" /> Southwest Region, Cameroon
          </p>
        </div>

        {/* Platform links */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Platform</p>
          <ul className="mt-3 space-y-2">
            {PLATFORM_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Organization links */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Organization</p>
          <ul className="mt-3 space-y-2">
            {ORG_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href="mailto:healthintel@visioninaction.cm" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Mail className="h-3.5 w-3.5" /> healthintel@visioninaction.cm
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Newsletter</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Surveillance highlights and product updates from Vision in Action Cameroon.
          </p>
          <form onSubmit={subscribe} className="mt-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
              className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90"
              title="Subscribe">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground sm:flex-row lg:px-8">
        <p>© 2026 Vision in Action Cameroon · HealthIntel</p>
        <p className="flex items-center gap-1.5">
          Built for public health impact <Heart className="h-3 w-3 text-primary" /> Southwest Region
        </p>
      </div>
    </footer>
  )
}
