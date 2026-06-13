# Deployment Fix Report — HealthIntel

**Date:** 2026-06-13
**Issue:** `npm install` failed on Vercel with `ERESOLVE` peer-dependency conflicts; the build never started.
**Outcome:** Resolved by removing unused dependencies and aligning the two genuinely React-18-pinned libraries to their React-19 releases. **React 19 retained — no downgrade.**

---

## 1. Root cause

The project runs **React 19 + Next.js 15**, but several dependencies declared peer ranges that stopped at React 18. On a **clean** install (which Vercel always performs) npm 11's strict peer resolution aborts with `ERESOLVE`:

| Package (before) | Declared React peer | Problem |
|------------------|---------------------|---------|
| `react-leaflet@4.2.1` | `^18` only | Hard conflict with React 19 — **and not even used** in the code |
| `lucide-react@0.395.0` | `^16.5.1 \|\| ^17 \|\| ^18` | No React 19 → conflict |
| `recharts@2.12.7` | `^16 \|\| ^17 \|\| ^18` | No React 19 → conflict |

Locally it "worked" only because `node_modules` had been installed earlier under more lenient conditions; the committed lockfile/clean install on Vercel exposed the real conflict.

A secondary problem: the dependency list carried **12 packages that the codebase never imports**, enlarging the peer-conflict surface and install size for no benefit.

---

## 2. Decision: upgrade vs. downgrade

Two safe paths existed:
- **(A) Downgrade to React 18** — large, backwards-looking change to a stack deliberately built on React 19 / Next 15.
- **(B) Keep React 19, remove dead deps, and bump the two real offenders to their React-19 releases.** ✅ **Chosen.**

Option B is the production-correct fix: it is minimal, forward-looking, removes the conflict at the source, and every retained library has first-class React 19 support.

---

## 3. Packages removed (unused — verified by import audit)

Removed because **no file imports them**:

- `react-leaflet` — the map (`components/MapComponent.tsx`) uses **plain Leaflet** via a dynamic `import('leaflet')`, not the React wrapper. *(This was the primary blocker.)*
- `papaparse` and `@types/papaparse` — CSV is generated manually in `lib/report.ts`.
- `date-fns` — no usage.
- Unused Radix UI packages: `@radix-ui/react-avatar`, `react-dialog`, `react-dropdown-menu`, `react-progress`, `react-separator`, `react-switch`, `react-tabs`, `react-tooltip` — modals/menus/tooltips in this app are custom components.

**Retained Radix (actually used):** `react-checkbox`, `react-label`, `react-select`, `react-slot`.

---

## 4. Version changes

| Package | Before | After | Reason |
|---------|--------|-------|--------|
| `lucide-react` | `^0.395.0` | `^0.469.0` | First 0.x release declaring a **stable** `^19.0.0` peer (0.460–0.468 only listed the `19.0.0-rc`). Same icon API — no code changes. |
| `recharts` | `^2.12.7` | `^2.15.4` | Adds `react`/`react-dom` `^19.0.0` to peers. Stays on the **2.x** line to avoid recharts 3.x's breaking API changes. |
| `@radix-ui/react-checkbox` | `^1.1.1` | `^1.1.3` | Pin to a build with explicit React 19 peer. |
| `@radix-ui/react-label` | `^2.1.0` | `^2.1.1` | Same. |
| `@radix-ui/react-select` | `^2.1.1` | `^2.1.4` | Same. |
| `@radix-ui/react-slot` | `^1.1.0` | `^1.1.1` | Same. |
| `next` | `^15.0.0` | `^15.1.0` | Minor bump for React 19 stability. |
| `eslint-config-next` | `^15.0.0` | `^15.1.0` | Match Next. |
| `autoprefixer` | `^10.0.1` | `^10.4.20` | Current patch line. |

`react`, `react-dom`, `@types/react`, `@types/react-dom` remain at `^19`. `next-themes@^0.4.6` and `react-hot-toast@^2.6.0` already supported React 19 (no change needed).

---

## 5. Why the fix works

- The **only** packages that excluded React 19 were `react-leaflet` (removed) and `lucide-react` / `recharts` (bumped to React-19 releases). With those resolved, **no remaining package's peer range excludes React 19**, so npm's clean install completes without `ERESOLVE` and **without `--force` or `--legacy-peer-deps`**.
- Removing 12 unused packages shrinks the tree, eliminates phantom peer constraints, and speeds installs — with zero code impact (none were imported).
- The lockfile (`package-lock.json`) was deleted and regenerated from the corrected `package.json`, so Vercel installs the exact, conflict-free tree.

---

## 6. Final compatibility matrix (React 19)

| Library | Version | React 19 support |
|---------|---------|------------------|
| next | ^15.1.0 | ✅ Native (React 19 is the Next 15 default) |
| react / react-dom | ^19.0.0 | ✅ |
| recharts | ^2.15.4 | ✅ peer `^19.0.0` |
| lucide-react | ^0.469.0 | ✅ peer `^19.0.0` |
| leaflet | ^1.9.4 | ✅ Framework-agnostic (no React peer) |
| @radix-ui/react-{checkbox,label,select,slot} | latest 1.1.x / 2.1.x | ✅ peer includes `^19.0` |
| next-themes | ^0.4.6 | ✅ |
| react-hot-toast | ^2.6.0 | ✅ peer `>=16` |
| tailwindcss | ^3.4.1 | ✅ Build tool (React-agnostic) |
| framer-motion | — | Not installed / not used in this project |

---

## 7. Config fix (build-time)

`next.config.js` listed `transpilePackages: ['leaflet', 'react-leaflet']`. Since `react-leaflet`
was removed, transpiling a non-existent package risks a clean-build failure. Changed to
`transpilePackages: ['leaflet']` and dropped the empty `serverExternalPackages: []`.

---

## 8. Deployment readiness audit (clean Vercel simulation)

| Area | Finding | Status |
|------|---------|--------|
| **Environment variables** | Only `NEXT_PUBLIC_SITE_URL`, read with a hard-coded fallback in `app/layout.tsx`. No required vars; build cannot fail on a missing env. | ✅ |
| **Server/client boundaries** | Only `app/layout.tsx` and `app/page.tsx` are server components (correct — metadata export / redirect). Every page using hooks declares `'use client'`. | ✅ |
| **Leaflet SSR** | `MapComponent` is imported via `next/dynamic` with `ssr: false`; Leaflet itself is loaded through `import('leaflet')` inside a `useEffect`, never on the server. | ✅ |
| **Dynamic imports** | The only `ssr:false` dynamic import is the map — correct and intentional. | ✅ |
| **TypeScript** | `tsc --noEmit` passes with zero errors after dependency changes. | ✅ |
| **Missing assets** | `metadata`/`Brand` reference `/logo-mark.svg` and `/logo-full.svg` — both present in `/public`. No broken asset references. | ✅ |
| **Build-time failures** | Fixed the `transpilePackages` reference to the removed `react-leaflet`. | ✅ (fixed) |
| **Production-only failures** | All `window`/`document`/`localStorage` access is inside `useEffect`, event handlers, or guarded by `typeof window === 'undefined'` (auth, alerts, settings, theme, chat history). No hydration-time global access. | ✅ |

---

## 9. Verification

- `rm -rf node_modules package-lock.json && npm install` → **succeeds with no flags** (no `ERESOLVE`); `npm ls` reports no invalid/missing/unmet peers.
- `npx tsc --noEmit` → **0 errors**.
- `npm run build` → **succeeds**, all routes compile (mirrors Vercel's clean environment).

**Status: ✅ Ready for Vercel deployment.**
