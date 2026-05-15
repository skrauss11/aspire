# STATUS.md

_Single source of truth for what each agent is currently working on in this repo. Update when you start, stop, or hand off._

_Last updated: 2026-05-15 ET_

---

## Currently in flight

_None._

## Recently shipped

- 2026-05-15 — **Codex** — PR #24 (`aspire`): Target basket weight input fix. Kept Simulator allocation inputs stable while editing so target basket weights no longer jump or drop typed values mid-entry.
- 2026-05-15 — **Codex** — PR #23 (`aspire`): Simulator header and tooltip wrapping. Tightened responsive header metrics and tooltip labels so controls fit cleanly across desktop, tablet, and mobile breakpoints.
- 2026-05-15 — **Codex** — PR #22 (`aspire`): Calculator Life chip layout. Fixed the Life allocation chip wrapping so the label and helper text remain readable at narrow widths.
- 2026-05-15 — **Codex** — PR #19 (`aspire`): Auth + Account Foundation. Added Supabase magic-link/session endpoints, `/account` shell, authenticated account summary/delete-account groundwork, authenticated scenario ownership support, and account navigation while preserving private-token Simulator flows.
- 2026-05-15 — **Codex** — PR #17 (`aspire`): Env-backed production verification. Confirmed Netlify/Supabase env availability, passed all RLS tests with production-loaded env, provisioned the Netlify encryption-key fallback after direct Supabase DB DNS failed in Functions, then reran the production score/scenario happy path through share/revoke/delete with cleanup.
- 2026-05-15 — **Codex** — PR #15 (`aspire`): Production smoke + launch hardening. Added simulator share copy/revoke controls, preserved private-token usability after deleting the current scenario, paired shared-page Aspire Gap with `AT THESE ASSUMPTIONS`, and reconciled `TECHNICAL_CONTEXT.md` plus the pre-launch checklist with the merged score/scenario contracts.
- 2026-05-15 — **Codex** — PR #13 (`aspire`): Sprint 4 Simulator persistence/share loop. Added named scenario save/list/load/rename/delete, 10-scenario cap, make-baseline flow, public share links at `/simulator/s/[shareId]`, and a read-only shared scenario view.
- 2026-05-15 — **Codex** — PR #11 (`aspire`): Sprint 3 Simulator v1 refactor. Rebuilt `/simulator` around saved calculator baseline hydration, sticky rate/gap header with non-removable `AT THESE ASSUMPTIONS`, live comparison levers, trajectory chart, comparison patterns, save modal, and a compliance-safe Shape of Your Gap observation panel.
- 2026-05-15 — **Codex** — PR #9 (`aspire`): Sprint 2 Calculator v2 refactor. Rebuilt `/` around the canonical 7-input Calculator, reveal panel with non-removable "AT THESE ASSUMPTIONS" pairing, email gate, encrypted `/api/score` handoff, compliance label corrections, server-authoritative score metrics, and Agent Lab/Hermes instruction sync.
- 2026-05-15 — **Codex** — PR #8 (`aspire`): encrypted scenario persistence foundation. Added Supabase-backed private scenario storage, encrypted calculator state fields, schema/migration support, RLS tests, and `/api/scenario` hydration groundwork.
- 2026-05-14 — **Claude** — PR #7 (`aspire`): "Methodology + explainer: lock all Family-basket sources via multi-agent audit" — canon update to `content/methodology/index.mdx` §3–4 and `content/explainers/savings-account-losing-points.mdx` against the locked basket ([audit thread](../aspire-gtm/70_AGENT_LAB/threads/2026-05-13-basket-component-source-audit.md)): Housing 6.48% (Case-Shiller `CSUSHPINSA`), S&P 500 13.14% (`SPXTR` total return, labeled "equity-linked aspiration"), Childcare 4.83% (BLS `CUUR0000SEEB03`), K–12 3.94% (BLS `CUUR0000SEEB02`), Healthcare 2.44% (BLS `CUUR0000SAM`); Family-basket aggregate 7.03%; HYSA reframed as illustrative 4% with FDIC context (national savings rate 0.38%, rate cap 4.39%).
- 2026-05-14 — **Claude** — PR #6 (`aspire`): STATUS freeze on `content/methodology/index.mdx` and `content/explainers/savings-account-losing-points.mdx` while the Family-basket source audit was pending, preventing methodology/explainer copy updates before Hermes's audit landed.
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
