# Progress Log

Session log for any coding agent working on this repo (the filename is a convention from the harness templates, not a
Claude Code requirement). Read it at the start of every session; update it before you stop. See `AGENTS.md`.

## Current Verified State

- Repository root: `subvera/` (Next.js 16.4, React 19.3, Tailwind v4, Motion; front-end prototype, no backend)
- Standard startup path: `./init.sh`, then `npm run dev` (http://localhost:3000)
- Standard verification path: `npm run verify` (lint, typecheck, `next build`, `scripts/smoke.sh`), plus each feature's browser steps in `feature_list.json`
- Baseline status: passing as of 2026-10-19 (session 002)
- Current highest-priority unfinished feature: `landing-001` (landing page with scripted demo). It and every feature up to `shell-001` are `unverified`: the code exists from commits 07fcc7f and 489828e but nobody has run their verification steps.
- Current blocker: none. `auth-002`, `backend-001` and `landing-002` need product decisions before they can be specified.

## Session Log

### Session 001

- Date: 2026-10-19
- Goal: Review the codebase and set up the agent harness from the learn-harness-engineering templates, matching the repo's existing conventions.
- Completed:
  - `AGENTS.md`: harness workflow, verification levels, definition of done, and the codebase conventions (routes, state, UI kit, tokens, product language). The Next.js managed block at the top is untouched.
  - `CLAUDE.md`: imports `AGENTS.md`, adds Claude Code notes (browser verification, frontend-design skill).
  - `init.sh`: `npm ci` only when the lockfile changed, then `npm run verify`. `SKIP_BUILD=1` for a quick lint + typecheck.
  - `scripts/smoke.sh` and npm scripts `typecheck`, `smoke`, `verify`.
  - `feature_list.json`: harness, docs, 10 existing prototype features (`unverified`), 3 backend features (`not_started`).
  - `docs/harness/`: session handoff, clean-state checklist, evaluator rubric, quality document.
  - README route table corrected (it still listed /dashboard, /reports, /documents).
- Verification run: `./init.sh` (full), negative test of `scripts/smoke.sh`.
- Evidence captured: see `harness-001` and `docs-001` in `feature_list.json`.
- Commits: none yet. Changes are uncommitted for review.
- Files or artifacts updated: `AGENTS.md`, `CLAUDE.md`, `README.md`, `package.json`, `init.sh`, `scripts/smoke.sh`, `feature_list.json`, `claude-progress.md`, `docs/harness/*`
- Known risk or unresolved issue: no feature behaviour has been browser-verified yet. The PDF export uses `window.print()`, which blocks browser automation, so that step needs a human or has to be recorded as skipped.
- Next best step: verify `landing-001` in the browser against `npm run dev`, record evidence, then work down the `unverified` list in priority order. Fix only what verification shows is broken, one feature at a time.

### Session 002

- Date: 2026-10-19
- Goal: Apply the client's landing page feedback (7 items) as `landing-003`.
- Completed: copy changes in hero, problem, how it works, the two feature rows and the audience section. Product demo tabs reordered to Review setup, Findings, Export on desktop and phones, with autoplay in the same order. Agreed calls: pill still links to pricing; "~5 min" stat becomes "Minutes"; "takes" fixed to "take"; body sentences end with a full stop, headings don't; "PDF or Word" kept as the client wrote it.
- Verification run: `npm run verify`; browser checks in Chrome at 1440px plus 390px and 360px frames (the Chrome window won't go below 606px).
- Evidence captured: `landing-003` in `feature_list.json`.
- Commits: none. Changes are uncommitted for review.
- Files or artifacts updated: `app/page.tsx`, `components/sections/{Hero,ProblemSolution,HowItWorks,WhoItIsFor,FeatureRow,ProductShot,MobileDemo}.tsx`, `feature_list.json`, `claude-progress.md`
- Known risk or unresolved issue: "Export the findings as PDF or Word" matches Pricing, but the app prototype exports a PDF and a comment sheet, not Word. The non-compliances heading runs to five lines on desktop because it's long. Both are copy decisions for the client.
- Next best step: unchanged. Verify `landing-001` (the rest of the landing page and the demo itself), then work down the `unverified` list.
