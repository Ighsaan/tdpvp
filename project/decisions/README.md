# Architecture Decisions (ADR)

## Purpose
Track significant architectural choices with context, alternatives, and consequences so future contributors can understand why the system evolved as it did.

## Location Rule
- Store ADR files in `/project/decisions`.
- Keep ADR numbering sequential across the whole repository.

## When to Create an ADR
Create an ADR when a decision:
- changes core architecture boundaries,
- affects multiplayer authority or deterministic simulation strategy,
- introduces major dependencies or infrastructure shifts,
- changes long-term development process in material ways.

## ADR Format
Each ADR should include:
1. Title and status.
2. Date and decision owners.
3. Problem statement and context.
4. Options considered.
5. Decision made.
6. Consequences (positive, negative, risks, follow-ups).

## Naming Convention
- File format: `adr-XXXX-short-title.md`.
- Use zero-padded sequential numbers.

## Status Lifecycle
- `Proposed`
- `Accepted`
- `Superseded`
- `Deprecated`

If superseded, link both old and new ADRs clearly.

## Quality Expectations
- Explain tradeoffs, not only conclusions.
- Capture assumptions and constraints.
- Keep ADRs concise but decision-complete.
