// Self-contained fixture so e2e specs do not depend on the Lovable-only
// `lovable-agent-playwright-config` package. The freshness spec only needs
// the stock @playwright/test test + expect; re-export them directly.
export { test, expect } from "@playwright/test";
