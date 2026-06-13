'use client'

import { BrandLockup } from '@/components/Brand'
import {
  Target, Users, ShieldCheck, Radar, Map, Activity, PieChart,
  Mail, MapPin, Globe, HeartPulse,
} from 'lucide-react'

const DOES = [
  { icon: Radar, t: 'Surveillance', d: 'Aggregates post-abortion care reporting across districts and facilities into one live picture.' },
  { icon: Activity, t: 'Early detection', d: 'Flags complication, adolescent-access and referral risks against WHO benchmarks.' },
  { icon: Map, t: 'Geographic intelligence', d: 'Pinpoints where burden concentrates so response is targeted, not generic.' },
  { icon: PieChart, t: 'Forecasting', d: 'Projects six-month demand to support staffing, supplies and budgeting.' },
  { icon: ShieldCheck, t: 'Accountability', d: 'Facility scorecards make performance transparent and comparable.' },
  { icon: HeartPulse, t: 'Decision support', d: 'Turns data into decision-ready briefings and recommended actions.' },
]

const AUDIENCE = [
  'Ministry of Health & regional delegations',
  'WHO & technical partners',
  'Donors & funding partners',
  'District health teams',
  'Facility focal points',
  'Implementing NGOs',
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-6 space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/20 p-6 lg:p-8"
        style={{ background: 'linear-gradient(115deg, hsl(202 74% 22%) 0%, hsl(208 60% 14%) 50%, hsl(34 60% 22%) 100%)' }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 12% 20%, hsl(var(--brand-blue)/0.55) 0%, transparent 45%), radial-gradient(circle at 88% 85%, hsl(var(--brand-gold)/0.45) 0%, transparent 45%)' }} />
        <div className="relative">
          <div className="inline-block rounded-xl bg-white/95 p-3 shadow-lg">
            <BrandLockup className="h-11 w-auto" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white lg:text-3xl">About HealthIntel</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
            HealthIntel is a public health intelligence platform built by <strong className="text-white">Vision in Action Cameroon</strong> to
            strengthen post-abortion care surveillance in the Southwest Region — making fragmented reporting
            visible, comparable and actionable for the people who make decisions.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Our mission</h2></div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            To reduce preventable complications and save lives by giving health teams earlier, clearer and
            more equitable intelligence — so resources reach the districts and patients that need them most.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Our approach</h2></div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We triangulate facility surveillance, digital signals, public-health indicators and AI knowledge
            monitoring — privacy-first, anonymised and aggregate — weighting each source by reliability before
            surfacing an insight.
          </p>
        </div>
      </section>

      {/* What it does */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">What HealthIntel does</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOES.map((x) => (
            <div key={x.t} className="rounded-xl border bg-card p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><x.icon className="h-4 w-4" /></div>
              <p className="mt-3 text-sm font-semibold text-foreground">{x.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience */}
      <section className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold text-foreground">Who it's for</h2></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {AUDIENCE.map((a) => (
            <span key={a} className="rounded-full border bg-muted/40 px-3 py-1 text-xs text-foreground/80">{a}</span>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 rounded-2xl border border-primary/20 bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">Contact us</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For partnerships, data integrations or a guided walkthrough, get in touch.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <a href="mailto:healthintel@visioninaction.cm"
            className="flex items-start gap-3 rounded-xl border bg-background/40 p-4 transition hover:border-primary/40">
            <Mail className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Email</p>
              <p className="text-xs text-muted-foreground break-all">healthintel@visioninaction.cm</p>
            </div>
          </a>
          <div className="flex items-start gap-3 rounded-xl border bg-background/40 p-4">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Location</p>
              <p className="text-xs text-muted-foreground">Southwest Region, Cameroon</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border bg-background/40 p-4">
            <Globe className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Organization</p>
              <p className="text-xs text-muted-foreground">Vision in Action Cameroon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
