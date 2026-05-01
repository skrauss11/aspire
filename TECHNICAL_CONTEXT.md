# TECHNICAL_CONTEXT.md

## Current Technical State

No application stack has been selected yet.

Current repository assets:

- `design.md`: brand and design standards
- `x-profile.png`: social profile asset
- `x-banner.png`: social banner asset
- Root knowledge files: product, positioning, compliance, content, business, roadmap, prompts, and research

The current local folder is not initialized as a git checkout at the time this file was created.

## Product Architecture Goal

Aspire Rate should be built around a transparent calculation engine that can support a calculator UI, saved scenarios, reports, and content-driven presets.

The calculation logic should be portable and testable. UI code should not own financial formulas.

## Core Domain Model

### Scenario

A user-created planning context.

Suggested fields:

- Scenario ID
- User or anonymous session ID
- Scenario name
- Location
- Household assumptions
- Goal list
- Portfolio assumptions
- Created and updated timestamps
- Formula version
- Data source versions

### Goal

A future cost category included in Aspire Rate.

Suggested fields:

- Goal type
- Current estimated cost
- Target date
- Inflation or growth assumption
- Source type: user, default, third-party, derived
- Source citation
- Weight in scenario

### Portfolio Assumption

The user's projected financial growth assumptions.

Suggested fields:

- Current balance
- Annual contribution
- Contribution growth rate
- Expected return assumption
- Cash yield assumption
- Fees, taxes, or ignored factors
- User-selected risk range

### Calculation Result

The output generated from a scenario.

Suggested fields:

- Aspire Rate
- Portfolio Rate
- Aspire Gap
- Goal-level contribution breakdown
- Range or uncertainty band
- Plain-English interpretation
- Warnings and limitations

## Calculation Design

The calculation engine should:

- Accept structured scenario input.
- Validate missing or inconsistent assumptions.
- Calculate goal-level future costs.
- Produce a weighted Aspire Rate.
- Calculate Portfolio Rate from user assumptions.
- Calculate Aspire Gap.
- Return explanations separate from numeric results.

Initial formula:

```text
Aspire Gap = Portfolio Rate - Aspire Rate
```

Future implementations should version formulas so old scenarios remain explainable.

## Data Source Design

Every sourced default should include:

- Provider
- Dataset name
- URL
- Retrieval date
- Observation period
- Geography
- Category
- Transformation notes
- License or usage notes

Do not hard-code sourced defaults without a way to update or audit them.

## MVP Stack Options

No stack is chosen. Reasonable MVP options:

- Static or server-rendered calculator with TypeScript formula module
- Next.js or similar React framework for UI and routing
- Lightweight database only after saved scenarios are required
- JSON or markdown-backed assumptions for earliest prototypes

Selection criteria:

- Fast iteration
- Easy deployment
- Clear formula tests
- Simple data provenance
- Low compliance risk

## Testing Priorities

The first implementation should test:

- Formula correctness
- Edge cases with zero or missing values
- Date and horizon calculations
- Range calculations
- Source metadata display
- Disclaimer display
- Mobile calculator usability

## Privacy and Security Notes

Before collecting real user financial data:

- Define data retention policy.
- Draft privacy policy.
- Minimize stored personally identifiable information.
- Separate anonymous calculator use from account-based saved scenarios.
- Avoid storing unnecessary account-level financial detail.
- Encrypt sensitive data at rest if stored.

## Open Decisions

- Frontend framework
- Hosting provider
- Authentication model
- Database
- Analytics
- Data ingestion workflow
- Report generation format
- Formula versioning strategy
- Privacy and retention policy

