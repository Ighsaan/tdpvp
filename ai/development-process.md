# Development Process

## Objective
Provide a repeatable delivery workflow for humans and AI agents building a deterministic authoritative multiplayer game.

## Workflow Stages
1. `Intake`
   - Select an existing task or create a new one in `/project/tasks`.
   - Confirm scope, constraints, dependencies, and acceptance criteria.
2. `Design`
   - Update relevant docs before implementation when behavior/contracts/architecture change.
   - Identify impact to systems, simulation timing, and schemas.
3. `Implementation`
   - Deliver incremental commits or change sets with clear boundaries.
   - Preserve separation between client rendering concerns and server authority logic.
4. `Verification`
   - Run unit/integration checks relevant to changed areas.
   - Validate deterministic behavior and command validation paths.
5. `Review`
   - Ensure code and docs align.
   - Capture tradeoffs, risks, and unresolved follow-ups.
6. `Completion`
   - Update task status to `Done`.
   - Link merged changes and any new follow-up tasks.

## Feature Lifecycle
1. Define gameplay/technical goal.
2. Document rules and architecture impact.
3. Define schema/contract changes.
4. Implement smallest viable vertical slice.
5. Verify correctness, determinism, and authority protections.
6. Stabilize with tests and documentation updates.

## Pull Request Expectations
- Clear problem statement and goal.
- Explicit list of changed domains (systems, simulation, schemas, architecture docs).
- Risk analysis for authority, determinism, and compatibility.
- Evidence of validation/testing.
- Updated documentation links.

## Testing Expectations
- Unit tests for deterministic rule logic.
- Integration tests for command handling and state transitions.
- Reconnect/resync behavior tests for multiplayer lifecycle.
- Regression coverage for previously fixed authority or timing issues.

## Documentation Requirements
- No behavior change without documentation updates.
- Keep docs and implementation merged in the same delivery cycle.
- Add ADRs for major architecture or process decisions.

## Definition of Ready
A task is ready when:
- goal is clear,
- acceptance criteria are testable,
- dependencies are identified,
- impacted docs are known.

## Definition of Done
A task is done when:
- acceptance criteria pass,
- deterministic and authority constraints are preserved,
- required tests and docs are complete,
- follow-up work is explicitly tracked.
