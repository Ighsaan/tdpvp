# AGENTS.md

## Project Mission
Build a competitive, realtime PvP side-scrolling tower defence game with fair, responsive gameplay under an authoritative server model. The project must prioritize integrity, determinism, and maintainability so both AI agents and human developers can ship features quickly without compromising simulation correctness.

## AI Governance Files
Before starting work, AI agents must load and follow the guidance in the `/ai` governance files.

These files define the operational rules for AI agents in this repository. AI agents must read them before performing any modifications. They define coding standards, architecture rules, domain terminology, anti-patterns, development workflow, and system-level AI prompts. If any rule in these files conflicts with an agent's assumptions, the governance files take priority.

Required governance files:
- `/ai/system-prompts.md`
- `/ai/domain-model.md`
- `/ai/anti-patterns.md`
- `/ai/coding-standards.md`
- `/ai/ai-behaviour.md`
- `/ai/repository-rules.md`
- `/ai/development-process.md`
- `/ai/architecture.md`

Canonical sources:
- Coding standards: `/ai/coding-standards.md`
- Domain terminology and model definitions: `/ai/domain-model.md`
- Architectural rules and boundaries: `/ai/architecture.md`
- Anti-patterns: `/ai/anti-patterns.md`
- AI behavior guidelines: `/ai/ai-behaviour.md`
- Repository structure and placement rules: `/ai/repository-rules.md`
- Development workflow: `/ai/development-process.md`
- System prompt layer: `/ai/system-prompts.md`

## Architecture Summary
- `Client Applications (React UI shell + ThreeJS + TypeScript)`: product/menu UI, presentation, player input, local prediction/interpolation, and UI.
- `Realtime Server (Colyseus + TypeScript)`: authoritative simulation, command validation, anti-cheat checks, and state replication.
- `Backend Platform (Supabase)`: identity, player profiles, progression/meta systems, inventory/decks, match history, and leaderboards.
- Core principle: clients send intent, server decides outcomes, clients render authoritative results.

## Repository Layout
- Root must stay minimal: `AGENTS.md`, `/ai`, `/project`, and `/.github` (workflow automation only).
- `/ai` stays at root for cross-project AI governance and process rules.
- `/project` contains implementation, documentation, contracts, and task assets:
  - `/project/apps/client`
  - `/project/apps/server`
  - `/project/packages/shared`
  - `/project/docs`
  - `/project/systems`
  - `/project/simulation`
  - `/project/schemas`
  - `/project/decisions`
  - `/project/tasks`

## Development Philosophy
- Documentation-first before implementation for any new subsystem.
- Small, incremental changes over broad refactors.
- Deterministic server logic is non-negotiable.
- Explicit boundaries between gameplay simulation and presentation.
- Prefer simple and explainable designs over cleverness.

## Multiplayer Authority Rules
- Clients never author health, damage, resources, positions, cooldown completion, spawn success, or win/loss outcomes.
- Every gameplay action must be validated by server-side rules and game state.
- Time-critical rules use server tick time, never client wall-clock time.
- Reconciliation must preserve server truth, with client smoothing only for visuals.
- Any feature that weakens authority must be rejected or redesigned.

## Documentation Requirements
- Update relevant docs in the same change whenever architecture, rules, schemas, or process changes.
- Keep docs descriptive and prescriptive: explain both current behavior and constraints.
- Include rationale for non-obvious decisions.
- Cross-link related docs when introducing new concepts.
- Do not leave placeholder sections in committed docs.

## Task Workflow
1. Select or create a task in `/project/tasks` using the standard task format.
2. Confirm scope, constraints, dependencies, and acceptance criteria.
3. Update design docs first if the task changes architecture/system behavior.
4. Implement in small, reviewable units.
5. Validate with tests and simulation checks.
6. Update affected documentation and ADRs where required.
7. Mark task status and capture follow-up work.

## Rules for Modifying Architecture
- Any cross-boundary change (client/server/backend responsibilities) must include:
  - an architecture doc update (`/ai/architecture.md` and relevant `/project/docs/*`),
  - schema updates (`/project/schemas/*`) and shared contract updates (`/project/packages/shared/*`) if network/state contracts change,
  - an ADR in `/project/decisions` for major directional changes.
- Do not merge architecture changes without documented consequences and rollback considerations.

## How AI Agents Should Propose and Execute Changes
1. Start from task acceptance criteria and architecture constraints.
2. Identify impacted docs/schemas/systems (`/project/docs`, `/project/schemas`, `/project/systems`) and shared contracts (`/project/packages/shared`) before coding.
3. Propose smallest viable change set.
4. Call out risks to determinism, authority, and compatibility.
5. Execute, validate, and document in one coherent update.
6. If requirements conflict, preserve server authority and ask for clarification.

## How Agents Should Interact With Tasks
- Use `/project/tasks/task-XXXX-description.md` naming and template from `/project/tasks/README.md`.
- Keep task status explicit: `Backlog`, `Ready`, `In Progress`, `Blocked`, `Review`, `Done`.
- Record assumptions and unresolved questions in the task file.
- Link task to changed docs and ADRs.

## Requirements for Updating Documentation
- System rule changes: update `/project/systems/*`.
- Simulation timing/order changes: update `/project/simulation/*`.
- Network/state payload changes: update `/project/schemas/*` and matching shared contracts in `/project/packages/shared/*`.
- Process/governance changes: update `/ai/*` and this file if policy-level.
- Architectural direction changes: add or amend ADRs in `/project/decisions`.

## Definition of Done (Documentation Gate)
A change is not complete until:
- acceptance criteria are satisfied,
- deterministic and authority constraints remain intact,
- docs and schemas are updated,
- test/validation notes are captured,
- task status is moved to `Done` with any follow-up tasks created.
