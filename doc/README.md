# MedLens — Documentation Index

This folder contains the phased build plan for **MedLens**, an AI-powered medical literature summarization tool.

Use these docs when building: point the agent at a specific phase file (e.g. *"Build Phase 2 from `doc/phase-02-core-summarization.md`"*).

## Source of Truth

- [Product.md](../Product.md) — Full product requirements (PRD)

## Master Plan

- [PLAN.md](./PLAN.md) — Phase overview, dependencies, and build order

## Phase Documents

| Phase | File | Status | Description |
|-------|------|--------|-------------|
| 0 | [phase-00-project-setup.md](./phase-00-project-setup.md) | Complete | Repo structure, dependencies, env config |
| 1 | [phase-01-core-summarization.md](./phase-01-core-summarization.md) | Complete | End-to-end abstract → LLM → summary flow |
| 2 | [phase-02-prompt-and-schema.md](./phase-02-prompt-and-schema.md) | Complete | Domain prompts, JSON schema, Pydantic models |
| 3 | [phase-03-input-ui.md](./phase-03-input-ui.md) | Complete | Input form, length selector, generate button |
| 4 | [phase-04-results-ui.md](./phase-04-results-ui.md) | Complete | Card-based structured output display |
| 5 | [phase-05-topic-relevance.md](./phase-05-topic-relevance.md) | Complete | Optional topic/keyword relevance check |
| 6 | [phase-06-error-handling.md](./phase-06-error-handling.md) | Complete | Validation, API errors, malformed responses |
| 7 | [phase-07-session-history.md](./phase-07-session-history.md) | Not started | Optional Streamlit session state history |
| 8 | [phase-08-demo-polish.md](./phase-08-demo-polish.md) | Not started | Final polish, demo readiness, smoke tests |
| — | [phase-09-future-enhancements.md](./phase-09-future-enhancements.md) | Reference | Post-MVP features (do not build for hackathon) |

## How to Build

1. Read [PLAN.md](./PLAN.md) for the full roadmap.
2. Complete phases in order — each phase lists its dependencies.
3. When ready to implement, tell the agent:

   > Build MedLens Phase N using `doc/phase-0N-*.md`

4. After each phase, verify acceptance criteria in that phase file before moving on.

## Hackathon Priority (from PRD)

1. Working end-to-end summarization
2. Clean and professional UI
3. Structured output cards
4. Topic relevance check
5. Error handling
6. Session history
7. Self-critique (optional, post-MVP)
8. Local model (optional, post-MVP)
