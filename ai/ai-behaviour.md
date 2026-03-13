# AI Behaviour Rules

## Purpose
Define how AI agents operate in this repository so changes stay safe, deterministic, and aligned with the authoritative multiplayer architecture.

## Operating Principles
- Protect gameplay integrity above implementation convenience.
- Respect architecture boundaries: client renders, server simulates, backend persists meta data.
- Prefer incremental delivery over broad rewrites.
- Keep reasoning explicit when decisions affect architecture, schemas, or balance rules.

## Change Discipline
- Do not perform large refactors without documented justification, impact analysis, and migration steps.
- Make the smallest viable change that satisfies task acceptance criteria.
- Keep behavior changes isolated and traceable.
- Avoid speculative abstractions until at least two concrete use-cases exist.

## Architecture Boundary Rules
- Do not move authoritative gameplay decisions to client code.
- Do not couple Supabase workflows to realtime server tick logic.
- Do not bypass command validation or anti-cheat checks for speed.
- Do not introduce direct client write access to authoritative match state.

## Documentation Coupling Rules
- Every structural change must update corresponding docs in the same change set.
- Every schema contract change must update `/project/schemas`.
- Every gameplay rule change must update `/project/systems`.
- Every simulation timing/order change must update `/project/simulation`.
- Major architectural direction changes require an ADR in `/project/decisions`.

## Dependency Policy
- Do not add dependencies unless clearly justified by task requirements.
- Prefer existing platform capabilities before introducing new libraries.
- For any new dependency, document:
  - why current tools are insufficient,
  - operational and security impact,
  - rollback/removal strategy.

## Validation Expectations
- Verify deterministic behavior for server-side logic changes.
- Confirm no client-trust regression in multiplayer flows.
- Validate compatibility of network message and state schemas.
- Record assumptions and known limits in task documentation.

## Collaboration Conduct
- Make assumptions explicit when requirements are ambiguous.
- Raise conflicts with authority model immediately.
- Surface risk early rather than silently continuing with uncertain architecture.
- Keep updates concise, factual, and implementation-focused.

## Prohibited Shortcuts
- Client-authoritative hit/damage/resource resolution.
- Time logic based on unsynchronized client clocks.
- Silent schema changes without documentation.
- Hidden behavior changes that bypass acceptance criteria.
