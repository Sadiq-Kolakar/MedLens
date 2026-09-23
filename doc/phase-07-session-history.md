# Phase 7 — Session History (Optional)

**Status:** Not started  
**Estimated time:** 10 minutes  
**Dependencies:** [Phase 6](./phase-06-error-handling.md)  
**Priority:** Optional (PRD priority #6)

## Goal

Store recent summarization runs in Streamlit session state so users can revisit prior results within the same browser session. No external database.

## Scope

### In scope

- `st.session_state` storage for history entries
- Sidebar or expandable section listing past summaries
- Each entry: timestamp, truncated abstract, length, topic, link to view
- Ability to reload a past result into the results view

### Out of scope

- Persistent storage across browser restarts
- User authentication
- Export history

## Deliverables

| File | Changes |
|------|---------|
| `app.py` | Initialize `session_state.history` list |
| `ui/history.py` (new) | `render_history_sidebar()`, `add_to_history()` |
| `models.py` | Optional `HistoryEntry` dataclass |

### Suggested HistoryEntry

```python
@dataclass
class HistoryEntry:
    timestamp: datetime
    abstract_preview: str      # first 100 chars
    summary_length: str
    topic: str | None
    result: SummaryResult
```

## UI Specification

### Sidebar: "Recent Summaries"

- List up to 5–10 most recent entries (newest first)
- Each item shows: time, length badge, topic (if any), abstract preview
- Click/select loads that result into the main results area

### Session state init

```python
if "history" not in st.session_state:
    st.session_state.history = []
```

Add to history after each successful generation.

## Acceptance Criteria

- [ ] Successful summaries are saved to session state
- [ ] History visible in sidebar or dedicated panel
- [ ] User can view a previous result without re-calling API
- [ ] History clears when browser session ends (expected Streamlit behavior)
- [ ] Does not break core generate flow if history is empty

## Skip Criteria

Skip this phase if:

- Running low on hackathon time
- Core demo (Phases 0–6 + 8) is not yet stable

## Build Command

```
Build MedLens Phase 7 using doc/phase-07-session-history.md
```

## Next Phase

[Phase 8 — Demo Polish](./phase-08-demo-polish.md)
