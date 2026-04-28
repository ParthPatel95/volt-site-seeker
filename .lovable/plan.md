## WattByte Advisory — Powered Land Consulting

A new flagship page launching WattByte's consulting arm focused on helping AI/HPC, Bitcoin mining, and inference clients source, validate, and energize powered land. Reuses existing institutional design language (deep navy + Bitcoin orange) and pipeline data (1,429 MW across 6 countries).

### 1. Routing & Navigation

- New route `/advisory` → `Advisory.tsx` (lazy-loaded, like AboutUs).
- Add **Advisory** entry to `LandingNavigation.tsx`:
  - Desktop: new ghost button between Academy and Hosting (Briefcase icon).
  - Mobile sheet: top-level link above "Academy".
- Add to `LandingFooter` "Company" column.
- SEO: title "Powered Land Advisory for AI, HPC & Bitcoin | WattByte" (<60 chars), meta description, single H1, canonical, JSON-LD `ProfessionalService`.

### 2. Page sections (top → bottom)

1. **Hero** — Tagline "Powered Land. Engineered Outcomes." Sub: positioning as the operator-led advisor that turns megawatts into compute. CTAs: "Request Consultation" (scrolls to form) + "Explore Pipeline" (scrolls to 3D).
2. **Trust strip** — 1,429 MW global pipeline · 135 MW under development (Alberta Heartland) · 6 countries · operator-led (we run our own sites).
3. **Who we serve** — three equal-weight cards:
   - **AI / HPC Hyperscalers & Neoclouds** — 50–500 MW liquid-cooled campuses, 2026–2028 energization.
   - **Bitcoin Miners** — sub-7¢/kWh hosting-grade sites, ASIC-ready power topology.
   - **Inference & Training Startups** — 1–20 MW modular GPU pods, fast-track <12 month energization.
4. **Market context (researched content)** — short data-driven section citing public 2025–2026 figures: AI datacenter demand projected to 3–4× by 2030 (IEA), grid interconnection queues 4–7 yr in PJM/ERCOT, hyperscaler PPAs hitting record volumes. Frames the scarcity problem we solve.
5. **Our advisory services** — 6 numbered service tiles:
   1. Site sourcing & off-market deal flow
   2. Power & interconnection diligence (utility, ISO/RTO, queue position)
   3. Permitting, zoning & community strategy
   4. Energy procurement (PPAs, behind-the-meter, demand response)
   5. Capex/opex modeling & rate optimization
   6. Build-to-suit & turnkey energization partnership
6. **Engagement model** — 4-step process timeline: Discovery → Diligence → Design → Energize.
7. **Differentiators** — operator-led, proprietary VoltScout intelligence, AESO/ERCOT real-time data, in-house engineering, $0 to $1.4 GW pipeline track record.
8. **Interactive 3D Pipeline Showcase** — see §3.
9. **Featured case studies / pipeline highlights** — Alberta Heartland 135 MW, Uganda Jinja 400 MW hydro, Texas natgas 536 MW.
10. **FAQ** — 6 entries (engagement minimum, fees, geography, exclusivity, NDA, timeline).
11. **Contact form** — see §4.
12. **Footer** — reuses `LandingFooter`.

### 3. Interactive 3D Pipeline Showcase ("Both")

A. **Primary: rotating Earth globe** — new component `AdvisoryPipelineGlobe.tsx` based on existing `InteractiveGlobe.tsx`, but:
- Larger MW pulse rings sized by capacity.
- Glowing arc connections from each project to a central "Calgary HQ" anchor (animated dashed lines using `THREE.QuadraticBezierCurve3`).
- Click a marker → side panel with project name, MW, energy mix, status, image.
- Auto-rotation pauses on hover; OrbitControls for manual exploration.
- Legend overlay with type filters (Hydro / Natgas / Hybrid / Mix).

