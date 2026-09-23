from contextlib import contextmanager
from typing import Iterator

import streamlit as st


def inject_custom_css() -> None:
    st.markdown(
        """
        <style>
            .medlens-header {
                margin-bottom: 0.25rem;
            }
            .medlens-subtitle {
                color: #5f6368;
                font-size: 1.05rem;
                margin-bottom: 1.5rem;
            }
            .medlens-input-section {
                padding: 1.25rem 0;
            }
            div[data-testid="stRadio"] > label {
                font-weight: 500;
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


@contextmanager
def render_card(title: str, icon: str | None = None) -> Iterator[None]:
    label = f"{icon} {title}" if icon else title
    with st.container(border=True):
        st.markdown(f"#### {label}")
        yield
