

# Test Results & Bug Fixes for Firecrawl Scanner Enhancements

## Code Review Findings

I reviewed all 6 features (satellite map, mining projection, EIA enrichment, comparison table, watchlist, PDF export) across the codebase, database schema, RLS policies, and edge function logic. Here is what I found:

---

## Bugs Found

### Bug 1: Upsert Fails — Missing Unique Constraint on `listing_url`
**Severity: Critical**
The edge function `firecrawl-property-scanner` uses `upsert({ ... }, { onConflict: 'listing_url' })` on line 289, but the `scraped_properties` table has no unique constraint on `listing_url`. This causes every scan to fail at the save step with a Postgres error. **No properties will be saved to the database.**

**Fix**: Add a unique index on `scraped_properties.listing_url` via migration.

### Bug 2: Shortlist State Not Loaded on Mount
**Severity: Medium**
`PropertyComparisonTable` initializes `shortlisted` as an empty Set and never fetches existing shortlisted items from the `property_shortlist` table. If a user shortlists items, navigates away, and returns, all stars appear unselected even though the data is in the DB.

**Fix**: Add a `useEffect` to fetch the user's existing shortlisted `property_id` values on mount and populate the Set.

### Bug 3: Shortlist Delete Missing User Scope
**Severity: Low (mitigated by RLS)**
Line 63 of `PropertyComparisonTable` deletes from `property_shortlist` filtering only by `property_id` without `user_id`. RLS prevents cross-user deletion, but for correctness the query should also filter by `user_id`.

**Fix**: Add `.eq('user_id', user.id)` to the delete query.

---

## Features Verified as Working

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Satellite Map + Substations** | ✅ Code correct | Calls `google-maps-substation-finder`, geocodes, renders `EnhancedMapboxMap` with substation markers. Lazy-loads on button click. |
| 2 | **Live Mining Projection** | ✅ Code correct | Uses `useBitcoinNetworkStats` hook (mempool.space + Coinbase APIs). Correctly calculates miner count, hashrate, revenue, costs, ROI. Gracefully returns null when no MW data. |
| 3 | **EIA Rate Enrichment** | ✅ Code correct | Edge function queries EIA API v2 for industrial rates by state. Correctly converts cents→dollars. Falls back gracefully if EIA key missing. |
| 4 | **Comparison Table** | ⚠️ Has bugs 2 & 3 | Sorting, filtering, and rendering work correctly. Shortlist persistence has the bugs noted above. |
| 5 | **Watch & Alert System** | ✅ Code correct | CRUD operations on `scan_watchlist` table work. RLS policies are correct (`auth.uid() = user_id` for ALL operations). Toggle active/paused works. |
| 6 | **PDF Export** | ✅ Code correct | Generates multi-page PDF with property details, scores, prices, and links using jsPDF. |

---

## Fixes to Implement

1. **Add unique index on `scraped_properties.listing_url`** — database migration
2. **Load existing shortlist on mount** in `PropertyComparisonTable.tsx` — add `useEffect` to query `property_shortlist`
3. **Scope shortlist delete by user_id** in `PropertyComparisonTable.tsx`

These are targeted, isolated fixes that won't affect any other functionality.

