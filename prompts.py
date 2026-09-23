LENGTH_INSTRUCTIONS = {
    "Small": (
        "Generate a highly concise summary focusing only on the most important information. "
        "Keep text fields brief and limit key_findings and limitations to the most essential items."
    ),
    "Medium": (
        "Generate a balanced summary containing the main research information and findings. "
        "Include core methodology and findings with moderate detail."
    ),
    "Detailed": (
        "Generate a more comprehensive summary including additional methodological and research "
        "details while still remaining concise compared to the original abstract."
    ),
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


def build_system_prompt() -> str:
    return """You are a medical literature summarization assistant.

Your task is to analyze the provided medical research abstract and return a structured JSON summary.

Rules:
1. Summarize only information present in the abstract.
2. Do not hallucinate facts or add information not contained in the abstract.
3. Preserve important numerical values when relevant.
4. Clearly distinguish study findings from assumptions.
5. Extract the research objective, study type/design, population, methodology, key findings, conclusion, and limitations.
6. Do not make medical diagnoses or recommend treatments.
7. For any field that cannot be determined from the abstract, use exactly: "Not specified in the abstract."
8. key_findings and limitations must be arrays of strings (use empty arrays if none are stated).
9. Return valid JSON only, matching the required schema exactly."""


def build_user_prompt(
    abstract: str,
    length: str,
    topic: str | None = None,
) -> str:
    length_instruction = LENGTH_INSTRUCTIONS.get(length, LENGTH_INSTRUCTIONS["Medium"])

    topic_section = ""
    if topic and topic.strip():
        topic_section = f"""
Topic / keyword for relevance check: {topic.strip()}

Perform a topic relevance check using ONLY the provided abstract.
- Set topic_relevance.status to exactly "Relevant" or "Not Relevant".
- Set topic_relevance.justification to exactly one concise sentence.
- If relevant, begin the justification with "Relevant because" (example: "Relevant because the study directly evaluates the effectiveness of the treatment in patients with Type 2 diabetes.").
- If not relevant, begin the justification with "Not relevant because" (example: "Not relevant because the study focuses on cardiovascular disease and does not directly investigate diabetes.").
- Base the decision only on whether the abstract directly addresses the topic.
- Do not invent information beyond the abstract.
"""
    else:
        topic_section = """
No topic was provided. Leave topic_relevance.status and topic_relevance.justification as empty strings.
"""

    return f"""Summary length: {length}
{length_instruction}
{topic_section}

Required JSON schema:
{JSON_SCHEMA_DESCRIPTION}

Abstract:
{abstract}"""
