## Sentinel Hub Verification

Sentinel Hub credentials (`SENTINEL_HUB_CLIENT_ID` / `SENTINEL_HUB_CLIENT_SECRET`) are configured and active.

**Live test result** against `facility-activity-monitor`:
- OAuth handshake to `services.sentinel-hub.com/oauth/token` succeeded.
- Statistics API returned 12 NDVI observations for "Whitecourt Newsprint Mill" over a 3-year window.
- Trend score computed (7, stable) — no `needs: ['sentinel_creds']` fallback fired.

**Proposed action:** No code changes required. If you'd like, I can additionally:
1. Wire a status badge into the Scraping tab so the UI shows "Sentinel Hub: Connected" with last-run NDVI counts.
2. Add a scheduled cron (every 24h) to refresh closure-signal scores across all facilities.
3. Surface NDVI trend evidence on each facility's detail dialog.

Approve this plan and tell me which of (1)/(2)/(3) — if any — to implement.