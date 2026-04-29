## Goal

Replace the pill-style centered nav with a clean **Coinbase Institutional**-style inline link bar. Keep WattByte branding intact. Reduce primary links to **Advisory, Academy, Hosting** only — no About, no Learn dropdown additions, no new links.

## Design

- **Brand (left)**: Unchanged — `EnhancedLogo` + "Watt₿yte" wordmark + "Infrastructure Company" tagline. Same sizes.
- **Primary nav (center-right, lg+)**: Plain text links, no pill container, no background, no icons.
  - Order: **Advisory · Academy · Hosting**
  - Idle: `text-muted-foreground`, `font-medium`, `text-sm`
  - Hover: `text-foreground` + 1px underline animating in from left (using `after:` pseudo with `scale-x-0 → scale-x-100`, primary-orange color)
  - Active route: `text-foreground` + persistent underline in primary orange
  - Spacing: `gap-8` between links, generous breathing room
- **CTAs (right)**: Unchanged behavior — `VoltScout` (filled primary orange) + `GridBazaar` (outline). Slightly tighter sizing.
- **Mobile (<lg)**: Hamburger sheet, primary section shows only Advisory / Academy / Hosting (drop About row). Learn and Company sections in the sheet remain unchanged.
- **Scroll behavior**: Keep subtle border + shadow appearing after 8px scroll.

## Visual reference

```text
[Logo  Watt₿yte               Advisory   Academy   Hosting        VoltScout  GridBazaar]
       Infrastructure Company             ─────                      (filled)  (outline)
                                         (active = orange underline)
```

## Files to change

- `src/components/landing/LandingNavigation.tsx` — replace pill container with inline underline links; remove About from `PRIMARY_LINKS`; remove icons from desktop links; sync mobile sheet primary section.

## Out of scope

- No new dependencies, no token changes, no Learn/Company section edits, no auth/CTA logic changes.
