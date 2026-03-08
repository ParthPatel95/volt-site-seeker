

## What's Happening

You're currently on the **landing page** (`/`). The recent changes were all **backend optimizations** — not a new visible UI feature:

1. **QueryClient defaults** — prevents refetch storms (invisible improvement)
2. **Auth consolidation** — reduced duplicate Supabase auth calls to fix "Too Many Requests" errors (invisible improvement)
3. **Edge function fixes** — added missing action handlers to `corporate-intelligence` function (backend only)

These are all under-the-hood fixes. There's no new button or page to see.

## Current Issue

Your console shows an **"Approval check timeout"** error from `AuthContext.tsx`, which may be preventing you from logging in and accessing the app at `/app/*`. This is likely caused by the approval check query timing out against Supabase (possibly still rate-limited from the earlier burst).

## Recommended Fix

The approval check in `AuthContext.tsx` has a timeout that's too aggressive or the check itself is failing. I should:

1. **Make the approval check more resilient** — catch timeout errors gracefully and default to allowing access (or showing a retry option) instead of blocking the entire auth flow
2. **Add a fallback** — if the approval check times out, treat it as "approved" or show the app with a warning banner, rather than showing a blank screen

### Files to modify:
- `src/contexts/AuthContext.tsx` — make the approval check timeout graceful instead of fatal

