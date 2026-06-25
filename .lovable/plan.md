# WattFund Page Rebuild

## Problem

The current `/wattfund` page uses a dark navy theme and is loaded with hard numbers ($25M target, 60% committed, $400M deployment, 675MW+, $250k/MW, $6.5M/MW, 48% savings, 99.99% uptime, 125 GW, 35% CAGR, etc.). The fund is being restructured, so those figures are no longer accurate. The page also clashes with the v2 landing (light, editorial, "Institutional · Apple × Coinbase" aesthetic, deep navy + Bitcoin orange accents on a clean white field).

## Goal

Replace the current WattFund page with a single, cohesive page that:

1. Visually matches the v2 landing (`src/components/landing/v2/*`) — light field, editorial typography, `text-foreground` / `bg-background`, `watt-bitcoin` and deep navy accents, `Reveal` motion, restrained ring/shadow treatment.
2. Communicates the fund's intent **without any specific numbers** (no $ amounts, MW totals, %, IRR, CAGR, capex/MW, uptime tiers, or year targets). Copy stays qualitative while restructuring is underway.
3. Keeps the existing nav, footer, and "Investment Inquiry" dialog wired up.

## New page structure

All sections built fresh inside `src/components/wattfund/v2/` so the old dark sections under `src/components/landing/` are not disturbed (they're still imported elsewhere indirectly via lazy loaders — we'll just stop importing them from WattFund).

1. **Hero** — "WattFund" eyebrow, headline like *"Institutional capital for power-first infrastructure."*, short qualitative subhead, primary CTA "Request the brief" → opens existing `InvestmentInquiryForm` dialog, secondary CTA "See our pipeline" → `/advisory`. A single restrained visual on the right (reuse `DatacenterCampusScene3D` or a quiet still graphic) — no stat counters.
2. **Restructuring notice** — small inline card: *"WattFund is being restructured. Fund terms, target size, and allocations are being finalized — request the updated brief for current details."* Sets expectations and explains the lack of numbers.
3. **Thesis** — three short qualitative pillars (Acquire stranded power · Develop compute-ready sites · Operate with proprietary intelligence). No $/MW, no percentages.
4. **What we invest in** — qualitative categories (Power assets, Datacenter conversions, Mining + HPC hosting). Word-only descriptions.
5. **Why WattFund** — three or four trust statements (Operator-led, Software-driven sourcing, Cross-border reach, Aligned with hosts and tenants). No stats.
6. **Process** — four-step strip (Introduction → Diligence materials → Investor discussion → Allocation). No timelines, no dollar minimums.
7. **Closing CTA** — "Request the updated WattFund brief" → opens dialog. Quiet footnote: *"For accredited / institutional investors. Information provided on request."*

Footer + nav unchanged.

## Implementation notes

- New files under `src/components/wattfund/v2/`: `WattFundHero.tsx`, `RestructuringNotice.tsx`, `ThesisSection.tsx`, `FocusAreasSection.tsx`, `WhyWattFundSection.tsx`, `ProcessSection.tsx`, `ClosingCtaSection.tsx`. Each uses the same primitives as `src/components/landing/v2/` (`Reveal`, semantic tokens, `Button` from shadcn, `watt-bitcoin` accent rule).
- Rewrite `src/pages/WattFund.tsx` to drop the dark `bg-watt-navy` wrapper, drop all `LazySection` imports of the old fund sections, and render the new v2 sections directly. Keep `LandingNavigation`, `LandingFooter`, and the `InvestmentInquiryForm` dialog.
- Remove the sr-only "$400M total capital deployment" copy and any numeric SEO strings; replace with qualitative SEO copy.
- Leave the old `src/components/landing/Fund*`, `WhyInvestSection`, `MarketOpportunitySection`, `InvestorCTASection`, `InvestmentProcessSection`, and `InvestmentThesisSection` files in place (not deleted) to avoid breaking any other importer; just stop using them from WattFund. If a follow-up cleanup is desired, that's a separate pass.
- No business-logic, routing, or backend changes. Pure presentation.
- Bump `src/constants/app-version.ts` so the new UI flushes any cached old WattFund bundle.

## Out of scope

- Reworking the landing page itself (it already defines the target branding).
- Editing other pages that may still display numeric fund figures.
- Deleting the legacy dark fund section components.
