import json
import re

from openai import OpenAI

from config import DEFAULT_MODEL, get_openai_api_key
from models import SummaryGenerationError, SummaryResult
from prompts import build_system_prompt, build_user_prompt


def _extract_json(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise SummaryGenerationError(
                "Unable to generate the summary. Please try again."
            )
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            raise SummaryGenerationError(
                "Unable to generate the summary. Please try again."
            )


def generate_summary(
    abstract: str,
    length: str,
    topic: str | None = None,
) -> SummaryResult:
    api_key = get_openai_api_key()
    if not api_key:
        raise SummaryGenerationError("OpenAI API key is not configured.")

    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": build_system_prompt()},
            {
                "role": "user",
                "content": build_user_prompt(abstract, length, topic),
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        raise SummaryGenerationError("Unable to generate the summary. Please try again.")

    data = _extract_json(content)
    return SummaryResult.model_validate(data)
