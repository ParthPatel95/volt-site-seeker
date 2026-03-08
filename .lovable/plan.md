

# Cutting-Edge Enhancements for the Firecrawl Property Scanner

## What's Already Built
- Firecrawl Search API → scrape listings → GPT-4o-mini extraction → save to DB
- Power infrastructure analysis (voltage, substation, utility provider, application process)
- Mining suitability score (1-10) with strengths/weaknesses
- Basic search form with location, type, power, budget filters

## Proposed Enhancements

### 1. Auto-Enrich with Mapbox Satellite + Substation Proximity Map
Each scraped property gets geocoded and displayed on a satellite map (Mapbox is already integrated) alongside nearby substations from the existing Google Maps Substation Finder. The user sees an interactive map card per property showing the actual site, nearby transmission lines, and substations — with distance calculations done server-side.

**Changes**: Add a map card to each result in `FirecrawlPropertyScanner.tsx` using the existing `EnhancedMapboxMap` component. Call the existing `google-maps-substation-finder` edge function to overlay real substations near each property.

### 2. Live Profitability Projection per Property
Wire each property's power capacity into the existing BTC ROI calculator logic (`useBTCROICalculator` hook) to show an instant profitability estimate: daily/monthly BTC revenue, electricity cost, and ROI timeline — right on each property card.

**Changes**: Create a `PropertyMiningProjection` component that takes MW capacity + electricity rate and outputs a mini P&L using the existing network stats hook (`useBitcoinNetworkStats`). Embed it in each result card.

### 3. Comparative Ranking Dashboard
Add a sortable/filterable table view of all scanned properties with columns for price, MW, mining score, $/MW, estimated ROI, substation distance — enabling side-by-side comparison. Include a "shortlist" feature to save favorites.

**Changes**: New `PropertyComparisonTable` component with sorting, filtering, and a shortlist toggle that persists to the DB.

### 4. Automated Watch & Alert System
Let users save search criteria and get notified (in-app + optional email via existing Resend integration) when new properties matching their criteria appear. A scheduled re-scan runs periodically.

**Changes**: New `scan_watchlist` DB table, a `property-watch-scanner` edge function triggered on a schedule, and email notifications via the existing Resend secret.

### 5. Electricity Rate Auto-Lookup
Instead of relying solely on GPT inference, cross-reference the property's state/utility with the EIA API (key already configured: `EIA_API_KEY`) to pull actual commercial/industrial electricity rates for that region.

**Changes**: Add an EIA rate lookup step in the `firecrawl-property-scanner` edge function after extraction, enriching each property with verified $/kWh data.

### 6. Export & Share
Add PDF report generation (jsPDF is already installed) and shareable links for individual properties or the full scan results.

**Changes**: New `ScanReportPDF` component using existing jsPDF patterns, plus a share link feature using the existing `secure_shares` table.

---

## Implementation Priority

| Phase | Feature | Files | Complexity |
|-------|---------|-------|-----------|
| 1 | Satellite map + substation overlay per property | `FirecrawlPropertyScanner.tsx`, new `PropertySatelliteCard.tsx` | Medium |
| 2 | Live profitability projection per property | New `PropertyMiningProjection.tsx` | Medium |
| 3 | EIA electricity rate enrichment | `firecrawl-property-scanner/index.ts` | Low |
| 4 | Comparative ranking table | New `PropertyComparisonTable.tsx` | Medium |
| 5 | Watch & alert system | New DB table + edge function + UI | High |
| 6 | PDF export & sharing | New `ScanReportPDF.tsx` | Low |

All features leverage existing infrastructure (Mapbox, Google Maps substations, BTC network stats, EIA API, Resend, jsPDF) — no new API keys or connectors needed.

