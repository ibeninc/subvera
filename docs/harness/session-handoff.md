# Session Handoff

Fill this in at the end of a long session, or one that touched several areas. Overwrite it each time; the history
lives in `claude-progress.md`.

## Verified Now

- What is currently working: baseline (`npm run verify`) passes; harness in place.
- What verification actually ran: `./init.sh` on 2026-10-19 (lint, typecheck, build, route smoke test).

## Changed This Session

- Code or behavior added: none to the app.
- Infrastructure or harness changes: `AGENTS.md`, `CLAUDE.md`, `init.sh`, `scripts/smoke.sh`, npm scripts, `feature_list.json`, `claude-progress.md`, `docs/harness/*`.

## Broken Or Unverified

- Known defect: none known.
- Unverified path: every app and landing feature (`landing-001` to `shell-001`).
- Risk for the next session: in-memory state resets on reload, so run each feature's steps in one page session.

## Next Best Step

- Highest-priority unfinished feature: `landing-001`
- Why it is next: lowest priority number that isn't `passing`.
- What counts as passing: every step in its `verification` list run at desktop and 390px, results recorded in `evidence`.
- What must not change during that step: the demo scripts' content and timing, unless verification shows a bug.

## Commands

- Startup: `./init.sh`, then `npm run dev`
- Verification: `npm run verify` (or `SKIP_BUILD=1 ./init.sh` for a quick check)
- Focused debug command: `npm run build && npm run smoke`