B. **Secondary: animated capacity-flow bar** — new `PipelineFlowStrip.tsx` beneath the globe:
- Horizontal stacked bar (1,429 MW total) segmented per project, colored by energy type.
- Animated "energy particles" flowing left→right inside each segment (CSS keyframes, no extra GPU cost).
- Hovering a segment highlights the matching globe marker (shared state via context).
- KPI counters above: Total MW, Under Development MW, Operating MW, Countries — using existing `AnimatedCounter`.

Both share a single `pipelineProjects` data array (extracted to `src/data/advisory-pipeline.ts`) so globe + strip stay in sync.

### 4. Contact form — `AdvisoryInquiryForm.tsx`

- React Hook Form + zod validation (mirror `InvestmentInquiryForm` patterns).
- Fields: Full name*, Company*, Role/title, Work email*, Phone, Client type* (radio: AI/HPC, Bitcoin Mining, Inference/Training, Other), Target capacity (MW), Target geography, Desired energization timeline (select), Project description (textarea, 2000 chars).
- Honeypot field + 3s submit-throttle to deter bots.
- On submit → insert into new `consulting_inquiries` table via supabase client.
- Success: replace form with confirmation card + email `advisory@wattbyte.com` mailto fallback.
- Toast on success/error.

### 5. Backend

New table via migration:

```sql
create table public.consulting_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text not null,
  role text,
  email text not null,
  phone text,
  client_type text not null check (client_type in ('ai_hpc','bitcoin','inference','other')),
  target_capacity_mw numeric,
  target_geography text,
  timeline text,
  project_description text,
  source text default 'advisory_page',
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.consulting_inquiries enable row level security;

-- Public can submit
create policy "Anyone can submit consulting inquiry"
  on public.consulting_inquiries for insert
  to anon, authenticated
  with check (true);

-- Only admins can read
create policy "Admins read consulting inquiries"
  on public.consulting_inquiries for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
```

No edge function, no email — per user choice. Admins view rows directly in Supabase for now.

### 6. Files to create / edit

Create:
- `src/pages/Advisory.tsx`
- `src/components/advisory/AdvisoryHero.tsx`
- `src/components/advisory/AdvisoryAudience.tsx`
- `src/components/advisory/AdvisoryMarketContext.tsx`
- `src/components/advisory/AdvisoryServices.tsx`
- `src/components/advisory/AdvisoryProcess.tsx`
- `src/components/advisory/AdvisoryDifferentiators.tsx`
- `src/components/advisory/AdvisoryPipelineGlobe.tsx`
- `src/components/advisory/PipelineFlowStrip.tsx`
- `src/components/advisory/AdvisoryCaseStudies.tsx`
- `src/components/advisory/AdvisoryFAQ.tsx`
- `src/components/advisory/AdvisoryInquiryForm.tsx`
- `src/data/advisory-pipeline.ts`
- Supabase migration for `consulting_inquiries`

Edit:
- `src/App.tsx` — add `/advisory` route (lazy + Suspense).
- `src/components/landing/LandingNavigation.tsx` — desktop button + mobile sheet entry.
- `src/components/landing/LandingFooter.tsx` — Company column link.

### 7. Technical notes

- All copy uses verifiable public 2025–2026 figures (IEA AI demand projections, ERCOT/PJM queue averages); transparency badges where citing sources, consistent with existing Academy content rules.
- Globe reuses installed `@react-three/fiber@^8.18` + `@react-three/drei@^9.122` — no new deps.
- Pipeline data sourced from existing `InfrastructureHighlights.tsx` and `InteractiveGlobe.tsx` (single source extracted to `advisory-pipeline.ts`, then those two files refactored to import from it — keeps numbers consistent across the site).
- All form inputs validated client-side with zod; insert relies on RLS policy above.
- Mobile-first responsive at the standard breakpoints; 3D globe degrades to a static 2D SVG world map under 768 px to keep mobile perf.
- Hover state uses `hover:bg-secondary` per project memory.
- Footer copyright stays 2026.

### 8. Out of scope

- Email notifications (user opted out).
- Admin dashboard for inquiries (read directly in Supabase for now).
- Authenticated client portal (future phase).
