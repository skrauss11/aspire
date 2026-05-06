# TECHNICAL_CONTEXT.md

_Last updated: 2026-05-06. This file is the authoritative technical reference for Codex and other AI agents working on Aspire Rate._

---

## Maintenance Rule

Any future change that alters architecture, routes, Netlify Functions, Supabase schema usage, environment variables, external integrations, data flow, calculator logic, simulator behavior, or deployment assumptions must update this file in the same commit.

Do not let implementation drift ahead of this document.

---

## Stack Overview

Aspire Rate is a static Netlify site with serverless functions and Supabase-backed saved scenarios. Supabase is the system of record for persistence; Beehiiv is the newsletter and subscriber layer. There is no frontend framework and no build step.

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JavaScript |
| Hosting | Netlify (site ID: `7fc9e061-49d8-4af7-91d9-90c0d70681f9`) |
| Serverless | Netlify Functions v1 (CommonJS) |
| System of record / scenario persistence | Supabase Postgres (`public.scenarios`) |
| Domain | `aspirerate.com` |
| Repo | `github.com/skrauss11/aspire` (branch: `main`) |
| Email delivery | Resend (from: `score@send.aspirerate.com`) |
| Newsletter / subscriber layer | Beehiiv (pub ID: `pub_8ad9f164-9d8a-426e-b25a-e8e4cc3cf601`) |
| Rate data | `rates.json` (static JSON, committed to repo) |
| Analytics | Google Analytics (`G-0YTMP6NYVB`) |

---

## File Map

```text
skrauss11/aspire/
├── index.html                         # Landing page + calculator + email score gate
├── simulator.html                     # Standalone simulator page fallback
├── simulator/
│   └── index.html                     # Primary simulator route used by score links
├── join.html                          # Newsletter sign-up landing page
├── manifesto.html                     # Brand manifesto page
├── og-card.html                       # Open Graph social preview card
├── rates.json                         # Asset + inflation rate data (10-yr CAGRs)
├── netlify.toml                       # Netlify config, API redirects, simulator redirect
├── netlify/
│   └── functions/
│       ├── score.js                   # POST /api/score
│       ├── scenario.js                # GET /api/scenario?t=...
│       └── tracker.js                 # POST /api/tracker
├── favicon-32.png
├── favicon-512.png
├── x-profile.png
├── x-banner.png
├── 10_CANONICAL/
│   └── Vocabulary.md
├── design.md
├── AGENTS.md
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

1. User lands on `index.html`.
2. User fills out the goal-first calculator with life goals and holdings.
3. User submits email through the score gate.
4. `POST /api/score` runs in `netlify/functions/score.js`.
5. `score.js` computes the Aspire Score from `basket.computed.fraction`.
6. `score.js` writes the full scenario to Supabase `public.scenarios`.
7. `score.js` upserts Beehiiv newsletter/subscriber metadata. Supabase remains the system of record.
8. `score.js` attempts to send the score email through Resend.
9. The API returns `{ score, scenarioId, simulatorUrl, emailSent }`.
10. The calculator shows the score and opens the simulator CTA.
11. User opens `/simulator/index.html?t={access_token}`.
12. `simulator/index.html` calls `GET /api/scenario?t={access_token}`.
13. `scenario.js` fetches the saved scenario from Supabase and returns score, basket, rates, and timestamps.
14. Simulator hydrates the saved score, goals, holdings, Aspire Rate, Portfolio Rate, and Gap.
15. User can test scenario paths by changing monthly contribution, time horizon, cost growth assumptions, or money growth assumptions.
16. User can opt into tracker updates through `POST /api/tracker`, which uses the saved scenario token to look up their email.

---

## Supabase

Supabase is the system of record and source of truth for saved scenarios and simulator hydration.

### Table

`public.scenarios`

Expected schema:

```sql
create extension if not exists pgcrypto;

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  access_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  email text not null,
  basket jsonb not null,
  score integer not null,
  aspiration_rate numeric,
  portfolio_rate numeric,
  gap numeric,
  rate_snapshot jsonb,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz
);

alter table public.scenarios enable row level security;

create index if not exists scenarios_access_token_idx
  on public.scenarios (access_token);

create index if not exists scenarios_email_created_at_idx
  on public.scenarios (email, created_at desc);
