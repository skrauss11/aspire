# Aspire Pre-Launch Checklist

_Drafted 2026-05-11. Lives at `aspire/specs/PRE-LAUNCH-CHECKLIST.md`. Consolidates implementation, content, compliance, and operational checklists from all seven specs into one trackable list._

---

## Schema and security (Codex)

- [x] New tables created per `security-and-privacy.md` §3:
  - [x] `users` with RLS policy `users_read_own` + `users_update_own`
  - [x] `calculator_states` with RLS policy `calc_states_own`, encrypted bytea columns for `total_assets`, `allocation_json`, `monthly_contribution`
  - [x] `scenarios` with RLS policies `scenarios_owner_all` + `scenarios_public_read`, encrypted bytea for `levers`
  - [x] `baseline_overrides` with RLS policy `baselines_own`, encrypted bytea for `levers`
- [x] `aspire_field_encryption_key_v1` provisioned in Supabase Vault
- [x] `ASPIRE_FIELD_ENCRYPTION_KEY` provisioned as a secret Netlify production fallback because Netlify Functions could not resolve the direct Supabase DB host during smoke testing
- [x] `aspire/lib/encryption.js` implemented (libsodium xchacha20-poly1305, server-side only)
- [x] RLS test suite written (`tests/rls.test.js`) — env-backed run passed on 2026-05-15
- [ ] Old `public.scenarios` table dropped (after new flow stable in production for ~1 week)

## Auth (Codex)

- [ ] Supabase Auth magic-link flow wired up
- [ ] Magic-link expiration set to 5 minutes
- [ ] Rate limit: max 5 magic-link requests per email per hour
- [ ] Session lifetime: 30-day rolling
- [ ] New-device login email sends via Resend (subject: *"You signed in to Aspire from a new device"*)
- [ ] Logout hard-revokes server-side
- [ ] Confirm Supabase Auth sends magic-links from `send.aspirerate.com` (or wire SMTP through Resend if not)

## Calculator page `/` (Codex)

- [x] `aspire/index.html` refactored per `page-spec-calculator.md`
- [x] Block A inputs: life chip (Home/Family/Freedom), geography, timeline slider
- [x] Block B inputs: total assets, 4-bucket allocation summing to 100%, monthly contribution
- [x] Reveal animation choreography (respects `prefers-reduced-motion`)
- [x] Aspire Rate, Aspire Gap, basket-component bar chart all render
- [x] **`AT THESE ASSUMPTIONS` eyebrow under hero number is present and non-removable**
- [x] Interpretation copy uses "at these assumptions" pairing in all three variants (negative/positive/zero gap)
- [x] Email gate sits below reveal; reveal stays visible after submit
- [ ] All copy from `copy.md` §1.1
- [x] State persists in localStorage; reloads gracefully
- [x] Mobile (≤860px) collapses to single column; reveal scales correctly
- [ ] LCP under 2.0s

## Simulator page `/simulator` (Codex)

- [x] `aspire/simulator/index.html` refactored per `page-spec-simulator.md`
- [x] Sticky header: scenario name, Aspire Rate (or Target), Aspire Gap, vs. Current
- [x] **`AT THESE ASSUMPTIONS` sub-eyebrow under the rate is present**
- [x] View toggle (Required ↔ Target with margin input) functional
- [x] All 6 levers implemented: Savings rate, Allocation mix, Timeline, Target basket, Geography, Configurable CAGR
- [x] Levers update Aspire Gap in real time
- [x] Trajectory chart renders
- [x] Reference line (baseline) shows behind active scenario line
- [ ] Recommendation engine in `aspire/lib/simulator/recommend.js` returns 2–4 ranked suggestions — deferred; v1 uses factual `lib/simulator/observations.js`
- [x] Observation panel avoids advisory recommendations and keeps outputs educational
- [x] Observation copy follows Allowed/Forbidden rules from `page-spec-simulator.md` §8
- [ ] Scenario presets implemented (6 locked: Aggressive, Conservative, Move to a cheaper city, Save 5 more years, Smaller life, Custom) — v1 has comparison patterns, not the final locked preset system
- [x] Scenario save/load via Supabase, 10-scenario cap enforced
- [x] Public scenario sharing at `/simulator/s/[shareId]` (read-only view, 20-char share_id)
- [x] Mobile = vertical lever stack
- [ ] Allocation Mix opens bottom sheet on mobile
- [ ] Configurable CAGR opens bottom sheet on mobile
- [ ] Auth gate: visitor without baseline redirects to `/` with banner — v1 shows an in-page start-over gate

## Netlify Functions (Codex)

- [x] `score.js` updated:
  - [x] Writes to new schema (encrypted)
  - [x] Returns `{ aspireRate, aspireGap, scenarioId, simulatorUrl, emailSent }`
  - [x] Function name and route preserved (deploy contract)
  - [x] Score email template surfaces Aspire Rate + Gap with "at these assumptions"
  - [x] Server `project()` result is authoritative for `costRate`, `moneyRate`, and `gap`
