

# Fix Power Model DTS Rates to Match Official AESO 2026 Bill Estimator

## Problem
The official AESO 2026 Bill Estimator (2026-015T Appendix 1) reveals that our tariff constants were estimated from the 2025 tariff with manual adjustments. The actual approved 2026 rates differ, with three components being significantly wrong.

## Discrepancies Found

### Critical (materially affects results)
- **Operating Reserve**: We use 12.50%, official is **8.13%** -- overstating OR charges by ~54%
- **TCR (Transmission Constraint Rebalancing)**: We use $0.265/MWh, official is **$0.131/MWh** -- roughly 2x too high
- **Voltage Control**: We use $0.07/MWh, official is **$0.15/MWh** -- roughly 2x too low

### Moderate (demand/capacity rates all slightly off)
- Bulk Coincident Demand: $11,131 should be **$10,927** (-1.8%)
- Regional Billing Capacity: $2,936 should be **$2,987** (+1.7%)
- POD Substation: $15,258 should be **$15,562** (+2.0%)
- POD Tier 1: $5,022 should be **$5,122** (+2.0%)
- POD Tier 2: $2,978 should be **$3,037** (+2.0%)
- POD Tier 3: $1,994 should be **$2,033** (+2.0%)
- POD Tier 4: $1,227 should be **$1,252** (+2.0%)
- System Support: $52 should be **$50** (-3.8%)

### Correct (no change needed)
- Bulk Metered Energy: $1.23/MWh -- matches
- Regional Metered Energy: $0.93/MWh -- matches
- Rider F: $1.26/MWh -- matches
- GST: 5% -- matches

## Changes

### File: `src/constants/tariff-rates.ts`

Update `AESO_RATE_DTS_2026` with all corrected rates from the official bill estimator:

```
bulkSystem.coincidentDemand: 11131 -> 10927
regionalSystem.billingCapacity: 2936 -> 2987
pointOfDelivery.substation: 15258 -> 15562
pointOfDelivery.tiers[0].rate: 5022 -> 5122
pointOfDelivery.tiers[1].rate: 2978 -> 3037
pointOfDelivery.tiers[2].rate: 1994 -> 2033
pointOfDelivery.tiers[3].rate: 1227 -> 1252
operatingReserve.ratePercent: 12.50 -> 8.13
tcr.meteredEnergy: 0.265 -> 0.131
voltageControl.meteredEnergy: 0.07 -> 0.15
systemSupport.highestDemand: 52 -> 50
```

Update `sourceDecision` to reference the 2026-015T bill estimator as the verified source.

Remove all "Est. 2026" and "ESTIMATE" comments from these values since they are now confirmed from the official document.

### File: `src/hooks/usePowerModelCalculator.ts`

No structural changes needed -- the calculator already reads all rates from the constants file. The corrected values will flow through automatically.

### File: `supabase/functions/energy-rate-estimator/tariff-data.ts`

No changes needed -- the edge function uses simplified flat rates for the quick estimator, not the full DTS structure.

## Impact

For a 45 MW facility at 95% uptime with ~$50/MWh pool price:
- Operating Reserve drops significantly (8.13% vs 12.50% of pool price), saving roughly $1.5M/year
- TCR drops by ~50%, saving ~$100k/year
- Voltage Control increases by ~2x, adding ~$50k/year
- Net effect: total DTS charges decrease, improving all-in rate by approximately 0.3-0.5 cents/kWh

## Verification

After updating, the calculator output can be cross-checked against the official estimator's result: a 20 MW facility at 65% LF, $51.26/MWh pool price, SF=1.0 should produce a monthly DTS charge of **$376,287**.
