# Aspire — Drift Report: New Specs vs. Existing Canon

_Compiled 2026-05-11 by Claude. Companion to the seven canonical specs in `specs/` and to the existing canon in this repo (`aspire/`) and the GTM sibling (`../aspire-gtm/`). The specs were originally drafted at the root of `Aspire-Unified/` and were promoted into `aspire/specs/` after Scott resolved the conflicts below on 2026-05-11._

---

## Executive summary

The seven new specs I wrote (`brief-v2.md`, `creative-direction.md`, `page-spec-calculator.md`, `page-spec-simulator.md`, `security-and-privacy.md`, `content-architecture.md`, `copy.md`) were authored without reading the existing canon in `aspire/`. As a result they conflict with established product terminology, formula sign conventions, the existing live-site stack and data model, the current tagline, the Aspire Score concept, the cross-repo authority rule, and the Sauna/Codex agent workflow.

Some of the conflicts are **intentional** — they reflect strategic decisions Scott made in our recent conversation (calculator-as-hero, two-page architecture, locked monetization tier shape, opinionated Simulator). Those conflicts are the existing docs needing to catch up to the new direction.

Other conflicts are **inadvertent** — I changed things I had no business changing because I didn't read what was there (terminology, gap sign, tagline, stack). Those need to either revert to canon or be promoted to canon with explicit decisions.

**Until the conflicts in §3 ("Critical conflicts") are resolved, the new specs cannot be safely handed to Codex without producing a fork of the live product.** This is the urgent deliverable.

---

## 1. The two foundations

### Foundation A — the existing canon (`aspire/` + `aspire-gtm/` + `_CONTROL/`)

- **Live product** at `aspirerate.com` — vanilla HTML/CSS/JS, Netlify Functions v1 (CommonJS), Supabase persistence, Beehiiv newsletter, Resend email, real `rates.json` updated 2026-05-04
- **Real code:** `index.html` (calculator), `simulator/index.html`, `manifesto.html`, `join.html`, `lib/` (10 files), `netlify/functions/` (3 functions: `score.js`, `scenario.js`, `tracker.js`)
- **Established terminology** documented in `aspire/10_CANONICAL/Vocabulary.md`, propagated through every product doc
- **Gap sign convention:** `Your gap = Money growth − Cost growth` (positive means user is ahead)
- **Aspire Score:** a 0–100 number that's a primary surfaced metric in the live product
- **Operational agents:** Sauna (content/UX/copy) and Codex (backend/functions) with file-ownership map and PR workflow per `aspire/AGENT_WORKFLOW.md`
- **Branch protection:** main is protected, no direct pushes, all changes via PR
- **Cross-repo authority:** `aspire/` wins for product/formula/compliance/architecture/roadmap; `aspire-gtm/` wins for content/research/GTM execution
- **Tagline:** *"How much of tomorrow can you afford?"*
- **Compliance posture:** every Aspire Rate output paired with *"at these assumptions"*; existing `npm run check:compliance` script blocks shipping certain phrases
- **5-phase roadmap:** Knowledge Foundation → Concept Prototype → Data-Backed Calculator → Scenario Engine → Content & Growth Loops → Monetization
- **5 candidate revenue lines:** Consumer Freemium, Advisor Tools, Content/Newsletter, Data/Reports, API/Embeds
- **Existing alignment work:** `_CONTROL/ALIGNMENT_REPORT.md` from 2026-05-04 already identified 10 internal drift issues; some recommendations have been actioned, some haven't
- **Asset catalog:** Δ glyph (favicons), Fraunces wordmark, terracotta `#C8451F` accent, near-black `#0F0E0C` background, cream `#F5F1EA`, warm gray `#8A8074`

### Foundation B — the new specs (root of `Aspire-Unified/`)

- Seven new docs written in this session
- Single-author voice, internally consistent, but written without reading Foundation A
- Strategic decisions you affirmed: calculator-as-hero, two-page architecture, Calculator + Simulator separation, monetization tier sequencing, opinionated Simulator recommendations, encryption + RLS + magic-link, MDX content layer, two-register design system (editorial + financial-instrument)
- Some specifics I picked unilaterally that conflict with Foundation A (see §3)

