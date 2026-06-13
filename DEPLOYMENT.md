# Deployment Guide — HealthIntel

HealthIntel is a Next.js 15 application. It runs entirely on local mock data, so it
deploys cleanly to any Node host. These instructions target **Vercel** (recommended)
and include a production checklist.

---

## 1. GitHub setup

```bash
cd abortion-safety-demo

# initialise (if not already a repo)
git init
git add .
git commit -m "HealthIntel — public health intelligence platform"

# create the remote (GitHub CLI) …
gh repo create vision-in-action/healthintel --private --source=. --push
# … or set it manually:
git remote add origin https://github.com/<org>/healthintel.git
git branch -M main
git push -u origin main
```

> Ensure `node_modules`, `.next`, and `.env.local` are git-ignored (the default
> Next.js `.gitignore` already covers these).

---

## 2. Vercel deployment

### Option A — Dashboard (no CLI)
1. Go to **vercel.com → Add New → Project**.
2. Import the GitHub repository.
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: `abortion-safety-demo` (if the repo root is `DEMO GRAPH`).
5. Build command `next build`, output handled automatically.
6. Add environment variables (see §3) → **Deploy**.

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel            # first run: link / configure
vercel --prod     # promote to production
```

`vercel.json` in the project sets the framework and security headers.

---

## 3. Environment variables

Copy `.env.local.example` → `.env.local` for local dev, and add the same keys in
**Vercel → Project → Settings → Environment Variables** for production.

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL for SEO / OpenGraph | `https://healthintel.visioninaction.cm` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Optional | Only if you swap Leaflet for Mapbox GL | `pk.eyJ1...` |

No secrets/API keys are required for the current build.

---

## 4. Custom domain setup

1. **Vercel → Project → Settings → Domains → Add**.
2. Enter your domain, e.g. `healthintel.visioninaction.cm`.
3. At your DNS provider create the record Vercel shows:
   - Subdomain → `CNAME` → `cname.vercel-dns.com`
   - Apex/root → `A` → `76.76.21.21` (or the value Vercel displays)
4. Wait for DNS propagation; Vercel issues TLS automatically.
5. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy so metadata is correct.

---

## 5. Production checklist

- [ ] `npm run build` succeeds locally with no type errors.
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production domain.
- [ ] Custom domain added and TLS active.
- [ ] OpenGraph preview renders (test with the Vercel OG inspector or a social debugger).
- [ ] Logos present at `/public/logo-mark.svg` and `/public/logo-full.svg` (replace with official artwork if needed).
- [ ] Sign-in works with the seeded accounts (see `README.md`).
- [ ] Error boundary verified (it renders on a thrown error and "Try again" recovers).
- [ ] Reports generate (PDF/CSV/Excel/GeoJSON) and the Executive Briefing exports.
- [ ] Alerts bell, command palette (⌘K), and district comparison all function.
- [ ] Presentation Mode banner toggles on/off and the guided tour runs.
- [ ] Mobile layout checked on a real device.
- [ ] (If connecting real data) replace `lib/mock-data.ts` and `lib/intelligence.ts`
      with live sources and swap the localStorage session for real authentication.

---

## 6. Build & run locally

```bash
npm install
npm run dev      # http://localhost:3000 (falls back to 3001 if busy)
npm run build    # production build
npm start        # serve the production build
```

> If the dev server ever shows `Cannot find module './xxx.js'` from `.next`,
> stop it, delete the `.next` folder, and run `npm run dev` again. (This happens
> if a production build runs while the dev server is live.)

---

© 2026 Vision in Action Cameroon · HealthIntel — Public Health Intelligence Platform.
