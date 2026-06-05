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

    // Try to click a Power Model tab/link if present; otherwise navigate via known route.
    const tab = page.getByRole("tab", { name: /power model/i }).first();
    if (await tab.count()) {
      await tab.click().catch(() => {});
    }

    // Look for analyzer hallmark text. Be permissive across copy variants.
    const marker = page.getByText(
      /power model|peak avoidance|curtailment/i,
    ).first();
    await expect(marker).toBeVisible({ timeout: 15_000 });
  });
});