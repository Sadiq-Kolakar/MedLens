LENGTH_PROFILES = {
    "Small": {
        "max_tokens": 550,
        "label": "SMALL",
        "instruction": (
            "Produce a highly concise summary. Strip all secondary detail. "
            "Each section should contain only the single most critical point."
        ),
        "constraints": """
VERBOSITY PROFILE: SMALL (mandatory — output must be noticeably shorter than Medium)
- objective, study_type, population, methodology, conclusion: max 1 short sentence each (≤20 words).
- clinical_or_research_relevance: max 1 short sentence (≤25 words).
- key_findings: exactly 1-2 bullets, each ≤15 words. Include only the primary outcome.
- limitations: 0-1 bullet only; use empty array [] if none are critical.
- title: short phrase only (≤12 words).
- Do NOT repeat information across fields. Be terse.""",
    },
    "Medium": {
        "max_tokens": 1100,
        "label": "MEDIUM",
        "instruction": (
            "Produce a balanced summary with moderate detail. "
            "Cover main methods, population, findings, and conclusion without excessive elaboration."
        ),
        "constraints": """
VERBOSITY PROFILE: MEDIUM (mandatory — noticeably longer than Small, shorter than Detailed)
- objective, study_type, population, methodology, conclusion: 1-2 sentences each (25-45 words total per field).
- clinical_or_research_relevance: 1-2 sentences (≤50 words).
- key_findings: 3-4 bullets covering primary and secondary outcomes.
- limitations: 1-3 bullets when stated in the source.
- title: concise but descriptive (≤20 words).""",
    },
    "Detailed": {
        "max_tokens": 2200,
        "label": "DETAILED",
        "instruction": (
            "Produce a comprehensive summary with rich detail. "
            "Include methodological specifics, sample characteristics, statistics, and nuanced findings."
        ),
        "constraints": """
VERBOSITY PROFILE: DETAILED (mandatory — output must be noticeably longer than Medium)
- objective, study_type, population, methodology, conclusion: 2-4 sentences each (50-90 words per field where information exists).
- clinical_or_research_relevance: 2-3 sentences explaining research/clinical significance (≤90 words).
- key_findings: 5-8 bullets including statistics, effect sizes, and subgroup results when present.
- limitations: up to 5 bullets with specific limitations from the source.
- title: full descriptive title when available.""",
    },
}

JSON_SCHEMA_DESCRIPTION = """{
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
}"""


def get_length_profile(length: str) -> dict:
    return LENGTH_PROFILES.get(length, LENGTH_PROFILES["Medium"])


def build_system_prompt(source_count: int = 1, length: str = "Medium") -> str:
    profile = get_length_profile(length)

    base = f"""You are a medical literature summarization assistant.

Your task is to analyze the provided medical research material and return a structured JSON summary using the exact schema below.

The user selected summary length: {profile["label"]}. This is mandatory — you MUST adjust sentence count, word count, and number of bullet points to match the verbosity profile. Small summaries must be clearly shorter than Medium; Detailed summaries must be clearly longer than Medium.

Rules:
1. Summarize only information present in the provided source material.
2. Do not hallucinate facts or add information not contained in the sources.
3. Preserve important numerical values when relevant (more values in Detailed, fewer in Small).
4. Clearly distinguish study findings from assumptions.
5. Extract the research objective, study type/design, population, methodology, key findings, conclusion, and limitations.
6. Do not make medical diagnoses or recommend treatments.
7. For any field that cannot be determined from the source material, use exactly: "Not specified in the abstract."
8. key_findings and limitations must be arrays of strings (use empty arrays if none are stated).
9. Return valid JSON only, matching the required schema exactly.
10. Always use the same JSON field names and structure — never add or remove fields.

{profile["constraints"]}"""

    if source_count > 1:
        base += """
11. Multiple documents are provided. Synthesize them into ONE unified summary using the exact same JSON schema.
12. Merge related findings across documents, note agreement or disagreement when present, and produce a single cohesive output.
13. For fields spanning multiple studies, summarize the combined evidence (e.g. list distinct study types or populations when they differ)."""

    return base


def build_user_prompt(
    source_text: str,
    length: str,
    topic: str | None = None,
    source_count: int = 1,
) -> str:
    profile = get_length_profile(length)

    if source_count > 1:
        source_description = (
            f"{source_count} medical research documents (pasted text and/or PDF extracts). "
            "Synthesize all documents into one summary using the required JSON template."
        )
    else:
        source_description = "one medical research abstract or document."

    topic_section = ""
    if topic and topic.strip():
        topic_section = f"""
Topic / keyword for relevance check: {topic.strip()}

Perform a topic relevance check using ONLY the provided source material.
- Set topic_relevance.status to exactly "Relevant" or "Not Relevant".
- Set topic_relevance.justification to exactly one concise sentence.
- If relevant, begin the justification with "Relevant because".
- If not relevant, begin the justification with "Not relevant because".
- For multiple documents, base relevance on whether the combined material addresses the topic.
- Do not invent information beyond the source material.
"""
    else:
        topic_section = """
No topic was provided. Leave topic_relevance.status and topic_relevance.justification as empty strings.
"""

    return f"""Summary length: {profile["label"]}
{profile["instruction"]}

Source material: {source_description}
{topic_section}

Required JSON schema (use this exact template every time):
{JSON_SCHEMA_DESCRIPTION}

Source material:
{source_text}"""
