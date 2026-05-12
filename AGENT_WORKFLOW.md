# AGENT_WORKFLOW.md

_How Codex, Claude, and Hermes coordinate work in this repo. Read this before doing anything._

_Sauna was discontinued as of 2026-05-11 (see `AGENTS.md` Agent Roster). Sauna's prior content/copy/UX-writing role moved to Claude; Sauna's prior live-site HTML editing role moved to Codex._

## Branch protection

Direct pushes to `main` are blocked. Every change — from any agent — must go through a pull request.

- Force pushes blocked
- Branch deletion blocked
- PR required to merge

This is intentional. Two agents writing to `main` directly created collisions in the past (most notably: a Codex `simulatorUrl` redirect silently broke a Sauna post-submit flow on 2026-05-04). PRs make collisions visible *before* they hit production.

## Per-change checklist

1. **Read `STATUS.md`.** If another agent is touching the same file, ask Scott to coordinate before starting.
2. **Write the entry** in `STATUS.md` under "Currently in flight" before opening the PR.
3. **Branch name:** `<agent>/<short-slug>` — e.g. `claude/spec-pass`, `codex/scenario-save`, `hermes/research-q3`.
4. **Open the PR** with: what changed, why, test notes, what was deferred.
5. **Wait for Scott's merge.** Do not self-merge unless Scott explicitly authorizes.
6. **After merge:** move the `STATUS.md` entry to "Recently shipped."

## Netlify

- Deploy Previews: **disabled.** Only merges to `main` trigger deploys.
- Branch deploys: **`main` only.**
- Reason: monthly credit cap. Burning a build per PR commit is not affordable.

## When agents disagree

If two agents touched the same file in different ways, the resolution path is:

1. Both PRs stay open.
2. Scott picks the merge order or asks one agent to rebase.
3. The losing agent reads the merged version and updates their PR.

No agent unilaterally rewrites another agent's work without leaving a comment in the PR explaining why.

## Hotfix exception

If production is broken (e.g. JS syntax error, calculator returning NaN), the rules relax:

- Open a PR titled `hotfix: <description>`.
- Tag Scott in the PR body.
- Self-merge only if Scott is unreachable AND the fix is genuinely surgical (one-file, <20 line diff).
- File a `STATUS.md` entry post-hoc.

## File ownership map (updated 2026-05-11)

| File | Primary owner | Notes |
|---|---|---|
| `index.html` | Codex | Calculator UI structure; copy sourced from `specs/copy.md` |
| `simulator/index.html` | Codex | Simulator UI structure; copy sourced from `specs/copy.md` |
| `manifesto.html`, `og-card.html`, `score/index.html` | Codex | Static pages; copy sourced from `specs/copy.md` |
| `netlify/functions/score.js` | Codex | Computation + Supabase upsert + Resend email. Function name preserved as deploy contract; return shape evolves with new specs. |
| `netlify/functions/scenario.js` | Codex | Scenario load/save |
| `netlify/functions/tracker.js` | Codex | Tracker waitlist signup |
| `rates.json` | Codex (cron) | Auto-refreshed weekly |
| `lib/*.js` | Codex | Calculator math, charts, format helpers, schema |
| `specs/*.md` | Claude | Canonical product/design specs — see `AGENTS.md` Canonical Specs |
| `content/**/*.mdx` (when added) | Claude | Published editorial pieces (Index cards, Explainers, Methodology) — drafts originate in `aspire-gtm/30_CONTENT_ENGINE/`, published MDX lives here |
| `copy.md`, brand voice docs | Claude | Voice and copy authority |
| `*.md` (other strategy docs) | Claude or Codex | Coordinate via `STATUS.md` if touching the same file |

Non-exclusive: any agent can touch any file with a `STATUS.md` entry. The "primary owner" is who Scott goes to first when something breaks there.
