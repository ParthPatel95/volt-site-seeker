

# Fix: Supabase Rate Limiting ("ThrottlerException: Too Many Requests")

## Root Cause

The app has **5+ independent `onAuthStateChange` listeners** and `getSession()` calls running simultaneously on every page load:

1. `AuthContext.tsx` — `getSession()` + `onAuthStateChange`
2. `VoltMarketAuthContext.tsx` — `getSession()` + `onAuthStateChange`
3. `AcademyAuthContext.tsx` — `getSession()` + `onAuthStateChange`
4. `GlobalUserMenu.tsx` — `getSession()` + `onAuthStateChange`
5. `LandingNavigation.tsx` — `getSession()` + `onAuthStateChange`
6. `useProgressTracking.ts` — `getSession()` + `onAuthStateChange`

All 3 auth contexts are nested in `App.tsx`, so on every page load the app fires **6+ simultaneous `getSession()` calls** plus sets up **6 `onAuthStateChange` listeners**, each of which triggers additional DB queries (profile fetches, approval checks, admin checks). This cascade easily exceeds Supabase's auth rate limit.

Additionally, the `QueryClient` has **no default config**, so every component mount triggers immediate refetches of energy data hooks.

## Plan

### 1. Configure QueryClient with sensible defaults
In `App.tsx`, add default `staleTime` and `retry` settings to prevent unnecessary refetches:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 min — prevents refetch storms
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false, // major source of burst requests
    },
  },
});
```

### 2. Remove duplicate auth listeners from GlobalUserMenu
`GlobalUserMenu` should consume `useAuth()` from `AuthContext` instead of independently calling `supabase.auth.getSession()` and `onAuthStateChange`. This eliminates 1 listener + 1 `getSession()` call + 1 profile query.

### 3. Remove duplicate auth listener from LandingNavigation
Same fix — use the existing `AuthContext` instead of directly calling Supabase auth.

### 4. Remove duplicate auth listener from useProgressTracking
Replace its independent `getSession()` + `onAuthStateChange` with `useAuth()`.

### 5. Lazy-load VoltMarketAuthProvider and AcademyAuthProvider
Currently all 3 auth contexts initialize on every page, even landing pages. Wrap `VoltMarketAuthProvider` and `AcademyAuthProvider` so they only mount on their respective routes (`/voltmarket/*`, `/academy/*`). This eliminates 2 `getSession()` calls + 2 `onAuthStateChange` listeners on non-relevant pages.

These changes reduce simultaneous auth calls from ~6 to 1, which will resolve the rate limiting.

