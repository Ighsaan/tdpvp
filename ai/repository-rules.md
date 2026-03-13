# Repository Rules

## Purpose
Define repository structure, ownership boundaries, and naming conventions so contributors place work consistently.

## Top-Level Layout
- `/ai`: AI governance, architecture constraints, and process rules.
- `/.github`: repository automation workflows (CI/release pipelines only).
- `/project`: project documentation and task management root.
- `/project/apps/client`: React UI shell + ThreeJS primary client implementation.
- `/project/apps/server`: Colyseus authoritative server implementation.
- `/project/packages/shared`: shared contracts used by client and server.
- `/project/docs`: product-level documentation and high-level technical context.
- `/project/systems`: gameplay system rules and balancing design.
- `/project/simulation`: deterministic simulation and timing model documentation.
- `/project/schemas`: authoritative data contracts for network and state.
- `/project/decisions`: architecture decision records (ADRs).
- `/project/tasks`: task templates and execution workflow.

## Future Code Placement (When Implementation Starts)
- `/project/apps/client`: React/ThreeJS client app (menus, rendering, UI, input, interpolation only).
- `/project/apps/server`: Colyseus authoritative simulation and room lifecycle.
- `/project/packages/shared`: protocol types and constants shared across runtime boundaries.
- Future backend integration artifacts should be introduced under `/project/apps/backend` or `/project/packages` with an ADR if structure expands.

## Documentation Placement Rules
- Gameplay rule details belong in `/project/systems`.
- Simulation mechanics and determinism details belong in `/project/simulation`.
- Contract-level message/state definitions belong in `/project/schemas`.
- Cross-cutting architectural explanations belong in `/project/docs` and `/ai/architecture.md`.
- Governance/process policy changes belong in `/ai` and/or `AGENTS.md`.
- Shared runtime contract source-of-truth code belongs in `/project/packages/shared`.

## Naming Conventions
- Markdown docs: kebab-case file names.
- ADRs: `adr-XXXX-short-title.md` with zero-padded numbers.
- Tasks: `task-XXXX-description.md`.
- Use consistent domain terms: `unit`, `tower`, `ability`, `mana`, `tick`, `room`, `authoritative`.

## Change Management Rules
- Do not introduce new top-level folders beyond `AGENTS.md`, `/ai`, `/.github`, and `/project` without documented reason.
- Any move/rename of docs must preserve traceability (update links and references).
- Keep docs coherent across folders; avoid contradictory definitions.
- For major structure changes, add an ADR.

## Quality Gate
A repository change is acceptable only if:
- files are in correct locations,
- naming conventions are followed,
- impacted docs are updated,
- architecture boundaries remain intact.
