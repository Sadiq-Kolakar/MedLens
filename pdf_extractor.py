from io import BytesIO

from pypdf import PdfReader

from config import MAX_PDF_FILES
from models import SummaryGenerationError


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages).strip()


def extract_text_from_pdfs(uploaded_files: list) -> tuple[list[tuple[str, str]], list[str]]:
    if not uploaded_files:
        return [], []

    if len(uploaded_files) > MAX_PDF_FILES:
        raise SummaryGenerationError(
            f"A maximum of {MAX_PDF_FILES} PDF files can be uploaded at once."
        )

    documents: list[tuple[str, str]] = []
    empty_files: list[str] = []

    for uploaded_file in uploaded_files:
        try:
            text = extract_text_from_pdf(uploaded_file.read())
        except Exception:
            raise SummaryGenerationError(
                f"Could not read PDF: {uploaded_file.name}. "
                "Please ensure the file is a valid, unencrypted PDF."
            )

        if text:
            documents.append((uploaded_file.name, text))
        else:
            empty_files.append(uploaded_file.name)

    if empty_files and not documents:
        raise SummaryGenerationError(
            "No extractable text found in the uploaded PDF(s). "
            "Scanned image-only PDFs are not supported."
        )

    return documents, empty_files
