# Evaluator Rubric

Use this after implementation and before accepting a feature. Score each row 0 (no), 1 (partly), 2 (yes).
A 0 in Correctness or Verification means Block or Revise, whatever the total.

| Category | Question | Subvera-specific checks | Score (0-2) | Notes |
| --- | --- | --- | --- | --- |
| Correctness | Does the behaviour match the feature's `user_visible_behavior`? | Checked at desktop and 390px. Toasts, empty states and dialogs behave as described. |  |  |
| Verification | Did the required checks actually run, with evidence? | `npm run verify` passed. Every `verification` step has a matching `evidence` line with a date. |  |  |
| Scope discipline | Did the session stay inside the chosen feature? | Diff touches only files the feature needs. No drive-by restyling. |  |  |
| Reliability | Does the result survive restart or rerun without repair? | `./init.sh` passes from clean. No `new Date()` at render (hydration). URL-reading components inside `<Suspense>`. |  |  |
| Maintainability | Is the code clear enough for the next session? | Reuses `kit.tsx` / `ui.tsx` / `form.tsx` and `@theme` tokens. State through `useApp()`. Comments explain why. No severity or per-finding status reintroduced. |  |  |
| Handoff readiness | Can a fresh session continue from repo artifacts only? | `claude-progress.md` and `feature_list.json` updated. Risks recorded. |  |  |

## Verdict

- Accept
- Revise
- Block

## Required Follow-Up

- Missing evidence:
- Required fixes:
- Next review trigger:

## Tuning log

Agents grading their own work tend to find a problem and then approve anyway. After each review, compare the
evaluator's scores with a human's. Where they differ, make the row's checks more specific and note it here.

| Date | Disagreement | Rubric change |
| --- | --- | --- |
