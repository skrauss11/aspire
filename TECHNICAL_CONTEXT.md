# TECHNICAL_CONTEXT.md

_Last updated: 2026-05-02. This file is the authoritative reference for Codex and other AI agents working on Aspire Rate._

---

## Stack Overview

Aspire Rate is a **static site** hosted on Netlify with a single serverless function. There is no backend framework, no database, and no build step.

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript (single `index.html`) |
| Serverless | Netlify Functions v1 (CommonJS) |
| Hosting | Netlify (site ID: `7fc9e061-49d8-4af7-91d9-90c0d70681f9`) |
| Domain | `aspirerate.com` |
| Repo | `github.com/skrauss11/aspire` (branch: `main`) |
| Email delivery | Resend (from: `score@send.aspirerate.com`) |
| Newsletter / subscriber CRM | Beehiiv (pub ID: `pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601`) |
| Data layer | `rates.json` (static JSON, committed to repo) |
| Analytics | Google Analytics (G-0YTMP6NYVB) |

---

## File Map

```
skrauss11/aspire/
├── index.html                   # Full calculator + Close the Gap Simulator (all UI lives here)
├── join.html                    # Newsletter sign-up landing page
├── manifesto.html               # Brand manifesto page
├── og-card.html                 # Open Graph social preview card
├── rates.json                   # Asset + inflation rate data (10-yr CAGRs)
├── netlify.toml                 # Netlify build config
├── netlify/
│   └── functions/
│       └── score.js             # POST /api/score — computes score, upserts Beehiiv, sends Resend email
├── favicon-32.png
├── favicon-512.png
├── x-profile.png
├── x-banner.png
├── design.md                    # Brand + design standards (load before any UI work)
├── AGENTS.md                    # AI agent operating rules (always read first)
├── PRODUCT_DNA.md
├── SOUL.md
├── COMPLIANCE.md
├── POSITIONING.md
├── CONTENT_STRATEGY.md
├── ICP.md
├── ROADMAP.md
├── BUSINESS_MODEL.md
├── PROMPTS.md
└── RESEARCH_TASKS.md
```

---

## Core User Flow

1. User lands on **aspirerate.com** (`index.html`)
2. Fills out the calculator (goals + holdings)
3. Submits their email → **POST /api/score** fires
4. `score.js` runs:
   - Computes Aspire Score (0–100), Aspire Rate, Portfolio Rate, and Gap
   - Upserts subscriber to **Beehiiv** with score + basket stored as custom fields
   - Sends transactional score email via **Resend** with a deep-link into the **Close the Gap Simulator**
5. User clicks the simulator link → `index.html#simulator` opens with their basket pre-loaded via base64url query param (`?b=...`)

---

## score.js — Netlify Function

**Endpoint:** `POST /api/score`  
**Runtime:** Node.js (CommonJS — `exports.handler`)

**Request body:**
```json
{
  "email": "user@example.com",
  "basket": {
    "goals": [{ "label": "Home", "amount": 500000, "horizon": 10, "asset": "home" }],
    "holdings": [{ "label": "S&P 500", "amount": 100000, "asset": "sp500" }],
    "computed": {
      "fraction": 42,
      "aspirationRate": 6.45,
      "portfolioRate": 14.85,
      "gap": 8.4
    },
    "source": "calculator"
  }
}
```

**Response:**
```json
{ "score": 42 }
```

**Side effects (run in parallel):**
- Upsert Beehiiv subscriber with custom fields: `basket_json`, `last_score`, `signup_source`, `last_recalc`
- Send Resend email (HTML, styled) with score breakdown + simulator deep-link

**Environment variables (set in Netlify UI):**
| Variable | Description |
|---|---|
| `BEEHIIV_API_KEY` | Beehiiv API key |
| `BEEHIIV_PUB_ID` | Publication ID (hardcoded fallback in code) |
| `RESEND_API_KEY` | Resend API key |
| `FROM_EMAIL` | Sending address (default: `score@send.aspirerate.com`) |
| `FROM_NAME` | Sender name (default: `Aspire Score`) |

---

## Beehiiv Integration

**API version:** v2  
**Endpoint used:** `POST /v2/publications/{pub_id}/subscriptions`

Every calculator submission upserts a subscriber. Custom fields stored per subscriber:

| Field | Value |
|---|---|
| `basket_json` | Full JSON basket (goals + holdings + computed) |
| `last_score` | Integer 0–100 |
| `signup_source` | `calculator` or overridden via `basket.source` |
| `last_recalc` | ISO date of most recent score calculation |

