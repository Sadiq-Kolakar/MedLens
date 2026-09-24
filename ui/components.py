from contextlib import contextmanager
from typing import Iterator

import streamlit as st


def inject_custom_css() -> None:
    st.markdown(
        """
        <style>
            .medlens-subtitle {
                color: #5f6368;
                font-size: 1.05rem;
                margin-top: -0.5rem;
                margin-bottom: 1.75rem;
            }
            .medlens-input-section {
                padding: 0.5rem 0 1.5rem;
            }
            .medlens-results-section {
                padding-top: 0.5rem;
            }
            div[data-testid="stRadio"] > label {
                font-weight: 500;
            }
            div[data-testid="stVerticalBlockBorderWrapper"] {
                margin-bottom: 0.85rem;
            }
            .medlens-footer {
                color: #6b7280;
                font-size: 0.85rem;
                margin-top: 2.5rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_header() -> None:
    st.title("MedLens")
    st.markdown(
        '<p class="medlens-subtitle">Medical Literature Summarization</p>',
        unsafe_allow_html=True,
    )


def render_section_divider(title: str | None = None) -> None:
    st.divider()
    if title:
        st.markdown(f"### {title}")


def show_error(message: str) -> None:
    st.error(message)


def render_footer() -> None:
    st.markdown(
        """
        <p class="medlens-footer">
        MedLens is a research-assistance tool for medical literature summarization.
        It does not provide medical diagnoses, treatment recommendations, or clinical advice.
        </p>
        """,
        unsafe_allow_html=True,
    )


@contextmanager
def render_card(title: str, icon: str | None = None) -> Iterator[None]:
    label = f"{icon} {title}" if icon else title
    with st.container(border=True):
        st.markdown(f"#### {label}")
        yield
