

# Energization Timeline Planner -- New AESO Hub Module

## Overview
A new "Energization" tab in the AESO Hub that models the full financial and regulatory timeline for connecting an industrial load to the Alberta grid. Every number in this tool comes from official AESO sources (ISO Tariff, ISO Rules Section 103.3, ISO Fees, Connection Process documentation) -- nothing estimated or fabricated.

## What It Does
Users input their facility parameters (capacity in MW, target energization date, DFO) and the tool produces:
1. A visual **6-stage Gantt-style timeline** of the AESO Connection Process (Stages 1-6) with gate milestones
2. A **financial obligations breakdown** showing every deposit, fee, and security requirement at each stage
3. A **monthly DTS cost projection** for what charges begin on energization day
4. A **total capital-at-risk summary** showing cumulative cash required before first kWh flows

## Data Sources (100% Factual)
All figures come from official AESO documents:

| Data Point | Source | URL |
|---|---|---|
| Connection Process Stages 1-6 (timelines, deliverables) | AESO Connection Process page | aeso.ca/grid/connecting-to-the-grid/connection-process/ |
| Stage 3 target: 32 weeks | AESO Connection Process | Same as above |
| Financial Security = 2 months estimated obligations | ISO Rules Section 103.3 (effective May 2, 2024) | aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/ |
| Pool Participation Fee: $150 + GST | ISO Fees page | aeso.ca/rules-standards-and-tariff/iso-fees/ |
| Energy Market Trading Charge: $0.606/MWh + GST | ISO Fees page | Same as above |
| Cluster Assessment Preliminary Fee: lower of $5,000 + $150/MW or $25,000 + GST | ISO Fees page | Same as above |
| Cluster Assessment Detailed Fee: lower of $20,000 + $300/MW or $65,000 + GST | ISO Fees page | Same as above |
| DTS rate components (all verified from 2026-015T Bill Estimator) | tariff-rates.ts constants | Already in codebase |
| Prudential Pool Prices (Jan 2026: $51, Feb 2026: $33) | AESO Settlement & Credit page | aeso.ca/market/market-participation/settlement-credit/ |
| Data Centre Staged Energizations (EN2 outside dates) | AESO Process Updates Nov 2025 | aeso.ca/grid/connecting-to-the-grid/process-updates/2025/data-centre-staged-energizations/ |

## UI Design

### Section 1: Facility Input Panel
- Contracted Capacity (MW) -- slider/input, default 45 MW
- Target Energization Date -- date picker
- DFO selection (FortisAlberta, EPCOR, ATCO, ENMAX)
- Project type toggle: Load (industrial/data centre) vs Generator
- Substation fraction (default 1.0)

### Section 2: Connection Process Timeline (Visual)
A horizontal stage-by-stage timeline showing:

```text
Stage 1        Stage 2          Stage 3           Stage 4        Stage 5         Stage 6
Screening      Assessment       Reg. Prep         AUC Apps       Construction    Close Out
(8 wks)        (16 wks)         (32 wks)          (variable)     (variable)      (post-ISD)
   |               |                |                  |              |               |
 Gate 1          Gate 2           Gate 3             Gate 4         Gate 5          Gate 6
                                   |                                  |
                              SAS Agreement                    100-Day & 30-Day
                            + Financial Security              Energization Packages
```

Each stage shows:
- Target duration (from AESO Connection Process page)
- Key deliverables (factual from AESO)
- Financial obligations triggered at that gate

### Section 3: Financial Obligations Breakdown
A table/card layout showing every fee and deposit:

**Pre-Connection Fees:**
- Cluster Assessment Preliminary Fee: lower of ($5,000 + $150 x MW) or $25,000 + GST
- Cluster Assessment Detailed Fee: lower of ($20,000 + $300 x MW) or $65,000 + GST
- Pool Participation Fee: $150 + GST (annual)

