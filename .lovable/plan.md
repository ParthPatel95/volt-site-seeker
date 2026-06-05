## Goal

Add an automated end-to-end test that fails when the deployed app serves a stale Power Model bundle or leaks legacy PWA/Workbox cache scripts into the HTML.

## What the test verifies

1. **Latest app version is live** — fetch the running app and confirm `APP_VERSION` from `src/constants/app-version.ts` is what the page actually exposes.
2. **Power Model route loads cleanly** — navigate to the AESO Market Hub Power Model tab, wait for the analyzer to render, and assert a marker that only exists in the current version (e.g. the `peakAvoidanceSuccessRate` UI field added in the latest PowerModelAnalyzer).
3. **No stale PWA/cache assets are served** — assert the served HTML and network traffic do not include:
   - `<script>` tags referencing `registerSW`, `virtual:pwa-register`, or `workbox-window`
   - requests to legacy precache buckets (`workbox-`, `precache-v`, `runtime-`)
   - the old `DEPLOY_VERSION` inline script or `beforeinstallprompt` shim block previously embedded in `index.html`
4. **Service worker hygiene** — confirm `/sw.js` and `/service-worker.js` respond with the kill-switch worker (contains `self.registration.unregister`) rather than a Workbox precache manifest.

## Implementation

- New file: `e2e/power-model-freshness.spec.ts` using the existing `playwright-fixture.ts` (`test`, `expect`).
- Expose the current version to the page for assertion: read `APP_VERSION` directly from `src/constants/app-version.ts` in the test via a static import so the spec is the single source of truth, then compare to `window.__APP_VERSION__`. To make that available without business logic changes, add a tiny `<meta name="app-version" content={APP_VERSION}>` injection (frontend-only) in `index.html` via a small `src/main.tsx` side effect that writes `document.documentElement.dataset.appVersion = APP_VERSION`. Test reads `html[data-app-version]`.
- Network assertions use `page.on('request')` to collect URLs, then filter for forbidden substrings.
- HTML assertions use `await page.content()` and regex checks for forbidden script patterns.
- SW assertions use `page.request.get('/sw.js')` and assert body contains `unregister(` and does NOT contain `workbox` precache manifest markers like `__WB_MANIFEST`.

## Test structure

```text
e2e/power-model-freshness.spec.ts
  ├── test: "serves current APP_VERSION on /"
  ├── test: "Power Model tab renders latest analyzer fields"
  ├── test: "index.html contains no legacy PWA/Workbox scripts"
  └── test: "/sw.js and /service-worker.js are kill-switch workers"
```

## Files touched

- Add `e2e/power-model-freshness.spec.ts`
- Tiny edit to `src/main.tsx` to set `document.documentElement.dataset.appVersion` (so tests have a stable hook; no business logic change)

## How it runs

- Locally: `bunx playwright test e2e/power-model-freshness.spec.ts`
- CI: existing `playwright.config.ts` picks it up from `e2e/` automatically; no workflow changes needed unless you want it added to `.github/workflows/ci.yml` as a separate job (let me know and I'll wire it in).

## Open questions

1. Should the test run against the **preview URL** (`https://id-preview--…lovable.app`), the **published URL** (`wattbyte.com`), or only the local dev server? Default in the plan: local dev server via Playwright's `baseURL`, matching the existing fixture.
2. Do you want this added to the GitHub Actions CI job, or run on-demand only?
