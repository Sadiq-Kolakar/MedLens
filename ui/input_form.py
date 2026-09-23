from dataclasses import dataclass

import streamlit as st


@dataclass
class InputFormData:
    abstract: str
    uploaded_pdfs: list
    summary_length: str
    topic: str | None
    generate_clicked: bool


def render_input_form() -> InputFormData:
    st.markdown('<div class="medlens-input-section">', unsafe_allow_html=True)

    abstract = st.text_area(
        "Enter Medical Abstract (Optional if uploading PDFs)",
        placeholder=(
            "Paste a medical research abstract here, or upload PDF(s) below. "
            "You can also combine pasted text with multiple PDFs for one unified summary."
        ),
        height=200,
        label_visibility="visible",
    )

    uploaded_pdfs = st.file_uploader(
        "Upload PDF(s)",
        type=["pdf"],
        accept_multiple_files=True,
        help="Upload one or more medical research PDFs. All sources are combined into a single structured summary.",
    )

    if uploaded_pdfs:
        st.caption(f"{len(uploaded_pdfs)} PDF file(s) selected.")

    summary_length = st.radio(
        "Summary Length",
        ["Small", "Medium", "Detailed"],
        index=1,
        horizontal=True,
        help=(
            "Small: 1-2 sentence fields, 1-2 findings · "
            "Medium: balanced detail, 3-4 findings · "
            "Detailed: full detail, 5-8 findings"
        ),
    )

    topic_input = st.text_input(
        "Topic / Keyword (Optional)",
        placeholder='e.g. "Diabetes", "cardiovascular risk", "immunotherapy"',
    )

    generate_clicked = st.button("Generate Summary", type="primary", use_container_width=False)

    st.markdown("</div>", unsafe_allow_html=True)

    topic = topic_input.strip() if topic_input.strip() else None

    return InputFormData(
        abstract=abstract,
        uploaded_pdfs=list(uploaded_pdfs) if uploaded_pdfs else [],
        summary_length=summary_length,
        topic=topic,
        generate_clicked=generate_clicked,
    )
