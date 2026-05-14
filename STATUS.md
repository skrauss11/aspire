# STATUS.md

_Single source of truth for what each agent is currently working on in this repo. Update when you start, stop, or hand off._

_Last updated: 2026-05-14 ET_

---

## Currently in flight

- **Codex — `codex/schema-migration`** — Sprint 1 security foundation + PR 2 score refactor: Supabase migration for authenticated users/calculator states/scenarios/baselines with RLS, server-side field encryption helper, RLS tests, locked 2026-05-13 `rates.json` basket component refresh, and encrypted `score.js`/`scenario.js` persistence. Scope: `supabase/`, `lib/`, `tests/`, `package.json`, `rates.json`, `netlify/functions/score.js`, `netlify/functions/scenario.js`; no `specs/`, strategy docs, or `content/*.mdx`.

- **On hold pending source audit** — `content/methodology/index.mdx` and `content/explainers/savings-account-losing-points.mdx`. The childcare CAGR thread ([aspire-gtm/70_AGENT_LAB/threads/2026-05-13-childcare-cagr-sourcing.md](../aspire-gtm/70_AGENT_LAB/threads/2026-05-13-childcare-cagr-sourcing.md)) resolved 2026-05-13 to use BLS `CUUR0000SEEB03` (~4.83%) as canonical childcare CAGR, retiring the placeholder ~11.8%. That change cascades into the basket aggregate in the savings-account-losing-points explainer (~11.0% → ~7.6%, gap shifts from −7 points to ~−3.6 points), which also exposed that the other Family-basket components are unverified placeholders with two source-fitness mismatches (K–12 tuition cites College Board higher-ed series; healthcare cites CMS NHEA spending, not BLS medical CPI). Source-verification handoff to Hermes opened 2026-05-13 ([aspire-gtm/70_AGENT_LAB/handoffs/2026-05-13-claude-to-hermes-basket-component-audit.md](../aspire-gtm/70_AGENT_LAB/handoffs/2026-05-13-claude-to-hermes-basket-component-audit.md)). **Do not edit these two files until the audit thread lands and the Methodology + explainer PRs go through.** Owner of follow-up PRs: Claude.

## Recently shipped

- 2026-05-13 — **Claude** — PR #5 (`aspire`) + PR #5 (`aspire-gtm`): 70_AGENT_LAB async-coordination layer + cross-repo AGENTS.md reference paragraph.
- 2026-05-11 — **Claude** — PR #4 (`aspire`) + companion PR (`aspire-gtm`): May 2026 strategic redirection. Adds `specs/` (7 canonical product/design specs + README-HANDOFF + PRE-LAUNCH-CHECKLIST), `content/` (placeholder Methodology page + 2 Explainer voice exemplars), `CLAUDE.md` and `_DRIFT_REPORT_2026-05-11.md` at repo root, AGENTS.md/AGENT_WORKFLOW.md updates (Sauna discontinued, Claude added to roster, voice rules merged, "at these assumptions" pairing tightened), supersession marks on prior canon docs.
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
