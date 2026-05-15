# TECHNICAL_CONTEXT.md

_Last updated: 2026-05-15. This file is the authoritative technical reference for Codex and other AI agents working on Aspire Rate._

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
| Serverless | Netlify Functions, bundled by Netlify/esbuild |
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
│   ├── index.html                     # Primary private simulator workspace
│   └── s/
│       └── index.html                 # Read-only public shared scenario route
├── account/
│   └── index.html                     # Magic-link account shell + delete-account flow
├── privacy/
│   └── index.html                     # Placeholder privacy policy pending legal review
├── terms/
│   └── index.html                     # Placeholder terms pending legal review
├── join.html                          # Newsletter sign-up landing page
├── manifesto.html                     # Brand manifesto page
├── og-card.html                       # Open Graph social preview card
├── rates.json                         # Asset + inflation rate data (10-yr CAGRs)
├── netlify.toml                       # Netlify config, API redirects, simulator redirect
├── netlify/
│   └── functions/
│       ├── account.js                 # GET/DELETE /api/account
│       ├── auth.js                    # POST /api/auth
│       ├── score.js                   # POST /api/score
│       ├── scenario.js                # GET/POST/PATCH/DELETE /api/scenario
│       └── tracker.js                 # POST /api/tracker (planned/reconcile before use)
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
5. `score.js` validates the basket and computes score/rates/gap server-side with `project()`.
6. `score.js` writes the full scenario to Supabase `public.scenarios`.
7. `score.js` upserts Beehiiv newsletter/subscriber metadata. Supabase remains the system of record.
8. `score.js` attempts to send the score email through Resend.
9. The API returns `{ score, aspireRate, aspireGap, scenarioId, t, simulatorUrl, emailSent }`.
10. The calculator shows the score and opens the simulator CTA.
11. User opens `/simulator/index.html?t={access_token}`.
12. `simulator/index.html` calls `GET /api/scenario?t={access_token}`.
13. `scenario.js` fetches the saved scenario from Supabase, decrypts encrypted lever state when present, and returns the selected scenario plus the user's saved scenario list.
14. Simulator hydrates the saved score, goals, holdings, Aspire Rate, Money Growth, Gap, saved names, public share state, and 10-scenario cap.
15. User can test scenario paths by changing savings rate, allocation mix, timeline, target basket, geography, and configurable CAGR assumptions.
16. User can save named scenarios, rename, delete, make a scenario the baseline, create/revoke public share links, or opt into tracker updates through `POST /api/tracker`, which uses the saved scenario token to look up their email.

---

## Supabase

Supabase is the system of record and source of truth for saved scenarios and simulator hydration.

### Tables

Production functions now read and write the May 2026 encrypted persistence schema while preserving temporary legacy columns on `public.scenarios` for private-token compatibility and migration safety.

New persistence tables:

- `public.users` mirrors Supabase Auth users by UUID and stores email.
- `public.calculator_states` stores one encrypted calculator baseline per user.
- `public.scenarios` stores encrypted scenario lever state, derived display values, public sharing flags, and temporary legacy token columns.
- `public.baseline_overrides` stores encrypted user-selected baseline lever state.
- `public.account_deletions` stores the 90-day hashed deletion audit trail.
- `public.auth_magic_link_requests` stores SHA-256 hashes of normalized emails and request timestamps for server-side magic-link rate limiting. Anon/authenticated roles have no grants and RLS is enabled without user policies.

Money fields are encrypted server-side before insert using `lib/encryption.js` and libsodium XChaCha20-Poly1305. The encryption key is stored in Supabase Vault as `aspire_field_encryption_key_v1`; Netlify Functions read it over a server-side Postgres connection via `SUPABASE_DB_URL`. `ASPIRE_FIELD_ENCRYPTION_KEY` is allowed only as a local/test fallback.

### Access Pattern

The browser never talks directly to Supabase.

All Supabase reads/writes go through Netlify Functions using `SUPABASE_SERVICE_ROLE_KEY`.

