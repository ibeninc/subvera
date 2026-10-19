# Subvera — web

Next.js 16 (App Router) + Tailwind CSS v4 + Motion. Marketing site and clickable app prototype for Subvera.

- **Layout, rhythm and motion:** `DESIGN.md`
- **Colour, type and logo:** Subvera Brand Sheet v1.0 (Depth Navy `#0E2A47`, Sea Teal `#14B8A6`, Deep Blue `#143A63`, Slate `#8A94A6`, Mist `#F5F7FA`; Space Grotesk + IBM Plex Sans, IBM Plex Mono for clause references)
- **Content:** Subvera app mockups

## Run

Needs Node 20.9 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, same as Vercel runs
npm run lint
npm run verify   # lint + typecheck + build + route smoke test
```

## Working with coding agents

Agents start from `AGENTS.md` (Claude Code reads it through `CLAUDE.md`). Run `./init.sh` to install and verify.
Feature state is in `feature_list.json`, the session log in `claude-progress.md`, and the rest of the harness in
`docs/harness/`.

## Deploy (Vercel)

Import the repo in Vercel and keep the defaults: framework **Next.js**, install `npm ci` (from `package-lock.json`),
build `next build`, no output directory override. No environment variables are needed. Every push to the default
branch deploys to production; other branches get preview URLs.

Commit `package-lock.json` with any dependency change so Vercel installs exactly the same versions.

## Routes

| Route | Screen |
|---|---|
| `/` | Landing page, with a scripted product demo under the hero (cursor on desktop, taps on phones) |
| `/sign-in` | Sign in (prototype: goes straight to `/reviews`) |
| `/reviews` | Reviews in progress for the selected project, searchable |
| `/reviews/new` | New review wizard: document, umbilical scope, project scope, standards and upload |
| `/reviews/[id]` | Review in progress (simulated, about 9 s), then findings: filters, search, comments, comment sheet and PDF export, archive |
| `/archive` | Archived reports, searchable |
| `/archive/[id]` | Archived report: details, history, report preview, reopen |
| `/members`, `/settings` | Team and project settings |

`/dashboard` and `/documents` redirect to `/reviews`, and `/reports` to `/archive` (`next.config.ts`).

The app keeps its state in memory for the session (`components/app/AppContext.tsx`); reloading resets it.

## Where things live

- `app/globals.css`: design tokens (`@theme`), type scale, dot-grid backgrounds
- `components/ui`: Button, Logo (inline SVG, geometry in `logo-geometry.ts`), StackCard, Slider
- `components/sections`: landing page sections. `demo.tsx` is the scripted demo engine shared by
  `ProductShot.tsx` (desktop) and `MobileDemo.tsx` (phones and tablets); each file has its scripts at the top
- `components/visuals`: animated feature panels
- `components/app`: app shell (sidebar, mobile menu), shared UI (`ui.tsx`), page building blocks (`kit.tsx`),
  wizard form controls, app state
- `lib/data.ts`: mockup content (findings, wizard options)
- `public/brand`: logo files for use outside the site (SVG lockups and marks). The site itself renders the logo inline.
- `scripts/build-logo.py`: regenerates the logo SVGs, `components/ui/logo-geometry.ts` and the app icons from one
  geometry. Needs `pip install fonttools brotli pillow` and one prior app run (it reads Space Grotesk from `.next`).

## Not wired up yet

Auth, file upload to a backend, the review job itself, and the demo request form are front-end only.
