## Goal
Restart the Vite dev server and verify that the recent changes pulled from GitHub (AESO backfill SMP fix, coverage audit migration, power-model parser updates, app version bump) are wired up and running cleanly.

## Steps

1. **Restart dev server** via `code--restart_dev_server`.
2. **Check dev-server logs** (sqlite daemon log) for Vite startup errors, missing imports, or TS errors after restart.
3. **Verify recently-changed files load cleanly**:
   - `src/components/aeso/PowerModelAnalyzer.tsx`
   - `src/lib/power-model-parser.ts`
   - `src/lib/aeso/dataCoverage.ts`
   - `src/constants/app-version.ts`
   - `src/integrations/supabase/types.ts`
   - `supabase/functions/aeso-comprehensive-backfill/index.ts` (SMP APIM URL fix)
4. **Confirm migration applied**: query `audit_aeso_hourly_coverage()` and `list_missing_aeso_hours()` exist and return expected shape.
5. **Browser preview check**: load `/` and the AESO Market Hub / Power Model route, watch console logs and network requests for runtime errors.
6. **Report**: summarize what restarted cleanly, any warnings/errors found, and confirm each of the 7 changed files is active in the running build. No code changes unless a regression is found — in which case I will surface it and ask before fixing.

## Out of scope
- No new features, no schema changes, no edge-function edits unless a regression is detected.
