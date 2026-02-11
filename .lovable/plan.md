

# Fix: Power Model Tab Not Appearing (PWA Cache Issue)

## Root Cause

The code is correct -- the Power Model tab IS properly configured in `AESOMarketComprehensive.tsx` with navigation item (priority 11), import, and TabsContent. The problem is a **stale PWA cache** serving an older version of the app.

The current `APP_VERSION` in `src/constants/app-version.ts` is `2026.02.05.002` (from Feb 5th), which predates the Power Model feature. The CacheBuster component compares this version against localStorage and only purges caches when it detects a mismatch -- but since the old cached bundle still has the old version string, users are stuck on the pre-Power-Model build.

## Fix

### File: `src/constants/app-version.ts`

Bump `APP_VERSION` from `'2026.02.05.002'` to `'2026.02.11.001'` to trigger automatic cache purging on next load.

This single change will cause the CacheBuster component to:
1. Detect the version mismatch
2. Purge all browser caches and service worker registrations
3. Force reload with a cache-busting query parameter
4. Serve the latest build including the Power Model tab

No other code changes are needed -- the Power Model navigation item, import, and TabsContent are all correctly wired up.

