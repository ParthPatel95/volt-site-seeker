## 1. Remove site grades from Site Intelligence

Both the Hyperscaler Suitability and Fiber scorecards currently render large grade badges (A/B/C/D/F) and weighted totals at the top of every report. Per request, remove them entirely.

**`src/components/aeso-hub/site-intel/SiteReport.tsx`**
- Remove the `<HyperscalerScoreCard>` and `<FiberScoreCard>` renders near the top of the report.
- Delete both component definitions (`HyperscalerScoreCard`, `FiberScoreCard`) and the `HYPERSCALER_GRADE_COLOR` constant.
- Remove the "Hyperscaler score" / "Fiber score" lines from the Methodology & Data Provenance section.
- Keep all underlying section data (fiber routes, transmission, climate, risk, sustainability, jurisdiction, logistics) — only the scoring UI goes away.

No edge function or DB changes needed; the score fields can remain in the payload, just unused by the UI.

## 2. Fix "can't clear coordinates / can't run a second report"

`SiteLookupForm` syncs the external pin into local state by calling `setLat`/`setLng` **directly inside the render body** (lines 23‑24). Every render that still sees a non‑null `initialLat`/`initialLng` (which never resets after the first lookup) immediately overwrites whatever the user just typed/cleared, so deleting the values is impossible and the user can't enter new ones.

**`src/components/aeso-hub/site-intel/SiteLookupForm.tsx`**
- Replace the in‑render setters with a `useEffect` that only re-syncs when `initialLat`/`initialLng` actually change (track previous values with a ref) so user edits aren't clobbered.
- Add a small "Clear" button next to the coord inputs that resets `lat`, `lng`, and `address` to empty strings.

**`src/components/aeso-hub/tabs/SiteIntelTab.tsx`**
- Add a "New report" / clear button that resets `pin` and `report` to `null` so the form fully resets.

## 3. Fix address lookup failing

The current geocoder hits `nominatim.openstreetmap.org` from the browser. Nominatim rate-limits/blocks browser requests without a proper User-Agent and frequently returns zero results for partial Alberta addresses, which is why coordinates work but addresses fail.

Move geocoding server-side via a new edge function `geocode-address`:
- Accepts `{ query: string }`.
- Calls Nominatim with a proper `User-Agent` header (required by their ToS) and a Photon fallback (`photon.komoot.io`) when Nominatim returns zero hits.
- Returns `{ lat, lng, label }` or a 404 with a clear message.

**Frontend** (`SiteLookupForm.tsx`): replace the direct `fetch` to Nominatim with `supabase.functions.invoke('geocode-address', { body: { query } })`. Surface a clearer toast when no match is found.

## 4. Fix password reset

`supabase.auth.resetPasswordForEmail` delivers the recovery tokens in the **URL hash fragment** (`#access_token=...&refresh_token=...&type=recovery`), but `ResetPassword.tsx` reads them with `useSearchParams()`, which only parses the query string. Result: every reset link shows "Invalid or missing reset link."

**`src/pages/ResetPassword.tsx`**
- Parse `window.location.hash` (strip the leading `#`, use `URLSearchParams`) to read `access_token`, `refresh_token`, and `type`.
- Fall back to query params for backward compatibility.
- Also subscribe to `supabase.auth.onAuthStateChange` and treat a `PASSWORD_RECOVERY` event as a valid session (this is the modern Supabase pattern and removes reliance on tokens being in the URL at all).
- After successful `updateUser({ password })`, sign the user out and navigate to `/voltmarket/auth` instead of `/voltmarket/dashboard`, so they re-authenticate with the new password.

**`src/pages/ForgotPassword.tsx`** — no logic change; the redirect URL already points at `/voltmarket/reset-password`, which is correct.

## Out of scope
- Re-introducing any scoring later (would need a separate request).
- Changing the underlying edge-function report payload.
- Adding new map providers (Mapbox token, etc.) — using free OSM-based geocoders only.
