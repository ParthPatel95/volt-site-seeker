

# Fix: Power Model Tab Not Visible on Mobile

## Root Cause (Deep Debug Finding)

The Power Model tab IS in the code and working correctly. The problem is **not a cache issue** -- it's a **mobile navigation visibility issue**.

The `useResponsiveNavigation` hook limits visible tabs based on screen width:
- Mobile (under 768px): Only **4 tabs** shown (priorities 1-4: Market, AI Predictions, Telegram, Datacenter)
- Tablet (under 1024px): Only **6 tabs** shown
- Small desktop (under 1280px): Only **8 tabs** shown
- Large desktop (1280px+): All 11 tabs shown

Power Model has **priority 11** (the lowest), so it's always hidden in the "..." overflow dropdown menu on every device except very large desktops. On the user's phone, it's buried 7 items deep inside a tiny "..." button that's easy to miss.

## Fix: Two-Part Solution

### Part 1: Promote Power Model to Higher Priority

In `src/components/AESOMarketComprehensive.tsx`, change Power Model's priority from 11 to **4** (making it one of the first visible tabs on mobile), and demote less-critical tabs.

New priority order:
```
1. Market Data (keep)
2. Power Model (promoted from 11 to 2)
3. Telegram Alerts (keep at 3)
4. AI Predictions (moved from 2 to 4)
5. Datacenter Control (moved from 4 to 5)
6. Historical (keep)
7. Analytics Export (keep)
8. Generation (keep)
9. Forecasts (keep)
10. Outages & Alerts (keep)
11. Dashboards (keep)
```

### Part 2: Increase Mobile Tab Count

In `src/hooks/useResponsiveNavigation.tsx`, increase visible items:
- Mobile: 4 to **5** items
- Tablet: 6 to **7** items
- Small desktop: 8 to **9** items

This ensures Power Model is always visible on every screen size without needing to dig through overflow menus.

### Part 3: Bump App Version

In `src/constants/app-version.ts`, bump to `2026.02.11.002` to force cache refresh so users get the updated navigation immediately.

## Files to Modify

| File | Change |
|---|---|
| `src/components/AESOMarketComprehensive.tsx` | Change Power Model priority from 11 to 2, adjust other priorities |
| `src/hooks/useResponsiveNavigation.tsx` | Increase visible item counts for all breakpoints |
| `src/constants/app-version.ts` | Bump version to `2026.02.11.002` |

