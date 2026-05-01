# PROMPTS.md

## Prompt Library

Reusable prompts for Aspire Rate agents.

## Product Strategy Prompt

```text
You are working on Aspire Rate, a personal inflation framework that calculates the inflation rate of the life a user wants and compares it with the projected growth rate of their money.

Read README.md, SOUL.md, PRODUCT_DNA.md, POSITIONING.md, ICP.md, ROADMAP.md, and COMPLIANCE.md before answering.

Task:
[Describe the product decision.]

Return:
1. Recommended decision
2. Reasoning
3. User value
4. Compliance risks
5. Data assumptions
6. Open questions
```

## Feature Spec Prompt

```text
Write a feature spec for Aspire Rate.

Feature:
[Name feature.]

Use the product concepts:
- Aspire Rate
- Portfolio Rate
- Aspire Gap

The spec must include:
- User problem
- User story
- Inputs
- Outputs
- Calculation assumptions
- Edge cases
- Compliance boundaries
- Analytics events
- MVP scope
- Later scope
```

## Content Draft Prompt

```text
Write an Aspire Rate article in the brand voice.

Topic:
[Topic.]

Audience:
[ICP segment.]

Requirements:
- Make one sharp argument.
- Use the phrase "the inflation rate of the life you want" only if it fits naturally.
- Do not recommend securities or financial products.
- Include assumptions and limitations.
- Prefer clear examples over generic advice.
- End with a question or calculator CTA.
```

## Research Prompt

```text
Research this Aspire Rate question:
[Question.]

Prioritize primary sources and current data.

Return:
- Summary
- Sources with links
- Retrieval date
- Data limitations
- Product implications
- Compliance considerations
- Follow-up research tasks
```

## Compliance Review Prompt

```text
Review the following Aspire Rate content or feature for compliance risk.

Material:
[Paste material.]

Check for:
- Investment advice risk
- Promissory or guaranteed language
- Unsupported claims
- Missing assumptions
- Missing source timestamps
- Misleading comparisons
- Testimonial or endorsement issues
- Privacy or user data concerns

Return:
- Risk level
- Specific issues
- Safer rewrite suggestions
- Questions for counsel
```

## Calculator Explanation Prompt

```text
Explain this Aspire Rate result to a user.

Inputs:
[Inputs.]

Outputs:
[Aspire Rate, Portfolio Rate, Aspire Gap.]

Requirements:
- Be clear and concise.
- Explain that outputs are scenario estimates.
- Do not recommend investments.
- Identify the largest drivers.
- Suggest questions the user can explore next.
```

## Agent Handoff Prompt

```text
You are taking over work on Aspire Rate.

Before starting, read:
- README.md
- AGENTS.md
- PRODUCT_DNA.md
- COMPLIANCE.md
- design.md

Current task:
[Task.]

Return a short plan, then execute if the task requires file changes.
When done, summarize changed files, assumptions, and remaining risks.
```

