

# Fix Academy Signup Flow + Auto-Generate Completion Certificate

## Issues Identified

### 1. Signup blocked by email confirmation
Supabase's default auth config requires email confirmation. When a new user signs up, `signUp()` returns a user but the session is `null` until the user confirms their email. The code then tries to navigate to `/academy`, but `AcademyAuthGuard` sees no active session and redirects back to `/academy/auth` -- a dead loop. The user specified we should **not** require email verification.

**Fix**: Disable email confirmation in Supabase `signUp` by using `autoConfirm` approach. Since we can't change Supabase dashboard settings via code, the practical fix is:
- In `AcademyAuthContext.signUp()`: After signup, if the session is null (email not confirmed), immediately call `signIn()` with the same credentials. This only works if Supabase has "Confirm email" disabled. Since we can't toggle that setting programmatically, we'll instead adjust the flow to show a success message and prompt re-login -- **OR** better yet, we change the signup toast to say "Account created! Please sign in." and switch to sign-in mode instead of navigating away.
- Remove the `is_email_verified` field concern -- it's on our custom `academy_users` table and defaults to `false`, which is fine since we won't gate anything on it.

**Actual root fix**: The real issue is Supabase requires email confirmation. We need to handle the case where `data.user` exists but `data.session` is null (meaning email confirmation required). The fix: after successful signup with no session, show "Account created! Please sign in." toast and switch to the sign-in form. When they sign in, the `signIn` flow will auto-create the academy profile if needed.

BUT -- the user said "we do not need to send a email verification." The Supabase project likely has email confirmation enabled. We should update the signup flow to handle both cases gracefully:
- If session exists after signup: navigate directly (confirmation disabled)  
- If session is null after signup: show "Account created! Sign in to continue." and switch to sign-in mode

### 2. Certificate never auto-generated
The `CompletionCertificate` component exists but is **never imported or rendered anywhere**. When a user completes all sections in all modules, nothing happens.

**Fix**: Add auto-certificate logic to the `AcademyProgress` page:
- When `overallProgress === 100` (all 13 modules completed), auto-show the `CompletionCertificate` overlay
- Certificate should be signed by "WattByte Inc." (update the certificate component)
- Also add per-module certificate buttons for completed modules
- Store completion in a toast/local check so the certificate popup appears once automatically

## Changes

### `src/contexts/AcademyAuthContext.tsx`
- Fix `signUp()`: After successful signup, check if `data.session` is null. If so, return a special indicator so the auth page knows to switch to sign-in mode instead of navigating.
- Return `{ error: null, needsSignIn: boolean }` pattern (or handle via the auth page).

### `src/pages/AcademyAuth.tsx`  
- After signup success with no session: show "Account created successfully! Please sign in." toast and auto-switch to sign-in mode (set `isSignUp(false)`) and keep the email pre-filled. Do NOT navigate away.
- After signup success with session: navigate as before.

### `src/components/academy/CompletionCertificate.tsx`
- Update the certificate to be signed by **"WattByte Inc."** -- add a signature/signatory line
- Add "Issued by WattByte Inc." text to the certificate

### `src/pages/AcademyProgress.tsx`
- Import `CompletionCertificate`
- When all 13 modules are 100% complete, auto-show certificate overlay (with `useState` to toggle)
- Add a "View Certificate" button when `overallProgress === 100`
- Pass `userName` from `academyUser.full_name`
- Also add per-module "View Certificate" buttons for individually completed modules

