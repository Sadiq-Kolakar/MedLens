from openai import OpenAI

from config import DEFAULT_MODEL, get_openai_api_key

LENGTH_INSTRUCTIONS = {
    "Small": (
        "Provide a highly concise summary focusing only on the most important points."
    ),
    "Medium": (
        "Provide a balanced summary containing the main research information and findings."
    ),
    "Detailed": (
        "Provide a comprehensive summary including methodological and research details "
        "while remaining concise compared to the original abstract."
    ),
}

SYSTEM_PROMPT = """You are a medical literature summarization assistant.

Summarize only the information present in the provided abstract.
Do not hallucinate facts or add information not contained in the abstract.
Avoid medical diagnoses and treatment recommendations."""


def generate_summary(abstract: str, length: str) -> str:
    api_key = get_openai_api_key()
    if not api_key:
        raise ValueError("OpenAI API key is not configured.")

    client = OpenAI(api_key=api_key)
    length_instruction = LENGTH_INSTRUCTIONS.get(length, LENGTH_INSTRUCTIONS["Medium"])

    response = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Summary length: {length}\n"
                    f"{length_instruction}\n\n"
                    f"Abstract:\n{abstract}"
                ),
            },
        ],
    )

    return response.choices[0].message.content or ""
