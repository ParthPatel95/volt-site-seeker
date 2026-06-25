# Fix Scraping Page — Sources, Data, and Counts

## What's actually broken

The Scraping page card statuses in the screenshot reflect three real defects, plus one display issue.

1. **Property listings (Hidden Gems) — `upsert ... Could not find the 'status' column`** (×8). The `gem-listing-scanner` edge function writes `status: 'active'` into `gem_listings`, but that column was never created. The current columns are `last_seen_at` + `is_stale` (added in the recent migration). Every upsert fails, so nothing new is stored.
2. **Property listings — `stale-marker: Could not find the function public.mark_stale_gem_listings(p_days)`**. The actual SQL function signature is `mark_stale_gem_listings(p_threshold_hours integer DEFAULT 72)`. The scanner is calling it with the wrong argument name, so the stale pass also fails every run.
3. **Property listings — junk URLs polluting Hidden Gems**. Firecrawl search returns `youtube.com/watch?v=…`, `facebook.com/groups/…`, and similar non-listing pages that match weak keyword signals. These should be filtered out before upsert.
4. **Industrial news & closure signals card shows old "error" status**. The function now succeeds (verified by direct curl: 200 OK, 40 articles scanned, 0 errors). The card just reflects the last stored run from yesterday and will refresh on the next click — that's correct behavior, not a bug. The cosmetic issue is that re-runs always report "0 new" because `industrial-news-scanner` only increments `articles_stored` on insert and never on update; once a URL has been seen, refreshing it doesn't count.

## Fixes

### 1. `supabase/functions/gem-listing-scanner/index.ts`
- Remove `status: 'active'` from the upsert row. Replace with `is_stale: false` (which matches the actual schema).
- Change the stale-marker RPC call from `{ p_days: 14 }` to `{ p_threshold_hours: 336 }` (14 days × 24h) so it matches the deployed signature.
- Add a URL filter that skips obvious non-listings before any upsert: hosts containing `youtube.com`, `youtu.be`, `facebook.com`, `instagram.com`, `twitter.com`, `x.com`, `tiktok.com`, `reddit.com`, `linkedin.com`, `pinterest.com`. Increment a `skipped_non_listing` counter and include it in the response for transparency.

### 2. `supabase/functions/industrial-news-scanner/index.ts`
- Count both inserts and refreshed updates toward `articles_stored` (currently only inserts are counted). The "items_new" tile is most useful when it represents "articles captured this run", which is what the orchestrator maps onto the card's "X new" badge.

### 3. Refresh source health after fix
After the edits deploy, invoke `scraping-orchestrator` with `scraper_key: "all"` once via the test tool so each source card flips to its current real status (no UI changes — `runOne` already updates `scraping_sources.status` and `last_run`).

## Out of scope

- No DB migration needed — the schema already has `last_seen_at` and `is_stale`, and the stale-marker RPC already exists with the correct signature.
- No frontend changes to `ScrapingTab.tsx` — the cards already read accurate values from `scraping_sources` + `scraping_jobs`; fixing the data pipeline is enough.
- Sentinel-2 monitor, OSM discovery, and Facility coordinate refinement are working (screenshot shows them green); they're not touched.
