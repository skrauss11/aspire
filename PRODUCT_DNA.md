# PRODUCT_DNA.md

## Product Definition

Aspire Rate is a personal inflation framework.

It helps users estimate the inflation rate of the life they are working toward and compare it with the projected growth rate of their financial resources.

## Core Concepts

### Aspire Rate

The estimated inflation rate of a user's desired future.

It is built from goal categories such as:

- Housing
- Education
- Family support
- Healthcare
- Lifestyle preservation
- Retirement or financial independence
- Geographic mobility
- Optionality and resilience

### Portfolio Rate

The projected growth rate of the user's resources.

Inputs may include:

- Cash
- Savings rate
- Investment balances
- Expected contribution growth
- Expected return assumptions
- Employer contributions
- Debt payoff effects

### Aspire Gap

The difference between Portfolio Rate and Aspire Rate.

```text
Aspire Gap = Portfolio Rate - Aspire Rate
```

Interpretation:

- Positive gap: resources may be gaining ground against the desired future.
- Flat gap: resources may be roughly keeping pace.
- Negative gap: the desired future may be getting expensive faster than resources are growing.

## Product Jobs

Aspire Rate helps users:

- Name the future they are pricing.
- Understand which goals are driving their personal inflation.
- Compare official inflation with their own goal basket.
- See how savings, investment returns, and contributions affect the gap.
- Test scenarios without receiving prescriptive investment advice.
- Have better conversations with partners, advisors, employers, or themselves.

## Key User Inputs

Early versions should support:

- Current age
- Location
- Household status
- Target goals
- Target dates
- Current cost estimates
- Future cost assumptions
- Current assets
- Annual savings or contributions
- Expected return assumption
- Risk and uncertainty preference

## Key Outputs

The product should produce:

- Aspire Rate
- Portfolio Rate
- Aspire Gap
- Goal category breakdown
- Assumption table
- Scenario comparison
- Plain-English interpretation
- Suggested questions to ask, not prescribed actions to take

## Calculation Philosophy

The calculation should be:

- Transparent
- Editable
- Source-aware
- Scenario-based
- Honest about uncertainty

Avoid false precision. A range is often better than a single number.

## Data Philosophy

Aspire Rate should distinguish among:

- Official inflation data
- Regional cost data
- Category-specific historical growth
- User-entered assumptions
- Model-generated estimates
- Editorial examples

Each should be labeled.

## Product Boundaries

Aspire Rate may say:

- "At these assumptions, your target lifestyle is inflating at roughly X percent."
- "Your portfolio assumptions imply a Y percent growth rate."
- "Your Aspire Gap is Z percentage points."
- "Housing is the largest driver in this scenario."

Aspire Rate should not say:

- "Buy this fund."
- "You should allocate X percent to stocks."
- "This plan guarantees success."
- "This asset will solve your gap."
- "You can safely retire at this date."

## North Star

The north star is the number of users who can clearly understand and explain their Aspire Gap.

