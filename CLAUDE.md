@AGENTS.md

## Claude Code notes

- `AGENTS.md` (imported above) is the operating guide. Follow its startup workflow at the start of every session.
- Feature verification happens in a browser: use the `run` skill or Claude in Chrome against `npm run dev`
  (`.claude/launch.json` has the dev server config). Record a GIF with a meaningful name for multi-step flows and put
  its name in the feature's `evidence`.
- For new UI or a visual rework, load the project's `frontend-design` skill (`.claude/skills/frontend-design`),
  then bring the result back in line with the conventions in `AGENTS.md`.
