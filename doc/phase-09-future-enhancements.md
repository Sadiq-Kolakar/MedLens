# Phase 9 — Future Enhancements (Reference Only)

**Status:** Not for hackathon MVP  
**Dependencies:** Completed MVP (Phases 0–8)  
**Priority:** Post-MVP

## Purpose

This document catalogs features from [Product.md](../Product.md) §15 and §19 that are explicitly **out of scope** for the hackathon. Do not build these unless the user requests a follow-up phase.

## Optional MVP-Adjacent (from PRD §15)

| Feature | Description | Effort |
|---------|-------------|--------|
| Self-critique | Second LLM call to evaluate factual consistency, coverage, completeness | Medium |
| Local model | PEGASUS-PubMed or similar for offline inference | High |

## Future Product Features (from PRD §19)

| Feature | Description |
|---------|-------------|
| PubMed API integration | Search literature directly from the app |
| PDF upload | Summarize full research papers |
| Multi-abstract comparison | Side-by-side analysis |
| Cross-paper synthesis | Combine findings across papers |
| Citation / PMID extraction | Pull metadata from abstracts |
| Research trend analysis | Aggregate patterns over corpora |
| Evaluation benchmark | PubMed dataset quality scoring |
| Summary quality scoring | Automated quality metrics |
| Export as PDF | Download formatted summary |
| Saved research history | Persistent DB-backed history |

## Suggested Post-MVP Phases (if continuing)

| Phase | Name | Notes |
|-------|------|-------|
| 9a | PubMed Search | API integration, search UI |
| 9b | PDF Ingestion | Upload + text extraction |
| 9c | Multi-Abstract Compare | Batch input, comparison view |
| 9d | Export & Persistence | PDF export, SQLite history |
| 9e | Self-Critique Loop | Second-pass quality check |
| 9f | Local Model | Experimental offline path |

## Technology Additions (only when needed)

These were explicitly excluded from MVP per PRD §14:

- MongoDB / PostgreSQL
- Authentication / JWT
- Redis
- Docker
- Vector database
- Complex backend frameworks

Introduce only when a specific future phase requires them.

## Build Command

Only use when explicitly requested:

```
Build MedLens Phase 9a (PubMed Search) — see doc/phase-09-future-enhancements.md
```
