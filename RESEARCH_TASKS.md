# RESEARCH_TASKS.md

## Research Backlog

This file tracks open research needed to make Aspire Rate accurate, trustworthy, and useful.

## Data Research

### CPI and Official Inflation

Questions:

- Which CPI series are most useful for comparison?
- Should Aspire Rate show CPI-U, core CPI, chained CPI, or category-level CPI?
- How should geographic CPI differences be handled?

Outputs:

- Recommended CPI sources
- Update cadence
- API or download workflow
- Plain-English methodology note

### Housing

Questions:

- Which data sources best represent home purchase cost growth by metro?
- How should down payment, mortgage rates, taxes, insurance, and maintenance be modeled?
- Should rent and buy goals be separate baskets?

Outputs:

- Housing model proposal
- Metro-level source list
- Default assumption table

### Education

Questions:

- How should public, private, in-state, out-of-state, and graduate education be separated?
- Should tuition, room and board, and fees have separate growth assumptions?
- How should scholarships and 529 balances be handled?

Outputs:

- Education cost model
- Source list
- Example scenarios

### Healthcare

Questions:

- Which healthcare cost indexes are credible for consumer planning?
- How should age, family size, and insurance status affect assumptions?
- How should long-term care be treated?

Outputs:

- Healthcare category model
- Default assumption ranges
- Risk disclosure language

### Portfolio Rate

Questions:

- How should user-selected return assumptions be framed?
- Should Aspire Rate provide historical return context?
- How can the product avoid implying recommended allocations?

Outputs:

- Portfolio Rate input design
- Education copy
- Compliance review questions

## User Research

### Concept Comprehension

Questions:

- Do users understand Aspire Rate within 60 seconds?
- Do they confuse it with CPI?
- Which phrase best explains it?

Tasks:

- Interview 10 target users
- Test three landing page headlines
- Test calculator result comprehension

### Willingness to Pay

Questions:

- Would users pay for saved scenarios?
- Would advisors pay for client reports?
- Which features create repeat use?

Tasks:

- Run pricing interviews
- Test consumer Pro landing page
- Test advisor mock report

## Compliance Research

Questions:

- At what point does scenario guidance become investment advice?
- What disclaimers are needed for calculator outputs?
- How should advisor-facing tools be reviewed?
- What privacy policy is needed before collecting user financial data?

Tasks:

- Counsel review of product scope
- Counsel review of marketing claims
- Counsel review of monetization model
- Counsel review of AI-generated explanations

## Technical Research

Questions:

- What stack should power the first calculator?
- Should formulas live in TypeScript, Python, or a separate model spec?
- How should source data updates be stored?
- How should scenarios be versioned?

Tasks:

- Choose MVP stack
- Draft calculation module interface
- Draft data source schema
- Draft scenario JSON schema

## Brand and Content Research

Questions:

- Which chart formats make Aspire Gap easiest to understand?
- Which social hooks travel without becoming misleading?
- Which examples feel specific but broadly relatable?

Tasks:

- Create 10 chart prototypes
- Test social post formats
- Build first 12 newsletter topic briefs