Private simulator links use the private `access_token`:

```text
/simulator/index.html?t={access_token}
```

The token is a bearer-style private link. Anyone with the link can load the private simulator workspace and the scenario list for that user until full auth is implemented. Do not expose more sensitive financial data than necessary until account/auth decisions are made.

Public shared scenarios use opt-in public IDs:

```text
/simulator/s/{share_id}
GET /api/scenario?share={share_id}
```

Public reads return only the shared scenario payload, not the private token or saved scenario list. Share IDs are 20-character base64url strings generated server-side.

---

## Netlify Functions

Functions are authored as ES modules and bundled by Netlify/esbuild.

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
  "aspireRate": 6.45,
  "aspireGap": -3.6,
  "scenarioId": "uuid",
  "t": "private_token",
  "simulatorUrl": "https://aspirerate.com/simulator/?t=private_token",
  "emailSent": true
}
```

Server-authoritative metrics:

- `costRate`, `moneyRate`, and `gap` always come from `project(basket.goals, basket.holdings)` on the server.
- `basket.computed` from the client is used only as a fallback source for `horizon` / `timeHorizon` when `project()` cannot derive a useful horizon.
- `applyComputedRates()` writes the server-derived values back into the persisted `scenario.basket.computed`.

Side effects:

- Creates or resolves a Supabase Auth-backed `public.users` row for the submitted email.
- Upserts encrypted calculator baseline fields into `public.calculator_states`.
- Inserts encrypted scenario lever state into `public.scenarios.levers`, with derived display values in `public.scenarios.derived`.
- Temporarily also writes legacy `email`, `basket`, `score`, `aspiration_rate`, `portfolio_rate`, `gap`, and `access_token` fields on `public.scenarios` so the current private-link simulator contract survives the schema transition.
- Upserts subscriber metadata in Beehiiv for newsletter/subscriber workflows.
- Attempts to send score email through Resend.
- Returns Aspire Rate, Aspire Gap, score, token, and simulator link even if Beehiiv or Resend fails, as long as Supabase scenario save succeeds.

### `scenario.js`

Endpoint:

```text
GET /api/scenario?t={access_token}
GET /api/scenario?share={share_id}
POST /api/scenario
PATCH /api/scenario
DELETE /api/scenario
```

Private load behavior:

- Validates token format.
- Fetches scenario from Supabase by `access_token`.
- Decrypts `public.scenarios.levers` server-side when present; falls back to legacy `basket` rows during the transition.
- Updates `last_accessed_at` asynchronously.
- Returns saved score, Aspire Rate, Aspire Gap, basket, computed rates, rate snapshot, created/updated timestamps, saved scenario list, and `maxScenarios`.
- When an `Authorization: Bearer <access_token>` header is present, the token must belong to the scenario owner; the returned scenario list uses the authenticated user context.

Public load behavior:

- Validates `share_id` format.
- Fetches only rows where `share_id` matches and `is_public = true`.
- Decrypts the shared scenario server-side.
- Returns the shared scenario without `access_token` or the user's scenario list.

Mutation behavior:

- `POST /api/scenario` creates a named scenario for the authenticated user, an email, or an existing private token.
- `PATCH /api/scenario` renames, updates basket/levers, toggles public sharing, revokes sharing, or saves a baseline override.
- `DELETE /api/scenario` deletes a named scenario owned by the authenticated user or the user resolved from the private token.
- The save cap is 10 scenarios per user and is enforced server-side.

### `auth.js`

Endpoint:

```text
POST /api/auth
```

Actions:

- `{ "action": "request", "email": "user@example.com" }` sends a Supabase Auth magic link that redirects to `/account/`.
- `{ "action": "refresh", "refreshToken": "..." }` refreshes a browser-held Supabase session.
- `{ "action": "logout", "scope": "global" }` revokes the logged-in session server-side with Supabase Auth Admin.

Magic-link requests are limited server-side to 5 requests per normalized email per rolling hour using `public.auth_magic_link_requests`. Only a SHA-256 email hash is stored for the limiter. Supabase's own Auth settings still control magic-link expiration, JWT expiry, session time-boxing, inactivity timeout, and SMTP sender domain; confirm those in the Supabase dashboard before launch.

The browser stores only the Supabase access/refresh token pair in localStorage under `aspire:auth`. The service role key never reaches the browser.

### `account.js`

Endpoint:

```text
GET /api/account
DELETE /api/account
```

Behavior:

- Requires `Authorization: Bearer <access_token>`.
- Verifies the JWT with Supabase Auth before using the user id.
- `GET` returns account email and a low-sensitivity saved scenario summary. It does not decrypt scenario lever state.
- `DELETE` writes an `account_deletions.email_sha256` audit row, deletes baseline/calculator/scenario/user rows, signs the user out globally, and deletes the Supabase Auth user.

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
| `SUPABASE_URL` | Yes | `auth.js`, `account.js`, `score.js`, `scenario.js`, `tracker.js` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `account.js`, `score.js`, `scenario.js`, `tracker.js` | Server-only Supabase secret/service role key |
| `SUPABASE_DB_URL` | Preferred for encrypted persistence | `lib/encryption.js` | Server-only Postgres connection string used to read `aspire_field_encryption_key_v1` from Supabase Vault |
| `SUPABASE_ANON_KEY` | Yes | `auth.js`, `tests/rls.test.js` | Browser-safe anon key used by magic-link requests, session refresh, and the RLS integration test harness |
| `ASPIRE_FIELD_ENCRYPTION_KEY` | Required fallback while Netlify cannot resolve the direct Supabase DB host | `lib/encryption.js` | 32-byte hex/base64 fallback key matching `aspire_field_encryption_key_v1`; stored as a secret Netlify env var |
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

Netlify redirects:

```text
/simulator -> /simulator/
/simulator/s/* -> /simulator/s/?id=:splat
```

The physical `simulator/index.html` route exists because it works reliably in local Netlify Dev and production static hosting. `/simulator/s/index.html` renders public shared scenarios and calls `/api/scenario?share=...`.

### Current UX

The simulator is a decision-based planner, not a raw spreadsheet.

Default planner levers:

- Savings rate
- Allocation mix
- Timeline
- Target basket
- Geography
- Configurable CAGR

Locked assumptions shown to the user:

- Aspire Rate / Target Aspire Rate
- Aspire Gap
- Future cost
- Projected resources
- Dollar gap
- Coverage

The user edits the assumption levers directly. The simulator is educational and must keep the non-removable `AT THESE ASSUMPTIONS` pairing visible near rate/gap outputs.

Main outputs:

- Future goal cost
- Projected resources
- Dollar gap
- Aspire Gap
- Scenario coverage percentage

Supporting outputs:

- Dollar trajectory chart comparing future cost against projected resources.
- In the simulator, dashed baseline lines compare the saved scenario with the current scenario.
- Gap movement.
- Shape of Your Gap observation cards from `lib/simulator/observations.js`.
- Named scenario save/load/rename/delete.
- Public share link copy/revoke.
- Make baseline.
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
Money Growth   = weighted CAGR of all holdings
Aspire Gap     = Money Growth - Aspire Rate
```

Score coverage is computed server-side from `project()` after validating the submitted basket. Client-submitted `computed` rates are not authoritative. `fraction` may appear in older calculator payloads, but it is not trusted as the score source.

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
3. Keep Netlify Functions compatible with Netlify's esbuild-bundled function runtime.
4. Never expose Supabase service role keys in browser code.
5. Use Supabase for saved scenario persistence.
6. Use Beehiiv for subscriber/newsletter state.
7. Use Resend for transactional score email.
8. Keep assumptions visible and educational.
9. Do not make investment recommendations.
10. Update this file when technical behavior changes.
