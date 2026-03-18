

# Fix: White Page on "My Learning" Dropdown

## Problem
The `GlobalUserMenu` component navigates to `/academy/learning` when clicking "My Learning", but no route exists for that path in `App.tsx`. This results in a blank page.

## Solution
The existing Academy landing page (`/academy`) already serves as the learning hub with module listings and the `ContinueLearningBar`. The simplest fix is to update the "My Learning" link in `GlobalUserMenu.tsx` to point to `/academy` instead of the non-existent `/academy/learning`.

Alternatively, if "My Learning" should show progress, it should point to `/academy/progress` which already exists and shows the progress dashboard.

## Change
**`src/components/GlobalUserMenu.tsx`** — Change line 94:
- From: `navigate('/academy/learning')`  
- To: `navigate('/academy/progress')`

This makes "My Learning" go to the progress dashboard (which shows per-module completion, certificates, etc.), while "Academy Home" already goes to `/academy`.

One file, one line change.

