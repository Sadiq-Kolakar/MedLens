import streamlit as st

from models import NOT_SPECIFIED, SummaryResult
from ui.components import render_card


def _display_text(value: str) -> None:
    text = value.strip() if value and value.strip() else NOT_SPECIFIED
    if text == NOT_SPECIFIED:
        st.markdown(f"*{text}*")
    else:
        st.markdown(text)


def _display_bullets(items: list[str]) -> None:
    cleaned = [item.strip() for item in items if item and item.strip()]
    if not cleaned:
        st.markdown(f"*{NOT_SPECIFIED}*")
        return
    st.markdown("\n".join(f"- {item}" for item in cleaned))


def render_results(
    result: SummaryResult,
    length: str,
    topic: str | None = None,
) -> None:
    with render_card("AI Medical Literature Summary", "📋"):
        if result.title and result.title != NOT_SPECIFIED:
            st.markdown(f"**{result.title}**")
        st.markdown(f"**Summary length:** {length}")
        if topic:
            st.markdown(f"**Topic / keyword:** {topic}")

    with render_card("Research Objective", "🎯"):
        _display_text(result.objective)

    col_study, col_population = st.columns(2)
    with col_study:
        with render_card("Study Type", "🔬"):
            _display_text(result.study_type)
    with col_population:
        with render_card("Population", "👥"):
            _display_text(result.population)

    with render_card("Methodology", "⚗️"):
        _display_text(result.methodology)

    with render_card("Key Findings", "📊"):
        _display_bullets(result.key_findings)

    with render_card("Research / Clinical Relevance", "💡"):
        _display_text(result.clinical_or_research_relevance)

    with render_card("Conclusion", "✅"):
        _display_text(result.conclusion)

    with render_card("Limitations", "⚠️"):
        _display_bullets(result.limitations)

    if topic:
        with render_card("Topic Relevance", "🔍"):
            relevance = result.topic_relevance
            if relevance.status:
                st.markdown(f"**Status:** {relevance.status}")
            if relevance.justification:
                st.markdown(f"**Justification:** {relevance.justification}")
            if not relevance.status and not relevance.justification:
                st.markdown(f"*{NOT_SPECIFIED}*")
