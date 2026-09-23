# Phase 2 — Prompt Engineering & Structured Schema

**Status:** Not started  
**Estimated time:** 20 minutes  
**Dependencies:** [Phase 1](./phase-01-core-summarization.md)  
**Priority:** Must have

## Goal

Replace free-form LLM output with a validated JSON structure matching the PRD schema. Implement domain-specific medical summarization prompts that minimize hallucination.

## Scope

### In scope

- `models.py` — Pydantic models for structured output
- `prompts.py` — System prompt + user prompt builder
- Update `llm.py` to request JSON and parse/validate response
- `topic_relevance` fields in schema (populated only when topic provided; can be empty otherwise)

### Out of scope

- Card-based UI rendering (Phase 4)
- Topic relevance UI section (Phase 5)
- Session history

## Deliverables

| File | Purpose |
|------|---------|
| `models.py` | `SummaryResult`, `TopicRelevance` Pydantic models |
| `prompts.py` | `build_system_prompt()`, `build_user_prompt(abstract, length, topic?)` |
| `llm.py` | Return `SummaryResult` instead of raw string |

## Required JSON Schema

From [Product.md](../Product.md) §8:

```json
{
  "title": "",
  "objective": "",
  "study_type": "",
  "population": "",
  "methodology": "",
  "key_findings": [],
  "clinical_or_research_relevance": "",
  "conclusion": "",
  "limitations": [],
  "topic_relevance": {
    "status": "",
    "justification": ""
  }
}
```

### Pydantic model (suggested)

```python
class TopicRelevance(BaseModel):
    status: str = ""           # "Relevant" | "Not Relevant" | ""
    justification: str = ""

class SummaryResult(BaseModel):
    title: str = "Not specified in the abstract."
    objective: str = "Not specified in the abstract."
    study_type: str = "Not specified in the abstract."
    population: str = "Not specified in the abstract."
    methodology: str = "Not specified in the abstract."
    key_findings: list[str] = []
    clinical_or_research_relevance: str = "Not specified in the abstract."
    conclusion: str = "Not specified in the abstract."
    limitations: list[str] = []
    topic_relevance: TopicRelevance = Field(default_factory=TopicRelevance)
```

## Prompt Requirements (from PRD §7)

The system prompt must instruct the model to:

1. Summarize only information in the abstract
2. Avoid hallucinating facts
3. Preserve important numerical values
4. Distinguish findings from assumptions
5. Extract objective, study type, population, methodology, findings, conclusion, limitations
6. Avoid diagnoses and treatment recommendations
7. Use `"Not specified in the abstract."` for unknown fields
8. Return valid JSON only

### Length-specific instructions

Embed the selected length (Small / Medium / Detailed) in the user prompt with the definitions from PRD §4.

### Topic in prompt

When `topic` is provided, include relevance check instructions in the prompt. When absent, instruct model to leave `topic_relevance` empty.

### JSON mode

Use OpenAI `response_format={"type": "json_object"}` if available, or explicit "respond with JSON only" in the prompt.

## Parsing & Fallback

- Parse JSON from response
- Validate with Pydantic
- On parse failure: attempt basic JSON extraction; if still failing, raise a typed error for Phase 6

## Acceptance Criteria

- [ ] LLM returns parseable JSON matching the schema
- [ ] Pydantic validation succeeds on typical medical abstracts
- [ ] Missing fields default to "Not specified in the abstract." (not fabricated)
- [ ] `key_findings` and `limitations` are lists
- [ ] Length selection changes prompt verbosity
- [ ] `generate_summary()` returns `SummaryResult` object
- [ ] App still displays result (can be `st.json()` temporarily until Phase 4)

## Build Command

```
Build MedLens Phase 2 using doc/phase-02-prompt-and-schema.md
```

## Next Phase

[Phase 3 — Input UI](./phase-03-input-ui.md)
