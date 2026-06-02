## Full QA & Fix Plan

Goal: audit every major surface of the app, produce a prioritized issue report, then fix everything found (small to structural). Given scope, this runs in waves so you get visible progress and can stop at any wave.

### Wave 1 — Automated sweep (no UI clicks needed)
1. **Static health**: TypeScript compile, ESLint, dependency audit, dead imports.
2. **Build output**: confirm production build succeeds, flag bundle bloat (>500KB chunks).
3. **Edge function inventory**: list all ~90 functions, check recent logs for errors in the last 7 days, flag failing ones.
4. **Database**: run Supabase linter; check RLS coverage on every public table; flag missing GRANTs.
5. **Routes**: enumerate all routes from `nav-items.tsx` and `App.tsx`, verify every route resolves to a mounted component.

### Wave 2 — Public-facing pages (browser QA)
Pages: `/`, `/advisory`, `/hosting`, `/about`, `/academy` + 10 education pages, `/auth`, `/forgot-password`.
For each: load, screenshot, check console errors, network 4xx/5xx, broken images, broken internal links, mobile viewport (390px), form submission where safe (advisory inquiry).

### Wave 3 — Authenticated app (browser QA, requires you logged in)
Pages: VoltScout dashboard, Intelligence Hub, AESO Market Hub (all sub-tabs incl. 12CP, Power Model, ML), Inventory, Secure Share, VoltMarket, VoltBuild, Admin.
For each: load, console/network check, verify live data renders (AESO pool price, BTC stats, etc.), test one read action per tab, skip destructive actions unless trivially reversible.

### Wave 4 — Critical flows end-to-end
- Auth: signup → email verify → login → logout
- Advisory inquiry form → admin view shows it
- Secure Share: create link → open as guest → view doc
- AESO report: generate → share link works
- Academy: enroll → complete module → certificate

### Wave 5 — Fixes
Triage findings into:
- **P0** (broken core flow, data loss risk, console errors blocking pages) → fix immediately
- **P1** (degraded UX, broken non-core feature, missing data) → fix in same wave
- **P2** (cosmetic, copy, minor a11y) → batch-fix at end
- **P3** (nice-to-have) → list in final report, ask before fixing

Bump `APP_VERSION` once at the end so users get the patched build.

### Deliverable
A single QA report posted in chat at the end of each wave with: file/route, severity, what's wrong, what I did about it (fixed / deferred / needs your input).

### Technical notes
- I'll need you logged in to the preview for Wave 3 & 4 — the browser session shares your Supabase session.
- I won't trigger destructive actions (deletes, payments, real emails to third parties) without asking.
- Estimated tool calls: ~150–250. I'll batch parallel reads aggressively.

### What I need from you
Just confirm and (when we hit Wave 3) make sure you're logged into the preview as an admin so I can reach the admin tabs.