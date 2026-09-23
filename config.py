import os

from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL = "gpt-4o-mini"
MAX_ABSTRACT_CHARS = 15000


def get_openai_api_key() -> str | None:
    key = os.getenv("OPENAI_API_KEY")
    if not key or key.strip() == "":
        return None
    return key.strip()