**Both foundations are valuable.** Foundation A is the live product and the operational system; Foundation B is the strategic redirection you're committing to. The drift below is the bridge between them that nobody has built yet.

---

## 2. Drift map at a glance

| # | Drift area | Severity | Type | Need Scott's call? |
|---|---|---|---|---|
| 1 | Terminology (Aspire Rate / Aspire Gap vs. Cost growth / Money growth / Your gap / Your Aspire Rate) | **CRITICAL** | Inadvertent | Yes |
| 2 | Gap sign convention (Money−Cost positive=ahead vs. Rate−Portfolio positive=behind) | **CRITICAL** | Inadvertent | Yes |
| 3 | Aspire Rate definition (existing: required money-growth rate; new: Goals CAGR + 1% margin) | **CRITICAL** | Mixed | Yes |
| 4 | Stack (existing: vanilla HTML+JS, no build; new: React + Next.js App Router) | **CRITICAL** | Inadvertent | Yes |
| 5 | Data schema (existing: single `scenarios` table with `basket` JSONB; new: 4 tables with encrypted bytea) | **CRITICAL** | Mixed | Yes |
| 6 | Aspire Score concept (existing: 0–100 score is a primary metric; new: not mentioned) | **MAJOR** | Inadvertent | Yes |
| 7 | Tagline ("How much of tomorrow can you afford?" vs. "Inflation isn't a number. It's a vector.") | **MAJOR** | Inadvertent | Yes |
| 8 | Compliance framing ("at these assumptions" required pairing vs. simpler footer line) | **MAJOR** | Inadvertent | Recommend yes |
| 9 | Calculator input model (existing: goals + holdings arrays; new: 7 inputs in 2 blocks) | **MAJOR** | Intentional | Confirm |
| 10 | Simulator levers (existing: 4 levers; new: 6 levers) | **MAJOR** | Intentional | Confirm |
| 11 | Authority structure (existing: aspire/ canonical; new: 7 root specs without authority statement) | **MAJOR** | Inadvertent | Yes |
| 12 | Agent workflow (existing: Sauna + Codex with PR rules; new: doesn't address) | **MAJOR** | Inadvertent | Recommend keep existing |
| 13 | Content repo structure (existing: aspire-gtm/ for content; new: MDX in main repo) | **MAJOR** | Mixed | Yes |
| 14 | Roadmap framing (existing: 5 phases; new: v1/v1.5/v2 with locked tier shape) | **MEDIUM** | Mixed | Recommend integrate |
| 15 | Business model breadth (existing: 5 candidate revenue lines; new: 2 locked tiers) | **MEDIUM** | Intentional | Confirm |
| 16 | Tagline-secondary phrases ("the inflation rate of the life you want" — both have it) | **LOW** | Aligned | None |
| 17 | Brand assets (terracotta, Fraunces, Δ — both have them) | **LOW** | Aligned | None |
| 18 | Voice rules (banned phrases, contractions, sharpness — both have similar rules) | **LOW** | Mostly aligned | Reconcile minor differences |
| 19 | ICP (upwardly mobile planner, 28–50 — existing only) | **LOW** | New specs silent | Inherit from existing |
| 20 | Authentication path (existing: bearer-token URL, magic-link planned; new: magic-link via Supabase Auth) | **LOW** | Compatible | Confirm timing |

---

## 3. Critical conflicts — these need a decision before any build

### Conflict 1 — Terminology

**Existing canon** (`aspire/10_CANONICAL/Vocabulary.md`, propagated through every product doc):
- **Internal:** Aspire Rate (= required money-growth rate), Cost growth rate, Money growth rate, Gap
- **User-facing in UI/copy/newsletter/landing:** Cost growth, Money growth, Your gap, Your Aspire Rate
- The user-facing language uses descriptive plain-English terms; "Your Aspire Rate" is reserved for the *required rate to hit*, not the *cost growth*
- Reason: avoids user confusion between cost inflation and the targeted return rate

**New specs:**
- Use "Aspire Rate" and "Aspire Gap" everywhere user-facing
- Treat "Aspire Rate" as the user-facing identity number
- Don't use "Cost growth" / "Money growth" / "Your gap" at all

**Honest tradeoff:**
- The existing canon is more linguistically careful. "Cost growth" is unambiguous in a way "Aspire Rate" isn't. The compliance team will love it.
- The new specs are more brandable. "My Aspire Rate is 11%" is more memorable than "my Cost growth is 10% and my Money growth is 5%."
- Both have legitimate logic. Picking one is a brand decision, not a technical decision.

**My recommendation:** **adopt the existing canon's user-facing terminology.** It's already in the live product, in the email templates, in the score function, in the Methodology page draft, and in the GTM content strategy. Reverting to it costs nothing. Pushing forward with the new terminology requires updating 14+ places I've already drafted plus the entire live product. Worse, the existing terminology is the more rigorous choice — Sauna and the GTM team chose it for a reason.

If you adopt this: I'll do a terminology pass on all 7 new specs in a single batch.

### Conflict 2 — Gap sign convention

**Existing canon:**
```
Your gap = Money growth − Cost growth
```
Positive gap = user's resources are outpacing the cost of the life they want. **Good.**
Negative gap = user is falling behind. **Bad.**

**New specs:**
```
Aspire Gap = Aspire Rate − (portfolio expected return)
```
Positive gap = the rate the user needs is higher than what their portfolio earns. **Bad.**
Negative gap = the user is ahead. **Good.**

**These are sign-opposite.** The same scenario produces a `+6.0 pts` in one system and `−6.0 pts` in the other.

**Honest tradeoff:**
- The existing convention reads more naturally ("my gap is +2 — I'm ahead by 2"). But it puts the bad case in negative territory, which is conceptually fine but visually looks like a problem in a chart.
- The new convention puts the typical case (gap > 0) in positive numbers and uses red color to convey the problem. Easier to render in the UI ("you're 6 points behind") but conceptually it inverts what "gap" usually means.

**My recommendation:** **adopt the existing convention.** Same reasoning as Conflict 1 — already in the code, the email templates, and the docs. It's also the convention that makes user-facing copy easier — *"close your gap"* makes more sense when "gap" is a thing you want to be positive. The new specs' framing ("losing 6 points a year") still works under the existing convention by inverting the sign in the display layer: the gap is `−6.0`, the interpretation copy says *"You're losing 6 points a year."*

If you adopt this: minor copy patches across `page-spec-calculator.md`, `page-spec-simulator.md`, and `copy.md`.

### Conflict 3 — What is the Aspire Rate, exactly?

**Existing canon:**
> Your Aspire Rate is the required money-growth rate the model estimates would be needed to cover the priced future at the user's current assumptions.

No margin. The Aspire Rate is exactly the rate that, at break-even, covers the cost growth.

**New specs:**
> Aspire Rate = (Goals CAGR) + 1% margin of safety

The Aspire Rate is the *target you should aim for* — slightly above the cost growth, so hitting it means you're ahead.

**Honest tradeoff:**
- The existing definition is mathematically pure. Easy to defend in Methodology. Easy for compliance.
- The new definition is more aspirational and more user-friendly — *"your Aspire Rate"* feels like a goal worth hitting, not a floor. The +1% margin is the difference between "barely making it" and "actually making it."
- The two are reconcilable: the new "+1%" can be a tunable margin of safety on top of the existing "required money-growth rate." Existing definition is the floor, new definition adds the margin as a separate tunable.

**My recommendation:** **integrate.** Update the canon to define:
- **Aspire Rate (required):** the money-growth rate needed to cover the priced future at break-even (existing definition).
- **Aspire Rate (target):** Aspire Rate (required) + margin of safety, defaulted to +1%, tunable in the Simulator.

Surface the *target* version by default in user-facing UI; surface the *required* version in Methodology and as a tooltip. This preserves the existing math, adds the new aspirational framing, and gives the Simulator a tunable that earns its place.

### Conflict 4 — Stack

**Existing:**
- Vanilla HTML, CSS, JS. No framework. No build step. 10 files in `lib/`. CommonJS Netlify Functions v1.
- Real working code today. Charts in custom JS (`lib/chart-*.js`), formula in `lib/aspire.js`, schema in `lib/schema.js`.

**New specs:**
- React + Next.js (App Router) on Netlify, Tailwind, Framer Motion, server actions for encrypted writes.
- Implies a complete rewrite.

**Honest tradeoff:**
- Vanilla HTML is simpler, has less attack surface, ships faster. The current code works.
- React/Next.js gives you better state management for the Simulator's complex lever interactions, easier MDX content integration, server components for encryption, and more standard patterns for Codex/AI-assisted work.
- Migrating a working product is the riskiest single thing in this whole project.

**My recommendation:** **stage the migration, don't do it in one shot.**
- **Phase A** (May): keep vanilla stack. Implement the new spec on top of it — refactor the existing `index.html` into the new Calculator design, refactor `simulator/index.html` into the new Simulator design. Same lib/. Same Netlify Functions. Same Supabase schema (extended, not replaced).
- **Phase B** (post-launch, when Aspire Pro is being scoped): if multi-goal modeling, scenario versioning, and Pro-tier features genuinely benefit from a framework, migrate then.
- **Hard stop:** never migrate the stack and ship a redesign at the same time. Pick one risk to take per release.

If you adopt this: I'll patch the new spec's "Tech notes" sections to assume the vanilla stack as v1, with framework migration flagged as a v2 option.

### Conflict 5 — Data schema

**Existing schema** (`public.scenarios`):
- One table — combines user, calculator state, and saved scenario in a single row
- `basket` JSONB holds goals + holdings + computed values
- `access_token` is a bearer URL slug (no Supabase Auth)
- No column encryption
- Magic-link auth is *planned* (per STATUS.md) but not built

**New specs schema:**
- Four tables: `users`, `calculator_states`, `scenarios`, `baseline_overrides`
- Encrypted bytea columns for money fields via Supabase Vault
- RLS policies per table
- Magic-link auth via Supabase Auth

**Honest tradeoff:**
- Existing schema works today. Migrating live data is risky.
- New schema is more secure, more normalized, and supports the Simulator's "implicit compare-to-current" model and saved-scenario cap that the existing schema doesn't.
- The encryption layer is a real upgrade in security posture — and you affirmed wanting it.

**My recommendation:** **migrate the schema, but keep the migration surgical and reversible.**
- Add the new tables alongside the existing `public.scenarios` (don't drop it).
- Build new flows against new tables.
- Backfill from `public.scenarios` to new tables for existing users.
- Once new tables are confirmed working in production for ~30 days, mark `public.scenarios` as deprecated; remove later.
- Encryption rollout: add `bytea` columns for the money fields; backfill encrypted values from existing plaintext; switch reads to decrypt server-side; remove old plaintext columns last.

The full migration plan needs its own doc once you commit to it.

---

## 4. Major conflicts — Scott should be aware of, may need a call

### Conflict 6 — The Aspire Score

The existing product surfaces a **0–100 score** as a primary metric:
- `score.js` computes it from `basket.computed.fraction`
- It's in the email Resend sends after submission
- It's in the calculator UI ("your score: 42")
- The existing `score.js` returns `{ score, scenarioId, simulatorUrl, emailSent }`

The new specs don't mention this concept. They surface Aspire Rate and Aspire Gap as the primary numbers.

**My honest read:** the score has problems. It compresses the gap (a continuous, defensible measurement) into a single 0–100 number whose midpoint isn't meaningful. "Your score is 42" doesn't tell anyone anything useful — 42 out of what? Compared to whom? Why 42 and not 41? It's also harder to defend in Methodology than the underlying CAGR comparison.

**My recommendation:** **deprecate the score in favor of Aspire Rate + Aspire Gap as the dual primary metrics.** But:
- Don't break the existing email template silently — write a copy patch that uses Rate + Gap instead.
- Update `score.js` to compute and return `aspireRate` and `gap` instead of `score`. Keep the function name for now to avoid breaking the deploy contract; rename in a separate cleanup PR.
- Remove the score from new UI surfaces.
- If you want to preserve the score for historical reasons (existing users have a number they remember), tuck it into a "your historical score" footnote on /account.

If you want to keep the score: that's a meaningful product decision and worth a separate conversation.

### Conflict 7 — Tagline

- **Existing:** *"How much of tomorrow can you afford?"* (in `design.md`, `aspire/index.html`, marketing assets)
- **New:** *"Inflation isn't a number. It's a vector."* (signature line in new specs, breaks your own "no negation pattern" rule as a protected exception)

**My recommendation:** **the existing tagline is better.** It's a question, which invites engagement. It's more memorable. It reads like a brand line, not a thesis statement. *"Inflation isn't a number. It's a vector."* is good as a hero-line on the homepage hero; it's less good as a permanent tagline. Use both — the question as the durable tagline, the vector line as the one-time hero punch on `/`.

If you adopt this: small copy patch in `brief-v2.md`, `creative-direction.md`, `copy.md`.

### Conflict 8 — Compliance framing

The existing canon requires every Aspire Rate display to be paired with *"at these assumptions"* or equivalent — explicitly to keep it from being read as a prediction or recommendation. The existing `npm run check:compliance` script enforces banned phrases.

The new specs have a footer line and a Methodology disclaimer but don't enforce the *"at these assumptions"* pairing in surfaced numbers.

**My recommendation:** **adopt the existing posture.** Add *"at these assumptions"* to:
- The Calculator reveal interpretation line
- The Simulator's sticky-header tooltip on the Aspire Rate
- The recommendations panel disclaimer
- Any email that surfaces the number

This isn't optional if you want to keep the current compliance posture intact.

### Conflict 11 — Authority structure

The existing canon has a clear cross-repo authority rule: `aspire/` is canonical for product/formulas/compliance/architecture, `aspire-gtm/` is canonical for content/research/GTM, both AGENTS.md files reference each other, and conflicts resolve in `aspire/`'s favor.

The seven new specs sit at the root of `Aspire-Unified/` with no authority statement. They could be read as: (a) a parallel set of recommendations, (b) the new canon that supersedes both `aspire/` and `aspire-gtm/`, or (c) an intermediate sketch.

**My recommendation:** **explicitly promote the new specs to canon, then update `aspire/`'s docs to inherit from them.** The flow:
1. Move the seven new specs into `aspire/` as their new canonical home.
2. Update the existing `aspire/AGENTS.md` to reference them in the Required Reading Order.
3. Mark the older docs that the new specs supersede (e.g., parts of `BUSINESS_MODEL.md`, parts of `ROADMAP.md`) as superseded with forward-references.
4. Update `aspire-gtm/AGENTS.md` to reflect the new canon's authority.

Without this, the next agent that reads the repo will hit conflicting instructions and either pick the wrong one or surface the conflict to you mid-task.

### Conflict 12 — Agent workflow

The existing canon has a real operational system:
- **Sauna** owns content, copy, UX, page structure
- **Codex** owns backend, Supabase, build tooling
- **STATUS.md** tracks current work
- **Branch protection** on `main`, all changes via PR
- **`AGENT_WORKFLOW.md`** documents the per-change checklist

The new specs don't address agents at all. If the new specs become canon without addressing this, Sauna and Codex will work from old instructions and miss the new direction; or you'll have to brief them manually each time.

**My recommendation:** **keep the existing agent workflow intact** (it works), update `aspire/AGENTS.md` to teach Sauna and Codex about the new specs, and add Claude as a third agent for spec/strategy work. (See proposed `aspire/AGENTS.md` updates in `aspire/AGENTS-PROPOSED.md` — drafted but not applied; you decide.)

### Conflict 13 — Content repo structure

The new specs say content lives as MDX in the main repo (`content/index/*.mdx`, `content/explainers/*.mdx`, `content/methodology/index.mdx`).

The existing canon has `aspire-gtm/30_CONTENT_ENGINE/` for content strategy and content drafts, with the cross-repo rule that `aspire-gtm/` is canonical for content/editorial.

**My recommendation:** **split the difference.**
- **Strategy and drafts** stay in `aspire-gtm/30_CONTENT_ENGINE/` (the GTM repo's job).
- **Published, ship-ready MDX** lives in `aspire/content/` so the live site can build it (the product repo's job).
- The flow: GTM repo produces a draft → Scott (or Sauna) reviews → published draft moves to `aspire/content/` as MDX → deploys with the next push.
- Update `aspire-gtm/AGENTS.md` to reflect this handoff.

---

## 5. Lower-priority drift

### Conflict 9 — Calculator input model
- Existing: goals array + holdings array, with rate selectors per row.
- New: 7 inputs in 2 blocks.
- **Status:** Intentional — your decision in our conversation. The new model is more constrained but less flexible. Confirm you want to lose the goals-and-holdings flexibility (and gain the simpler funnel).

### Conflict 10 — Simulator levers
- Existing: 4 levers (monthly contribution, time horizon, cost growth, money growth).
- New: 6 levers (savings, allocation mix, timeline, target basket, geography, configurable CAGR).
- **Status:** Intentional. Confirm.

### Conflict 14 — Roadmap framing
- Existing: 5-phase technical roadmap (Knowledge Foundation → Concept Prototype → Data-Backed Calculator → Scenario Engine → Content & Growth Loops → Monetization).
- New: v1 / v1.5 / v2 with locked tier shape.
- **Status:** Compatible. The new framing maps roughly to existing Phases 4–5. Recommend integrating: keep the 5-phase roadmap as the technical backbone, layer the v1/v1.5/v2 monetization sequencing on top of Phases 4–5.

### Conflict 15 — Business model breadth
- Existing: 5 candidate revenue lines.
- New: 2 locked tiers (Newsletter Premium, Aspire Pro).
- **Status:** Intentional consolidation. The new specs are more focused but lose the optionality (advisor tools, data products, API). Confirm you want to drop those, or flag them as "future surfaces, not v1/v2."

### Conflict 18 — Voice rules
Both have substantially similar voice rules (banned phrases, contractions, sharpness). Minor differences:
- Existing rules add: Morgan Housel × Matt Levine × Nassim Taleb as voice comps.
- New rules add: explicit "no negation pattern" with one protected exception, italics-only-on-thesis-words rule.
- Existing bans: "Risk-free," "Achieve your dreams," "Doom-driven fear copy."
- New bans: "Beat inflation," "Optimize your portfolio," "In today's economy," "Delve," "Unpack," "Leverage."
- **Recommendation:** merge into a single voice rules block in the canonical AGENTS.md. I can do this pass once you confirm.

### Conflict 19 — ICP
The new specs barely mention ICP. The existing `aspire/ICP.md` has the full ICP — upwardly mobile planner, 28–50, household formers/buyers, "I am doing the responsible things, but the future I want keeps moving away."
- **Recommendation:** the new specs inherit existing ICP. No action needed beyond a reference in `brief-v2.md`.

### Conflict 20 — Authentication path
- Existing: bearer-token URL (`?t=access_token`); magic-link via Resend planned per STATUS.md.
- New: magic-link via Supabase Auth.
- **Compatible** — both are magic-link approaches. The detail (Resend vs. Supabase Auth) is an implementation choice. Resend already has the sending domain set up; Supabase Auth is integrated with the database. Engineering choice, not a strategic one.

---

## 6. What's NOT drift — already aligned

These are areas where the new specs and existing canon agree, and no action is needed:
- **Brand color palette** (terracotta, ink, paper, paper2, muted, rule, accent — both have them, identical hex values)
- **Wordmark** (italic Fraunces with terracotta Δ)
- **Δ as recurring system element**
- **Editorial register** (sparse, high-contrast, Fraunces headlines, no fintech clichés)
- **No third typeface** (both keep two-face system)
- **Compliance fundamentals** (never recommend specific assets, never guarantee returns, never imply prediction)
- **Manifesto** (existing page, untouched in new specs)
- **The thesis** (CPI doesn't describe your life; your future has its own inflation rate)
- **Beehiiv as newsletter platform** (locked in both)
- **Supabase as system of record** (both)
- **Netlify as hosting** (both)
- **Resend for transactional email** (existing only; new specs are silent — recommend keep)

---

## 7. Recommended sequencing

To go from "drift report" to "ready to build," here's the order I'd run:

### This week — decisions only

1. Read this report. Make the calls on Conflicts 1–8 (the critical and major ones). Most are 30-second decisions if you're confident; some are worth 10 minutes of thinking.
2. Tell me your calls. I'll then:
   - Patch the seven new specs to the resolved positions.
   - Update `aspire/AGENTS.md` to point to the new canon + preserve the agent workflow.
   - Update `aspire-gtm/AGENTS.md` with the same updates.
   - Move the new specs into `aspire/` as their canonical home.
   - Mark superseded sections of older docs.

### Next 1–2 weeks — alignment

3. After spec patches, audit and patch the live site copy to match the (now-locked) terminology. This is mostly a Sauna job per existing file ownership.
4. Audit and patch the live `score.js` to return Aspire Rate + Gap (without breaking the deploy contract). This is a Codex job.
5. Land the new schema migration plan (separate doc once you decide on Conflict 5).

### Weeks 3–4 — build

6. Codex implements the new Calculator (refactoring `index.html`).
7. Codex implements the new Simulator (refactoring `simulator/index.html`).
8. Sauna writes the editorial pieces (10 Index cards, 8 Explainers, Methodology).
9. Privacy/Terms pages go to legal review.

### Post-launch

10. v1.5 — Aspire Report Premium via Beehiiv tiered subscriptions.
11. v2 — Aspire Pro features (multi-goal, tax-aware, spouse mode).
12. (Optional) framework migration to React/Next.js if Pro-tier complexity demands it.

---

## 8. What I deferred while writing this report

You asked for four optional follow-ups. I'm holding all four pending decisions on Conflicts 1–8:

| Deferred | Why |
|---|---|
| `README-HANDOFF.md` for Codex | Has to encode the resolved terminology + stack to be useful. Drafting it now would lock in choices you haven't made. |
| Pre-launch checklist | Same — depends on stack call (Conflict 4) and schema call (Conflict 5). |
| `methodology.md` draft (placeholder shell) | Has to use the resolved terminology and gap convention. Drafting now means rewriting later. |
| First two Explainer drafts as voice exemplars | Same. Voice is settled enough to draft, but terminology isn't. |

All four become quick to write once the critical conflicts resolve.

---

## 9. Executive summary of recommendations

If you want my best read in one pass, here it is:

| Conflict | My recommendation | Cost to adopt |
|---|---|---|
| 1. Terminology | **Adopt existing canon** (Cost growth / Money growth / Your gap / Your Aspire Rate) | One pass over 7 specs |
| 2. Gap sign | **Adopt existing convention** (Money − Cost, positive = ahead) | Minor copy patches |
| 3. Aspire Rate definition | **Integrate** — existing definition is the floor, +1% margin is a tunable target | Methodology section + Simulator lever |
| 4. Stack | **Keep vanilla HTML for v1**, defer framework migration to v2 if needed | Patch tech-notes sections |
| 5. Schema | **Migrate carefully** — new tables alongside old, backfill, deprecate later | Separate migration plan doc |
| 6. Aspire Score | **Deprecate from UI**, keep score.js function name to preserve deploy contract | One-PR copy update |
| 7. Tagline | **Keep existing** ("How much of tomorrow can you afford?"); use new line as one-time hero punch | Copy patches |
| 8. Compliance framing | **Adopt existing** ("at these assumptions" pairing) | Add to surfaced number lines |
| 9. Calculator inputs | **Confirm new model** is intentional | None if confirmed |
| 10. Simulator levers | **Confirm new model** is intentional | None if confirmed |
| 11. Authority structure | **Move new specs into `aspire/`, update AGENTS.md to reference them** | Move + edit |
| 12. Agent workflow | **Keep existing Sauna/Codex/PR workflow**, brief them on new specs | AGENTS.md update |
| 13. Content repo | **GTM produces drafts, `aspire/content/` holds published MDX** | Document the handoff |

If you tell me "yes to all my recommendations," I can patch the seven specs, update both AGENTS.md files, and move the canon into place in a single pass. If you want to discuss any of these instead, we discuss.

---

## 10. What I think the spirit of your direction is

For what it's worth: reading the existing canon, I think the new specs are 80% in the spirit of where you were already heading. The Methodology page concept, the Aspire Index pop-culture cards, the editorial publication framing, the Simulator-as-prescription-after-Calculator-diagnosis, the encryption + RLS posture, the locked monetization tier shape — all of this directionally fits the existing canon. The conflicts are mostly in the *details I picked unilaterally* (terminology, gap sign, tagline, stack), not in the *strategic direction* you actually committed to.

So this isn't a reset. It's a sharpening. The new specs articulate what the existing canon was implying, and the existing canon constrains the new specs in ways that make them better.
