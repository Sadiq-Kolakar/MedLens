# Phase 6 — Error Handling & Input Validation

**Status:** Complete  
**Estimated time:** 15 minutes  
**Dependencies:** [Phase 5](./phase-05-topic-relevance.md)  
**Priority:** Must have

## Goal

Handle all PRD-specified failure modes gracefully so the app never crashes during a live demo.

## Scope

### In scope

- Centralized error display in UI
- All error cases from PRD §12
- Malformed LLM JSON recovery
- Input length limits
- Loading states during API calls

### Out of scope

- Retry logic with exponential backoff (nice-to-have, not required)
- Logging infrastructure

## Error Cases (from PRD §12)

| Condition | User Message | Implementation |
|-----------|--------------|----------------|
| Empty abstract | "Please enter a medical abstract." | Validate before API call; `st.warning` or `st.error` |
| Missing API key | "OpenAI API key is not configured." | Check in `config.py` before call |
| API failure | "Unable to generate the summary. Please try again." | Catch `openai` exceptions in `llm.py` |
| Invalid LLM response | Friendly message + optional retry hint | JSON parse fallback in `llm.py` |
| Very large input | Message about size limit | Check `len(abstract) > MAX_ABSTRACT_CHARS` |

## Deliverables

| File | Changes |
|------|---------|
| `llm.py` | Try/except, `SummaryGenerationError` custom exception |
| `config.py` | `MAX_ABSTRACT_CHARS` enforced |
| `app.py` | `st.spinner("Generating summary...")` during API call |
| `ui/components.py` | `show_error(message)` helper |

## Implementation Notes

### Custom exception

```python
class SummaryGenerationError(Exception):
    def __init__(self, user_message: str):
        self.user_message = user_message
```

### Malformed JSON handling

1. Try `json.loads()` on response
2. If fails, try extracting JSON between `{` and `}`
3. If still fails, raise `SummaryGenerationError("Unable to generate the summary. Please try again.")`
4. Never show raw stack traces to user

### Security

- Never log or display `OPENAI_API_KEY`
- Never include API error details that leak key or internal paths

### Loading state

```python
with st.spinner("Generating summary..."):
    result = generate_summary(...)
```

Disable double-submit if practical (button state or session flag).

## Acceptance Criteria

- [ ] Empty abstract → validation message, no API call
- [ ] Missing `.env` key → clear configuration message
- [ ] Simulated API error → friendly message, app stays up
- [ ] Oversized abstract → limit message before API call
- [ ] Malformed JSON from LLM → handled without crash
- [ ] Spinner shows during generation
- [ ] No API key visible in UI or error messages

## Build Command

```
Build MedLens Phase 6 using doc/phase-06-error-handling.md
```

## Next Phase

[Phase 7 — Session History](./phase-07-session-history.md) (optional) or [Phase 8 — Demo Polish](./phase-08-demo-polish.md)
