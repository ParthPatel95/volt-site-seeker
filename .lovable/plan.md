

# Academy Content Refinement: Novice-to-Expert Pedagogy Pass

## Goal
Rewrite Academy lesson content across all 13 modules so a complete novice can read top-to-bottom and emerge genuinely expert-level. Today's content is dense, jargon-forward, and assumes background knowledge. We'll restructure it pedagogically without changing the page architecture.

## Diagnostic (what's wrong today)
After auditing pages like `BitcoinEducation`, `ImmersionCoolingEducation`, `NetworkingEducation`, `ElectricalInfrastructureEducation`, and `EngineeringPermittingEducation`:
- **No "explain like I'm new" intros.** Sections jump straight to specs (e.g., "Stratum V2 protocol encrypts…") with no plain-language framing.
- **Jargon is undefined on first use.** Terms like dielectric, switchgear, AESO, hashrate, PUE, arc flash appear without definitions.
- **No analogies.** Abstract electrical/thermodynamic concepts lack the everyday comparisons that make them stick.
- **Missing "why does this matter."** Facts are listed, but the business/operational consequence is implicit.
- **Worked examples are sparse.** Numbers appear (e.g., "15 J/TH") without showing the math that produces them.
- **No vocabulary scaffolding.** Each module reintroduces terms the learner just met in the prior module.

## Pedagogical Framework (applied to every section)
Each refined section follows this 5-beat structure:
1. **Plain-English hook** — one sentence a 12-year-old understands
2. **Why it matters** — business/operational stakes in 1–2 lines
3. **Core explanation** — the existing technical content, but with jargon defined inline on first use
4. **Worked example or analogy** — concrete numbers or a real-world comparison
5. **Common pitfall / expert tip** — what trips people up (often already covered by RealWorldInsight/CommonMistakes)

## Scope (13 modules)
Bitcoin, Mining Economics, Datacenters, Hydro Cooling, Immersion Cooling, Air Cooling, Electrical Infrastructure, Networking, Engineering & Permitting, Operations, Noise Management, Taxes & Insurance, Security & Compliance.

For each module:
- Rewrite the **intro section** with a "Start here" plain-language overview
- Add a **"Key Terms" callout** at the top of each module (5–10 terms defined simply)
- Refine **every section's opening paragraph** to follow the 5-beat structure
- Add **worked examples** to any section with numbers (J/TH, kW, kVA, PUE, dB, $/MWh, etc.)
- Add **analogies** to abstract sections (transformers = water pressure, dielectric fluid = "electrically invisible" oil, etc.)
- Insert **"Beginner → Expert" progression markers** so learners see how concepts build

## Deliverables
1. **New shared component**: `<KeyTermsGlossary terms={[...]} />` — collapsible chip-style term/definition list, placed at the top of each module under the flashcard
2. **New shared component**: `<PlainEnglishIntro>` — a styled callout for the "explain like I'm new" hook at the start of each section
3. **New shared component**: `<WorkedExample title formula steps result />` — boxed math walkthrough
4. **Content rewrites** across ~130 section components (the `*Section.tsx` files under `src/components/<module>/`)
5. **Module-level glossary data** in `src/constants/academy-glossary.ts` (one keyed entry per module)

## Execution Plan (phased — too large for one pass)

Because this touches ~130 files, I'll execute in 4 phases. After each phase you review and approve before I continue.

- **Phase 1 — Foundations + Bitcoin + Mining Economics** (highest learner traffic; sets the template)
  - Build the 3 shared components
  - Create glossary data file
  - Refine all sections in Bitcoin and Mining Economics modules
- **Phase 2 — Infrastructure modules**: Datacenters, Electrical, Networking
- **Phase 3 — Cooling modules**: Hydro, Immersion, Air
- **Phase 4 — Operational modules**: Engineering & Permitting, Operations, Noise, Taxes & Insurance, Security & Compliance

## Constraints honored
- No changes to page-level architecture, routing, auth, or quiz/exam logic
- All facts preserved; only wording, structure, and scaffolding change
- No fabricated statistics — if a number isn't already in the codebase or a verified source, we won't invent one
- Visual consistency requirement preserved (same section wrappers, same theme tokens)
- Tailwind static-class rule honored

## What I need from you to start
Approve the plan and I'll begin Phase 1 (shared components + Bitcoin + Mining Economics). I'll pause at the end of Phase 1 for your review of the new pedagogical style before rolling it across the remaining modules.

