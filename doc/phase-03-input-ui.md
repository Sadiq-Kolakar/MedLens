# Phase 3 — Input UI

**Status:** Not started  
**Estimated time:** 15 minutes  
**Dependencies:** [Phase 2](./phase-02-prompt-and-schema.md)  
**Priority:** Must have

## Goal

Build a clean, professional input section that matches the PRD layout — not a generic chatbot. Separate input concerns from results display.

## Scope

### In scope

- `ui/input_form.py` — reusable input form component
- `ui/components.py` — shared styles/helpers (header, section dividers)
- Refactor `app.py` to use input module
- Page config: wide layout, custom title/subtitle
- Input elements per PRD §4 and §10

### Out of scope

- Results cards (Phase 4)
- Full error handling polish (Phase 6) — basic validation only

## Deliverables

| File | Purpose |
|------|---------|
| `ui/input_form.py` | `render_input_form() -> InputFormData` |
| `ui/components.py` | `render_header()`, shared CSS if needed |
| `app.py` | Orchestrates header + input form |

### Suggested dataclass

```python
@dataclass
class InputFormData:
    abstract: str
    summary_length: str  # "Small" | "Medium" | "Detailed"
    topic: str | None
```

## UI Specification

### Header

```
MedLens
Medical Literature Summarization
```

(Note: PRD mockup says "MedSynth AI" — use **MedLens** per project name.)

### Input section

| Element | Spec |
|---------|------|
| Abstract label | "Enter Medical Abstract" |
| Text area | Large (`height=200+`), placeholder explaining paste abstract |
| Summary length | Three options: Small, Medium, Detailed (radio or segmented control) |
| Topic | Optional text input: "Topic / Keyword (Optional)" |
| Button | Primary "Generate Summary" |

### Layout

- Centered or left-aligned content with comfortable spacing
- Clear visual separation between input and results (divider or `st.divider()`)
- Use `st.columns` only if it improves layout; keep simple

### Styling

- `st.set_page_config(page_title="MedLens", page_icon="🔬", layout="wide")`
- Optional minimal custom CSS in `components.py` for typography
- No complex animations

## Acceptance Criteria

- [ ] Header shows app name and subtitle
- [ ] Large text area with correct label and placeholder
- [ ] Three summary length options work and return selected value
- [ ] Optional topic field present (can be empty)
- [ ] Generate button triggers summarization flow
- [ ] Input section looks professional and medical-research oriented
- [ ] Form data passed correctly to `llm.generate_summary()`

## Build Command

```
Build MedLens Phase 3 using doc/phase-03-input-ui.md
```

## Next Phase

[Phase 4 — Results UI](./phase-04-results-ui.md)
