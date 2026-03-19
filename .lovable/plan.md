

# Add Interactive Quizzes & Flashcards to All Academy Modules

## Current State
- **Have quizzes + flashcards**: Bitcoin Fundamentals (8 quiz sets, 20 flashcards), AESO/Alberta Energy (10 quiz sets, 25 flashcards)
- **Have flashcards only**: Electrical Infrastructure (8 flashcards, no quizzes)
- **Have nothing**: Mining Economics, Mining Infrastructure (Datacenter), Hydro Cooling, Immersion Cooling, Operations & Maintenance, Noise Management, Strategic Operations Masterclass, Taxes & Insurance, Engineering & Permitting, Networking — **10 modules with no quizzes or flashcards**

## Plan

### 1. Add quiz data for all 11 missing modules (`src/constants/quiz-data.ts`)

Add 3-5 quiz questions per module, each with 4 multiple-choice options and explanations:

| Module | Quiz Sets (3-5 questions each) |
|--------|-------------------------------|
| Mining Economics | Revenue Drivers, Cost Structure, Break-Even Analysis |
| Mining Infrastructure | Facility Design, Cooling Systems, Hardware |
| Electrical Infrastructure | Fundamentals, Transformers, Safety |
| Hydro Cooling | System Design, Components, Efficiency |
| Immersion Cooling | Fluid Types, System Design, Benefits |
| Operations & Maintenance | Monitoring, Maintenance Schedules, KPIs |
| Noise Management | Regulations, Mitigation, Measurement |
| Taxes & Insurance | Tax Treatment, Insurance Types, Compliance |
| Engineering & Permitting | Permitting Process, Site Requirements, Environmental |
| Networking | ISP Selection, Redundancy, Security |
| Strategic Operations | Site Selection, Risk Management, Scaling |

### 2. Add flashcard data for 10 missing modules (`src/constants/flashcard-data.ts`)

Add 8-10 flashcards per module covering key terminology (Electrical Infrastructure already has flashcards).

### 3. Add quiz + flashcard components to each module page

For each of the 11 module pages, add:
- Import `KnowledgeCheck`, `QuickFlashcard`, and the module's quiz/flashcard data
- Place a `QuickFlashcard` deck near the top (after intro section)
- Place `KnowledgeCheck` components after relevant content sections

### Files to modify

**Data files:**
- `src/constants/quiz-data.ts` — Add ~35 quiz sets for 11 modules (~120 questions total)
- `src/constants/flashcard-data.ts` — Add ~100 flashcards across 10 new decks

**Module pages (11 files):**
- `src/pages/MiningEconomicsEducation.tsx`
- `src/pages/DatacenterEducation.tsx`
- `src/pages/ElectricalInfrastructureEducation.tsx`
- `src/pages/HydroDatacenterEducation.tsx`
- `src/pages/ImmersionCoolingEducation.tsx`
- `src/pages/OperationsEducation.tsx`
- `src/pages/NoiseManagementEducation.tsx`
- `src/pages/TaxesInsuranceEducation.tsx`
- `src/pages/EngineeringPermittingEducation.tsx`
- `src/pages/NetworkingEducation.tsx`
- `src/pages/StrategicOperationsMasterclass.tsx`

Each page gets the same pattern: import quiz/flashcard data, add `QuickFlashcard` after intro, add `KnowledgeCheck` after 2-3 key content sections.

