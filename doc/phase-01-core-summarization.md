# Phase 1 — Core Summarization (End-to-End)

**Status:** Not started  
**Estimated time:** 25 minutes  
**Dependencies:** [Phase 0](./phase-00-project-setup.md)  
**Priority:** Must have (highest)

## Goal

Prove the full pipeline works: user pastes abstract → clicks generate → OpenAI returns a summary → displayed in the app. Output can be plain text or rough JSON at this stage; polish comes in Phase 2.

## Scope

### In scope

- `llm.py` — OpenAI client wrapper with a single `generate_summary(abstract, length)` function
- Wire `app.py` with:
  - Text area for abstract
  - Summary length selector (Small / Medium / Detailed)
  - "Generate Summary" button
  - Display raw or semi-structured result
- Basic empty-input check ("Please enter a medical abstract.")
- Missing API key check ("OpenAI API key is not configured.")

### Out of scope

- Full JSON schema / Pydantic validation (Phase 2)
- Card-based UI (Phase 4)
- Topic relevance (Phase 5)
- Advanced error handling (Phase 6)

## Deliverables

| File | Purpose |
|------|---------|
| `llm.py` | `generate_summary(abstract: str, length: str) -> str` |
| `app.py` | Minimal form + button + result display |

## Implementation Notes

### llm.py

```python
from openai import OpenAI
from config import get_openai_api_key, DEFAULT_MODEL

def generate_summary(abstract: str, length: str) -> str:
    client = OpenAI(api_key=get_openai_api_key())
    # Build a simple system + user prompt mentioning length
    # Return response content as string
```

- Use chat completions API
- Pass `length` ("small", "medium", "detailed") into the user prompt with brief instructions
- Keep prompts simple here; Phase 2 replaces them

### app.py flow

1. Text area: "Enter Medical Abstract"
2. Radio or selectbox: Small / Medium / Detailed
3. Button: "Generate Summary"
4. On click:
   - Validate non-empty abstract
   - Check API key exists
   - Call `generate_summary()`
   - Show result in `st.write()` or `st.markdown()`

### Length → prompt hints (temporary)

| Length | Instruction |
|--------|-------------|
| Small | Highly concise; only most important points |
| Medium | Balanced; main findings and methods |
| Detailed | Comprehensive; include methodology details |

## Acceptance Criteria

- [ ] User can paste an abstract and click Generate
- [ ] OpenAI API is called with the abstract and selected length
- [ ] A summary appears on screen (any readable format)
- [ ] Empty abstract shows validation message
- [ ] Missing API key shows friendly message (no key exposed)
- [ ] App does not crash on a successful API response

## Build Command

```
Build MedLens Phase 1 using doc/phase-01-core-summarization.md
```

## Next Phase

[Phase 2 — Prompt & Schema](./phase-02-prompt-and-schema.md)
