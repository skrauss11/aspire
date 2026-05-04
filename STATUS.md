# STATUS.md

_Single source of truth for what each agent is currently working on in this repo. Update when you start, stop, or hand off._

_Last updated: 2026-05-04 08:10 ET_

---

## Currently in flight

_(empty — nothing in flight)_

## Recently shipped

- 2026-05-04 — **Sauna** — PR #1: Copy/UX refactor + post-submit flow (terminology pass, CTA flip, inline simulator auto-open, Home Alone Aspire Index card, 38 average benchmark, expandable explainer, score email rewrite). Hotfix `2d44912`: post-submit auto-redirect skipping inline experience.
- 2026-05-03 — **Codex** — Saved scenario simulator flow (`009e83b`, `2033533`). Wires Supabase persistence in `netlify/functions/score.js` (returns scenarioId + simulatorUrl token).
- 2026-05-03 — **Codex** — `docs: update technical context for Supabase simulator flow` (`3ef4378`).

## Architecture decisions

- **Persistence:** Supabase (project: `mknfjzgwueswetujpbsc`). Replaces the old "Beehiiv custom fields" approach. `TECHNICAL_CONTEXT.md` rule #5 needs updating to match.
- **Auth (planned, not built):** Magic link via Resend. See `session/aspire-plan-architecture.md` for full schema + phasing.
- **Branch policy:** `main` is protected. All changes go through PRs. No direct pushes by any agent.
- **Netlify:** Deploy Previews disabled. Only `main` triggers deploys. Production branch only.

## Open spec docs

- `session/aspire-plan-architecture.md` (Sauna, 2026-05-03) — My Aspire Plan: tabs, scenario cards, comparison table, Supabase schema, magic-link auth, 5-phase rollout. **Blocked on:** 6 open questions to be answered before Phase 1 kicks off.

## Agent ownership

Not exclusive, but if both agents touch the same file, leave a one-line entry under "Currently in flight" first.

- **Sauna** — content, copy, UX, page structure, brand consistency. Memory + planning docs.
- **Codex** — backend functions, Supabase schema/migrations, build tooling, deploy infra.
- **Either** — small fixes, hotfixes (with a `STATUS.md` entry).

## How to use this file

Before touching a file, scan "Currently in flight" — if another agent's working on it, coordinate via Scott. After shipping, move the entry to "Recently shipped" with a one-line summary.
