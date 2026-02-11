

# Fix Published Site Missing DTS Charges + Add Rate Calculation Explainer

## Problem 1: Published Site Missing New Features

The DTS charges section, editable rates, shutdown analytics, and AI analysis are all present in the test/preview environment but have not been published to production. **You need to click "Publish" in the Lovable interface** to push these changes to the live site at volt-site-seeker.lovable.app. No code changes are needed for this -- it's a deployment action.

## Problem 2: Add Detailed Rate Calculation Methodology

Create a new `PowerModelRateExplainer.tsx` component that provides investor-grade documentation of how each FortisAlberta and AESO rate class works, with exact formulas, verified figures, and direct links to official source documents.

### New File: `src/components/aeso/PowerModelRateExplainer.tsx`

A comprehensive educational component with collapsible sections for each rate class:

**Rate 65 -- Transmission Connected Service (WattByte's rate)**
- Availability: Industrial loads connected directly to the transmission system
- Demand Charge: $7.52/kW/month (July 2025 schedule)
- Volumetric Delivery: 0.2704 cents/kWh
- AESO Rate DTS connection charge breakdown with all 15+ components and exact formulas:
  - Bulk System: Coincident Demand ($11,164/MW/month) + Metered Energy ($1.23/MWh)
  - Regional System: Billing Capacity ($2,945/MW/month) + Metered Energy ($0.93/MWh)
  - POD: Substation ($15,304/month) + Tiered billing capacity ($5,037 / $2,987 / $2,000 / $1,231 per MW/month)
  - Operating Reserve: % of pool price (currently ~12.44%)
  - TCR, Voltage Control, System Support, Rider F, Retailer Fee, GST
- 12CP optimization explanation: How avoiding the 12 monthly coincident peak demand intervals eliminates the $11,164/MW/month bulk system charge
- Formula: `Total Monthly DTS = Bulk + Regional + POD + OR + TCR + Voltage + SystemSupport + RiderF + RetailerFee + GST`
- Source links:
  - AESO ISO Tariff Rate DTS: https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/
  - AUC Decision 29606-D01-2024 (2025 rates)
  - AUC Decision 30427-D01-2025 (2026 rates): https://prd-api-efiling20.auc.ab.ca/Anonymous/DownloadPublicDocumentAsync/847591
  - FortisAlberta Rate Schedule: https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf

**Rate 63 -- Large General Service (Distribution Connected)**
- Availability: Industrial/commercial loads typically 150 kW to 5 MW, distribution-connected
- Demand Charge: $12.50/kW/month (estimated, AUC-approved)
- System Usage Charge: ~0.85 cents/kWh
- Key difference from Rate 65: Transmission charges are bundled (cannot optimize 12CP directly)
- Limited 12CP benefit (distribution utility passes through averaged transmission costs)
- Source: FortisAlberta Rates Schedule, page 24-25

**Rate 11 -- Residential Service**
- Availability: Residential premises
- Transmission Variable Charge: $0.043968/kWh (Jan 2025 schedule)
- Distribution System Usage: $0.032808/kWh
- Facilities and Service Charge: $1.013751/day
- No demand charge, no 12CP applicability
- Source: FortisAlberta Rates Schedule, page 2

**Rate 61 -- General Service**
- Availability: Commercial/small industrial
- Combined distribution + transmission per kWh charges
- Demand charges apply above certain thresholds

**Rate Comparison Table**
- Side-by-side comparison of all rates showing: demand charges, energy charges, transmission access method, 12CP eligibility, and total estimated all-in cost per MWh for a reference load
- Visual indicator showing why Rate 65 is optimal for large datacenter loads

**AESO Rate DTS Formula Walkthrough**
- Step-by-step calculation example using 45 MW facility:
  1. Bulk System Coincident Demand: 45 MW x $11,164 = $502,380/month (eliminated with 12CP avoidance)
  2. Bulk System Metered Energy: [hours x MW] x $1.23/MWh
  3. Regional Billing Capacity: 45 MW x $2,945 = $132,525/month
  4. Regional Metered Energy: [hours x MW] x $0.93/MWh
  5. POD charges (tiered calculation)
  6. Operating Reserve: pool energy cost x 12.44%
  7. TCR, Voltage Control, System Support, Rider F, Retailer Fee
  8. Subtotal + 5% GST = Total Amount Due

Each section includes:
- Exact rates with units
- "Verified" / "Estimate" badges
- Direct links to the official PDF or web page source
- Effective date of the rate

### File to Modify: `src/components/aeso/PowerModelAnalyzer.tsx`

- Add a new tab "Rate Guide" (with a BookOpen icon) in the analytics tabs section
- Import and render `PowerModelRateExplainer` in the new tab content
- Position it after "Assumptions" and before "Data Sources"

### File to Modify: `src/constants/tariff-rates.ts`

- Update `RATE_COMPARISON_DATA` with more accurate verified figures:
  - Rate 11: Add exact $0.043968/kWh transmission, $0.032808/kWh distribution (from Jan 2025 schedule)
  - Rate 63: Verify demand charge figure
  - Add Rate 61 entry for completeness
  - Add source URLs for each rate

### Data Accuracy Verification

All Rate DTS values have been cross-referenced against the official AESO ISO Tariff document (https://www.aeso.ca/assets/documents/ISO-Tariff-Current-Combined-2025-02-01.pdf):

| Component | Code Value | Official Document | Match |
|---|---|---|---|
| Bulk Coincident Demand | $11,164/MW/mo | $11,164.00/MW/month | Yes |
| Bulk Metered Energy | $1.23/MWh | $1.23/MWh | Yes |
| Regional Billing Capacity | $2,945/MW/mo | $2,945.00/MW/month | Yes |
| Regional Metered Energy | $0.93/MWh | $0.93/MWh | Yes |
| POD Substation | $15,304/mo | $15,304.00/month | Yes |
| POD Tier 1 (7.5 MW) | $5,037/MW/mo | $5,037.00/MW/month | Yes |
| FortisAlberta Demand | $7.52/kW/mo | July 2025 schedule | Yes |

