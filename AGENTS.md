# AGENTS.md

This file defines how AI agents should work on Aspire Rate.

## Cross-Repo Authority Rule

In the unified workspace, `aspire/` is canonical for product language, user-facing terminology, formulas, compliance, technical architecture, monetization guardrails, roadmap, and live-site behavior.

`aspire-gtm/` is canonical for research, content strategy, newsletter, social, editorial planning, GTM experiments, and audience development.

When product, formula, compliance, monetization, roadmap, technical architecture, or live-site behavior decisions conflict across repos, `aspire/` wins.

`aspire-gtm/` may create GTM recommendations, content ideas, campaign strategy, newsletter strategy, and audience-development plans, but it may not redefine canonical product terminology, formulas, compliance posture, roadmap, monetization guardrails, technical architecture, or live-site behavior.

Any GTM document that touches recommendations, financial products, affiliates, sponsorships, advertisers, aggregate gap data, referrals, or data licensing must defer to `aspire/COMPLIANCE.md`.

## Agent Roster (updated 2026-05-11)

Aspire runs as a multi-agent product. The current roster:

| Agent | Primary responsibility | Default file scope |
|---|---|---|
| Codex | Backend, Netlify Functions, Supabase schema/migrations, build tooling, deploy infra, live-site HTML refactors | `netlify/functions/`, `lib/`, `rates.json`, schema, `*.html` |
| Claude | Strategy, spec authoring, copy, content (MDX), cross-repo synthesis, drift detection, decision documents | `specs/`, `*.md` (strategy/spec), `content/` (when added) |
| Hermes | Research, market intel, trend monitoring, competitor analysis, source validation, and Agent Lab collaboration candidates | `aspire-gtm/40_MARKET_INTELLIGENCE/`, `aspire-gtm/00_RAW/Research/`, `aspire-gtm/70_AGENT_LAB/` |

_Sauna was discontinued as of 2026-05-11. Sauna's prior content/copy/UX-writing responsibilities moved to Claude; Sauna's prior live-site HTML editing role moved to Codex._

Operational rules in `AGENT_WORKFLOW.md` apply to all three agents equally:
- Branch protection on `main` is enforced. PRs only.
- Add a `STATUS.md` entry under "Currently in flight" *before* opening the PR.
- Branch name format: `<agent>/<short-slug>` (e.g., `claude/spec-pass`, `codex/score-refactor`).
- Wait for Scott's merge.
- No deploy previews; only merges to `main` deploy.

## Canonical Specs (added 2026-05-11)

Seven specs in `specs/` are the canonical product and design source of truth as of 2026-05-11:

- `specs/brief-v2.md` — master design + product brief
- `specs/creative-direction.md` — type, color, motion, two-register system
- `specs/page-spec-calculator.md` — Calculator page spec
- `specs/page-spec-simulator.md` — Simulator page spec
- `specs/security-and-privacy.md` — security model, RLS, encryption, deletion flow
- `specs/content-architecture.md` — content layer + monetization tier shape
- `specs/copy.md` — every word on every page

These supersede the design-direction sections of `POSITIONING.md`, `PRODUCT_DNA.md`, `CONTENT_STRATEGY.md`, `BUSINESS_MODEL.md`, and `ROADMAP.md` where they conflict. The reconciliation log between the prior canon and these specs is `_DRIFT_REPORT_2026-05-11.md` (this repo, root). `COMPLIANCE.md`, `ICP.md`, `TECHNICAL_CONTEXT.md`, `AGENT_WORKFLOW.md`, and `10_CANONICAL/Vocabulary.md` retain authority for their specific domains (with `Vocabulary.md` updated to match the new terminology in a separate cleanup PR).

### Pre-canonical thinking lives in `../aspire-gtm/70_AGENT_LAB/`

Strategy debates, hypotheses, research handoffs, and ideas in progress between agents (Claude, Hermes, Codex, Grok, ChatGPT) live in the sibling GTM repo at `../aspire-gtm/70_AGENT_LAB/`. **Nothing there is canonical** — it's the *thinking* surface. Decisions made in the lab become canon only when an agent opens a PR against the relevant canonical doc (`aspire/specs/`, `10_PROJECT_BRAIN/Decisions.md`, etc.) and links the originating thread.

If you're an agent and you have a position on something that another agent might disagree with — or you need to hand off research — start there before touching canon. Format spec, rules of engagement, and seed examples are in `../aspire-gtm/70_AGENT_LAB/README.md`.

