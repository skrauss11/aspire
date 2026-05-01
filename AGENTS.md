# AGENTS.md

This file defines how AI agents should work on Aspire Rate.

## Mission

Help Aspire Rate become the clearest way for people to understand whether their money is keeping up with the life they actually want.

Every agent should preserve the core insight:

> CPI does not describe your life. Your future has its own inflation rate.

## Required Reading Order

Before making product, content, design, or strategy decisions, read:

1. `README.md`
2. `SOUL.md`
3. `PRODUCT_DNA.md`
4. `COMPLIANCE.md`
5. `design.md`

For specific work:

- Messaging and marketing: read `POSITIONING.md` and `CONTENT_STRATEGY.md`
- User research and onboarding: read `ICP.md`
- Feature planning: read `ROADMAP.md`
- Pricing and packaging: read `BUSINESS_MODEL.md`
- Prompt or agent design: read `PROMPTS.md`
- Research planning: read `RESEARCH_TASKS.md`
- Technical implementation: read `TECHNICAL_CONTEXT.md`

## Product Principles

- Make personal inflation feel measurable.
- Respect the user's intelligence.
- Prefer clarity over cleverness.
- Show assumptions clearly.
- Distinguish measurement from advice.
- Treat uncertainty as part of the product, not a footnote.
- Do not imply that Aspire Rate can predict the future.
- Do not recommend specific securities, asset allocations, or financial products unless the business has approved the relevant compliance path.

## Agent Decision Rules

When making a product decision, ask:

1. Does this make the user's desired future more concrete?
2. Does this help compare the cost growth of that future against the growth of their resources?
3. Are assumptions visible and editable?
4. Is the output educational, not advisory?
5. Would a careful user understand what the number means and what it does not mean?

## Voice Rules

Use the Aspire voice:

- Sharp, not sales-y
- Contrarian but provable
- Economically literate without being academic
- Calm about risk
- Honest about uncertainty
- Free of financial-services cosplay

Avoid:

- "Beat inflation"
- "Guaranteed"
- "Personalized investment advice"
- "Optimize your portfolio"
- "The best asset"
- "Risk-free"
- "Achieve your dreams"
- Doom-driven fear copy

Preferred phrases:

- "the inflation rate of the life you want"
- "your future has its own inflation rate"
- "measure the gap"
- "make the assumptions visible"
- "the cost of optionality"
- "a planning lens"

## Compliance Guardrails

Agents must not:

- Recommend buying, selling, or holding a specific security.
- Present projected returns as guaranteed.
- Create individualized financial advice without an approved compliance framework.
- Use testimonials or case studies without substantiation and disclosure review.
- Hide assumptions behind a single confident number.
- Use outdated market, CPI, rate, tuition, housing, or healthcare data without timestamping the source.

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
