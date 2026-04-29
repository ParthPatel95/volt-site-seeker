## Goal

Redesign `LandingNavigation` to look more professional, ensure full responsiveness across all breakpoints, and reorder primary links so **Advisory comes before Academy** (desktop and mobile).

## Design direction

Institutional aesthetic (Apple × Coinbase): deep navy, Bitcoin-orange accents, generous spacing, refined typography, subtle motion.

- **Two-row → one-row at lg+**: brand left, primary nav center, CTAs right.
- **Brand**: keep `EnhancedLogo` + "WattByte" wordmark with the inline Bitcoin glyph; tighten the tagline to a single muted line.
- **Primary nav (lg+)**: inline pill links with icon + label — order: **Advisory · Academy · Hosting · About**. Active route gets an underline indicator + foreground color; idle links use `text-muted-foreground` with `hover:text-foreground hover:bg-secondary` (matches our hover-readability rule).
- **CTAs**: split visual weight — `VoltScout` becomes primary filled (Bitcoin orange), `GridBazaar` becomes outline/ghost. Both shrink labels into icon-only buttons with tooltips below `md`.
- **Subtle polish**: scroll-shadow (border + shadow appears after 8px scroll), 200ms ease transitions, focus-visible rings using `--ring`.
- **Auth**: `GlobalUserMenu` stays right-most when signed in.

## Responsive behavior

| Breakpoint | Layout |
|---|---|
| `< sm` (≤640) | Logo (compact) · VoltScout pill · hamburger. GridBazaar moves into sheet. |
| `sm`–`md` | Add GridBazaar as outline button; primary links stay in sheet. |
| `lg` (≥1024) | Show inline primary nav (Advisory, Academy, Hosting, About); hamburger hidden. |
| `xl+` | Full spacing, full tagline visible. |

Current code hides Academy/Hosting until `xl` and keeps a partially-visible Advisory at all sizes — we'll unify so all three primary links appear together at `lg`, eliminating the awkward middle states.

## Mobile sheet refresh

- Reorder top section to **Advisory → Academy → Hosting**.
- Slightly larger touch targets (min-h 44px), section dividers instead of just spacing.
- Keep existing Learn / Company groupings unchanged in content; refine type scale and add a small caret/active state.
- Footer CTAs: VoltScout (filled primary) + GridBazaar (outline) — match desktop weighting.

## Files to change

- `src/components/landing/LandingNavigation.tsx` — full redesign (single file, no API surface change).

No new dependencies. No design-token changes — uses existing `--primary`, `--secondary`, `--muted`, `--border`, `--ring`.

## Out of scope

- Logged-in app shell navigation (separate component).
- Footer redesign.
- Adding new routes — only reordering and styling existing links.