Hermes should treat research dumps as an idea feeder for the Agent Lab, not only as archival raw research. Each weekly Hermes research/content intelligence run should scan the week's `aspire-gtm/00_RAW/Research/` outputs and durable evidence-bank additions, extract 2–5 research-backed product or content questions that are too strategic or cross-functional to draft directly, and convert them into either:

- a new `../aspire-gtm/70_AGENT_LAB/threads/YYYY-MM-DD-short-slug.md`, when debate is needed; or
- a `../aspire-gtm/70_AGENT_LAB/handoffs/YYYY-MM-DD-hermes-to-[agent]-short-slug.md`, when a specific agent should act.

Hermes must update `../aspire-gtm/70_AGENT_LAB/INDEX.md` in the same change. Lab output remains non-canonical: do not promote any Hermes lab candidate, thread, handoff, source validation, or research recommendation to canon without Scott approval and a PR against the relevant canonical surface.

## Internal vs User-Facing Terminology

Aspire uses descriptive internal terms for product logic and documentation:

- Cost growth rate = modeled growth rate of the priced future
- Money growth rate = modeled growth rate of the user's listed resources
- Required money-growth rate = solved money-growth rate needed to cover the priced future at the current assumptions
- Gap = difference between money growth and cost growth, plus the dollar gap implied by the model

Canonical user-facing vocabulary:

- Cost growth = how fast the priced future is becoming more expensive
- Money growth = how fast the listed resources are modeled to grow
- Your gap = the difference between cost growth and money growth, plus the dollar gap implied by the model
- Your Aspire Rate = the required money-growth rate the model estimates would be needed to cover the priced future at the current assumptions

Formula:

```text
Your gap = Money growth - Cost growth
```

Avoid using "Aspire Rate" internally to mean cost growth. "Your Aspire Rate" is now reserved for the branded user-facing required money-growth rate.

Your Aspire Rate is a modeled requirement, not a recommendation. It does not tell the user what to buy, sell, hold, or allocate toward. Always frame it with "at these assumptions" or equivalent language.

`Future Buying Power` is a supporting result/explanation layer, not the primary metric.

## Mission

Help Aspire Rate become the clearest way for people to understand whether their money is keeping up with the life they actually want.

Every agent should preserve the core insight:

> CPI does not describe your life. Your future has its own inflation rate.

## Required Reading Order

Before making product, content, design, or strategy decisions, read:

1. `README.md`
2. `SOUL.md`
3. `specs/brief-v2.md` (canonical product/design brief — supersedes design-direction sections of older docs where they conflict)
4. `PRODUCT_DNA.md`
5. `COMPLIANCE.md`
6. `specs/creative-direction.md` (visual identity supersedes `design.md` where they conflict)
7. `10_CANONICAL/Vocabulary.md` (terminology — being updated to match `specs/brief-v2.md` §1)
8. `STATUS.md` (current work in flight)
9. `AGENT_WORKFLOW.md` (per-change checklist)
10. `_DRIFT_REPORT_2026-05-11.md` (reconciliation log between prior canon and the new specs — useful context, not required for every task)

For specific work:

- Messaging and marketing: read `POSITIONING.md`, `CONTENT_STRATEGY.md`, and `specs/content-architecture.md`
- User research and onboarding: read `ICP.md`
- Feature planning: read `ROADMAP.md` and `specs/brief-v2.md` (Phase 4–5 of the existing roadmap is now elaborated by the v1/v1.5/v2 sequencing in the new specs)
- Pricing and packaging: read `BUSINESS_MODEL.md` and `specs/content-architecture.md` §12 (locked tier shape)
- Prompt or agent design: read `PROMPTS.md`
- Research planning: read `RESEARCH_TASKS.md`
- Technical implementation: read `TECHNICAL_CONTEXT.md` and the Tech notes sections of `specs/page-spec-calculator.md` §11 and `specs/page-spec-simulator.md` §13
- Security, encryption, deletion flow, schema: read `specs/security-and-privacy.md`
- Copy work: read `specs/copy.md` (source of truth for every word on every page)

## Product Principles

- Make personal inflation feel measurable.
- Respect the user's intelligence.
- Prefer clarity over cleverness.
- Show assumptions clearly.
- Distinguish measurement from advice.
- Treat uncertainty as part of the product, not a footnote.
- Do not imply that Aspire Rate or Your Aspire Rate can predict the future.
- Do not recommend specific securities, asset allocations, or financial products unless the business has approved the relevant compliance path.

