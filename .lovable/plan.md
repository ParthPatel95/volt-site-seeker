## Goal

1. Elevate every section of the WattByte Advisory (consulting) page with sharper, more credible copy that balances **operator depth**, **institutional credibility**, and **speed-to-energization**.
2. Surface every consulting inquiry submitted from `/advisory` inside the VoltScout admin panel as a dedicated "Consulting Inquiries" section, separate from the existing access-request approvals.

---

## Part 1 — Advisory page content enhancement

Scope covers the full page in `src/pages/Advisory.tsx`. Each section gets a copy pass with tightened headlines, clearer subheads, and stronger proof points. No layout/structure changes — purely text + supporting micro-data updates.

### 1. Hero (`AdvisoryHero.tsx`)
- Replace generic headline with one that names the buyer (AI/HPC, miners, inference) and the outcome (energized MW, not slideware).
- Add a one-line credibility strip below CTAs: "1,429 MW global pipeline · 4 countries · operator-led since 2019".

### 2. Audience (`AdvisoryAudience.tsx`)
- Three audience cards (AI/HPC · Bitcoin · Inference/Training) — each gets:
  - One-line pain ("18-month interconnect queues kill your training schedule")
  - One-line WattByte answer ("we route you to validated, queue-cleared sites")
  - 2 quantified deliverables.

### 3. Market context (`AdvisoryMarketContext.tsx`)
- Refresh stats with sourced 2026 figures: NA grid queue size, AI datacenter demand forecast, Alberta/Texas headroom.
- Add a short "Why now" paragraph tying speed-to-energization to the AI capex cycle.

### 4. Services (`AdvisoryServices.tsx`)
- Reframe the 4–6 service tiles around outcomes ("Site sourcing → shortlist of validated parcels in 30 days") instead of inputs.
- Add a deliverables bullet list per service.

### 5. Process (`AdvisoryProcess.tsx`)
- Tighten the step labels and add typical week-ranges per phase to reinforce the speed angle (Discovery: wk 1–2, Diligence: wk 3–6, Energization: wk 7+).

### 6. Differentiators (`AdvisoryDifferentiators.tsx`)
- Replace soft adjectives with concrete proof points: hands-on EPC delivery, Chairman Jay Hao's semiconductor lineage, in-house AESO/ERCOT data stack, real operating sites (link to pipeline map).

### 7. Pipeline showcase
- No code change to the map; refresh the section intro copy (already in `Advisory.tsx`) to be tighter and tie to "live, advised, or operating".

### 8. Case studies (`AdvisoryCaseStudies.tsx`)
- Rewrite 2–3 case study cards with a consistent pattern: Client type → Constraint → WattByte intervention → Outcome (MW, $/MWh, timeline).
- Mark unverifiable specifics generically ("North American hyperscaler" etc.) — no fabricated numbers.

### 9. FAQ (`AdvisoryFAQ.tsx`)
- Refresh the Q&A list to cover the questions buyers actually ask: engagement model, fee structure (success vs retainer), exclusivity, geographic reach, conflict-of-interest with own pipeline, typical timeline to energization.

### 10. Inquiry form (`AdvisoryInquiryForm.tsx`)
- Light copy polish on labels, helper text, and success state. No schema change.

### SEO
- Refresh `<title>` and meta description in `Advisory.tsx` `useEffect` to match new positioning.
- Update JSON-LD `description`.

---

## Part 2 — Consulting Inquiries in VoltScout Admin

### Database (no schema change needed)
`public.consulting_inquiries` already exists with all needed columns (`full_name`, `company`, `role`, `email`, `phone`, `client_type`, `target_capacity_mw`, `target_geography`, `timeline`, `project_description`, `source`, `status`, `created_at`, `updated_at`).

We will:
- Verify RLS allows admin (`has_role(auth.uid(), 'admin')`) to `SELECT` and `UPDATE status`. If a permissive admin policy isn't already there, add one in a new migration.
- Allowed status values: `new`, `contacted`, `qualified`, `won`, `lost`, `archived`.

### Frontend — new admin section
Build `src/components/admin/ConsultingInquiries.tsx`:
- Fetches `consulting_inquiries` ordered by `created_at desc`.
- Tabs/filters: All · New · Contacted · Qualified · Won · Lost · Archived (counts per tab).
- Card list per inquiry showing: name + company, client_type badge, target MW, geography, timeline, submitted date, expandable project description, contact email/phone with copy buttons.
- Actions: status dropdown (updates `status` + `updated_at`), "Mark contacted", "Archive".
- Empty + loading + error states matching existing `AdminSettings` patterns.
- Realtime: subscribe to `postgres_changes` on `consulting_inquiries` so new submissions appear without refresh.

Integrate into `src/components/admin/AdminSettings.tsx`:
- Add a new collapsible section "Consulting Inquiries" alongside the existing "Access Requests" and "User Management" sections, gated by the same `isAdmin` check.
- Keep current admin email gate (`admin@voltscout.com`); no changes to who counts as admin.

### Notifications (light touch)
- Show an unread-count badge on the new section header equal to inquiries with `status = 'new'`.
- No email/Slack sending in this scope.

---

## Technical notes

- Files touched (frontend): all `src/components/advisory/*.tsx`, `src/pages/Advisory.tsx`, `src/components/admin/AdminSettings.tsx`, new `src/components/admin/ConsultingInquiries.tsx`.
- Files touched (backend): one new migration only if missing admin RLS policies on `consulting_inquiries`.
- Design tokens only — no hex colors. Reuse existing `watt-bitcoin`, `watt-navy`, semantic foreground/background tokens.
- No new dependencies.
- No mock data: case-study numbers will be either verifiable or expressed in deliberately generic ranges; inquiry list shows real DB rows only.

---

## Out of scope

- Redesigning the pipeline map or layout of Advisory sections.
- Sending email/Slack notifications on new inquiries.
- Changes to who qualifies as a VoltScout admin.
- Schema changes to `consulting_inquiries` beyond RLS adjustments.
