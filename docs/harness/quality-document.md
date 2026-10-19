# Quality Document

Codebase health by area. The evaluator rubric asks "did this session do good work?"; this asks "is the project getting
stronger or weaker?". Read it before a session to see where the code is weakest; update it after significant sessions.

**Grades:** A: verified, clean, agent-legible. B: verified, minor gaps. C: works but unverified or hard to follow.
D: broken or major structural problems.

## Product Domains

| Domain | Grade | Verification | Agent Legibility | Test Stability | Key Gaps | Last Updated |
|--------|-------|--------------|------------------|----------------|----------|--------------|
| Landing + scripted demo | C | Smoke only | Good: one file per section, demo scripts at top of file | No automated behaviour test | Demo timing unverified on phones | 2026-10-19 |
| Sign in | C | Smoke only | Good | No automated behaviour test | Prototype only (auth-002) | 2026-10-19 |
| Reviews list | C | Smoke only | Good | No automated behaviour test | | 2026-10-19 |
| New review wizard | C | Smoke only | Good, step rules in one array | No automated behaviour test | | 2026-10-19 |
| Review run + findings | C | Smoke only | Fair: `Findings.tsx` is 540 lines | No automated behaviour test | `window.print()` blocks browser automation | 2026-10-19 |
| Archive + report | C | Smoke only | Good, report shared via `report.tsx` | No automated behaviour test | | 2026-10-19 |
| Members + settings | C | Smoke only | Good | No automated behaviour test | | 2026-10-19 |

## Architectural Layers

| Layer | Grade | Boundary Enforcement | Agent Legibility | Key Gaps | Last Updated |
|-------|-------|----------------------|------------------|----------|--------------|
| Routes (`app/`) | B | Convention only: server `page.tsx` + client screen | Good | Not lint-enforced | 2026-10-19 |
| App state (`AppContext.tsx`) | B | All mutations through `useApp()` | Good, one typed `Ctx` | In memory, resets on reload | 2026-10-19 |
| Shared UI (`components/app`, `components/ui`) | B | Convention only | Good, JSDoc on exports | | 2026-10-19 |
| Data (`lib/data.ts`) | B | Pure data and helpers | Good | Sample data only | 2026-10-19 |
| Styling (`globals.css` tokens) | B | Convention only | Good | `DESIGN.md` colours/fonts are superseded but still in the file | 2026-10-19 |
| Harness | B | `init.sh` + smoke | Good | No browser-level automated tests | 2026-10-19 |

## Change History

### 2026-10-19

- Changes: harness added (session 001). First snapshot.
- Domains promoted: none
- Domains demoted: none
- New gaps identified: no feature browser-verified; README routes were stale (fixed); `Findings.tsx` size.
- Gaps closed: no standard verification path existed (now `npm run verify`).