## Agent Decision Rules

When making a product decision, ask:

1. Does this make the user's desired future more concrete?
2. Does this help compare the cost growth of that future against the growth of their resources?
3. Are assumptions visible and editable?
4. Is the output educational, not advisory?
5. Would a careful user understand what the number means and what it does not mean?

## Voice Rules

Comps: **Morgan Housel × Matt Levine × Nassim Taleb.**

Use the Aspire voice:

- Sharp, not sales-y
- Contrarian but provable
- Economically literate without being academic
- Calm about risk
- Honest about uncertainty
- Free of financial-services cosplay
- Contractions always
- Italics earn their keep on key thesis words: *vector*, *yours*, *your* basket

Avoid (union of prior canon and the May 2026 specs):

- "Beat inflation"
- "Guaranteed"
- "Personalized investment advice"
- "Optimize your portfolio"
- "The best asset"
- "Risk-free"
- "Achieve your dreams"
- "Supercharge"
- "Unlock"
- "In today's economy"
- "Delve"
- "Unpack"
- "Leverage"
- Doom-driven fear copy
- Alpha promises
- Crypto maximalism
- Advisor cosplay
- Generic personal finance copy

Banned pattern: *"This isn't X. It's Y."* — except the protected secondary punchline *"Inflation isn't a number. It's a vector."* (used sparingly in Calculator H1, occasional editorial accent, social posts — see `specs/copy.md` §4.0 for tagline placement).

Preferred phrases:

- "the inflation rate of the life you want"
- "your future has its own inflation rate"
- "measure the gap"
- "close the gap"
- "make the assumptions visible"
- "at these assumptions" (compliance pairing — required when surfacing a rate or gap)
- "the cost of optionality"
- "a planning lens"

Tagline:
- **Primary tagline** (durable, footer mast, OG card, social profile): *"How much of tomorrow can you afford?"*
- **Secondary punchline** (Calculator H1, occasional accent): *"Inflation isn't a number. It's a vector."*

## Compliance Guardrails

Agents must not:

- Recommend buying, selling, or holding a specific security.
- Present projected returns as guaranteed.
- Create individualized financial advice without an approved compliance framework.
- Use testimonials or case studies without substantiation and disclosure review.
- Hide assumptions behind a single confident number.
- Use outdated market, CPI, rate, tuition, housing, or healthcare data without timestamping the source.
- Surface Aspire Rate, Target Aspire Rate, money growth, or any rate-comparison number in user-facing copy without pairing it with *"at these assumptions"* or equivalent contextualizing language.
- Apply gain/loss color treatment to Aspire Gap without showing the underlying assumptions in the same view.

Agents may:

- Explain concepts.
- Compare scenarios.
- Help users understand assumptions.
- Cite sources and timestamp data.
- Generate educational examples.
- Produce content that encourages users to consult qualified professionals for decisions requiring advice.

## Data Rules

All external data used in product or content should include:

- Source
- Retrieval date
- Geographic scope
- Time period
- Methodology notes when available
- Known limitations

Never mix national averages, regional prices, and user-specific goals without labeling the difference.

## Engineering Rules

No application stack has been selected yet. Read `TECHNICAL_CONTEXT.md` before proposing implementation details. Until the stack is selected, agents should:

- Keep docs and architecture decisions explicit.
- Prefer simple, inspectable implementations.
- Avoid premature backend complexity.
- Separate calculation logic from UI.
- Store assumptions as structured data.
- Preserve an audit trail for formulas and data sources.

## Design Rules

Follow `design.md`.

Core constraints:

- Product name: Aspire Rate
- Brand: Aspire
- Domain: `aspirerate.com`
- Wordmark: italic "Aspire" in Fraunces with terracotta delta
- Visual tone: sparse, high contrast, stat-forward
- Avoid generic fintech gradients and stock-market visual cliches

## Output Standard

When agents create or edit work, they should state:

- What changed
- Why it changed
- Which source files informed the change
- Any assumptions
- Any compliance or data risks that remain
- Any conflict surfaced between the existing canon and the May 2026 specs in `specs/` — link the relevant drift-report conflict (`_DRIFT_REPORT_2026-05-11.md` §3 or §4) and recommend a resolution rather than silently picking a side
