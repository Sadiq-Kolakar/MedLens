import streamlit as st

from config import MISSING_API_KEY_MESSAGE, get_openai_api_key, validate_abstract
from llm import generate_summary
from models import SummaryGenerationError
from ui.components import (
    inject_custom_css,
    render_header,
    render_section_divider,
    show_error,
)
from ui.input_form import render_input_form
from ui.results import render_results

st.set_page_config(page_title="MedLens", page_icon="🔬", layout="wide")
inject_custom_css()
render_header()

form_data = render_input_form()

if form_data.generate_clicked:
    validation_error = validate_abstract(form_data.abstract)
    if validation_error:
        show_error(validation_error)
    elif not get_openai_api_key():
        show_error(MISSING_API_KEY_MESSAGE)
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
            except SummaryGenerationError as e:
                show_error(e.user_message)
