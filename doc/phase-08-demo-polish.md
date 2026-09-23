# Phase 8 — Demo Polish & Smoke Test

**Status:** Complete  
**Estimated time:** 10 minutes  
**Dependencies:** [Phase 6](./phase-06-error-handling.md) (Phase 7 optional)  
**Priority:** Must have

## Goal

Final pass to ensure the MVP is demo-ready: consistent branding, smooth UX, and verified end-to-end flow with a real medical abstract.

## Scope

### In scope

- Visual consistency pass (spacing, fonts, card alignment)
- Root `README.md` with setup and run instructions
- Smoke test with 2–3 sample abstracts
- Remove debug output (`st.json`, print statements)
- Verify all PRD success criteria (§18)

### Out of scope

- New features
- Performance optimization beyond obvious issues

## Deliverables

| File | Changes |
|------|---------|
| `README.md` | Project description, setup, run, env config |
| `app.py`, `ui/*` | Polish spacing, remove dev artifacts |
| `doc/README.md` | Update phase status table |

## Demo Checklist

Run through this flow live:

1. [ ] Open app — professional header visible
2. [ ] Paste sample abstract (see below)
3. [ ] Select **Medium** length
4. [ ] Enter topic: `Diabetes` (or relevant to sample)
5. [ ] Click **Generate Summary**
6. [ ] Spinner appears, then structured cards render
7. [ ] Key findings show as bullets
8. [ ] Topic relevance card shows with justification
9. [ ] Repeat with **Small** and **Detailed** — output verbosity changes
10. [ ] Test empty abstract → validation message
11. [ ] Test without topic → no relevance card

## Sample Test Abstracts

Keep 1–2 short PubMed-style abstracts in `README.md` or a `samples/` folder for demo repeatability. Example topics:

- Diabetes / metformin RCT
- Cardiovascular / statin observational study

## README.md Template

```markdown
# MedLens

AI-powered medical literature summarization for researchers and clinicians.

## Setup

pip install -r requirements.txt
cp .env.example .env
# Add OPENAI_API_KEY to .env

## Run

streamlit run app.py

## Features

- Paste medical abstracts
- Choose summary length (Small / Medium / Detailed)
- Optional topic relevance check
- Structured card-based output
```

## PRD Success Criteria Verification

| # | Criterion | Phase |
|---|-----------|-------|
| 1 | Paste abstract | 3 |
| 2 | Select length | 3 |
| 3 | Optional topic | 3, 5 |
| 4 | Generate summary | 1 |
| 5 | Structured cards | 4 |
| 6 | Bullet findings | 4 |
| 7 | Topic relevance when provided | 5 |
| 8 | One-line justification | 5 |
| 9 | Error handling | 6 |
| 10 | Live demo ready | 8 |

## Acceptance Criteria

- [ ] All 10 PRD success criteria pass
- [ ] No debug/raw JSON visible in production UI
- [ ] README documents setup and run
- [ ] Demo completes in under 2 minutes without manual fixes
- [ ] App name consistently "MedLens" throughout

## Build Command

```
Build MedLens Phase 8 using doc/phase-08-demo-polish.md
```

## Post-MVP

See [phase-09-future-enhancements.md](./phase-09-future-enhancements.md) for features beyond the hackathon.
