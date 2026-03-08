

# Firecrawl-Powered Property Scraper for Bitcoin Mining Sites

## Overview
Build a real property scraping pipeline using Firecrawl to search and scrape real estate listing sites (LoopNet, Crexi, CREXi, LandWatch, etc.) for industrial/warehouse properties suitable for Bitcoin mining operations. Each result will be enriched with power infrastructure details via OpenAI analysis.

## Architecture

```text
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Frontend Form   │────▶│  firecrawl-property-  │────▶│  Firecrawl  │
│  (search params) │     │  scanner (edge fn)    │     │  Search API │
└─────────────────┘     │                      │     └─────────────┘
                        │  1. Search Firecrawl  │
                        │  2. Scrape top results│────▶ Firecrawl Scrape
                        │  3. OpenAI extract    │────▶ OpenAI GPT-4o
                        │  4. Save to DB        │────▶ scraped_properties
                        └──────────────────────┘
```

## Components

### 1. New Edge Function: `firecrawl-property-scanner`
Single edge function that:
- Takes search params (location, property type, power requirements, budget)
- Uses **Firecrawl Search API** to find listings across LoopNet, Crexi, LandWatch, CommercialCafe, etc. with targeted queries like `"industrial property for sale near substation {location} high power"` 
- For each search result, uses **Firecrawl Scrape API** to extract full listing markdown
- Sends scraped content to **OpenAI GPT-4o-mini** with a structured extraction prompt to pull: address, price, sq ft, lot size, power capacity indicators, substation proximity, transmission access, zoning, year built, and a **power infrastructure analysis** (nearest utility, power application process, estimated available capacity)
- Saves structured results to `scraped_properties` table with `ai_analysis` JSON containing the power infrastructure details
- Returns results to frontend

### 2. New Frontend Component: `FirecrawlPropertyScanner.tsx`
Replace or add alongside existing scrapers in `MultiSourceScraper.tsx`:
- New tab "Firecrawl Scanner" with the search form
- Shows real-time progress (searching → scraping → analyzing)
- Results display with **enhanced power infrastructure section** showing:
  - Nearest substation info (from AI analysis)
  - Estimated power capacity
  - Utility provider
  - Power application process summary
  - Transmission line access
  - Grid interconnection notes

### 3. Enhanced Property Display
Update `PropertyDetailsSection.tsx` and `PropertyStatsGrid.tsx` to show the `ai_analysis` data when available — power infrastructure details, utility info, and application process.

### 4. Config Updates
- Add `firecrawl-property-scanner` to `supabase/config.toml` with `verify_jwt = false`

## Search Strategy
The edge function will construct multiple targeted search queries:
1. `"industrial property for sale {location} high power capacity substation"`
2. `"warehouse for sale near electrical substation {location}"`  
3. `"data center ready property {location} MW power"`
4. `"heavy industrial site {location} transmission access"`

This casts a wide net across all indexed real estate listings.

## OpenAI Extraction Prompt
The prompt will ask GPT-4o-mini to extract structured JSON from the scraped markdown, including:
- Standard property fields (address, price, sqft, etc.)
- **Power infrastructure analysis**: nearest substation, utility provider, estimated capacity, transmission voltage, interconnection type
- **Power application process**: which utility to contact, typical timeline, required documents, estimated cost
- **Bitcoin mining suitability score**: 1-10 based on power access, cooling potential, zoning, price

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/firecrawl-property-scanner/index.ts` | **Create** — Main edge function |
| `src/components/scraping/FirecrawlPropertyScanner.tsx` | **Create** — Frontend search UI with power infra display |
| `src/components/scraping/PowerInfraAnalysis.tsx` | **Create** — Component to display AI power analysis |
| `src/components/MultiSourceScraper.tsx` | **Modify** — Add new Firecrawl Scanner tab |
| `src/components/scraping/PropertyDetailsSection.tsx` | **Modify** — Show ai_analysis power data |
| `supabase/config.toml` | **Modify** — Add function config |

## Data Flow
1. User enters location + filters → calls edge function
2. Edge function searches via Firecrawl → gets 5-10 real listing URLs
3. Scrapes each URL via Firecrawl → gets full listing content as markdown
4. Sends each listing's markdown to OpenAI → extracts structured data + power analysis
5. Saves to `scraped_properties` with `ai_analysis` containing power infra details
6. Frontend displays results with rich power infrastructure information

No database schema changes needed — the existing `scraped_properties` table already has an `ai_analysis` JSON column perfect for storing the power infrastructure data.

