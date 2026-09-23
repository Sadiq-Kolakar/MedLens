import json
import re

from openai import APIConnectionError, APIError, APITimeoutError, OpenAI, RateLimitError
from pydantic import ValidationError

from config import (
    DEFAULT_MODEL,
    GENERATION_FAILED_MESSAGE,
    MISSING_API_KEY_MESSAGE,
    get_openai_api_key,
)
from models import SummaryGenerationError, SummaryResult
from prompts import build_system_prompt, build_user_prompt


def _extract_json(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise SummaryGenerationError(GENERATION_FAILED_MESSAGE)
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            raise SummaryGenerationError(GENERATION_FAILED_MESSAGE)


def generate_summary(
    abstract: str,
    length: str,
    topic: str | None = None,
) -> SummaryResult:
    api_key = get_openai_api_key()
    if not api_key:
        raise SummaryGenerationError(MISSING_API_KEY_MESSAGE)

    client = OpenAI(api_key=api_key)

    try:
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
    except (APIError, APIConnectionError, RateLimitError, APITimeoutError):
        raise SummaryGenerationError(GENERATION_FAILED_MESSAGE)

    content = response.choices[0].message.content
    if not content:
        raise SummaryGenerationError(GENERATION_FAILED_MESSAGE)

    data = _extract_json(content)

    try:
        return SummaryResult.model_validate(data)
    except ValidationError:
        raise SummaryGenerationError(GENERATION_FAILED_MESSAGE)
