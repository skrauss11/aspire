# Aspire — Security and Privacy

_Companion to brief-v2.md. Locked 2026-05-11._

Aspire collects sensitive financial data — total assets, allocation breakdowns, monthly contributions, geographic location. Even though some users will enter hypothetical numbers, **the system cannot tell hypothetical from real, so we treat everything as real.** This doc defines the security model, the data inventory, and the user-facing privacy commitments.

---

## 1. Threat model

The realistic threats, ranked by likelihood:

1. **Misconfigured RLS leaks one user's row to another user via a query bug.** This is the most likely security failure on a Supabase-backed product. Encryption does not help against it. **Defense:** rigorous RLS policies, row-by-row, with tests.
2. **Phishing or credential reuse against a user's email.** Magic-link auth eliminates passwords entirely, removing the credential-reuse vector.
3. **Account takeover via email compromise.** Mitigated by: short-lived magic-link tokens (5 min), rate limiting on magic-link requests, and visible login-from-new-device notification.
4. **Database compromise at Supabase.** Rare. Mitigated by at-rest encryption (default) and column-level encryption on the money fields.
5. **Insider access at Supabase.** A Supabase engineer with database privileges could see plaintext data in unencrypted columns. **Defense:** encrypt the money fields with a key only Aspire holds.
6. **Public scenario URL guessing.** Mitigated by long random `share_id` slugs (20+ chars).

What we are **not** defending against in v1:
- Targeted nation-state attacks.
- Subpoena/legal compulsion (we'd comply with valid US legal process).
- Loss of the application encryption key on Aspire's side (operational risk — see §6).

---

## 2. Data inventory — what we store, where, why

| Field | Where stored | Why we need it | Sensitivity |
|---|---|---|---|
| Email | `users.email` (plaintext) | Magic-link auth + Beehiiv newsletter | Medium |
| User ID (UUID) | `users.id` | Internal key | Low |
| Life chip | `calculator_states.life_chip` | Determines basket preset | Low |
| Geography (zip/metro) | `calculator_states.geography` | Determines housing CAGR | Low–medium |
| Timeline (years) | `calculator_states.timeline` | Used in Simulator trajectory | Low |
| **Total assets ($)** | `calculator_states.total_assets` | Calculator math + Simulator state | **High** |
| **Allocation breakdown** | `calculator_states.allocation_json` | Calculator math + Simulator state | **High** |
| **Monthly contribution ($)** | `calculator_states.monthly_contribution` | Simulator trajectory projection | **High** |
| Computed Aspire Rate | `calculator_states.aspire_rate` | Cache for fast page loads | Medium (derived from sensitive) |
| Computed Aspire Gap | `calculator_states.aspire_gap` | Cache | Medium |
| Scenario name | `scenarios.name` | UI label | Low |
| **Scenario lever state** | `scenarios.levers` (JSONB) | Same as Calculator state — full financial profile | **High** |
| Scenario derived values | `scenarios.derived` (JSONB) | Cache | Medium |
| Scenario sharing flag | `scenarios.is_public` | Whether to expose via share URL | Low |
| Scenario share slug | `scenarios.share_id` | Public URL key | Low |
| Timestamps | All tables | Operational | Low |

The four bolded fields are the **money fields.** They get column-level encryption (see §4).

What we **do not** store:
- Names. Email is the only identifier.
- IP addresses on calculator submissions or lever changes.
- Precise geolocation (lat/long). Zip is the maximum precision we capture.
- Browser fingerprints.
- Income figures. (Only contribution amount.)
- Account/account-holder info from any third party (no Plaid, no aggregation).
- Demographic data (age, gender, marital status).
- Anything entered into form fields that gets abandoned before submission.

---

## 3. Row-Level Security — the primary defense

Every table has RLS enabled. Every policy is keyed off `auth.uid()`. No exceptions.

### Schema with RLS policies

```sql
-- users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- No INSERT/DELETE policies on users — those go through Supabase Auth flows.

-- calculator_states table
CREATE TABLE calculator_states (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  life_chip text,
  geography text,
  timeline int,
  total_assets bytea,           -- encrypted
  allocation_json bytea,         -- encrypted
  monthly_contribution bytea,    -- encrypted
  aspire_rate numeric,
  aspire_gap numeric,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE calculator_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calc_states_own"
  ON calculator_states FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- scenarios table
CREATE TABLE scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text,
  levers bytea,                  -- encrypted (full lever state)
  derived jsonb,                 -- not encrypted (cached display values)
  is_public boolean DEFAULT false,
  share_id text UNIQUE,          -- generated when is_public = true
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Owner can do anything with their own scenarios
CREATE POLICY "scenarios_owner_all"
  ON scenarios FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read a scenario marked public via its share_id (the public route uses an
-- anon-key query that only matches when is_public = true)
CREATE POLICY "scenarios_public_read"
  ON scenarios FOR SELECT
  USING (is_public = true);

-- baseline_overrides table
CREATE TABLE baseline_overrides (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  levers bytea,                  -- encrypted
  set_at timestamptz DEFAULT now()
);
ALTER TABLE baseline_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "baselines_own"
  ON baseline_overrides FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### RLS testing requirement

Before any production deploy, a test suite must verify each policy. At minimum:

```ts
// tests/rls.test.ts (skeleton)
describe('RLS — calculator_states', () => {
  it('user A cannot read user B calculator_states', async () => { ... });
  it('user A cannot update user B calculator_states', async () => { ... });
  it('anon cannot read any calculator_states', async () => { ... });
});
```

Run as part of CI. Failing RLS tests block merge. **This is the single most important security practice on the project.**

---

## 4. Column-level encryption for the money fields

The four money fields (`total_assets`, `allocation_json`, `monthly_contribution`, `scenarios.levers`) are encrypted at the application layer before being written to Postgres, and decrypted server-side when read by an authorized user.

### Approach

- Use **libsodium** (`@noble/ciphers` or `tweetnacl` in JS) for `xchacha20-poly1305` authenticated encryption.
- Encryption key stored in **Supabase Vault** as a single secret named `aspire_field_encryption_key_v1`. The `_v1` suffix supports key rotation (see §6).
- Encryption happens **server-side only.** Next.js server actions / route handlers fetch the key from Vault, encrypt/decrypt, and pass plaintext to the React client. The client never sees the key.
- Each encrypted value uses a fresh random nonce, prepended to the ciphertext: `nonce || ciphertext`.
- Stored as `bytea` columns in Postgres.

### What this protects against

- Insider access at Supabase: a Supabase engineer with database privileges sees only ciphertext for the money fields.
- Database backup leak: backups contain ciphertext for the money fields.
- Some forms of SQL injection: a successful read of these columns yields ciphertext, not plaintext.

### What this does NOT protect against

- A compromise of the Aspire application server (where the key is held in memory after fetch from Vault). Acceptable risk for v1 — a different problem.
- A user's own session being hijacked. The attacker would see the same data the user does. Mitigated by short session lifetimes.

### Implementation note for Codex

```ts
// lib/encryption.ts (server-only — never import in client code)
import sodium from '@noble/ciphers/chacha';
import { fetchKeyFromVault } from './vault';

let cachedKey: Uint8Array | null = null;

async function getKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  cachedKey = await fetchKeyFromVault('aspire_field_encryption_key_v1');
  return cachedKey;
}

