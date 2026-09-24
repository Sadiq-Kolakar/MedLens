# Phase 5 — Topic / Keyword Relevance Check

**Status:** Complete  
**Estimated time:** 10 minutes  
**Dependencies:** [Phase 4](./phase-04-results-ui.md)  
**Priority:** Must have

## Goal

When the user provides an optional topic/keyword, display a Topic Relevance card with status (Relevant / Not Relevant) and a one-line justification. When no topic is provided, hide this section entirely.

## Scope

### In scope

- Pass `topic` from input form through to `llm.generate_summary()` and prompts
- Refine `prompts.py` relevance instructions when topic is present
- Topic Relevance card in `ui/results.py`
- Conditional rendering: only show card when topic was provided

### Out of scope

- Relevance based on external data (only abstract + topic)
- Separate LLM call for relevance (single call is fine)

## Deliverables

| File | Changes |
|------|---------|
| `prompts.py` | Topic-aware relevance instructions |
| `llm.py` | Accept optional `topic` parameter |
| `ui/results.py` | Topic Relevance card with status + justification |
| `app.py` | Pass topic through pipeline |

## Behavior Specification (PRD §5)

### When topic IS provided

Prompt must ask the model to:

- Determine if abstract is relevant to the topic
- Set `topic_relevance.status` to `"Relevant"` or `"Not Relevant"`
- Set `topic_relevance.justification` to one concise sentence

Example outputs:

**Relevant:**
> Relevant because the study directly evaluates the effectiveness of the treatment in patients with Type 2 diabetes.

**Not Relevant:**
> Not relevant because the study focuses on cardiovascular disease and does not directly investigate diabetes.

### When topic is NOT provided

- Do not show Topic Relevance card in UI
- `topic_relevance` can be empty/default in the model response
- Prompt should say: do not perform relevance check

## UI Specification

### Topic Relevance Card

Only visible when `topic` input is non-empty.

```
Topic Relevance

Status: ✅ Relevant   (or ❌ Not Relevant)

Justification:
"The study directly investigates treatment outcomes related to diabetes."
```

- Use emoji or colored badge for status (optional, keep subtle)
- Justification as single line or short paragraph

## Acceptance Criteria

- [ ] With topic "Diabetes" on a diabetes-related abstract → shows Relevant + justification
- [ ] With topic on unrelated abstract → shows Not Relevant + justification
- [ ] With empty topic field → Topic Relevance card is hidden
- [ ] Justification is one line, based only on abstract content
- [ ] No fabricated relevance claims

## Build Command

```
Build MedLens Phase 5 using doc/phase-05-topic-relevance.md
```

## Next Phase

[Phase 6 — Error Handling](./phase-06-error-handling.md)
