# Tasks Workflow

## Purpose
Define how work is tracked and executed so AI agents and humans can collaborate predictably.

## Location Rule
- Keep all project task files under `/project/tasks`.
- Root-level task folders are not permitted.

## Task File Naming
- Use `task-XXXX-description.md` (zero-padded sequence).
- Example: `task-0001-initialize-room-lifecycle.md`.

## Task Template
Each task file must contain:

## Title
A concise statement of the outcome.

## Description
Context and problem statement.

## Goal
Clear desired end state.

## Acceptance Criteria
Testable checks that define completion.

## Technical Notes
Architecture constraints, implementation hints, risks, and non-goals.

## Dependencies
Linked prerequisite tasks, docs, ADRs, or external constraints.

## Suggested Additional Sections
- `Status`: Backlog / Ready / In Progress / Blocked / Review / Done.
- `Owner`: human/agent responsible.
- `Docs to Update`: explicit list of required documentation updates.
- `Validation Plan`: tests/checks required before completion.

## Task Lifecycle
1. Create task in `Backlog`.
2. Refine to `Ready` with complete acceptance criteria.
3. Move to `In Progress` during execution.
4. Move to `Review` after implementation and validation.
5. Move to `Done` once criteria and documentation updates are complete.
6. Create follow-up tasks for deferred scope; never hide unfinished work.

## AI Agent Execution Rules
- Start by reading task requirements and linked docs.
- Respect architecture boundaries and authority model.
- Implement smallest viable change set.
- Update `/project/docs`, `/project/schemas`, and `/project/decisions` in the same delivery cycle where applicable.
- Record assumptions and open issues in the task file.

## Quality Gate
A task cannot be marked `Done` unless:
- all acceptance criteria are met,
- required tests/validation pass,
- required docs are updated,
- unresolved risks are either addressed or tracked in new tasks.
