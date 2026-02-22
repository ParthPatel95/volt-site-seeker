

# Add Export/Download Button to Power Model Results

## Overview
Add an export button to the Power Model results dashboard that lets users download a comprehensive CSV or PDF report containing all monthly breakdown data, over-contract credits, effective rates, and annual summary.

## Where the Button Goes
In `PowerModelAnalyzer.tsx`, next to the existing "Edit Config" button in the Results Dashboard header bar (line 349-355). A dropdown button with two options: "Export CSV" and "Export PDF".

## CSV Export

The CSV will contain:

**Header block (metadata comments):**
- Facility parameters (capacity, uptime target, curtailment strategy)
- Pricing mode (fixed @ $X/MWh or floating pool)
- CAD/USD rate, hosting rate
- Export timestamp

**Monthly rows with columns:**
- Month, Total Hours, Running Hours, Uptime %, Curtailed Hours
- MWh (Actual), MWh (Full Capacity)
- DTS Charges, Energy Charges, Total (CAD)
- All-in Rate (cents/kWh CAD), All-in Rate (cents/kWh USD)
- Curtailment Savings (fixed-price only)
- Over-Contract Credits (fixed-price only)

**Annual summary row** with the same columns plus:
- Effective Rate after credits (fixed-price only)

**All-in Rate Breakdown section:**
- Each charge component in cents/kWh (Energy, Operating Reserve, FortisAlberta Demand, etc.)
- Over-Contract Credit deduction and Effective Rate (if applicable)

## PDF Export

Uses the existing `exportToPDF` utility from `src/utils/pdfExport.ts` (jsPDF + html2canvas). Captures the charge breakdown card and monthly summary table as a styled PDF.

## Files Modified

### 1. New file: `src/utils/powerModelExport.ts`
Contains all export logic:
- `exportPowerModelCSV(monthly, annual, params, cadUsdRate, capacityMW)` -- builds and downloads CSV
- `exportPowerModelPDF()` -- captures the results section via html2canvas

### 2. `src/components/aeso/PowerModelAnalyzer.tsx`
- Import `Download` icon and dropdown menu components
- Add a dropdown button next to "Edit Config" with "Export CSV" and "Export PDF" options
- Pass `monthly`, `annual`, `params` to the export functions
- Add `id="power-model-results"` to the results container div for PDF capture

## Technical Details

### CSV generation function signature:
```typescript
function exportPowerModelCSV(
  monthly: MonthlyResult[],
  annual: AnnualSummary | null,
  params: FacilityParams,
  cadUsdRate: number,
  capacityMW: number
): void
```

### Fixed-price conditional columns:
The CSV conditionally includes "Curtailment Savings" and "Over-Contract Credits" columns only when `params.fixedPriceCAD > 0`, and appends the "Effective Rate" line to the annual summary.

### PDF capture:
Uses the existing `exportToPDF` function from `src/utils/pdfExport.ts` targeting the `#power-model-results` element with landscape orientation for the wide table.

