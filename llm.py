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
from prompts import build_system_prompt, build_user_prompt, get_length_profile


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
    source_text: str,
    length: str,
    topic: str | None = None,
    source_count: int = 1,
) -> SummaryResult:
    api_key = get_openai_api_key()
    if not api_key:
        raise SummaryGenerationError(MISSING_API_KEY_MESSAGE)

    client = OpenAI(api_key=api_key)
    length_profile = get_length_profile(length)

    try:
        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            response_format={"type": "json_object"},
            max_tokens=length_profile["max_tokens"],
            messages=[
                {
                    "role": "system",
                    "content": build_system_prompt(source_count, length),
                },
                {
                    "role": "user",
                    "content": build_user_prompt(
                        source_text, length, topic, source_count
                    ),
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
