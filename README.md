# HealthIntel — Public Health Intelligence Platform

**A public health intelligence platform for post-abortion care (PAC) surveillance in the Southwest Region of Cameroon.**
Built for **Vision in Action Cameroon** to turn surveillance into decision-ready intelligence — seeing *where* complications cluster, *who* is most affected, *why* it matters, and *what to do next*.

> ⚕️ All figures in this build are synthetic, generated locally for presentation and product demonstration. **No real patient information is used or stored.**

---

## Table of Contents
1. [What this platform does](#what-this-platform-does)
2. [Feature tour](#feature-tour)
3. [Screens & routes](#screens--routes)
4. [Tech stack](#tech-stack)
5. [Getting started](#getting-started)
6. [Sign-in accounts](#sign-in-accounts)
7. [Project structure](#project-structure)
8. [Data model & API](#data-model--api)
9. [Branding & theming](#branding--theming)
10. [Keyboard shortcuts](#keyboard-shortcuts)
11. [Reports & exports](#reports--exports)
12. [Accessibility & performance](#accessibility--performance)
13. [Roadmap / extending to production](#roadmap--extending-to-production)
14. [Troubleshooting](#troubleshooting)

---

## What this platform does

PAC surveillance tracks complications arising from post-abortion care across health facilities.
HealthIntel turns that raw reporting into **decision-ready intelligence**:

- **Monitor** key indicators (case volume, complication rate vs. the WHO 20% benchmark, adolescent share, referral rate, facility coverage).
- **Locate** risk geographically with a choropleth district map.
- **Explain** the picture automatically with an AI Insight Engine that surfaces findings, risks, trends and recommendations.
- **Forecast** demand and **hold facilities accountable** via scorecards.
- **Act** — generate letterheaded reports, ask the AI assistant, and drill into any district.

Design influences and best practices were drawn from established public-health tooling
(DHIS2 disease-surveillance dashboards, configurable alert thresholds, GIS thematic mapping,
push/standard reports) and modern dashboard UX (KPI-first layout, command palette, micro-interactions).

---

## Feature tour

| Area | What you get |
|------|--------------|
| **Animated platform intro** | A branded hero on the Overview that explains the platform at a glance, with count-up stats and a live ECG motif. Collapsible (state remembered). |
| **KPI cards** | Five headline metrics that **animate from zero** on load and on refresh, with WHO-threshold progress and period-over-period change. |
| **District map** | Leaflet + OpenStreetMap choropleth. Colour-coded by complication rate, click-through to district reports, hover tooltips. Fills its column and re-renders correctly when filters change. |
| **AI Insight Engine** | Auto-generated findings. **Click any insight** to open a detailed modal with the metric, change, a tailored recommended action, and a jump to the district report. |
| **Demographic filters** | District, age group, sex, wealth quintile, education, displacement — charts and map update live. |
| **Time-series & digital signals** | Monthly epi-curve (Recharts) and search-volume / sentiment widget. |
| **Command palette (⌘K / Ctrl-K)** | Instantly jump to any page, district, or action; arrow-key + enter navigation. |
| **Alerts center (bell)** | Live, threshold-driven alerts derived from the data — complication-rate, adolescent-share, risk-score and region/system notices. Unread badge (red for critical), mark-as-read, click-through to the district. Recalculates from the thresholds you set in Platform Settings. |
| **District comparison** | Pick any two districts and compare them side-by-side across six indicators (with better/worse highlighting), risk verdicts, and an overlaid case-trend chart. |
| **Epi-threshold overlay** | The case-trend chart draws the WHO/benchmark complication line so months above the benchmark are obvious at a glance. |
| **Executive Briefing** | The "under 2 minutes" decision page: headline, what-happened / why-it-matters / what-to-do, key findings, top risks, prioritized actions with owners, resource-allocation weighting, and a **6-month outlook wired live to the Forecasting module**. Download (Markdown), Export PDF (letterheaded), or Share. |
| **Data Sources Center** | Documents every intelligence stream across four categories (surveillance, digital signals, public-health indicators, AI knowledge monitoring) with status, coverage, last-updated and reliability scores — plus an indicator glossary. Answers "where does the data come from?" |
| **AI Intelligence Center** | Monitors how communities use AI assistants for health questions: top questions, 12-month interest timeline, knowledge gaps, and a **Misinformation Monitor** with risk levels and recommended responses. |
| **Digital Health Signals 2.0** | The dashboard signals widget now tabs across volume/sentiment, **trending questions**, and **emerging topics** with growth and affected district. |
| **Evidence & explainability** | Every AI insight opens a **"View Evidence"** panel: sources used, contributing facilities, period analysed, confidence score and analytical method. |
| **District storytelling** | District reports lead with a narrative **"District Story"** (situation → risks → trends → recommended interventions). |
| **Presentation Mode** | Opt-in conference mode: a "Demonstration Environment — Not Real Patient Data" banner with a rotating live-activity ticker and a guided tour. Off by default. |
| **AI Assistant with history** | Context-aware Q&A. Past chats are **saved locally**, listed in a side panel, reopenable and deletable. |
| **District Intelligence** | Per-district deep dive: demographics, facility performance, risk indicators, AI summary, recommendations. |
| **Forecasting / Operations / Accountability / Health Search** | Predictive outlook, live event feed, facility scorecards, and search intelligence. |
| **Reports & Export** | Real, letterheaded **PDF (print / save)**, plus **CSV, Excel, GeoJSON** downloads. |
| **User Management** *(admin)* | Invite users, search, change roles inline, remove. |
| **Platform Settings** *(admin)* | Configurable alert thresholds, notification toggles, theme, region — persisted in the browser. |
| **Account Settings** | Every user can edit their own name, email, phone, title, organization and password. |
| **Light / Dark mode** | Full theming across every screen. |

---

## Screens & routes

```
/login                          Authentication (branded, quick-access accounts)
/dashboard                      Overview: intro, KPIs, map, AI insights, charts
/dashboard/briefing             Executive Briefing (decision-ready summary + PDF)
/dashboard/districts            District list / intelligence
/dashboard/districts/[id]       Single-district deep dive (with District Story)
/dashboard/compare              Side-by-side district comparison
/dashboard/sources              Data Sources Center (provenance & reliability)
/dashboard/ai-intelligence      AI Intelligence Center (questions, misinformation)
/dashboard/operations           Live operations / event feed
/dashboard/forecasting          6-month predictive analytics
/dashboard/accountability       Facility & district scorecards
/dashboard/search               Health intelligence search
/dashboard/reports              Report builder & exports (PDF/CSV/Excel/GeoJSON)
/dashboard/assistant            AI assistant with saved chat history
/dashboard/users      (admin)   User management
/dashboard/settings   (admin)   Platform settings
/dashboard/account              Personal account settings
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 15** (App Router, React 19) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 with CSS-variable theming (light/dark) |
| UI primitives | Radix UI + shadcn-style components |
| Map | Leaflet.js + OpenStreetMap tiles (no API key) |
| Charts | Recharts |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Data | In-memory seeded mock data (no database required) |
| Auth | Lightweight client session (localStorage) — swappable for real auth |

---

## Getting started

```bash
cd abortion-safety-demo
npm install
npm run dev
```

Open **http://localhost:3000** (it will use **3001** automatically if 3000 is busy).

Production build:

```bash
npm run build && npm start
```

> ⚠️ Don't run `npm run build` while `npm run dev` is live — they share the `.next` folder and the dev server can crash with `Cannot find module './xxx.js'`. If that happens: stop the dev server, delete `.next`, and run `npm run dev` again.

---

## Sign-in accounts

The login screen offers one-click quick-access accounts:

| Role | Email | Password |
|------|-------|----------|
| Administrator | `admin@healthintel.org` | `admin123` |
| Regional Manager | `regional@healthintel.org` | `regional123` |
| Facility Manager | `facility@healthintel.org` | `facility123` |
| Public Viewer | `viewer@healthintel.org` | `viewer123` |

Admin-only areas (User Management, Platform Settings) are gated by role.

---

## Project structure

```
abortion-safety-demo/
├── app/
│   ├── layout.tsx                      # Root layout, theme provider, toaster
│   ├── login/page.tsx                  # Branded sign-in
│   ├── dashboard/
│   │   ├── layout.tsx                  # Auth gate + sidebar/topnav + ⌘K provider
│   │   ├── page.tsx                    # Overview
│   │   ├── districts/…                 # District intelligence + [id] deep dive
│   │   ├── operations / forecasting / accountability / search
│   │   ├── reports/page.tsx            # Report builder
│   │   ├── assistant/page.tsx          # AI chat with saved history
│   │   ├── users/page.tsx              # (admin) user management
│   │   ├── settings/page.tsx           # (admin) platform settings
│   │   └── account/page.tsx            # personal account settings
│   └── api/                            # dashboard-data, districts, assistant, forecasting, …
├── components/
│   ├── Brand.tsx                       # Logo mark + lockup + header
│   ├── CommandPalette.tsx              # ⌘K palette + provider
│   ├── SummaryCards.tsx                # Animated KPI cards
│   ├── MapComponent.tsx                # Leaflet choropleth
│   ├── dashboard/
│   │   ├── PlatformIntro.tsx           # Animated brand hero
│   │   └── AIInsightsPanel.tsx         # Insights + detail modal
│   ├── layout/{Sidebar,TopNav}.tsx
│   └── ui/                             # Radix/shadcn primitives
├── contexts/AuthContext.tsx            # Session + updateUser
├── lib/
│   ├── types.ts                        # Interfaces & constants
│   ├── mock-data.ts                    # Seeded data + query helpers
│   ├── auth.ts                         # Mock auth + role permissions
│   ├── report.ts                       # PDF/CSV/Excel/GeoJSON generation
│   ├── useCountUp.ts                   # Count-up animation hook
│   └── utils.ts
└── public/
    ├── logo-mark.svg                   # Vision in Action Cameroon mark
    ├── logo-full.svg                   # Full logo lockup
    └── geojson/districts.json
```

---

## Data model & API

Data is generated lazily by a seeded PRNG (`lib/mock-data.ts`) so figures are stable across reloads.

### `GET /api/dashboard-data`
Optional query params: `district`, `ageGroup`, `sex`, `wealth`, `education`, `displaced`.
Returns `{ summary, geoData, timeSeries, digitalTrace, insights }` (see `DashboardData` in `lib/types.ts`).

Other routes: `/api/districts/[id]`, `/api/assistant`, `/api/forecasting`, `/api/accountability`, `/api/events`, `/api/search`, `/api/init-db`.

---

## Branding & theming

- **Brand colours** live as CSS variables in `app/globals.css`: `--brand-blue` (Vision in Action sky-blue) and `--brand-gold`, surfaced to Tailwind as `brand.blue` / `brand.gold` / `gold`.
- **Logo**: replace `public/logo-mark.svg` and `public/logo-full.svg` with the official artwork (keep the file names) and it updates everywhere — sidebar, login, and the PDF letterhead.
- Light/dark palettes are defined as `:root` / `.dark` variable sets.

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/⌘ + K` | Open the command palette |
| `↑ / ↓` | Move through palette results |
| `↵` | Run the selected command |
| `Esc` | Close palette / modals |

---

## Reports & exports

The report builder (`/dashboard/reports`) produces:

- **PDF** — opens a fully letterheaded document (logo, KPIs, district table, AI findings, confidential footer) in a new tab; use the browser's **Save as PDF** or print. *(Allow pop-ups the first time.)*
- **CSV / Excel / GeoJSON** — direct file downloads.

Logic lives in `lib/report.ts` and is reused by the "Recent Reports" shortcuts.

---

## Accessibility & performance

- Respects `prefers-reduced-motion` (count-ups, ECG, gradient animation disable gracefully).
- Keyboard-navigable palette and modals; focus rings throughout.
- Map stays mounted across filter changes (overlayed spinner) so it never blanks out, and markers are cleared between refreshes to avoid build-up.
- Static routes are pre-rendered; the map is dynamically imported client-side only.

---

## Roadmap / extending to production

1. **Real data** — replace `lib/mock-data.ts` with DHIS2 / Postgres / a REST API.
2. **Real auth** — swap the localStorage session for NextAuth.js or your IdP, keep the role model in `lib/auth.ts`.
3. **Persisted settings & users** — move Platform Settings, user management and chat history to a backend.
4. **Server-side PDF** — for pixel-perfect reports, render via a headless-Chrome service.
5. **Push alerts** — wire the configured thresholds to email/SMS when breached.
6. **Mapbox GL** — upgrade the map for vector tiles and richer styling.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Cannot find module './xxx.js'` from `.next` | Stop dev server → delete `.next` → `npm run dev`. (Usually caused by running a build while dev is live.) |
| PDF didn't open | Allow pop-ups for the site, then click Generate again. |
| Map area is blank | Ensure you're online (OpenStreetMap tiles); the container re-sizes on window resize. |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on a corporate network | `PowerShell:` `$env:NODE_OPTIONS = "--use-system-ca"; npm run dev` |

---

© 2026 Vision in Action Cameroon · HealthIntel — PAC Surveillance Platform.
Synthetic data for demonstration. Not for clinical decision-making.
