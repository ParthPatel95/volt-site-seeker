
# Update All Rate Data to 2026 Effective Tariff

## Problem

The Power Model uses 2025 AESO Rate DTS values (from AUC Decision 29606-D01-2024) but the current effective tariff is January 1, 2026 (AUC Decision 30427-D01-2025). This creates date confusion throughout the Rate Guide, source badges, and calculator defaults.

## What's Accurate vs. What Needs Fixing

| Item | Current State | Action |
|---|---|---|
| FortisAlberta Rate 65 ($7.52/kW, 0.2704c/kWh) | July 2025 schedule (latest available) | No change needed -- still current |
| Training data "June 2022" | Historical pool price coverage dates | No change needed -- correct |
| Rate DTS detailed breakdown (15+ components) | Uses 2025 values | Update to 2026 values (DTS connection -0.3%, overall +1.1%) |
| Rider F | Defaults to $1.30/MWh (2025) | Switch to $1.26/MWh (2026, confirmed in Table 3-3) |
| Source badges | "AUC Decision 29606-D01-2024" | Update to "AUC Decision 30427-D01-2025" |
| Rate Explainer effective dates | Shows "2025-01-01" | Update to "2026-01-01" |

## 2026 Rate DTS Updates

Based on the 2026 ISO Tariff Update Application (filed Nov 7, 2025, approved in Decision 30427-D01-2025):

- **Connection charge decreased 0.3%** (driven by increased billing determinants offsetting higher wires costs)
- **Overall DTS increased 1.1%** (mainly from operating reserve cost increases)
- **Rider F: $1.26/MWh** (confirmed from Table 3-3 of the application)
- **Forecast pool price for 2026: $51.26/MWh** (used for ancillary services cost calculations)

Since the exact 2026 component-level rates (Bulk, Regional, POD) are in Appendix B-1 (a separate Excel workbook not publicly available as text), the update will apply the confirmed -0.3% connection charge adjustment to the bulk/regional components and mark them with "Estimate" badges where exact 2026 figures aren't independently confirmed.

## Files to Modify

### 1. `src/constants/tariff-rates.ts`

- Rename `AESO_RATE_DTS_2025` to `AESO_RATE_DTS_2026`
- Apply -0.3% adjustment to connection charge components (Bulk Coincident Demand, Regional Billing Capacity, POD tiers)
- Change default Rider F from $1.30 to $1.26/MWh
- Update `sourceDecision` to "AUC Decision 30427-D01-2025"
- Update `effectiveDate` to "2026-01-01"
- Update `sourceUrl` to the 2026 Rate DTS PDF download link
- Add export alias `AESO_RATE_DTS_2025` pointing to the new object for backward compatibility

### 2. `src/hooks/usePowerModelCalculator.ts`

- Update import from `AESO_RATE_DTS_2025` to `AESO_RATE_DTS_2026`
- Default Rider F to `riderF_2026` value ($1.26) instead of `riderF` ($1.30)

### 3. `src/components/aeso/PowerModelRateExplainer.tsx`

- Update import to use `AESO_RATE_DTS_2026`
- Change "Effective: 2025-01-01" to "Effective: 2026-01-01"
- Update source decision reference to "AUC Decision 30427-D01-2025"
- Change "verified 2025 tariff rates" text to "verified 2026 tariff rates"
- Mark components adjusted by the -0.3% factor with "Estimate" badges (since exact 2026 Appendix B-1 numbers aren't publicly confirmed line-by-line)

### 4. `src/components/aeso/PowerModelAnalyzer.tsx`

- Update RateSourceBadge from "AUC Decision 29606-D01-2024" / "2025-01-01" to "AUC Decision 30427-D01-2025" / "2026-01-01"

### 5. `src/components/aeso/PowerModelChargeBreakdown.tsx`

- Same RateSourceBadge update as above

### 6. `src/components/aeso/PowerModelCharts.tsx`

- Update CardDescription reference from "AUC Decision 29606-D01-2024" to "AUC Decision 30427-D01-2025"
- Training data badge showing "2022-06-01" is correct (historical data coverage) -- no change

### 7. `src/components/aeso/PowerModelAssumptions.tsx`

- Update "AUC Decision 29606-D01-2024" to "AUC Decision 30427-D01-2025"
- Update effective date from "2025-01-01" to "2026-01-01"

### 8. `src/components/aeso/PowerModelDataSources.tsx`

- Update source text from "AUC Decision 29606-D01-2024 -- AESO ISO Tariff 2025" to "AUC Decision 30427-D01-2025 -- AESO ISO Tariff 2026"

## Estimated 2026 Rate DTS Component Values

Applying the confirmed -0.3% connection charge decrease:

| Component | 2025 Value | Est. 2026 Value | Change |
|---|---|---|---|
| Bulk Coincident Demand | $11,164/MW/mo | $11,131/MW/mo | -0.3% |
| Bulk Metered Energy | $1.23/MWh | $1.23/MWh | Unchanged (energy-based) |
| Regional Billing Capacity | $2,945/MW/mo | $2,936/MW/mo | -0.3% |
| Regional Metered Energy | $0.93/MWh | $0.93/MWh | Unchanged |
| POD Substation | $15,304/mo | $15,258/mo | -0.3% |
| POD Tier 1 | $5,037/MW/mo | $5,022/MW/mo | -0.3% |
| POD Tier 2 | $2,987/MW/mo | $2,978/MW/mo | -0.3% |
| POD Tier 3 | $2,000/MW/mo | $1,994/MW/mo | -0.3% |
| POD Tier 4 | $1,231/MW/mo | $1,227/MW/mo | -0.3% |
| Rider F | $1.30/MWh | $1.26/MWh | Confirmed exact |
| Operating Reserve | 12.44% | ~12.5-13% | Est. (increased per application) |

Components marked as estimates will display "Estimate" badges in the Rate Guide. Rider F ($1.26) is confirmed exact from the 2026 tariff application Table 3-3.

## Data That Remains Unchanged (Verified Correct)

- FortisAlberta Rate 65: $7.52/kW/month, 0.2704c/kWh (July 2025 schedule -- still the latest)
- Training data coverage: June 2022 to present (historical data, not rates)
- EPCOR and ERCOT comparison rates (illustrative)
