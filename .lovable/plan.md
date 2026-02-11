

# Definitive Fix: Replace Overflow Navigation with Scrollable Tab Bar

## The REAL Root Cause

The `ResponsiveNavigation` + `useResponsiveNavigation` hook has a React rendering bug:

1. `navigationItems` is declared inside `AESOMarketComprehensive` without `useMemo` -- new array reference every render
2. `useEffect([items])` in the hook fires every render (reference changes)
3. `setVisibleItems(sorted.slice(0, 5))` creates a new array, triggering re-render
4. This creates an unstable render loop where items can be lost or displayed incorrectly

This explains why you keep seeing only 6 items instead of 11, and why Power Model never appears -- the component never stabilizes with the correct set of items.

## Solution: Horizontally Scrollable Tab Bar

Instead of hiding tabs in an overflow menu (which breaks), replace the navigation with a **horizontally scrollable row of tab buttons**. ALL 11 tabs are always visible -- users just swipe/scroll left-right on mobile. Power Model will always be visible as the 2nd tab.

This is the standard pattern used by Google Chrome tabs, YouTube categories, and most mobile apps.

## Files to Modify

### 1. `src/components/AESOMarketComprehensive.tsx`
- Replace `ResponsiveNavigation` with a simple scrollable flex container
- Wrap `navigationItems` in `useMemo` to prevent unnecessary re-renders
- Render all 11 tabs as horizontally scrollable buttons (no overflow menu)
- Keep Power Model at priority 2 position

### 2. `src/constants/app-version.ts`
- Bump to `2026.02.11.004`

### What the User Will See
- A horizontal scrollable row of tab buttons below the AESO Market Hub header
- On mobile: swipe left/right to see all tabs (Power Model visible as 2nd tab)
- On desktop: all tabs visible in a single row
- No more "..." overflow menu that hides critical tabs

### Technical Details

The scrollable navigation will be a simple `div` with:
- `overflow-x: auto` and `-webkit-overflow-scrolling: touch` for smooth mobile scrolling
- `scrollbar-hide` class to hide the scrollbar for a clean look
- All items rendered inline with `flex-shrink-0` so they don't collapse
- Active tab highlighted with primary color
- No dependency on `useResponsiveNavigation` hook (eliminates the bug entirely)

This completely removes the possibility of Power Model being hidden. No priority sorting, no screen-width calculations, no overflow menus -- just a reliable scrollable row of all tabs.
