'use client'

import { Lock, ShieldCheck, EyeOff, Database, UserCheck, FileCheck2 } from 'lucide-react'

const PRINCIPLES = [
  { icon: EyeOff, t: 'Anonymised & aggregate', d: 'The platform works with de-identified, aggregate surveillance data. No personally identifiable patient information is displayed or required to operate.' },
  { icon: Lock, t: 'Privacy by design', d: 'Data minimisation is built in — only the indicators needed for surveillance and decision support are processed.' },
  { icon: UserCheck, t: 'Role-based access', d: 'Access is scoped by role (administrator, regional manager, facility manager, viewer) so users see only what their mandate requires.' },
  { icon: Database, t: 'Source transparency', d: 'Every figure is traceable to its source category and reliability score via the Data Sources Center.' },
  { icon: ShieldCheck, t: 'Ethical use', d: 'HealthIntel supports population-level decision-making and is not intended for individual clinical or legal decisions.' },
  { icon: FileCheck2, t: 'Standards-aligned', d: 'The data model is designed to align with WHO indicators and DHIS2-compatible national reporting.' },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Privacy &amp; Data Governance</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          How HealthIntel handles data responsibly on behalf of Vision in Action Cameroon and its partners.
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm leading-relaxed text-foreground/90">
          HealthIntel is a <strong>surveillance and decision-support</strong> platform. It is designed to protect
          the people behind the data: it operates on anonymised, aggregate information and never exposes
          individual patient records.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.t} className="rounded-xl border bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><p.icon className="h-4 w-4" /></div>
            <p className="mt-3 text-sm font-semibold text-foreground">{p.t}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Data retention &amp; security</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>• Aggregate surveillance indicators are retained for trend analysis and forecasting.</li>
          <li>• Access is authenticated and scoped by role; sessions expire automatically.</li>
          <li>• Production deployments enforce HTTPS and standard security headers.</li>
          <li>• Source integrations are governed by data-sharing agreements with each provider.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-dashed bg-muted/20 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Questions about data governance or a data-sharing agreement?
          Contact <a href="mailto:healthintel@visioninaction.cm" className="font-medium text-primary hover:underline">healthintel@visioninaction.cm</a>.
        </p>
      </div>

      <p className="text-center text-[11px] text-muted-foreground">Last reviewed: June 2026 · Vision in Action Cameroon</p>
    </div>
  )
}
