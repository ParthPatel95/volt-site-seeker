

# Fix Property Scraper for JS-Heavy Sites (LoopNet, Crexi, etc.)

## Problem

The `firecrawl-property-scanner` edge function fails to extract useful data from sites like LoopNet and Crexi because:

1. **Overly restrictive search queries** — Using `site:loopnet.com OR site:crexi.com` limits results to those exact domains, which Firecrawl's search may not index well
2. **No `waitFor` on scrape** — LoopNet/Crexi render listings via JavaScript; without waiting for DOM rendering, the markdown returned is empty or just nav/footer content
3. **Only 2 search queries, capped at 6 results** — Very limited coverage
4. **No retry or fallback** — If a result has thin content, it's discarded silently

## Plan

### 1. Improve search queries in the edge function

Replace the current 2 narrow `site:` queries with 5-6 broader, more effective queries:

```
"industrial property for sale {location} high power capacity"
"warehouse data center {location} heavy power for sale"  
"{location} industrial building MW power electrical substation"
"commercial industrial property {location} loopnet crexi"
"manufacturing facility {location} for sale power infrastructure"
```

Remove the `site:` operator — Firecrawl search already indexes these sites and `site:` restrictions reduce result quality.

### 2. Add `waitFor` to scrape options

Add `waitFor: 5000` to the `scrapeOptions` in the Firecrawl search call so JavaScript-rendered content on LoopNet/Crexi has time to load before markdown extraction:

```json
{
  "query": "...",
  "limit": 8,
  "scrapeOptions": { 
    "formats": ["markdown"], 
    "waitFor": 5000,
    "onlyMainContent": true
  }
}
```

### 3. Increase result limits

- Raise per-query limit from 5 to 8
- Raise unique result cap from 6 to 10
- This gives much better coverage without hitting edge function timeouts

### 4. Add fallback direct scrape for thin results

If a search result has markdown shorter than 200 characters (indicating JS didn't render), do a separate Firecrawl scrape call on that URL with `waitFor: 8000` to get the full rendered content. This handles the common case where search returns a URL but not the rendered content.

### 5. Improve content validation

Before sending to OpenAI, check that the markdown actually contains property-related keywords (price, sqft, acres, lease, etc.). Skip results that are just navigation menus or error pages.

### Files to modify
- **`supabase/functions/firecrawl-property-scanner/index.ts`** — All changes in this single file (broader queries, waitFor, higher limits, fallback scrape, content validation)

