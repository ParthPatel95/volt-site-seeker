
# Include Over-Contract Credits in AI Executive Briefing

## Overview
When in fixed-price mode, the AI Executive Briefing currently has no visibility into over-contract credits or the effective rate after credits. This change passes that data to the AI prompt so it can analyze credit earnings and effective cost savings.

## Changes

### 1. Frontend: Pass over-contract data to edge function
**File: `src/components/aeso/PowerModelAIAnalysis.tsx`** (lines 490-496)

Add `overContractCredits` to each monthly object being sent:
```
overContractCredits: m.overContractCredits,
```

The `annual` object is already passed in full (line 489), so `totalOverContractCredits`, `effectivePerKwhCAD`, and `effectivePerKwhUSD` are already included. The `params` object already includes `fixedPriceCAD`. No other frontend changes needed.

### 2. Edge function: Add over-contract credits to AI prompt
**File: `supabase/functions/dashboard-ai-assistant/index.ts`** (lines 48-51, 67)

**In the Annual Summary section** (after line 51), add a conditional block:
```
- Over-Contract Credits: CA$X (Y hours above fixed price)
- Effective Rate (after credits): CA$X.XXX cents/kWh (US$X.XXX cents/kWh)
```
These lines only appear when `params.fixedPriceCAD > 0` and `annual.totalOverContractCredits > 0`.

**In the Monthly Breakdown** (line 67), append over-contract credits per month when in fixed-price mode:
```
, OC Credits $X
```

**In the analysis instructions** (lines 69-94), add guidance for the AI to analyze credits:
- Under "Cost Drivers and Tariff Analysis": mention over-contract credits and their impact on effective rate
- Under "Top 3 Optimization Opportunities": consider credit-maximizing curtailment strategies

### What does NOT change
- Calculator logic -- no changes
- Summary cards or charge breakdown -- no changes
- Other edge functions -- no changes
- Non-fixed-price mode -- prompt is identical to before (conditional sections are omitted)

## Technical Details

The `buildPowerModelPrompt` function receives the full `data` object which includes `params.fixedPriceCAD` and `annual.totalOverContractCredits`. The conditional prompt additions check:
- `params.fixedPriceCAD > 0` to determine fixed-price mode
- `annual.totalOverContractCredits > 0` to determine if any credits were earned

Monthly `overContractCredits` values are already computed in the calculator; they just need to be included in the serialized monthly data sent from the frontend.