`reactivate_existing: true` — re-subscribes lapsed users.  
`send_welcome_email: false` — score email is the welcome.

The **monthly recalc job** (fires 1st of each month, 7 AM ET) re-fetches all subscribers, recalculates scores from stored `basket_json`, and updates `last_score` + `last_recalc`.

---

## Resend Integration

**API:** `POST https://api.resend.com/emails`  
**Sending domain:** `send.aspirerate.com`  
**From address:** `score@send.aspirerate.com`

The score email is fully HTML (inline styles, Georgia serif, terracotta brand palette). It contains:
- Large score number (0–100)
- Score interpretation line (4 tiers: <40, 40–74, 75–99, 100)
- Rates table: Aspire Rate / Portfolio Rate / Annual Gap
- Gap narrative (ahead vs. behind framing)
- CTA button: **Run the Close the Gap Simulator →** (deep-link with base64url basket)

---

## rates.json — Data Layer

Static JSON file committed to the repo. Loaded client-side by `index.html`.

**Methodology:** Trailing 10-year CAGR.  
**Sources:** Yahoo Finance (equities, gold, BTC), FRED (CPI sub-indices, national home prices), Zillow ZHVI (metro home prices), College Board (tuition).  
**Last updated:** 2026-04-30.

**Asset keys available:**
- Portfolio assets: `sp500`, `qqq`, `single` (NVDA), `gold`, `btc`
- Inflation/cost benchmarks: `cpi`, `home` (national), `health`, `car`
- Metro home prices: `home_nyc`, `home_la`, `home_sf`, `home_seattle`, `home_boston`, `home_chicago`, `home_austin`, `home_dallas`, `home_houston`, `home_denver`, `home_miami`, `home_phoenix`, `home_nashville`, `home_atlanta`, `home_dc`
- Tuition: `tuition_private`, `tuition_public_in`, `tuition_public_out`

---

## Close the Gap Simulator

Post-score feature embedded in `index.html` (accessible at `aspirerate.com/?b={base64url_basket}#simulator`).

The simulator deep-link encodes a minimal basket:
```json
{
  "goals": [{ "label": "...", "amount": 0, "horizon": 0, "asset": "..." }],
  "holdings": [{ "label": "...", "amount": 0, "asset": "..." }]
}
```
Base64url encoded (URL-safe: `+→-`, `/→_`, no `=` padding), passed as `?b=` query param.

---

## Score Formula

```
Aspire Score = Math.max(0, Math.min(100, Math.round(fraction)))
  where fraction = computed by index.html before POST

Aspire Rate    = weighted CAGR of all goal cost categories
Portfolio Rate = weighted CAGR of all holdings
Aspire Gap     = Portfolio Rate − Aspire Rate
```

Score interpretation:
- **100**: fully funded
- **75–99**: close — last stretch
- **40–74**: partial coverage
- **<40**: most of the target out of reach

---

## Deployment

- Repo is linked to Netlify. Every push to `main` triggers a production deploy.
- No build step — Netlify publishes the root directory.
- Functions auto-detected from `netlify/functions/`.
- Deploy verification: poll `https://api.netlify.com/api/v1/sites/7fc9e061-49d8-4af7-91d9-90c0d70681f9/deploys?per_page=1` until `state === 'ready'`.

---

## What Codex Should Know Before Touching Code

1. **Read `AGENTS.md` first.** Then `SOUL.md`, `PRODUCT_DNA.md`, `COMPLIANCE.md`, `design.md`.
2. **No build step.** Don't introduce one. Keep it static + one function.
3. **score.js is CommonJS.** Do not convert to ESM — Netlify Functions v1 requires `exports.handler`.
4. **rates.json is the data layer.** Don't hard-code rates inline. Always read from the JSON.
5. **Beehiiv stores the basket.** Don't stand up a database — subscriber custom fields are the persistence layer until further notice.
6. **Score is computed client-side first.** The function receives `basket.computed.fraction` — it does not recalculate from raw inputs.
7. **Compliance guardrails apply.** No investment advice, no guaranteed returns, no personalized recommendations. See `COMPLIANCE.md`.
8. **Brand palette:** background `#f5f1ea`, primary text `#0f0e0c`, accent/terracotta `#c8451f`, muted `#5a544b`. Font: Georgia serif for numbers/display, system-ui for body.
