import streamlit as st

from config import get_openai_api_key
from llm import generate_summary

st.set_page_config(page_title="MedLens", layout="wide")
st.title("MedLens")
st.caption("Medical Literature Summarization")

abstract = st.text_area(
    "Enter Medical Abstract",
    placeholder="Paste a medical research abstract here...",
    height=200,
)
summary_length = st.radio(
    "Summary Length",
    ["Small", "Medium", "Detailed"],
    horizontal=True,
)

if st.button("Generate Summary"):
    if not abstract.strip():
        st.error("Please enter a medical abstract.")
    elif not get_openai_api_key():
        st.error("OpenAI API key is not configured.")
    else:
        with st.spinner("Generating summary..."):
            try:
                result = generate_summary(abstract.strip(), summary_length)
                st.markdown("### Summary")
                st.markdown(result)
            except Exception:
                st.error("Unable to generate the summary. Please try again.")
