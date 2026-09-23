from dataclasses import dataclass

import streamlit as st


@dataclass
class InputFormData:
    abstract: str
    summary_length: str
    topic: str | None
    generate_clicked: bool


def render_input_form() -> InputFormData:
    st.markdown('<div class="medlens-input-section">', unsafe_allow_html=True)

    abstract = st.text_area(
        "Enter Medical Abstract",
        placeholder=(
            "Paste a medical research abstract here. "
            "The summary will be generated from this text only."
        ),
        height=220,
        label_visibility="visible",
    )

    summary_length = st.radio(
        "Summary Length",
        ["Small", "Medium", "Detailed"],
        horizontal=True,
        help="Small: concise · Medium: balanced · Detailed: comprehensive",
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
        summary_length=summary_length,
        topic=topic,
        generate_clicked=generate_clicked,
    )
