# STATUS.md

_Single source of truth for what each agent is currently working on in this repo. Update when you start, stop, or hand off._

_Last updated: 2026-05-11 ET_

---

## Currently in flight

- **Claude** — `claude/may-2026-redirection`: ships the May 2026 strategic redirection. Adds `specs/` (7 canonical product/design specs + README-HANDOFF + PRE-LAUNCH-CHECKLIST), `content/` (placeholder Methodology page + 2 Explainer voice exemplars), `CLAUDE.md` and `_DRIFT_REPORT_2026-05-11.md` at repo root, AGENTS.md/AGENT_WORKFLOW.md updates (Sauna discontinued, Claude added to roster, voice rules merged, "at these assumptions" pairing tightened), supersession marks on `PRODUCT_DNA.md` / `POSITIONING.md` / `CONTENT_STRATEGY.md` / `ROADMAP.md` / `BUSINESS_MODEL.md` / `10_CANONICAL/Vocabulary.md`. Reconciles with the May 4 alignment report and the May 11 drift report. **Awaiting Scott's review and merge.** Companion PR in `aspire-gtm/` on `claude/may-2026-redirection` covers the GTM AGENTS.md update + V3.2 archive.

## Recently shipped

- 2026-05-04 — **Sauna** — PR #1: Copy/UX refactor + post-submit flow (terminology pass, CTA flip, inline simulator auto-open, Home Alone Aspire Index card, 38 average benchmark, expandable explainer, score email rewrite). Hotfix `2d44912`: post-submit auto-redirect skipping inline experience.
- 2026-05-03 — **Codex** — Saved scenario simulator flow (`009e83b`, `2033533`). Wires Supabase persistence in `netlify/functions/score.js` (returns scenarioId + simulatorUrl token).
- 2026-05-03 — **Codex** — `docs: update technical context for Supabase simulator flow` (`3ef4378`).

## Architecture decisions

- **Persistence:** Supabase (project: `mknfjzgwueswetujpbsc`) is the system of record for saved scenarios and simulator hydration.
- **Newsletter/subscriber layer:** Beehiiv remains the newsletter platform and subscriber metadata layer.
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
