# Codex Handoff — Aspire May 2026 Redirection

_Drafted 2026-05-11. Lives at `aspire/specs/README-HANDOFF.md`. Purpose: orient Codex (or any builder) to the seven specs in this folder, the existing live code, and the migration path between them._

---

## Read this first, in this order

1. **`../AGENTS.md`** — operating constitution. Agent roster (Codex, Claude, Hermes), branch protection rules, required reading order, voice rules. Non-negotiable.
2. **`../AGENT_WORKFLOW.md`** — per-change checklist. PR rules. File ownership map.
3. **`../STATUS.md`** — what's currently in flight. **Read before touching any file.** Add an entry under "Currently in flight" *before* opening your PR.
4. **`../_DRIFT_REPORT_2026-05-11.md`** (one level up, at repo root) — context on why these specs exist and what conflicts were resolved with the prior canon.
5. **`brief-v2.md`** in this folder — master spec. Aspire Rate, Target Aspire Rate, Aspire Gap definitions. Voice. ICP. Compliance pairing.
6. **`creative-direction.md`** — visual direction. Two-register system. Type/color/motion/component primitives.
7. **`page-spec-calculator.md`** — Calculator implementation spec.
8. **`page-spec-simulator.md`** — Simulator implementation spec (the heaviest).
9. **`security-and-privacy.md`** — schema, RLS, encryption, auth, deletion flow. **Read all of it before writing schema or auth code.**
10. **`content-architecture.md`** — content surfaces, monetization tier shape (locked).
11. **`copy.md`** — every word on every page. Source of truth for copy.
12. **`../COMPLIANCE.md`** — non-negotiable.
13. **`../TECHNICAL_CONTEXT.md`** — current stack, current schema, current functions.

---

## What's actually changing

The May 2026 redirection is a **focused product refresh on top of the existing stack**, not a rewrite. Specifically:

| Surface | Change | Effort |
|---|---|---|
| `aspire/index.html` (Calculator) | Refactor to the new design + 7-input model + reveal moment + "at these assumptions" pairing | Medium |
| `aspire/simulator/index.html` (Simulator) | Significant refactor — 6 levers, sticky header with Required/Target view toggle, opinionated recommendations, scenario presets, Supabase magic-link persistence | Large |
| `aspire/netlify/functions/score.js` | Update return shape to surface `aspireRate` + `aspireGap` (deprecate `score`); preserve function name | Small |
| `aspire/netlify/functions/scenario.js` | Update to read from new schema | Small |
| `aspire/netlify/functions/tracker.js` | Update field names if affected | Small |
| Supabase schema | Drop `public.scenarios`; create `users`, `calculator_states`, `scenarios`, `baseline_overrides` per `security-and-privacy.md` §3 | Medium |
| `aspire/lib/encryption.js` | NEW — libsodium wrapper for the money fields | Small |
| Supabase Vault | NEW — provision `aspire_field_encryption_key_v1` | Tiny |
| `aspire/lib/aspire.js` | Refactor formula to use new sign convention and surface Aspire Rate / Aspire Gap | Small |
| `aspire/lib/chart-*.js` | Add the Calculator reveal bar chart and Simulator trajectory chart | Medium |
| `aspire/manifesto.html` | Untouched per spec | Zero |
| `aspire/og-card.html` | Update for new tagline placement | Tiny |

**What's NOT changing:**
- Stack (vanilla HTML + CSS + JS, Netlify Functions v1 CommonJS, no build step).
- Hosting (Netlify, branch policy, no deploy previews).
- Newsletter platform (Beehiiv).
- Transactional email (Resend, sending domain `score@send.aspirerate.com`).
- The function names of existing Netlify Functions (deploy contract).
- The `rates.json` format (extended, not replaced).

---

## Ordered build plan

### Sprint 1 — schema and security foundation (Codex, ~1 week)

PR 1: `codex/schema-migration`
- Create new tables per `security-and-privacy.md` §3 with all RLS policies.
- Implement `aspire/lib/encryption.js` per `security-and-privacy.md` §4.
- Provision `aspire_field_encryption_key_v1` in Supabase Vault.
- Write the RLS test suite (`tests/rls.test.js`).
- Do not drop `public.scenarios` yet.

PR 2: `codex/score-refactor`
- Update `score.js` to write to new tables (encrypted), keep function name and route.
- Update return shape: `{ aspireRate, aspireGap, scenarioId, simulatorUrl, emailSent }`.
- Update `scenario.js` to read from new tables.
- Update score email template to surface Aspire Rate + Aspire Gap with "at these assumptions" pairing (see `copy.md` §3.5).

### Sprint 2 — Calculator refactor (Codex, ~1 week)

PR 3: `codex/calculator-v2`
- Refactor `index.html` to the new design per `page-spec-calculator.md`.
- Implement Block A (life chip, geography, timeline) and Block B (assets, allocation, contribution).
- Implement reveal choreography (1200ms sequence, see spec §6).
- Wire to `score.js` for email gate → Simulator handoff.
- All copy from `copy.md` §1.1.
- "AT THESE ASSUMPTIONS" eyebrow non-removable.
- Run `npm run check:compliance` before requesting review.

