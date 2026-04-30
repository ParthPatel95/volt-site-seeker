# Make WattByte's Landing Page Feel Like a Tier-1 Infrastructure Company

The current page already has the right ingredients (real photos, live AESO data, 1,429 MW pipeline). What's missing is the **institutional weight** — the visual cues that signal "we operate billions in infrastructure," not "we're a startup with a great deck." The reference set is Brookfield Infrastructure, Equinix, Crusoe, Iron Mountain, and Coinbase Institutional.

## What "massive company" looks like, concretely

1. **Proof above the fold** (logos, regulators, counterparties)
2. **Numbers that scale, repeated everywhere** (MW, countries, years operating, uptime)
3. **Editorial typography** (tight tracking, large display sizes, restraint)
4. **Real operational photography** (already strong — push further)
5. **Live, moving data** (AESO pool price, BTC hashrate — proves the lights are on)
6. **Press / institutional endorsement** (as-seen-in strip)
7. **A single, consistent voice** across hero, sections, footer

## The 7 Upgrades

### 1. Trust Bar directly under the hero
A thin, monochrome strip immediately after `OptimizedHeroSection`:
- Left label: "Trusted infrastructure partners" (uppercase, tracked)
- 5–7 grayscale logos at 60% opacity, hover to 100%: AESO, FortisAlberta, ATCO, a hyperscaler-adjacent reference, a hardware OEM (Bitmain/MicroBT), a Tier-1 bank/auditor if applicable
- Single divider line above and below
- This is the single highest-impact change — every institutional site has one

### 2. Live Operations Ticker (replaces / augments `LiveMarketsSection` header)
A persistent slim bar with live values pulled from existing hooks:
- AESO Pool Price · AB Grid Demand · BTC Price · Network Hashrate · Next 12CP probability
- Auto-rotating, mono font, subtle pulse on update
- Signals "we run real infrastructure in real markets right now"

### 3. Hero refinement (no rebuild)
- Add a one-line **eyebrow** above the H1: "OPERATING IN 6 COUNTRIES · 1,429 MW PIPELINE · SINCE 2019"
- Add a third stat tile: "6 Countries" alongside 1,429 MW and 135 MW
- Add a subtle **"As featured in"** micro-line under the CTAs (3 publication names in muted text)
- Keep the photo and gradient — they already work

### 4. New "By the Numbers" band
Full-width dark navy band with 4 large stats, animated count-up on scroll:
- 1,429 MW · 135 MW · 6 Countries · 7 Years Operating
- Mono numerals, generous whitespace, hairline dividers between
- Place between Alberta Hub and Investment Thesis

### 5. Leadership / Operator credibility section
A condensed leadership strip on the landing page (not just `/about`):
- 3 cards: Jay Hao (Chairman), SnehalKumar Patel (President), one engineering lead
- Headshot, name, title, one-line credential
- Anchors the company in real, named operators — institutional buyers vet people first

### 6. Press & Recognition strip
A simple section: "Featured in" + 4–6 press logos (CoinDesk, Bitcoin Magazine, local Alberta business press, etc.). Even modest press, presented well, reads as legitimacy. If real press is thin, frame it as "Industry coverage" with article links.

### 7. Footer upgrade
- Add a **registered office address** (Calgary / wherever applicable)
- Add **regulatory / compliance line** (e.g., "AESO market participant" or similar real designation)
- Add a small **status indicator**: green dot + "All systems operational" linking to a status concept
- Tighten copyright, add legal/privacy links if missing

## Cross-cutting design polish

- **Typography rhythm**: Standardize hero/section H1 at one display weight (e.g., font-semibold tracking-tight), eyebrows uppercase tracked, body at one size. Audit and remove font-size inconsistencies across the 8 lazy-loaded sections.
- **Section dividers**: The current colored `SectionDivider` (cyan/purple/yellow) reads playful, not institutional. Replace with hairline rules + ample whitespace, or single-color subtle dividers in `--border`.
- **Reduce particle/aurora effects** on the landing route — keep them on `/wattfund`. Big companies don't sparkle.
- **Consistent CTA pair** everywhere: primary "Request a consultation" + secondary "Explore pipeline" (matches Advisory hero).

## Files to touch (technical section)

```text
src/components/landing/
  TrustBar.tsx                NEW — partner/regulator logos
  LiveOperationsTicker.tsx    NEW — wraps useAESOData + useBitcoinNetworkStats
  ByTheNumbersBand.tsx        NEW — animated stat band
  LeadershipStrip.tsx         NEW — 3-card condensed leadership
  PressStrip.tsx              NEW — "Featured in" logos
  OptimizedHeroSection.tsx    EDIT — eyebrow, 3rd stat, "as featured in"
  SectionDivider.tsx          EDIT — neutral hairline variant
  LandingFooter.tsx           EDIT — address, status dot, regulatory line
src/pages/Landing.tsx         EDIT — insert new sections in order:
                                Hero → TrustBar → LiveTicker → Problem/Solution
                                → Alberta → ByTheNumbers → Thesis → Pipeline
                                → LiveMarkets → Leadership → VoltScout → Academy
                                → Press → Footer
src/assets/partners/          NEW dir — partner SVG logos (grayscale)
src/assets/press/             NEW dir — press SVG logos (grayscale)
```

Reuse existing `ScrollReveal`, `useAESOData`, `useBitcoinNetworkStats`, `EnhancedLogo`, design tokens (`watt-navy`, `watt-bitcoin`, `--border`, `--muted-foreground`). No new dependencies.

## Suggested build order

1. TrustBar + Hero eyebrow (highest impact, lowest effort)
2. ByTheNumbers band + neutral SectionDividers
3. LiveOperationsTicker
4. LeadershipStrip + PressStrip
5. Footer upgrade

## Two things I need from you before I build

- **Partner logos**: which real entities can we list (AESO, FortisAlberta, ATCO, Bitmain, etc.)? I won't fabricate logos.
- **Press**: any real coverage URLs/outlets, or should the first pass use a generic "Industry coverage" framing with article cards instead of logos?
