## Problem

The Power Model is double-charging transmission. For a Rate 65 (transmission-connected) site it adds two FortisAlberta line items that don't exist on Rate 65:

| Line in current model | Rate per official tariff | Effect on a 45 MW site |
|---|---|---|
| FortisAlberta Demand $7.52/kW-month | **Not on Rate 65** (Rate 63 only) | +$4.06M/yr ≈ **+1.77¢/kWh** |
| Fortis Distribution 0.2704¢/kWh | **Not on Rate 65** | +$1.07M/yr ≈ **+0.27¢/kWh** |

That's where the inflated "All-in 9.85¢" comes from. Worst-case DTS alone should be ≈3.5–3.9¢/kWh, matching your independent estimate.

## Verified source (official)

FortisAlberta, *Rates, Options and Riders Schedules*, effective April 1, 2026 (AUC Decision 30274-D01-2025), **Rate 65: Transmission Connected Service**, p. governing Rate 65:

> Transmission Charges: "The Transmission Charge is the current Independent System Operator (ISO) tariff charges as billed by the Alberta Electric System Operator (AESO) flowed through directly to the Customer."
> Distribution Charges: "Service Charge — **$50.619440/day**"

That's the entire FortisAlberta bill for Rate 65: an ISO pass-through (already covered by AESO Rate DTS in the model) plus a flat ~$50.62/day service charge (≈$18,476/yr — trivial, ~0.005¢/kWh at 45 MW).

Source URL: https://www.fortisalberta.com/docs/default-source/default-document-library/rates-options-and-riders-schedules-effective-april-1-2026.pdf

## Fix

### 1. `src/constants/tariff-rates.ts`
Replace the `FORTISALBERTA_RATE_65_2026` constant with the actual Rate 65 structure:
```ts
export const FORTISALBERTA_RATE_65_2026 = {
  // Rate 65 = ISO tariff pass-through (already modeled via AESO Rate DTS) +
  // a flat distribution service charge. No $/kW-month demand charge,
  // no ¢/kWh volumetric. Verified against AUC Decision 30274-D01-2025,
  // FortisAlberta Rates Schedule effective April 1, 2026.
  DISTRIBUTION_SERVICE_CHARGE_PER_DAY: 50.619440, // $/day
  // Legacy fields retained as 0 for backward compatibility with override UI:
  DEMAND_CHARGE_KW_MONTH: 0,
  VOLUMETRIC_DELIVERY_CENTS_KWH: 0,
  TRANSMISSION_ACCESS_CENTS_KWH: 0, // pass-through via DTS
  RIDERS_CENTS_KWH: 0,
  effectiveDate: '2026-04-01',
  sourceUrl: 'https://www.fortisalberta.com/docs/default-source/default-document-library/rates-options-and-riders-schedules-effective-april-1-2026.pdf',
  sourceDecision: 'AUC Decision 30274-D01-2025',
  lastVerified: '2026-06-08',
} as const;
```

### 2. `src/hooks/usePowerModelCalculator.ts`
Replace the Fortis charge math (lines ~401-403):
```ts
// OLD
const fortisDemandCharge = cap * 1000 * fortisDemand;
const fortisDistribution = kwh * fortisVol / 100;

// NEW — Rate 65 distribution = flat $/day service charge only
const daysInMonth = new Date(yearOfBucket, calendarMonth + 1, 0).getDate();
const fortisDemandCharge = 0; // Rate 65 has no demand charge
const fortisDistribution = daysInMonth * FORTISALBERTA_RATE_65_2026.DISTRIBUTION_SERVICE_CHARGE_PER_DAY;
```
Keep the existing `totalFortisCharges = fortisDemandCharge + fortisDistribution` so the rest of the aggregation/UI continues to work; the "FortisAlberta Demand" bar will simply render as 0 and the "Fortis Distribution" bar will show the tiny daily service charge.

### 3. UI labels (`PowerModelChargeBreakdown.tsx`, `PowerModelEditableRates.tsx`, `PowerModelRateExplainer.tsx`, `PowerModelDataSources.tsx`, `powerModelExport.ts`)
- Rename the "FortisAlberta Demand" row to "FortisAlberta Service Charge (Rate 65)" and bind it to `fortisDistribution`.
- Remove the "Fortis Distribution" line item (now folded into the service charge).
- In the editable-rates panel, hide the `DEMAND_CHARGE_KW_MONTH` and `VOLUMETRIC_DELIVERY_CENTS_KWH` inputs (or replace with a single read-only "Service Charge $50.619440/day" entry) and add a footnote: *"Rate 65 distribution is a flat daily service charge — no demand or volumetric component. AESO ISO tariff is billed via Rate DTS line items above."*
- Update the data-sources / rate-explainer copy to cite the April 1, 2026 schedule and AUC Decision 30274-D01-2025.

### 4. Verify in-app
After change, the same 45 MW Rate 65 scenario should land at roughly:
- DTS (incl. 12CP at 85% avoidance): ~3.5–3.9¢/kWh
- Operating Reserve + Pool Energy + Rider F + Retailer: variable with pool price
- Fortis service charge: ≈0.005¢/kWh (flat)
- All-in: ~7.5–8.0¢/kWh worst case, dropping into the 6s with curtailment — matching your independent estimate.

### 5. Bump `APP_VERSION`
`src/constants/app-version.ts` → `'2026.06.08.009'`.

### 6. Memory update
Update `mem://features/aeso-101/rate-65-transmission-connected-advantage` to reflect that Rate 65 distribution = $50.619440/day flat, no $/kW-month, no volumetric (per AUC 30274-D01-2025).

## Out of scope
- AESO Rate DTS values (already verified against 2026-015T Bill Estimator and unchanged).
- 12CP avoidance success-rate logic (unchanged).
- Curtailment/optimizer logic (unchanged).