```

### Access Pattern

The browser never talks directly to Supabase.

All Supabase reads/writes go through Netlify Functions using `SUPABASE_SERVICE_ROLE_KEY`.

Simulator links use the private `access_token`:

```text
/simulator/index.html?t={access_token}
```

The token is a bearer-style private link. Anyone with the link can load the scenario. Do not expose more sensitive financial data than necessary until account/auth decisions are made.

---

## Netlify Functions

All functions use CommonJS (`exports.handler`) and run as Netlify Functions v1.

### `score.js`

Endpoint:

```text
POST /api/score
```

Request body:

```json
{
  "email": "user@example.com",
  "basket": {
    "goals": [{ "goalType": "Home", "goalMode": "life", "label": "Home", "amount": 500000, "horizon": 10, "asset": "home" }],
    "holdings": [{ "label": "S&P 500", "amount": 100000, "asset": "sp500" }],
    "computed": {
      "fraction": 42,
      "aspirationRate": 6.45,
      "portfolioRate": 14.85,
      "gap": 8.4,
      "futureBuyingPower": "420k",
      "timeHorizon": 10
    },
    "source": "calculator"
  }
}
```

Response body:

```json
{
  "score": 42,
  "scenarioId": "uuid",
  "simulatorUrl": "https://aspirerate.com/simulator/index.html?t=private_token",
  "emailSent": true
}
```

Side effects:

- Inserts scenario into Supabase.
- Upserts subscriber metadata in Beehiiv for newsletter/subscriber workflows.
- Attempts to send score email through Resend.
- Returns score and simulator link even if Beehiiv or Resend fails, as long as Supabase scenario save succeeds.

### `scenario.js`

Endpoint:

```text
GET /api/scenario?t={access_token}
```

Behavior:

- Validates token format.
- Fetches scenario from Supabase by `access_token`.
- Updates `last_accessed_at` asynchronously.
- Returns saved score, basket, computed rates, rate snapshot, and created timestamp.

### `tracker.js`

Endpoint:

```text
POST /api/tracker
```

Request body:

```json
{ "token": "private_access_token" }
```

Behavior:

- Looks up scenario email from Supabase using the private token.
- Upserts Beehiiv subscriber fields:
  - `tracker_interest = true`
  - `tracker_opted_at = ISO timestamp`
  - `signup_source = simulator_tracker`

This avoids asking for email again on the simulator page.

---

## Environment Variables

Set these in Netlify production and local `.env` for `netlify dev`.

| Variable | Required | Used By | Description |
|---|---:|---|---|
| `SUPABASE_URL` | Yes | `score.js`, `scenario.js`, `tracker.js` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `score.js`, `scenario.js`, `tracker.js` | Server-only Supabase secret/service role key |
| `BEEHIIV_API_KEY` | Yes | `score.js`, `tracker.js` | Beehiiv API key |
| `BEEHIIV_PUB_ID` | Yes | `score.js`, `tracker.js` | Beehiiv publication ID |
| `RESEND_API_KEY` | Yes for email | `score.js` | Resend API key |
| `FROM_EMAIL` | Yes for email | `score.js` | Sending address |
| `FROM_NAME` | Optional | `score.js` | Sender name |

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

`.env` is ignored by Git and must stay ignored.

---

## Beehiiv Integration

Beehiiv is the newsletter and subscriber layer. It is not the system of record for saved scenarios; Supabase is.

API version: v2

Endpoint used:

```text
POST /v2/publications/{pub_id}/subscriptions
```

Calculator score submission stores:

| Field | Value |
|---|---|
| `basket_json` | Subscriber metadata copy of basket context; Supabase remains the source of truth |
| `last_score` | Integer 0–100 |
| `simulator_url` | Private simulator URL |
| `signup_source` | `basket.source` or `calculator` |
| `last_recalc` | ISO date |

Tracker opt-in stores:

| Field | Value |
|---|---|
| `tracker_interest` | `true` |
| `tracker_opted_at` | ISO timestamp |
| `signup_source` | `simulator_tracker` |

Beehiiv custom fields may need to be created/allowed in Beehiiv before writes succeed.

---

## Resend Integration

API:

```text
POST https://api.resend.com/emails
```

Sending domain:

```text
send.aspirerate.com
```

From address:

```text
score@send.aspirerate.com
```

The score email includes:

- Large score number.
- Score interpretation.
- Cost growth / Money growth / Your gap table.
- Gap narrative.
- CTA to the private Supabase-backed simulator link.

Local testing may save Supabase scenarios successfully while email fails if Resend credentials/domain permissions are not valid locally.

---

## Simulator

Primary route:

```text
/simulator/index.html?t={access_token}
```

Fallback/static page:

```text
/simulator.html
```

Netlify redirect:

```text
/simulator -> /simulator.html
```

The physical `simulator/index.html` route exists because it works reliably in local Netlify Dev and production static hosting.

### Current UX

The simulator is a decision-based planner, not a raw spreadsheet.

Default planner levers:

- Monthly contribution
- Time horizon
- Cost growth
- Money growth assumption

Locked assumptions shown to the user:

- Cost growth
- Money growth
- Starting Assets

The user does not edit cost growth by default. Internally, Aspire Rate is treated as Aspire's measurement from the saved basket.

Main outputs:

- Future goal cost
- Projected resources
- Dollar gap
- Your gap
- Required additional monthly contribution to close the gap
- Required money growth assumption to close the gap
- Scenario coverage percentage

Supporting outputs:

- Dollar trajectory chart comparing future cost against projected resources.
- In the simulator, dashed baseline lines compare the saved scenario with the current scenario.
- Gap movement.
- Plain-English summary.
- Copy simulator link.
- Copy summary.
- Turn on tracker updates.

### Calculator Schema Notes

Goals remain stored in the existing `basket.goals` JSON array. V3.1 adds optional metadata while preserving hydration of older baskets:

```json
{
  "goalType": "Home",
  "goalMode": "life",
  "label": "Home in Denver",
  "amount": 800000,
  "horizon": 5,
  "asset": "home_denver",
  "growth": 6.45
}
```

`goalType` is user-facing life-event metadata. Supported defaults are Home, College, Car, Retirement, Wedding, Children, Time off work, Business investment, Medical, and Custom.

`goalMode` defaults to `life`. Asset/unit target goals remain deferred/advanced and are not part of the default calculator path.

Rate selectors are context-specific:

- Goal rows show cost benchmarks only: CPI/life costs, home, metro home, tuition, healthcare, car, and custom-compatible existing selected values.
- Holding rows show money-growth assumptions only: cash, broad index, tech index, gold, and any existing selected advanced value for backwards compatibility.
- Speculative single-name and crypto assumptions are available only after the user opens the advanced assumptions toggle, and are never default goal cost benchmarks.

---

## rates.json

Static JSON file committed to the repo. Loaded client-side by `index.html` and simulator pages.

Methodology: trailing 10-year CAGR.

Sources:

- Yahoo Finance: equities, gold, BTC.
- FRED: CPI sub-indices, national home prices.
- Zillow ZHVI: metro home prices.
- College Board: tuition.

Last known update in file: 2026-04-30.

Available asset groups include:

- Portfolio assets: `sp500`, `qqq`, `single`, `gold`, `btc`
- Inflation/cost benchmarks: `cpi`, `home`, `health`, `car`
- Metro home prices: `home_nyc`, `home_la`, `home_sf`, `home_seattle`, `home_boston`, `home_chicago`, `home_austin`, `home_dallas`, `home_houston`, `home_denver`, `home_miami`, `home_phoenix`, `home_nashville`, `home_atlanta`, `home_dc`
- Tuition: `tuition_private`, `tuition_public_in`, `tuition_public_out`

---

## Score Formula

```text
Aspire Score = clamp(round(fraction), 0, 100)