### Sprint 3 — Simulator refactor (Codex, ~2 weeks)

PR 4: `codex/simulator-v2`
- Refactor `simulator/index.html` to the new design per `page-spec-simulator.md`.
- Implement sticky header with Required/Target view toggle.
- Implement all 6 levers (per spec §5).
- Implement trajectory chart with crossover annotation.
- Implement opinionated recommendation engine in `aspire/lib/simulator/recommend.js`.
- Implement scenario save/load via Supabase, with the 6 locked presets.
- Implement public scenario sharing at `/simulator/s/[shareId]`.
- Mobile = preset-led entry → vertical lever stack with full control.
- All copy from `copy.md` §1.2.

### Sprint 4 — content surfaces (Codex + Claude, ~1 week)

PR 5: `codex/content-routes`
- Create `/index`, `/explainers`, `/methodology`, `/report`, `/account` routes per `content-architecture.md` and `copy.md` §1.3 + §2.
- Set up MDX rendering for `aspire/content/index/*.mdx`, `aspire/content/explainers/*.mdx`, `aspire/content/methodology/index.mdx`.
- Create Beehiiv archive integration for `/report` (see `content-architecture.md` §3).
- Add `/llms.txt` generation at build time.
- Add JSON-LD schema (Article, FAQ, Author, Dataset) injection.

PR 6: `claude/launch-content`
- Author 10 launch Index card MDX files.
- Author 8 launch Explainer MDX files.
- Author Methodology page content.
- Author `/author/scott` bio (Scott to provide bio content).

### Sprint 5 — pre-launch (Codex, ~few days)

PR 7: `codex/cleanup`
- Drop `public.scenarios` table (after confirming Sprint 1–3 are stable in production for ~1 week).
- Run a final `npm run check:compliance` pass.
- Verify Netlify env vars are set: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BEEHIIV_API_KEY`, `BEEHIIV_PUB_ID`, `RESEND_API_KEY`, `FROM_EMAIL`, `FROM_NAME`, plus new: `SUPABASE_VAULT_KEY_ID` (or whatever the encryption key reference uses).
- Submit `/privacy` and `/terms` placeholder pages to legal review (see `copy.md` §5).

PR 8: `claude/methodology-final`
- Finalize the Methodology page with current rate sources, vintages, and formulas.

---

## Things to never do during this build

- **Never ship a stack migration and a redesign in the same release.** Vanilla HTML stays for v1. React/Next.js is a v2 conversation.
- **Never surface an Aspire Rate or Aspire Gap without "at these assumptions"** (or equivalent — *"based on your inputs,"* *"under these conditions"*).
- **Never recommend specific assets, funds, tickers, or allocations** in the Simulator's recommendation panel. See `page-spec-simulator.md` §8 for the Allowed/Forbidden table.
- **Never break the existing `score.js` function name or route.** It's a deploy contract.
- **Never push to `main` directly.** Branch protection is on. PRs only.
- **Never expose `SUPABASE_SERVICE_ROLE_KEY` or the encryption key in browser code.** Server-side only.
- **Never ship without `npm run check:compliance` passing.**
- **Never paywall the Methodology page, the Aspire Index card library, the Explainers, or the basic Calculator/Simulator.** These are non-negotiable per `content-architecture.md` §12.

---

## Open questions Codex should surface (not assume)

- **Supabase Vault API:** has evolved several times. Verify the current API at implementation time before committing to the pattern in `security-and-privacy.md` §4. If the recommended pattern is deprecated or has changed, flag it in the PR description and ask Scott.
- **Magic-link auth via Supabase Auth or via Resend?** Spec recommends Supabase Auth for sign-in, Resend for transactional. Confirm Supabase Auth's email sending uses the `send.aspirerate.com` domain (or wire it through Resend SMTP if not).
- **Geography autodetect API:** spec mentions "ip-api or similar." Pick one, document the choice, confirm Netlify-edge compatibility.
- **Charting:** spec recommends hand-rolled SVG. Existing `lib/chart-*.js` modules are JS-based. Confirm extension path before introducing any new charting helpers.

---

## How to know you're done

The build is done when:
1. A first-time visitor lands on `/` and within 90 seconds knows their Aspire Rate and Aspire Gap.
2. Submitting their email opens the Simulator with their Calculator state pre-loaded.
3. Moving any of the 6 levers updates the Aspire Gap in real time and shows recommendations within 100ms.
4. Saving a scenario persists encrypted in Supabase; sharing yields a public `/simulator/s/[id]` URL.
5. `/index`, `/explainers`, `/report`, `/methodology`, `/account` all load and render correctly.
6. `npm run check:compliance` passes.
7. RLS test suite passes.
8. Lighthouse score ≥ 90 on `/` (LCP under 2.0s).
9. The footer compliance line appears on every page; "AT THESE ASSUMPTIONS" appears under every surfaced rate.

---

## When in doubt

Defer to Scott. Surface the question with: (a) what the spec says, (b) what's actually possible/sensible, (c) your recommendation. Don't silently pick a side.
