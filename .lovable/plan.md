## Full App Health Check Plan

Run an end-to-end verification of the site intelligence flow without changing code unless an issue surfaces.

### 1. Backend / Edge Function checks
- `geocode-address`: POST sample addresses (Calgary AB, Toronto ON, Midland TX, Phoenix AZ). Confirm each returns plausible lat/lng + label and that Nominatim → Photon fallback path is intact.
- `alberta-site-report`: POST coords inside Alberta and outside (TX, AZ, ON). Confirm 200 responses (no bounds rejection) and that payloads include the expected sections.
- `google-maps-substation-finder`: POST a US and a Canadian location. Confirm substations array + center coordinates returned.
- Pull recent edge function logs for each to surface silent errors.

### 2. Frontend wiring checks
- Re-read `SiteLookupForm.tsx` and the parent Site Intel page to confirm: label says "Canada or USA", address submit invokes `geocode-address`, resolved coords feed `Generate Site Report`, and the map pin sync logic still works.
- Re-read `PropertySatelliteCard.tsx` and the map overlay component to confirm substation markers render from the finder response.
- Confirm no stale "Alberta only" copy or guards remain in the site-intel components.

### 3. Runtime / dev-server checks
- Inspect the Vite daemon log for compile errors or HMR failures.
- Inspect browser console snapshot for runtime errors on `/app/...` site intel route.
- Note the existing auth-approval timeout warning (already known, non-blocking) so it isn't conflated with new issues.

### 4. Browser walkthrough (Playwright headless, localhost:8080)
- Restore Supabase session from env, navigate to the Site Intelligence page.
- Type "Midland, TX" → click search → screenshot. Confirm lat/lng populate.
- Click "Generate Site Report" → screenshot result panel. Confirm no 400 / "outside Alberta" error.
- Repeat with "Calgary, AB" to confirm Canadian path still works.
- Open the Industry Intelligence map tab → screenshot to confirm overlays render.

### 5. Report
- Summarize pass/fail per check with evidence (status codes, screenshots, log excerpts).
- If any step fails, stop and propose a targeted fix in a follow-up plan rather than patching mid-check.

### Out of scope
- No code changes during the health check. Any fixes are proposed as a separate plan after results are in.
