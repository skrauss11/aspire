# AGENT_WORKFLOW.md

_How Sauna and Codex coordinate work in this repo. Read this before doing anything._

## Branch protection

Direct pushes to `main` are blocked. Every change — from any agent — must go through a pull request.

- Force pushes blocked
- Branch deletion blocked
- PR required to merge

This is intentional. Two agents writing to `main` directly created collisions (most recently: a Codex `simulatorUrl` redirect silently broke Sauna's post-submit flow on 2026-05-04). PRs make collisions visible *before* they hit production.

## Per-change checklist

1. **Read `STATUS.md`.** If another agent is touching the same file, ask Scott to coordinate before starting.
2. **Write the entry** in `STATUS.md` under "Currently in flight" before opening the PR.
3. **Branch name:** `<agent>/<short-slug>` — e.g. `sauna/post-submit-fix`, `codex/scenario-save`.
4. **Open the PR** with: what changed, why, test notes, what was deferred.
5. **Wait for Scott's merge.** Do not self-merge unless Scott explicitly authorizes.
6. **After merge:** move the `STATUS.md` entry to "Recently shipped."

## Netlify

- Deploy Previews: **disabled.** Only merges to `main` trigger deploys.
- Branch deploys: **`main` only.**
- Reason: monthly credit cap. Burning a build per PR commit is not affordable.

## When agents disagree

If Codex and Sauna both touched the same file in different ways, the resolution path is:

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

## File ownership map

| File | Primary owner | Notes |
|---|---|---|
| `index.html` | Sauna | Calculator UI, copy, post-submit flow |
| `simulator.html` | Codex (deprecated soon) | Saved-scenario page, will move to `/plan` |
| `netlify/functions/score.js` | Codex | Score computation + Supabase upsert + Resend email |
| `netlify/functions/scenario.js` | Codex | Scenario load/save |
| `netlify/functions/tracker.js` | Codex | Tracker waitlist signup |
| `rates.json` | Codex (cron) | Auto-refreshed weekly |
| `*.md` (docs) | Either | Coordinate via STATUS.md if touching the same file |

Non-exclusive: either agent can touch any file with a STATUS.md entry. The "primary owner" is who Scott goes to first when something breaks there.