Aspire Rate    = weighted CAGR of all goal cost categories
Portfolio Rate = weighted CAGR of all holdings
Aspire Gap     = Portfolio Rate - Aspire Rate
```

`fraction` is computed client-side before posting to `/api/score`.

V3.1 also computes supporting planning outputs client-side:

- `dollarGap = projectedResources - futureGoalCost`
- required additional monthly contribution, using the current scenario money-growth assumption over the weighted horizon
- required money growth assumption, solved by binary search against current assets and planned contributions

Score interpretation:

- `100`: fully funded
- `75-99`: close
- `40-74`: partial coverage
- `<40`: most of the target remains out of reach

---

## Deployment

- Repo is linked to Netlify.
- Every push to `main` triggers production deploy.
- No build step.
- Netlify publishes the root directory.
- Functions are in `netlify/functions/`.

Local testing:

```bash
npx netlify-cli dev
```

Use HTTP locally, not HTTPS:

```text
http://localhost:8888/
```

The local `.env` file must contain real values, not redacted placeholders.

---

## Agent Rules Before Touching Code

1. Read `AGENTS.md` first, then `SOUL.md`, `PRODUCT_DNA.md`, `COMPLIANCE.md`, and `design.md`.
2. Keep the site static unless a deliberate stack decision changes that.
3. Keep Netlify Functions CommonJS.
4. Never expose Supabase service role keys in browser code.
5. Use Supabase for saved scenario persistence.
6. Use Beehiiv for subscriber/newsletter state.
7. Use Resend for transactional score email.
8. Keep assumptions visible and educational.
9. Do not make investment recommendations.
10. Update this file when technical behavior changes.
