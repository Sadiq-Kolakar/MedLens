def combine_sources(abstract: str, pdf_documents: list[tuple[str, str]]) -> str:
    sections: list[str] = []

    if abstract.strip():
        sections.append(f"=== Pasted Text ===\n{abstract.strip()}")

    for filename, text in pdf_documents:
        sections.append(f"=== PDF: {filename} ===\n{text}")

    return "\n\n".join(sections)


def build_source_label(abstract: str, pdf_documents: list[tuple[str, str]]) -> str:
    parts: list[str] = []
    if abstract.strip():
        parts.append("pasted text")
    if pdf_documents:
        count = len(pdf_documents)
        parts.append(f"{count} PDF{'s' if count != 1 else ''}")
    return " + ".join(parts)


def count_sources(abstract: str, pdf_documents: list[tuple[str, str]]) -> int:
    count = len(pdf_documents)
    if abstract.strip():
        count += 1
    return count
