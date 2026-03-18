

# Academy Audit & Improvement Plan

## Current State Assessment

### Visual Issues Found
1. **Stale stats in Hero**: `AcademyHeroSection.tsx` hardcodes 10 modules with `moduleData` array that is outdated — the actual curriculum in `CurriculumSection.tsx` has **13 modules** (added taxes-insurance, engineering-permitting, networking). The "98 Lessons" count is also wrong.
2. **Auth gate blocks browsing**: The entire Academy (including the curriculum browser) requires sign-in via `AcademyAuthGuard`. The CTA says "No signup required" and "Always free" but every page redirects to auth. This is contradictory and creates a bad first impression.
3. **Dark hero on dark background**: The hero uses hardcoded `watt-navy` dark background with white text, which clashes with the theme-aware design system requirement. The orbiting icons animation is visually busy and distracting.
4. **Category order**: "Masterclass" is listed first in the filter tabs but "Fundamentals" is the natural starting point for new learners.
5. **No learning path guidance**: Modules are presented as a flat grid with no suggested order. A new learner has no idea where to start or what sequence to follow.

### Structural/UX Issues
6. **No estimated completion time**: Module cards show lesson counts but no time estimates, making it hard to plan study sessions.
7. **No prerequisite indicators**: Advanced modules don't indicate which fundamentals should be completed first.
8. **Inconsistent module counts**: `Academy.tsx` lists 13 modules, `AcademyHeroSection.tsx` lists 10, `AcademyProgress.tsx` lists 13 — data is duplicated and out of sync across 3+ files.
9. **No "learning path" view**: Users can only browse by category filter. There's no visual path showing progression from beginner to advanced.

### Content Organization Issues
10. **Module pages are monolithic**: Each education page (e.g., `BitcoinEducation.tsx`) is a single long-scroll page with 12-16 sections. No chapter/unit structure.
11. **Quizzes only on Bitcoin module**: `KnowledgeCheck` and `QuickFlashcard` are only used in `BitcoinEducation.tsx` — other modules lack interactive assessment.

---

## Improvement Plan

### Phase 1: Fix Data Inconsistencies & Auth Flow (High Priority)

**1. Create a single source of truth for curriculum data**
- Create `src/constants/curriculum-data.ts` with the full 13-module curriculum definition (id, title, description, icon, route, lessons, category, difficulty, estimatedMinutes, prerequisites)
- Update `Academy.tsx`, `AcademyHeroSection.tsx`, `AcademyProgress.tsx`, and `CurriculumSection.tsx` to all import from this single file
- Auto-calculate total modules and lessons from the data

**2. Fix the auth gate contradiction**
- Make the Academy landing page (`/academy`) publicly accessible — remove `AcademyAuthGuard` from this route only
- Keep individual module pages behind the auth guard
- Update the hero CTA text to clarify: "Sign up free to track progress" instead of "No signup required"
- This lets users browse the curriculum before committing to sign up

**3. Fix hero stats**
- Replace hardcoded `moduleData` in `AcademyHeroSection.tsx` with import from the centralized curriculum data
- Stats will auto-update to show correct 13 modules and actual lesson count

### Phase 2: Learning Path & Navigation (Medium Priority)

**4. Add a "Recommended Learning Path" view**
- Add a toggle between "Grid View" (current) and "Learning Path" view in `CurriculumSection.tsx`
- Learning Path view shows modules in a vertical timeline with connectors, grouped by phase:
  - **Phase 1 — Foundations**: Bitcoin Fundamentals, Mining Economics, Alberta Energy Market
  - **Phase 2 — Infrastructure**: Mining Infrastructure, Electrical Infrastructure, Hydro Cooling, Immersion Cooling
  - **Phase 3 — Operations**: Operations & Maintenance, Noise Management
  - **Phase 4 — Masterclass**: Strategic Operations, Taxes & Insurance, Engineering & Permitting, Networking
- Each phase shows prerequisites and estimated total time

**5. Add time estimates and prerequisites to module cards**
- Calculate total reading time from section `time` values (already defined in section nav configs like `bitcoinSections`)
- Show "~45 min" on each module card
- Show prerequisite badges: "Requires: Bitcoin Fundamentals" on advanced modules

**6. Reorder category tabs**
- Change order to: All → Fundamentals → Operations → Advanced → Masterclass (beginner-first)

### Phase 3: Course Quality Improvements (Lower Priority)

**7. Add progress-aware "Next Module" recommendations**
- At the bottom of each module page, show "Recommended Next" based on the learning path and current progress
- Replace the generic CTA sections with contextual next-step guidance

**8. Add estimated reading time to the curriculum browser**
- Sum up section times from each module's nav config
- Display alongside lesson count: "12 lessons · ~75 min"

### Files to Modify
- **Create**: `src/constants/curriculum-data.ts` (single source of truth)
- **Modify**: `src/pages/Academy.tsx` (remove auth guard reference)
- **Modify**: `src/App.tsx` (remove AcademyAuthGuard from /academy route)
- **Modify**: `src/components/academy/AcademyHeroSection.tsx` (use centralized data, fix stats)
- **Modify**: `src/components/academy/CurriculumSection.tsx` (use centralized data, add learning path view, reorder tabs, add time/prerequisites)
- **Modify**: `src/pages/AcademyProgress.tsx` (use centralized data)
- **Modify**: `src/components/academy/ContinueLearningBar.tsx` (use centralized data)
- **Modify**: `src/components/academy/AcademyCTASection.tsx` (fix "no signup required" messaging)

