# Phase 4 — Results UI (Card-Based Display)

**Status:** Complete  
**Estimated time:** 20 minutes  
**Dependencies:** [Phase 3](./phase-03-input-ui.md)  
**Priority:** Must have

## Goal

Display the structured `SummaryResult` as visual cards/sections — not one large plain-text paragraph. This is a core demo differentiator.

## Scope

### In scope

- `ui/results.py` — `render_results(result: SummaryResult, length: str, topic: str | None)`
- Card components for each PRD section
- Summary header card with metadata (length, optional topic)
- Bullet lists for `key_findings` and `limitations`
- Empty-state handling for missing fields

### Out of scope

- Topic relevance card visibility logic beyond basic "show if topic provided" (refined in Phase 5)
- Session history
- Export PDF

## Deliverables

| File | Purpose |
|------|---------|
| `ui/results.py` | All result card rendering |
| `ui/components.py` | `render_card(title, content, icon?)` helper |
| `app.py` | Call `render_results()` after generation |

## Card Layout (from PRD §9)

### Summary Header Card

- Title: "AI Medical Literature Summary"
- Show: selected summary length, optional topic/keyword
- Optionally show extracted `title` from abstract if present

### Content Cards (in order)

1. **Research Objective** — `objective`
2. **Study Type** — `study_type`
3. **Population** — `population`
4. **Methodology** — `methodology`
5. **Key Findings** — `key_findings` as bullet points
6. **Research / Clinical Relevance** — `clinical_or_research_relevance`
7. **Conclusion** — `conclusion`
8. **Limitations** — `limitations` as bullet points
9. **Topic Relevance** — placeholder card (hidden if no topic; fully wired in Phase 5)

### Suggested layout

```
[ Summary Header Card — full width ]

[ Research Objective — full width ]

[ Study Type ] [ Population ]   ← two columns

[ Methodology — full width ]

[ Key Findings — full width ]

[ Research Relevance — full width ]

[ Conclusion — full width ]

[ Limitations — full width ]
```

Use `st.container(border=True)` or custom CSS for card appearance.

## Display Rules

- If field is empty or `"Not specified in the abstract."`, still show the card with that text (or italic muted placeholder)
- `key_findings`: render as `st.markdown` bullet list; if empty, show "Not specified in the abstract."
- `limitations`: same as findings
- Do not render raw JSON to the user

## Acceptance Criteria

- [ ] Results are NOT shown as one plain paragraph
- [ ] Each PRD section has its own visual card/section
- [ ] Key findings displayed as bullet points
- [ ] Limitations displayed as bullet points
- [ ] Header card shows summary length and topic (if provided)
- [ ] Layout is readable with clear headings
- [ ] Works for Small, Medium, and Detailed summaries

## Build Command

```
Build MedLens Phase 4 using doc/phase-04-results-ui.md
```

## Next Phase

[Phase 5 — Topic Relevance](./phase-05-topic-relevance.md)
