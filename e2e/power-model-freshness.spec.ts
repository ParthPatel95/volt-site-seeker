import { test, expect } from "../playwright-fixture";
import { APP_VERSION } from "../src/constants/app-version";

const FORBIDDEN_HTML_PATTERNS = [
  /virtual:pwa-register/i,
  /workbox-window/i,
  /registerSW\s*\(/i,
  /DEPLOY_VERSION/,
  /beforeinstallprompt[\s\S]*addEventListener/i,
];

const FORBIDDEN_REQUEST_SUBSTRINGS = [
  "workbox-",
  "precache-v",
  "/runtime-",
];

test.describe("Power Model freshness & PWA hygiene", () => {
  test("serves current APP_VERSION on /", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const version = await page.evaluate(
      () => document.documentElement.dataset.appVersion,
    );
    expect(version).toBe(APP_VERSION);
  });

  test("index.html contains no legacy PWA/Workbox scripts", async ({
    page,
  }) => {
    const requestedUrls: string[] = [];
    page.on("request", (req) => requestedUrls.push(req.url()));

    await page.goto("/");
    await page.waitForLoadState("networkidle").catch(() => {});

    const html = await page.content();
    for (const pattern of FORBIDDEN_HTML_PATTERNS) {
      expect(html, `HTML must not match ${pattern}`).not.toMatch(pattern);
    }

    const offenders = requestedUrls.filter((u) =>
      FORBIDDEN_REQUEST_SUBSTRINGS.some((s) => u.includes(s)),
    );
    expect(offenders, `Forbidden requests: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });

  test("/sw.js and /service-worker.js are kill-switch workers", async ({
    request,
  }) => {
    for (const path of ["/sw.js", "/service-worker.js"]) {
      const res = await request.get(path);
      expect(res.ok(), `${path} should be served`).toBeTruthy();
      const body = await res.text();
      expect(body, `${path} must self-unregister`).toMatch(/unregister\s*\(/);
      expect(body, `${path} must not be a Workbox precache`).not.toMatch(
        /__WB_MANIFEST|workbox-precaching/i,
      );
    }
  });

  test("Power Model tab renders latest analyzer", async ({ page }) => {
    await page.goto("/app/aeso-market-hub");
    await page.waitForLoadState("domcontentloaded");

    // /app/* is behind AuthWrapper — when there is no Supabase session,
    // the SPA renders <Auth /> in place of the route children without
    // changing the URL. In stock CI we have no session, so race the two
    // possible outcomes: analyzer text (authed) or the Auth screen's
    // distinctive "Access VoltScout Platform" CardTitle (unauthed). If
    // Auth wins, skip rather than fail — the other three tests in this
    // file already cover the freshness invariants we need to protect.
    const authMarker = page.getByText(/Access VoltScout Platform/i).first();
    const analyzerMarker = page.getByText(
      /power model|peak avoidance|curtailment/i,
    ).first();

    await Promise.race([
      authMarker.waitFor({ state: "visible", timeout: 15_000 }).catch(() => null),
      analyzerMarker.waitFor({ state: "visible", timeout: 15_000 }).catch(() => null),
    ]);

    if (await authMarker.isVisible().catch(() => false)) {
      test.skip(true, "No Supabase session in CI — analyzer is behind AuthWrapper");
      return;
    }

    // Try to click a Power Model tab/link if present; otherwise navigate via known route.
    const tab = page.getByRole("tab", { name: /power model/i }).first();
    if (await tab.count()) {
      await tab.click().catch(() => {});
    }

    await expect(analyzerMarker).toBeVisible({ timeout: 15_000 });
  });
});