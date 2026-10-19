<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Subvera: agent guide

Subvera is a Next.js 16 marketing site and clickable app prototype for reviewing umbilical documents against
API 17E / 17L1. There is no backend: app state lives in memory (`components/app/AppContext.tsx`) and resets on reload.

This repo is set up for long-running agent work. The goal is not raw code output. The goal is to leave the repo in a
state where the next session can continue without guessing.

## Startup workflow

Before writing code:

1. Confirm the working directory with `pwd` (should end in `/subvera`).
2. Read `claude-progress.md` for the latest verified state and next step.
3. Read `feature_list.json` and pick the highest-priority feature that isn't `passing` or `blocked`.
4. Review recent commits with `git log --oneline -5`.
5. Run `./init.sh` (install, lint, typecheck, production build, route smoke test).
6. If the feature touches UI, start `npm run dev` and look at the affected screen before changing it.

If the baseline is already failing, fix that first. Don't stack feature work on a broken starting state.

## Working rules

- One feature at a time. Only one feature in `feature_list.json` may be `in_progress`.
- Adding code doesn't make a feature done. Running its `verification` steps does.
- Stay inside the selected feature. A narrow supporting fix is fine when a blocker forces it; note it in the progress log.
- Don't change a feature's `verification` steps, or `scripts/smoke.sh`, to make work look finished.
- Prefer durable repo artifacts over chat summaries.
- Before using a Next.js API, read its page in `node_modules/next/dist/docs/` (see the block at the top of this file).

## Verification

| Level | Command | What it proves |
|---|---|---|
| Quick | `SKIP_BUILD=1 ./init.sh` | lint + typecheck |
| Baseline | `./init.sh` or `npm run verify` | lint, typecheck, `next build`, every route renders with the right title, old routes redirect |
| Feature | the feature's `verification` steps, in a browser against `npm run dev` | the user-visible behaviour works |

There is no unit-test runner. Feature checks are done in a real browser. Record what you saw as evidence: the steps
you ran, the result, and a screenshot path or GIF name if you captured one. Check at desktop width and at a phone
width (390px) for anything layout-related.

When you add a route, add it to `scripts/smoke.sh` in the same change.

## Codebase conventions

Match these. They're how the existing code works, not aspirations.

**Routes** (`app/`)
- `page.tsx` is a small server component: it exports `metadata` (`{ title: "…" }`; the root layout adds " · Subvera")
  and renders one client component from the same folder, named for the screen (`ReviewsList.tsx`, `Findings.tsx`).
- A client component that reads the URL (`useParams`, `useSearchParams`) renders inside `<Suspense>` in `page.tsx`,
  with a one-line comment saying why. `cacheComponents` is on, so this is required, not optional.
- App screens live under `app/(app)/`, which wraps them in `AppProvider` + `AppShell`. Marketing and sign-in sit outside it.
- Retired routes become `redirects()` in `next.config.ts`, with a comment, rather than being deleted silently.

**State and data**
- All app state and mutations go through `useApp()` from `components/app/AppContext.tsx`. Add a typed action to `Ctx`
  rather than holding shared state in a screen. Mutations that matter to the audit trail go through `log()` / `logActivity`.
- Sample content, types and pure helpers live in `lib/data.ts`. Dates use `SAMPLE_TODAY` / `todayLabel()`, never
  `new Date()` at render time, so server and client HTML match.
- Feedback after an action is `toast("…")`: short, past tense, no exclamation marks ("Review archived").

**UI building blocks** (reuse before writing new markup)
- Page layout: `PageIntro` + `PageBody` from `components/app/kit.tsx` (or `PageHeader` from `ui.tsx` for simple screens),
  with `gutter` for horizontal padding. Lists use `FilterTabs`, `SearchField`, `Pagination`, `EmptyState`. Confirmations use `Dialog`.
- Findings: `KindIcon` / `KindText` / `KindDot`, `ClauseRef`, `ResultsSummary`, `StatusPill`, `Avatar`, `Person` from `components/app/ui.tsx`.
- Buttons in the app: `appButton(variant, className)` on a `<button>` or `<Link>`. Cards: `Card`, `surface`, `surfaceHover`.
- Wizard and settings forms: `Section`, `Group`, `OptionTile`, `Select`, `WizardStepper` from `components/app/form.tsx`.
- Report and comment sheet export: `components/app/report.tsx`, shared by reviews and the archive.
- Marketing: `components/sections/*` (one file per section), `components/visuals/*`, `components/ui/*`.

**Styling**
- Tailwind v4 with tokens from `@theme` in `app/globals.css`: `navy`, `teal`, `teal-dark`, `mist`, `canvas`, `hairline`,
  `edge`, `fg-muted`, `fg-subtle`, `high-fg`, `missing`, radii `rounded-pill` etc. Use tokens rather than new hex values.
  One-off pixel sizes in brackets (`text-[13px]`) are normal here.
- Teal is never small text on white: use `teal-dark`. Text uses three levels only: `navy`, `fg-muted`, `fg-subtle`.
- Icons are `lucide-react`, decorative ones `aria-hidden`. Motion is `motion/react`.
- Fonts: Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono for clause references and codes.
- Layout, rhythm and motion for the marketing site: `DESIGN.md`. Its colours and fonts are superseded by the brand
  sheet values in `README.md` and `globals.css`.

**Product language**
- A finding is one of three kinds: `non-compliant`, `missing`, `compliant`. There is no severity and no per-finding
  status; engineers export the comment sheet and track findings there. Don't reintroduce either.
- Review status is `Running`, `Complete` or `Archived`.
- British spelling ("utilisation", "colour"). Plain, specific sentences. Subvera flags issues for engineers to judge;
  copy must never say it certifies compliance.

**Code style**
- Comments explain why, in a short block or JSDoc line above the thing. Match the density of the file you're in.
- Imports use the `@/` alias. Client components start with `"use client"`.

## Required artifacts

- `feature_list.json`: source of truth for feature state
- `claude-progress.md`: session log and current verified state
- `init.sh`: standard startup and verification path
- `scripts/smoke.sh`: route smoke test run by `npm run verify`
- `docs/harness/session-handoff.md`: compact handoff, for long sessions or several active areas
- `docs/harness/clean-state-checklist.md`: run before ending a session
- `docs/harness/evaluator-rubric.md`: score a session's work before accepting it
- `docs/harness/quality-document.md`: codebase health by area, updated after significant sessions

## Definition of done

A feature is `passing` only when all of these are true:

- the behaviour in `user_visible_behavior` is implemented
- `npm run verify` passes
- every step in its `verification` list was run, and what you saw is recorded in `evidence`
- the repo still starts from `./init.sh` with no manual repair

## End of session

1. Update `claude-progress.md` (current verified state + a new session entry).
2. Update `feature_list.json`: status, evidence, notes. Never mark `passing` without evidence.
3. Record unresolved risks or blockers.
4. Go through `docs/harness/clean-state-checklist.md`.
5. Commit with a descriptive message once the work is in a safe state, if the user has asked you to commit.
6. Leave the repo so the next session can run `./init.sh` immediately.
