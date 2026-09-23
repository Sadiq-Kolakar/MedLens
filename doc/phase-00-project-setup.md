# Phase 0 — Project Setup

**Status:** Complete  
**Estimated time:** 10 minutes  
**Dependencies:** None  
**Priority:** Must have

## Goal

Bootstrap the MedLens repository with Python dependencies, environment configuration, and a minimal runnable Streamlit shell so later phases can build on a consistent foundation.

## Scope

### In scope

- `requirements.txt` with pinned or minimum versions
- `.env.example` with `OPENAI_API_KEY` placeholder
- `.gitignore` (`.env`, `__pycache__`, `.venv`, etc.)
- `config.py` — load env via `python-dotenv`
- Minimal `app.py` — Streamlit app that runs and shows a title placeholder
- Optional: `README.md` at repo root with setup/run instructions (brief)

### Out of scope

- OpenAI API calls
- Summarization logic
- Styled UI beyond a basic title

## Deliverables

| File | Purpose |
|------|---------|
| `requirements.txt` | `streamlit`, `openai`, `python-dotenv`, `pydantic` |
| `.env.example` | Template for API key |
| `.gitignore` | Exclude secrets and Python artifacts |
| `config.py` | `get_openai_api_key()`, constants (model name, max input length) |
| `app.py` | `streamlit run app.py` works; shows "MedLens" header |

## Implementation Notes

### requirements.txt (suggested)

```
streamlit>=1.28.0
openai>=1.0.0
python-dotenv>=1.0.0
pydantic>=2.0.0
```

### config.py

- Load `.env` on import
- Expose `OPENAI_API_KEY` (return `None` if missing — do not crash at import)
- Define constants:
  - `DEFAULT_MODEL` (e.g. `gpt-4o-mini` or `gpt-3.5-turbo` for speed/cost)
  - `MAX_ABSTRACT_CHARS` (e.g. 15000)

### app.py (minimal)

```python
import streamlit as st

st.set_page_config(page_title="MedLens", layout="wide")
st.title("MedLens")
st.caption("Medical Literature Summarization")
```

## Acceptance Criteria

- [ ] `pip install -r requirements.txt` succeeds
- [ ] `streamlit run app.py` opens without errors
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` documents `OPENAI_API_KEY`
- [ ] `config.py` loads env vars without exposing the key in UI/logs

## Build Command

```
Build MedLens Phase 0 using doc/phase-00-project-setup.md
```

## Next Phase

[Phase 1 — Core Summarization](./phase-01-core-summarization.md)
