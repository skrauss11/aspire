# Aspire Rate

Aspire Rate helps people calculate the inflation rate of the life they are working toward and determine whether their money is keeping up.

Core belief:

> CPI does not describe your life. Your future has its own inflation rate.

Aspire Rate translates financial goals into a personal inflation framework. Instead of asking "What is inflation?", it asks:

> What is the inflation rate of the life you actually want?

## Knowledge System

This repository is the source of truth for product, positioning, strategy, compliance posture, content, and agent behavior for Aspire Rate.

Start here:

| File | Purpose |
|---|---|
| `AGENTS.md` | Operating instructions for AI agents working on Aspire Rate |
| `SOUL.md` | The philosophical center of the product |
| `PRODUCT_DNA.md` | Product concepts, mechanics, language, and decision principles |
| `POSITIONING.md` | Market category, narrative, messaging, and differentiation |
| `ICP.md` | Ideal customers, user psychology, anxieties, and adoption triggers |
| `ROADMAP.md` | Product phases, feature priorities, and sequencing |
| `BUSINESS_MODEL.md` | Monetization, packaging, pricing hypotheses, and growth loops |
| `COMPLIANCE.md` | Legal and compliance boundaries for product, content, and AI output |
| `CONTENT_STRATEGY.md` | Editorial strategy, channels, formats, and voice |
| `PROMPTS.md` | Reusable prompts for agents, research, writing, and product work |
| `RESEARCH_TASKS.md` | Open research backlog for market, data, compliance, and product validation |
| `TECHNICAL_CONTEXT.md` | Technical architecture assumptions, calculation design, and open implementation decisions |
| `design.md` | Locked visual identity and brand design standards |

## Core Metrics

### Aspire Rate

The inflation rate of the life the user is working toward. It is personal, goal-based, and future-oriented.

Examples of goals:

- Buying a home
- Paying for college
- Building a family future
- Preserving lifestyle
- Reaching financial independence
- Affording healthcare
- Maintaining optionality

### Portfolio Rate

The projected growth rate of the user's money, based on savings, investments, cash, and return assumptions.

### Aspire Gap

The difference between the Portfolio Rate and the Aspire Rate.

```text
Aspire Gap = Portfolio Rate - Aspire Rate
```

If the Aspire Gap is positive, the user's money may be gaining ground against the life they want. If negative, the future they want is getting more expensive faster than their resources are growing.

## Product Posture

Aspire Rate is a measurement and planning lens.

It is not:

- A robo-advisor
- An investment manager
- A promise of returns
- A replacement for qualified financial, tax, or legal advice
- A generic inflation calculator

## Current Repository State

The current repo contains an early web experience and brand assets:

- `index.html`
- `join.html`
- `manifesto.html`
- `og-card.html`
- `rates.json`
- `netlify/functions/score.js`
- `netlify.toml`
- `favicon-512.png`
- `favicon-32.png`
- `design.md`
- `x-profile.png`
- `x-banner.png`

The knowledge files in this root directory are intended to guide future product, engineering, content, and agent work across the calculator, website, and The Aspire Report newsletter.