- [x] `scenario.js` updated to read new schema
- [x] `scenario.js` supports named save/list/load/rename/delete, make-baseline, public share, revoke share, and 10-scenario cap
- [x] `tracker.js` compatible with private token lookup
- [x] All env vars set in Netlify production:
  - [x] `SUPABASE_URL`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`
  - [x] `BEEHIIV_API_KEY`
  - [x] `BEEHIIV_PUB_ID`
  - [x] `RESEND_API_KEY`
  - [x] `FROM_EMAIL`
  - [x] `FROM_NAME`
  - [x] (new) encryption key reference for Vault / Netlify fallback

## Content surfaces (Codex + Claude)

- [ ] `/index` listing route + `/index/[slug]` detail route
- [ ] `/explainers` listing route + `/explainers/[slug]` detail route
- [ ] `/methodology` route (single page)
- [ ] `/report` route (Beehiiv archive integration; pulls past issues at build time)
- [ ] `/report/[slug]` route for individual past issues
- [ ] `/account` route (settings, delete-my-account flow per `security-and-privacy.md` §8)
- [ ] `/privacy` route (placeholder content from `copy.md` §5.1, flagged for legal review)
- [ ] `/terms` route (placeholder content from `copy.md` §5.2, flagged for legal review)
- [ ] `/author/scott` page (bio TBD by Scott)
- [ ] MDX rendering wired for `aspire/content/`
- [ ] Frontmatter validation in CI (pre-publish lint per `content-architecture.md` §8)
- [ ] `/llms.txt` generated at build time
- [ ] JSON-LD schema injection (Article, FAQ, Author, Dataset)
- [ ] `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended

## Editorial content (Claude)

- [ ] 10 launch Index card MDX files authored:
  - [ ] Father of the Bride (1991)
  - [ ] The Graduate (1967)
  - [ ] Good Will Hunting (1997)
  - [ ] Reality Bites (1994)
  - [ ] When Harry Met Sally (1989)
  - [ ] Risky Business (1983)
  - [ ] National Lampoon's Vacation (1983)
  - [ ] Friends (1994)
  - [ ] The Big Chill (1983)
  - [ ] Trading Places (1983)
- [ ] 8 launch Explainer MDX files authored
- [ ] Methodology page complete (all CAGR sources, formulas, basket weights)
- [ ] Author bio at `/author/scott` (Scott to provide)

## Brand assets

- [ ] Display Δ glyph variant designed (refined optical balance for >96px use)
- [ ] Favicons confirmed working at root + per route
- [ ] OG card system updated for new tagline placement
- [ ] No stock photography, no illustrations on launch surfaces

## Compliance and legal

- [ ] `npm run check:compliance` passes on every shipped surface
- [ ] Footer compliance line on every page (verbatim from `copy.md` §4.1)
- [ ] Methodology disclaimer block at top of `/methodology`
- [ ] Recommendations panel disclaimer in Simulator
- [ ] All surfaced rates and gaps paired with "at these assumptions"
- [ ] No banned phrases anywhere in shipped copy (per `aspire/AGENTS.md` Voice Rules)
- [ ] Privacy policy reviewed by lawyer (replaces `/privacy` placeholder)
- [ ] Terms of service reviewed by lawyer (replaces `/terms` placeholder)
- [ ] No third-party tracking pixels on `/` or `/simulator` (verified)
- [ ] Logger configured to redact money fields and email
- [ ] Sentry/error reporter configured with PII scrubbing

## Operational

- [ ] Branch protection on `main` confirmed enforced
- [ ] `STATUS.md` is current (no stale entries)
- [ ] Updated `aspire/AGENTS.md` reflects the May 2026 redirection (Sauna removed, Claude added)
- [ ] Updated `aspire-gtm/AGENTS.md` reflects the same
- [ ] CLAUDE.md at repo root accurately describes new agent roster
- [ ] Cross-repo handoff for content drafts documented (`aspire-gtm/30_CONTENT_ENGINE/` → `aspire/content/`)

## Post-launch loops

- [ ] Beehiiv weekly Aspire Report cadence confirmed (Tuesday morning, 10am ET)
- [ ] Aspire Index publication cadence: 1 new card per month
- [ ] Explainer cadence: 1–2 per month
- [ ] Methodology refresh: quarterly when CAGRs update
- [ ] `rates.json` weekly refresh job confirmed running

## Success criteria (run 30 days post-launch)

- [ ] ≥40% of unique visitors complete Calculator inputs
- [ ] ≥25% of those who see the reveal submit email
- [ ] ≥60% of /simulator visitors move at least one lever
- [ ] ≥35% of /simulator users save at least one scenario
- [ ] Aspire Report Tuesday open rate ≥40%
- [ ] At least one ChatGPT/Perplexity/Google AIO query about personal inflation cites Aspire (GEO test)

---

## Sign-off

| Owner | Surface | Approved | Date |
|---|---|---|---|
| Scott | Strategic direction (drift report decisions) | ✓ | 2026-05-11 |
| Codex | Schema migration | | |
| Codex | Calculator refactor | | |
| Codex | Simulator refactor | | |
| Codex | Score.js + Netlify Functions | | |
| Claude | Specs and copy | ✓ | 2026-05-11 |
| Claude | Editorial content (10 Index + 8 Explainers + Methodology) | | |
| Legal | Privacy + Terms | | |
| Scott | Final pre-launch sign-off | | |