**Stage 3 -- SAS Agreement Financial Security:**
- Calculated as 2 months of estimated DTS obligations (per ISO Rules Section 103.3)
- Uses the full DTS rate structure from our verified 2026-015T constants
- Formula: monthly DTS charges x 2 (bulk system + regional + POD + energy charges)

**Stage 5 -- Energization Financial Security:**
- Additional financial security may be required (per Section 103.3)
- Calculated based on 2 months of estimated energy market obligations
- Uses Prudential Pool Price x capacity x load factor x 2 months

**Ongoing Post-Energization:**
- Energy Market Trading Charge: $0.606/MWh + GST
- Monthly DTS charges (calculated using existing Power Model logic)

### Section 4: Total Capital-at-Risk Summary
Summary cards showing:
- Total upfront fees (cluster assessment + pool participation)
- Financial security (SAS Agreement) -- refundable deposit
- Financial security (energy market) -- refundable deposit
- First month DTS charges estimate
- **Total cash required before first revenue**

### Section 5: Source Attribution
Every figure links to its AESO source document with "Verified" badges and effective dates.

## Files to Create/Modify

### New Files:
1. **`src/components/aeso-hub/tabs/EnergizationTab.tsx`** -- Tab wrapper (follows PowerModelTab pattern)
2. **`src/components/aeso/EnergizationTimeline.tsx`** -- Main component containing all sections
3. **`src/constants/energization-fees.ts`** -- All AESO fees and connection process data with source URLs

### Modified Files:
4. **`src/components/aeso-hub/layout/AESOHubSidebar.tsx`**
   - Add `'energization'` to `AESOHubView` type union
   - Add nav item under "Market" group: `{ id: 'energization', label: 'Energization', icon: Timer }`

5. **`src/components/aeso-hub/layout/AESOHubLayout.tsx`**
   - Add `energization: 'Energization Timeline'` to VIEW_LABELS

6. **`src/components/aeso-hub/AESOMarketHub.tsx`**
   - Import and render `EnergizationTab` when `activeTab === 'energization'`

## Technical Details

### Constants file structure (`energization-fees.ts`):
```typescript
export const AESO_CONNECTION_PROCESS = {
  stages: [
    {
      id: 1, name: 'Screening',
      targetWeeks: 8,
      description: 'AESO reviews the SASR and determines connection requirements',
      financialObligations: [],
      keyDeliverables: ['System Access Service Request (SASR)'],
      source: 'aeso.ca/grid/connecting-to-the-grid/connection-process/',
    },
    // ... stages 2-6 with verified data
  ],
} as const;

export const AESO_ISO_FEES = {
  poolParticipationFee: { amount: 150, gst: true, source: '...' },
  energyMarketTradingCharge: { perMWh: 0.606, gst: true, source: '...' },
  clusterPreliminaryFee: {
    formula: 'lower of ($5,000 + $150*MW) or $25,000',
    calculate: (mw: number) => Math.min(5000 + 150 * mw, 25000),
    gst: true, source: '...',
  },
  clusterDetailedFee: {
    formula: 'lower of ($20,000 + $300*MW) or $65,000',
    calculate: (mw: number) => Math.min(20000 + 300 * mw, 65000),
    gst: true, source: '...',
  },
} as const;

export const AESO_FINANCIAL_SECURITY = {
  rule: 'ISO Rules Section 103.3',
  requirement: '2 months of estimated obligations above unsecured credit limit',
  effectiveDate: '2024-05-02',
  source: 'aeso.ca/rules-standards-and-tariff/iso-rules/section-103-3-financial-security-requirements/',
} as const;
```

### Financial Security Calculation Logic:
The SAS Agreement financial security is calculated by running the existing DTS charge calculator (from `AESO_RATE_DTS_2026`) for the given capacity and multiplying by 2 months. This reuses the verified tariff constants already in the codebase.

### Timeline Visualization:
Uses existing UI primitives (Card, Badge, Progress) with a horizontal step indicator. Each stage is a clickable card that expands to show deliverables, responsible parties, and financial triggers. The timeline highlights which stage corresponds to the user's target date.

