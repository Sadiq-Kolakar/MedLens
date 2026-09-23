import streamlit as st

from config import get_openai_api_key
from llm import generate_summary
from ui.components import inject_custom_css, render_header, render_section_divider
from ui.input_form import render_input_form
from ui.results import render_results

st.set_page_config(page_title="MedLens", page_icon="🔬", layout="wide")
inject_custom_css()
render_header()

form_data = render_input_form()

if form_data.generate_clicked:
    if not form_data.abstract.strip():
        st.error("Please enter a medical abstract.")
    elif not get_openai_api_key():
        st.error("OpenAI API key is not configured.")
    else:
        with st.spinner("Generating summary..."):
            try:
                result = generate_summary(
                    form_data.abstract.strip(),
                    form_data.summary_length,
                    form_data.topic,
                )
                render_section_divider("Results")
                render_results(
                    result,
                    form_data.summary_length,
                    form_data.topic,
                )
            except Exception as e:
                message = getattr(e, "user_message", None) or (
                    "Unable to generate the summary. Please try again."
                )
                st.error(message)
