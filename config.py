import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL = "gpt-4o-mini"
MAX_ABSTRACT_CHARS = 15000

EMPTY_ABSTRACT_MESSAGE = "Please enter a medical abstract."
MISSING_API_KEY_MESSAGE = "OpenAI API key is not configured."
GENERATION_FAILED_MESSAGE = "Unable to generate the summary. Please try again."


def get_openai_api_key() -> str | None:
    key = os.getenv("OPENAI_API_KEY")
    if not key or key.strip() == "":
        return None
    return key.strip()


def validate_abstract(abstract: str) -> str | None:
    if not abstract.strip():
        return EMPTY_ABSTRACT_MESSAGE
    if len(abstract) > MAX_ABSTRACT_CHARS:
        return (
            f"The abstract exceeds the maximum length of {MAX_ABSTRACT_CHARS:,} "
            "characters. Please shorten your input."
        )
    return None
