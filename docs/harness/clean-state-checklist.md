# Clean State Checklist

Go through this before ending a session.

- [ ] `./init.sh` still passes (lint, typecheck, build, smoke).
- [ ] No dev or `next start` server left running on 3000 or 3100.
- [ ] Any new route is in `scripts/smoke.sh` and the README route table.
- [ ] `claude-progress.md` has a session entry and an up-to-date Current Verified State.
- [ ] `feature_list.json` reflects what is actually passing: nothing `passing` without evidence, at most one `in_progress`.
- [ ] No half-finished step is left undocumented.
- [ ] `git status` shows only intended changes. The Next.js block in `AGENTS.md` is untouched.
- [ ] The next session can continue without manual repair.
