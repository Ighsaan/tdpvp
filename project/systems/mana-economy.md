# Mana Economy System

## Purpose
Define the primary resource model that governs pacing, strategic choices, and comeback potential.

## Core Principles
- Mana is the universal action currency for units, towers, and abilities.
- Regeneration and gain rules must be predictable and server-authoritative.
- Economy should reward skillful planning without producing unbreakable snowballs.

## Mana Flow Model
- `Passive Income`: baseline mana regeneration per tick/interval.
- `Optional Active Income`: objective-based or event-based gains (if enabled).
- `Spending`: spawn, placement, upgrades, ability casts.
- `Caps`: max mana limit to prevent excessive hoarding.

## Validation Rules
- All spending commands require server-side mana availability checks.
- Concurrent spend attempts resolve deterministically by command order policy.
- No negative mana states permitted unless explicitly designed (default: disallow).

## Pacing by Match Phase
- Early game: constrained income to encourage scouting and risk management.
- Mid game: increased action density and tactical variety.
- Late game: high-tempo decision pressure with larger opportunity swings.

## Economy Anti-Abuse Rules
- Reject duplicated/replayed spend commands.
- Enforce cooldown and rate limits alongside resource checks.
- Ensure reconnect cannot duplicate prior spend outcomes.

## Balance Levers
- Base regen rate.
- Phase-based regen modifiers.
- Max mana cap.
- Cost curves for units/towers/abilities.
- Objective reward magnitude/frequency.

## Observability
- Mana spent per category and phase.
- Floating (unused) mana rates indicating decision friction.
- Resource denial and tempo swing metrics.
- Correlation between spend timing and win probability.
