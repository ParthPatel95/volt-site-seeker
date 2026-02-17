

# Fix: Hide Main Sidebar for AESO & ERCOT Market Hubs

## The Problem

The main VoltScout sidebar stays visible alongside the new AESO Hub sidebar, creating a "double sidebar" layout. Build Management avoids this because its route (`/app/build`) is listed in the `isFullScreenModule` check in `VoltScout.tsx`. The market hub routes are not.

## The Fix

One line change in `src/pages/VoltScout.tsx` (line 49-50):

Add `/app/aeso-market-hub` and `/app/ercot-market-hub` to the `isFullScreenModule` condition so the main sidebar hides and the page gets full width, just like Build Management and Secure Share.

**Before:**
```
const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                           location.pathname.startsWith('/app/secure-share');
```

**After:**
```
const isFullScreenModule = location.pathname.startsWith('/app/build') || 
                           location.pathname.startsWith('/app/secure-share') ||
                           location.pathname.startsWith('/app/aeso-market-hub') ||
                           location.pathname.startsWith('/app/ercot-market-hub');
```

No other files need to change. The AESO and ERCOT sidebar components already have "Back to VoltScout" links built in.

