

# Academy E2E Verification Plan

## What
Use the browser to navigate the Academy and verify that the 6 interactive components render and behave correctly across 5 modules.

## Verification Matrix

| Module | Components to verify |
|---|---|
| Bitcoin | RealWorldInsight, ModuleExam |
| Mining Economics | RealWorldInsight, CommonMistakes, ModuleExam |
| Operations | RealWorldInsight, ProcessFlowchart, OrderingExercise, CommonMistakes, ModuleExam |
| Electrical | RealWorldInsight, ProcessFlowchart, OrderingExercise, ModuleExam |
| Datacenter | DecisionTree, ComparisonMatrix |

## Steps
1. `navigate_to_sandbox` → `/academy` (login check first; if blocked, stop and ask user to log in)
2. For each module page (`/academy/bitcoin`, `/academy/mining-economics`, `/academy/operations`, `/academy/electrical`, `/academy/datacenter`):
   - Navigate, scroll/observe to confirm each expected component renders
   - Screenshot the key interactive sections
   - Interact once with each (click a DecisionTree option, drag/click an OrderingExercise item, open ModuleExam, click a flashcard)
3. Capture console errors via `read_console_logs` after each module
4. Report a per-module pass/fail table; if a bug is found, stop and report before fixing

## Notes
- Read-only verification — no code changes unless a defect is found
- Auth: if the preview redirects to login, I'll stop and ask you to sign in rather than entering credentials
- Browser is rate-limited; I'll batch screenshots only at meaningful checkpoints