export async function encryptField(plaintext: string): Promise<Buffer> {
  const key = await getKey();
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const ciphertext = sodium.xchacha20poly1305(key, nonce).encrypt(
    new TextEncoder().encode(plaintext)
  );
  return Buffer.concat([Buffer.from(nonce), Buffer.from(ciphertext)]);
}

export async function decryptField(stored: Buffer): Promise<string> {
  const key = await getKey();
  const nonce = stored.subarray(0, 24);
  const ciphertext = stored.subarray(24);
  const plaintext = sodium.xchacha20poly1305(key, nonce).decrypt(ciphertext);
  return new TextDecoder().decode(plaintext);
}
```

(The above is illustrative — verify the exact `@noble/ciphers` API at implementation time. Library APIs shift.)

### Verify Supabase Vault API at implementation time

Supabase's Vault and column-encryption surfaces have evolved several times. Before implementing, check the current Supabase documentation for:
- Vault secret retrieval from server-side Postgres functions vs. external fetch.
- Whether `pgsodium` transparent column encryption is still recommended (as of late 2025 it was being deprecated in favor of app-side encryption — confirm current state).

The pattern above (app-level encryption with key in Vault) is the most stable and least likely to be deprecated.

---

## 5. Auth and session management

- **Magic-link only via Supabase Auth.** No passwords. Removes password-reuse and password-reset attack surface entirely.
- **Two email channels, separate jobs:**
  - **Supabase Auth** (sends magic-link sign-in emails). Uses the project's configured SMTP — confirm at implementation time whether Aspire wires this through Resend (preferred — same sending domain) or uses Supabase's default.
  - **Resend** (sends transactional product emails — the score email after Calculator submission, new-device notifications, account-deletion confirmations). The existing `aspire/netlify/functions/score.js` Resend integration stays.
- Magic links expire after **5 minutes** and are single-use.
- Rate limit: max 5 magic-link requests per email per hour. After that, soft-fail with helpful copy.
- Sessions: 30-day rolling expiration. Refresh on each authenticated request.
- New-device login: send an email (via Resend) when a session is created from an IP/UA combination not seen before. Subject: *"You signed in to Aspire from a new device."* Body includes timestamp, approximate location (city-level from IP), and a *"Wasn't you?"* link that nukes all sessions and rotates the user's auth tokens.
- Logout: hard-revokes the session token server-side (not just client-side cookie clear).

---

## 6. Key management and rotation

### Initial setup

- Generate a 256-bit key (32 random bytes) once, store as `aspire_field_encryption_key_v1` in Supabase Vault.
- Document the key creation date in an internal runbook.
- The key is never logged, never committed to source control, never exported.

### Rotation

- Plan: rotate the key every 12 months, or immediately on suspected compromise.
- Rotation procedure (documented in `RUNBOOK.md`, not this doc):
  1. Generate `aspire_field_encryption_key_v2`.
  2. Background job re-encrypts all rows with `_v2`, marks the key version on each row (add a `key_version` column).
  3. Once 100% of rows migrated, mark `_v1` as inactive in Vault.
  4. After 30-day rollback window, delete `_v1`.

### Backups

- Supabase's automatic daily backups are encrypted at rest. The money fields are double-encrypted in backups (Supabase's at-rest layer plus our app-level layer).
- Backups retained per Supabase's default policy (7 days for free tier, 30 days for Pro, longer for higher tiers — confirm with current plan).

### What if Aspire loses the key?

- All money fields become permanently unreadable.
- Other fields (email, geography, timeline, computed values) remain accessible.
- Users would see a soft-degraded experience: their Aspire Rate and Gap still display from cache, but they'd need to re-enter total assets / allocation / contribution to use the Simulator.
- Acceptable failure mode. Better than a key the attacker has.

---

## 7. Public scenario sharing — what's exposed

When a user marks a scenario `is_public = true`:

- A random 20-character `share_id` is generated (high enough entropy that brute-forcing the URL space is infeasible).
- The public URL is `/simulator/s/{share_id}`.
- The publicly exposed payload: scenario name + lever values + computed Aspire Rate/Gap + basket components. Decrypted server-side and rendered in a read-only view.
- **Not exposed:** the user's email, user ID, other scenarios, baseline state, IP, or any metadata that identifies the owner.
- The share view shows: *"This scenario was shared anonymously. Make it your starting point →"* — no attribution.

User can revoke a share at any time (toggles `is_public` to false; `share_id` is preserved for future re-share but the URL returns 404).

---

## 8. Account deletion

A user can delete their account self-serve at `/account` (or by emailing privacy@aspirerate.com — but self-serve is the supported path).

### What happens

1. User clicks `Delete my account`. Confirmation modal: *"This will permanently delete your Aspire account, your saved scenarios, and remove you from the Aspire Report. This can't be undone."*
2. On confirm:
   - Delete from `scenarios` (cascade from user_id FK).
   - Delete from `calculator_states` (cascade).
   - Delete from `baseline_overrides` (cascade).
   - Delete from `users`.
   - Call Beehiiv API to remove subscription.
   - Invalidate all sessions.
3. Confirmation email sent: *"Your Aspire account has been deleted."*
4. User is redirected to `/` with a brief toast: *"Your account is gone."*

### Audit trail

A minimal `account_deletions` log table records: deletion timestamp, hashed (SHA-256) email at time of deletion. Used to handle "I changed my mind, can you restore?" requests with a clear *"no, deletion is permanent"* answer. Retained 90 days, then purged.

Public scenarios shared by a deleted user: deleted along with the account. Existing share URLs return 404 with a redirect.

---

## 9. Retention

- Active users: data retained as long as the account exists.
- Inactive users (no login in 24 months): no auto-deletion in v1. Promising auto-deletion creates compliance burden we don't need yet. Revisit in v2 when user count justifies it.
- Account deletion logs: 90 days, then purged.
- Newsletter subscribers (Beehiiv side): managed per Beehiiv's data policies. Aspire respects unsubscribe immediately.

### Migration from existing schema

Per drift-report Conflict 5, **the existing `public.scenarios` table is fully replaced by the new schema in §3.** No migration of existing rows is needed (no real production user data to preserve as of 2026-05-11). Migration steps:

1. Codex creates the new tables (`users`, `calculator_states`, `scenarios`, `baseline_overrides`) per §3 in a single migration PR.
2. Codex updates `aspire/netlify/functions/score.js` and `scenario.js` to write/read against the new tables.
3. Codex provisions `aspire_field_encryption_key_v1` in Supabase Vault.
4. Codex implements `aspire/lib/encryption.js` per §4.
5. Once the new flow is live and verified in production, drop the old `public.scenarios` table in a separate cleanup PR.

If real users have created scenarios between now and the migration date, this plan changes. Codex must verify row count in `public.scenarios` immediately before migrating; if rows exist that represent active users, switch to the additive-then-deprecate strategy described in drift-report Conflict 5 instead of dropping.

---

## 10. Compliance and disclaimers

- Aspire is **not a registered investment advisor.** All outputs are educational measurements, not investment advice. Documented in:
  - Footer compliance line on every page: *"Outputs are educational measurements, not investment advice. Past rates are not guarantees of future results."*
  - Recommendations panel in the Simulator: never names specific assets, funds, or tickers (enforced in code — see `page-spec-simulator.md` §8).
- Aspire is **not a fiduciary.** No client relationship is created by use of the site.
- US-only baseline data. Visitors from outside the US are not blocked but the data is US-centric. Documented on `/methodology`.
- No CCPA/GDPR sale of personal information — Aspire does not sell or rent user data, ever.
- Privacy policy (`/privacy`) and terms (`/terms`) pages are required before launch. Drafts not in scope of this doc; flag for legal review.

---

## 11. User-facing privacy summary (footer / privacy page)

Short, plain English. Lives at `/privacy` and is summarized in the footer. Draft:

> ### What we keep
> Your email and the numbers you enter — assets, allocation, contributions, geography, goals — so the Simulator can pick up where you left off.
>
> ### How we keep it
> Sensitive financial fields are encrypted in our database. Connections use TLS. Magic-link auth means we never store passwords.
>
> ### What we don't do
> Sell or share your data. Track you with ads. Aggregate accounts. Store your name, IP, or anything you didn't type into Aspire.
>
> ### What you can do
> Delete your account anytime at /account. Unsubscribe from the Aspire Report at any time. Email privacy@aspirerate.com with questions.

The footer compliance line + a link to `/privacy` is the minimum on every page.

---

## 12. Operational practices

- **Secrets in environment variables**, never in source. Vercel/Netlify-style env config. Local `.env.local` is gitignored.
- **No financial data in logs.** Application logs scrub anything resembling money fields. Use a structured logger with field-level redaction.
- **Error reporting (Sentry, etc.):** scrub PII and money fields before transmission. Configure with allowlist, not denylist.
- **No third-party scripts on Calculator or Simulator pages.** No analytics pixels that fire on input events. Page-view-only telemetry, gated behind consent.
- **Dependency hygiene:** Dependabot or equivalent. Critical security patches deployed within 7 days; high-severity within 30.
- **Breach response runbook:** documented separately. At minimum: identify scope, notify affected users within 72 hours, document remediation, post-mortem.

---

## 13. Open questions

- **Privacy policy and terms of service drafting** — needs legal review. Out of scope for this doc.
- **Cookie consent banner** — minimal first-party cookies (auth session, theme preference). May not require a full GDPR-style consent banner for US-only v1, but worth a legal opinion before launch.
- **Beehiiv data residency** — confirm Beehiiv's hosting region and data processing terms align with Aspire's privacy promises.
- **Right-to-export** — should `/account` include a "download my data" button? Not required by US law for non-California users in v1; nice-to-have for trust signal. Open.

---

## 14. Codex implementation checklist

A handoff summary for whoever builds this:

- [ ] Create all four tables with the exact schema in §3.
- [ ] Enable RLS on all four tables and apply the policies as written.
- [ ] Write RLS test suite. Block merge if any test fails.
- [ ] Implement `lib/encryption.ts` with libsodium per §4. Server-side only.
- [ ] Provision the encryption key in Supabase Vault as `aspire_field_encryption_key_v1`.
- [ ] All writes to money fields go through `encryptField`; all reads go through `decryptField`. No exceptions.
- [ ] Implement magic-link auth via Supabase Auth. Configure 5-minute link expiry, 30-day session.
- [ ] Implement new-device login email notification.
- [ ] Implement `/account` page with self-serve delete flow per §8.
- [ ] Configure logger to redact money field keys and email.
- [ ] Configure Sentry/error reporter with PII scrubbing.
- [ ] Add `/privacy` and `/terms` pages (content TBD pending legal).
- [ ] Add footer compliance line on every page.
- [ ] Verify no third-party scripts load on `/` or `/simulator`.
- [ ] CI: dependency scanning (Dependabot or equivalent).
- [ ] Write breach response runbook.
