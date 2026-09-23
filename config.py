import os

from dotenv import load_dotenv

from input_builder import combine_sources

load_dotenv()

DEFAULT_MODEL = "gpt-4o-mini"
MAX_ABSTRACT_CHARS = 15000
MAX_TOTAL_INPUT_CHARS = 50000
MAX_PDF_FILES = 5

EMPTY_INPUT_MESSAGE = "Please enter text or upload at least one PDF with extractable content."
MISSING_API_KEY_MESSAGE = "OpenAI API key is not configured."
GENERATION_FAILED_MESSAGE = "Unable to generate the summary. Please try again."


def get_openai_api_key() -> str | None:
    key = os.getenv("OPENAI_API_KEY")
    if not key or key.strip() == "":
        return None
    return key.strip()


def validate_input(abstract: str, pdf_documents: list[tuple[str, str]]) -> tuple[str | None, str]:
    combined = combine_sources(abstract, pdf_documents)
    if not combined.strip():
        return EMPTY_INPUT_MESSAGE, ""
    if len(combined) > MAX_TOTAL_INPUT_CHARS:
        return (
            f"The combined input exceeds the maximum length of "
            f"{MAX_TOTAL_INPUT_CHARS:,} characters. Please shorten your text or upload fewer PDFs."
        ), ""
    return None, combined
