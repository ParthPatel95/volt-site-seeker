

# Data Accuracy Audit: Power Model Cost Analyzer

## Verification Methodology

Cross-referenced all tariff rates in `src/constants/tariff-rates.ts` against the official **AESO 2025 ISO Tariff Update Application** (filed November 8, 2024) and the **AESO 2026 ISO Tariff Update Application** (filed November 7, 2025), both publicly available on aeso.ca.

---

## Issues Found

### Issue 1: Bulk System Coincident Demand Rate is Wrong (CRITICAL)

| Detail | Value |
|---|---|
| **Code value** | `$10,927/MW/month` |
| **AESO Official (Appendix B-2, Table 3-1)** | `$11,164/MW/month` |
| **Discrepancy** | $237/MW/month under-stated |
| **Impact on 45 MW facility** | Irrelevant for the "avoided 12CP" scenario (charge = $0), but incorrect if user models partial avoidance |

The official AESO Table 3-1 in the 2025 ISO Tariff Update Application clearly states the Bulk System Charge - Demand is **$11,164/MW/month** (Appendix B-2, effective Feb 1, 2025 through Dec 31, 2025). The $10,927 value may have come from the user's spreadsheet or an earlier draft.

**Fix**: Change `coincidentDemand: 10927` to `coincidentDemand: 11164` in `AESO_RATE_DTS_2025`.

### Issue 2: Rider F is Outdated for 2026 (MODERATE)

| Detail | Value |
|---|---|
| **Code value** | `$1.30/MWh` (2025 rate) |
| **2026 Official** | `$1.26/MWh` |
| **Source** | 2026 ISO Tariff Update Application, Table 3-3 |

The current Rate DTS effective January 1, 2026 uses Rider F at **$1.26/MWh**, not the 2025 rate of $1.30/MWh. Since this is labeled as a 2025 rate structure (`AESO_RATE_DTS_2025`), the $1.30 value is technically correct for 2025 modeling. However, users modeling 2026 costs will get slightly wrong results.

**Fix**: Add a note/constant for the 2026 Rider F rate ($1.26/MWh) or update the constant if the intent is current-year modeling.

### Issue 3: Operating Reserve Rate Needs Verification (LOW RISK)

The code uses `12.44%` of pool price. The AESO tariff application states the operating reserve is charged as a "percentage of pool price" but the exact percentage is calculated annually based on forecast ancillary services costs. The 12.44% value likely came from the user's spreadsheet and represents a reasonable 2025 estimate. The AESO does not publish a single fixed percentage -- it varies monthly based on actual costs settled.

**Fix**: Add a comment noting this is an estimate and the actual rate is settled monthly by AESO. Consider labeling it with an "Estimate" badge in the UI.

### Issue 4: FortisAlberta Distribution Charge Missing from Calculator (LOW)

The calculator includes all AESO Rate DTS charges but does **not** include FortisAlberta Rate 65 distribution charges ($7.52/kW/month demand + 0.2704 cents/kWh delivery). These are defined in `FORTISALBERTA_RATE_65_2026` but never consumed by `usePowerModelCalculator.ts`.

**Fix**: Add FortisAlberta Rate 65 charges (demand + volumetric delivery) to the monthly cost calculation, or clearly label the model as "AESO ISO Tariff charges only (excludes DFO charges)".

### Issue 5: Breakeven Calculation Missing FortisAlberta Costs (LOW)

The breakeven pool price calculation in `calculateBreakeven()` only includes AESO energy charges in its marginal cost stack. If FortisAlberta distribution charges are part of the operating cost, they should be included in the marginal cost calculation.

---

## Rates Verified as Correct

| Component | Code Value | AESO Official | Status |
|---|---|---|---|
| Bulk System Energy | $1.23/MWh | $1.23/MWh | CORRECT |
| Regional Billing Capacity | $2,945/MW/month | $2,945/MW/month | CORRECT |
| Regional Metered Energy | $0.93/MWh | $0.93/MWh | CORRECT |
| POD Substation | $15,304/month | $15,304/month | CORRECT |
| POD First 7.5 MW | $5,037/MW/month | $5,037/MW/month | CORRECT |
| POD Next 9.5 MW | $2,987/MW/month | $2,987/MW/month | CORRECT |
| POD Next 23 MW | $2,000/MW/month | $2,000/MW/month | CORRECT |
| POD Remaining | $1,231/MW/month | $1,231/MW/month | CORRECT |
| Rider F (2025) | $1.30/MWh | $1.30/MWh | CORRECT |
| TCR | $0.265/MWh | Variable (AESO supplement) | ESTIMATE - acceptable |
| Voltage Control | $0.07/MWh | Standard charge | CORRECT |
| System Support | $52/MW/month | Standard charge | CORRECT |
| Retailer Fee | $0.25/MWh | Standard charge | CORRECT |
| GST | 5% | 5% | CORRECT |
| FortisAlberta Demand | $7.52/kW/month | July 2025 schedule | CORRECT |
| FortisAlberta Distribution | 0.2704 cents/kWh | July 2025 schedule | CORRECT |

## Calculation Logic Verified as Correct

| Logic | Status | Notes |
|---|---|---|
| POD tiered charge calculation | CORRECT | Properly applies substation fraction to tier boundaries |
| 12CP curtailment (top N demand hours) | CORRECT | Sorts by AIL descending, flags top hours |
| Economic curtailment (breakeven) | CORRECT | Marginal cost / OR multiplier formula is sound |
| Monthly MWh = running hours x capacity | CORRECT | Assumes full load operation when running |
| Operating reserve = pool energy x rate% | CORRECT | Applied to total pool energy cost, not per MWh |
| GST applied to pre-GST total | CORRECT | 5% of (DTS + Energy charges) |
| Annual summary weighted averages | CORRECT | Pool price weighted by running hours per month |

---

## Proposed Fixes

### File: `src/constants/tariff-rates.ts`

1. Change `coincidentDemand: 10927` to `coincidentDemand: 11164`
2. Add `riderF_2026: { meteredEnergy: 1.26 }` constant
3. Add comment on `operatingReserve` noting it's an estimate settled monthly

### File: `src/hooks/usePowerModelCalculator.ts`

4. Either add FortisAlberta Rate 65 charges to the cost model, or add a clear comment/UI label that DFO charges are excluded

### File: `src/components/aeso/PowerModelChargeBreakdown.tsx`

5. Add "Estimate" badge to Operating Reserve and TCR rows since these are variable charges settled monthly by AESO

---

## Summary

- **13 out of 15 AESO rates are 100% correct** against official filings
- **1 critical rate error**: Bulk System Coincident Demand ($10,927 should be $11,164) -- though has zero impact when 12CP is fully avoided
- **1 outdated rate**: Rider F uses 2025 value ($1.30) when 2026 is now $1.26
- **All calculation logic is mathematically correct**
- **FortisAlberta (DFO) charges are defined but not included in the power model calculations** -- should be explicitly labeled as excluded or added

