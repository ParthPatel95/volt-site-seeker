

# Add Property Scraper to the App

## Problem
The scraping components (`AIPropertyScraper`, `ComprehensiveScraper`, `FirecrawlPropertyScanner`, etc.) exist in `src/components/scraping/` but are **never imported or rendered** anywhere in the app. There's no route, no sidebar link, and no page that uses them -- they're completely orphaned.

## Plan

### 1. Create a Property Scraper page
Create `src/pages/PropertyScraper.tsx` that combines the existing scraping components into a tabbed interface:
- **Firecrawl Scanner** tab — `FirecrawlPropertyScanner` (AI-powered search using Firecrawl)
- **Brokerage Discovery** tab — `AIPropertyScraper` (direct brokerage search)
- **Comprehensive Scraper** tab — `ComprehensiveScraper` (multi-source scraping)
- **Free Data Sources** tab — `FreeDataSources` (county records, public data)

Include the `ScrapedPropertiesDisplay` component below the tabs to show results.

### 2. Add a route in VoltScout.tsx
Add `<Route path="property-scraper" element={<PropertyScraper />} />` to the existing routes.

### 3. Add sidebar navigation entry
Add a "Property Scraper" item to the **Analysis** section in `src/components/Sidebar.tsx` with a `Search` icon, linking to `/app/property-scraper`.

This wires up the existing scraping code so it's actually accessible from the UI.

