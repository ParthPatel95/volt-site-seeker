

# Comprehensive Academy Content Improvement Plan

This is a large-scale content enhancement across all 13 modules, covering four areas: deeper written content, better visual aids, more assessments, and more interactive elements.

---

## Current State Assessment

**Strengths:**
- Content is factually solid and well-structured (verified March 2026)
- 13 modules, 128 lessons, 1312 lines of quiz data, 582 lines of flashcard data
- Bitcoin and AESO modules have the most quiz coverage (5-6 quiz sets each)
- Some modules already have interactive calculators (Revenue Drivers, Staffing)

**Gaps identified:**
- Several modules have only 2 quiz sets (Operations, Taxes, Mining Economics) vs Bitcoin's 6
- Flashcard decks are uniformly 8 cards each — could be expanded for deeper modules
- No end-of-module final exam component exists
- Limited interactive elements beyond a few calculators — no drag-and-drop, scenario builders, or decision trees
- No visual process diagrams (flowcharts, decision trees) rendered as components
- Sections like Engineering/Permitting and Networking have dense text without interactive aids

---

## Phase 1: More Assessments (Highest Impact)

### 1A. Add Missing Quiz Sets
Add 2-3 new quiz sets to under-covered modules. Each set = 3 questions with explanations.

**Modules needing quizzes:**
- **Operations**: Add quizzes for `troubleshooting`, `safety` (currently only `monitoring`, `preventive-maintenance`)
- **Taxes & Insurance**: Add quizzes for `capex`, `liability-insurance` (currently only `crypto-tax`, `property-insurance`)
- **Mining Economics**: Add quiz for `profitability` (currently `revenue-drivers`, `cost-structure`, `break-even`)
- **Hydro Cooling**: Add quiz for `economics` (currently only `cooling-methods`)
- **Immersion Cooling**: Add quiz for `overclocking` (currently only `fluids`)
- **Electrical**: Currently no quizzes wired into the page — wire existing quiz sets into `ElectricalEducation.tsx`
- **Strategic Operations**: Add quiz for `track-3` (currently only `track-1`, `track-5`)

All questions will be factually verified against the content already in the sections.

### 1B. Create End-of-Module Exam Component
New `ModuleExam` component placed at the bottom of each module (before CTA). Features:
- Pulls 5-8 questions from across all quiz sets for that module
- Timed mode (optional)
- Score threshold (70%) to earn completion badge
- Integrates with `useAcademyProgress` to mark module as "exam passed"

### 1C. Expand Flashcard Decks
Increase from 8 to 12-15 cards for the 3 flagship modules (Bitcoin, AESO, Mining Economics). Add practical scenario-based cards.

**Files modified:** `quiz-data.ts`, `flashcard-data.ts`, all 13 education page files, new `ModuleExam.tsx`

---

## Phase 2: Better Visual Aids

### 2A. Process Flowchart Component
Create a reusable `ProcessFlowchart` component rendering step-by-step flows with connecting lines, icons, and status colors. Use in:
- **Engineering & Permitting**: Permitting process timeline (Application → Review → Approval)
- **Electrical**: Voltage step-down path (Grid → Substation → Transformer → PDU → Miner)
- **Operations**: Troubleshooting decision tree
- **AESO**: Pool price formation flow

### 2B. Comparison Matrix Component
Create a reusable `ComparisonMatrix` for side-by-side feature comparison. Deploy in:
- **Immersion Cooling**: Single-phase vs Two-phase comparison
- **Hydro Cooling**: Dry cooler vs Wet cooling tower vs Hybrid
- **Datacenter**: Container vs Building vs Modular
- **Networking**: ISP options comparison (Fiber vs Fixed Wireless vs Starlink)

### 2C. Animated Stat Counters
Add animated number counters (using framer-motion) to key metrics in sections that currently show static numbers. Example: "45MW" power capacity, "$300K CapEx" in case studies.

**Files created:** `ProcessFlowchart.tsx`, `ComparisonMatrix.tsx`; updated across ~8 section components

---

## Phase 3: More Interactive Elements

### 3A. Scenario Builder Component
Create `ScenarioBuilder` — a multi-step "what if" calculator. Deploy in:
- **Mining Economics**: "Build Your Mine" — choose location, hardware, power rate → see projected ROI
- **Noise Management**: Input distance + miner count → see if you meet Alberta PSL limits
- **Taxes & Insurance**: Choose corporate structure → see tax implications

### 3B. Decision Tree Component
Interactive branching logic component where users click choices and get guided recommendations:
- **Datacenter**: "Which facility type is right for you?" (budget, scale, timeline → container/building/modular)
- **Electrical**: "What voltage infrastructure do you need?" (MW capacity → recommended architecture)
- **Hydro vs Immersion**: "Which cooling is right?" (climate, budget, noise constraints → recommendation)

### 3C. Drag-and-Drop Ordering Exercise
Create `OrderingExercise` for sections with sequential processes:
- **Engineering & Permitting**: Order the permitting steps correctly
- **Electrical**: Order the voltage step-down chain
- **Operations**: Prioritize alert response steps

**Files created:** `ScenarioBuilder.tsx`, `DecisionTree.tsx`, `OrderingExercise.tsx`

---

## Phase 4: Deeper Written Content

### 4A. Add "Real-World Insight" Callouts
Add 1-2 practical callout boxes per module with industry tips. Using existing `KeyInsight` components with a new "real-world" variant. Examples:
- **Operations**: "At a 45MW site, we found that staggering maintenance by rack row reduced peak downtime by 40%"
- **Networking**: "In rural Alberta, always have your ISP contract specify SLA penalties — we recovered $X in credits in Year 1"

### 4B. Expand Thin Sections
Several sections are under 100 lines and could benefit from more depth:
- **Strategic Operations**: Each track section is brief — add concrete frameworks and checklists
- **Engineering & Permitting**: AUC section could include more on the actual application process
- **Taxes**: Operating Expense section could detail more deductible categories with examples

### 4C. Add "Common Mistakes" Sections
Add a `CommonMistakes` component (red-themed warning cards) to 6 key modules:
- Bitcoin: Security mistakes (sharing keys, phishing)
- Mining Economics: Ignoring difficulty growth in projections
- Electrical: Undersizing transformers
- Operations: Skipping preventive maintenance schedules
- Noise: Not accounting for cumulative noise from multiple sources
- Engineering: Starting construction before permits are approved

**Files created:** `CommonMistakes.tsx`, `RealWorldInsight.tsx`; updates to ~15 section components

---

## Implementation Order

1. **Phase 1** (Assessments) — highest user engagement impact
2. **Phase 2** (Visual aids) — reusable components, moderate scope
3. **Phase 3** (Interactive) — most complex, highest wow factor
4. **Phase 4** (Written content) — content additions within existing structures

**Estimated scope:** ~25 files created/modified per phase. All content will be factually accurate, using only data already verified in existing sections or well-established public facts.

---

## Technical Notes

- All new components follow existing patterns: `ScrollReveal` wrappers, theme-aware colors (`text-foreground`, `bg-card`), `framer-motion` animations
- Quiz questions will have 4 options each with detailed explanations — no trick questions, no false information
- Interactive calculators use conservative default values and include "Illustrative Example" disclaimers
- New components are lazy-loaded to maintain performance
- All content additions are additive — no existing verified content is removed or altered

