# MedLens

AI-powered medical literature summarization for researchers and clinicians.

MedLens helps you quickly understand medical research abstracts by generating structured summaries with optional topic relevance checks. It is a **research-assistance tool** — not a medical diagnosis or treatment recommendation system.

## Features

- Paste medical research abstracts
- Choose summary length: **Small**, **Medium**, or **Detailed**
- Optional topic / keyword relevance check
- Structured, card-based output (objective, methods, findings, conclusion, limitations)
- Session history for recent summaries (same browser session)

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
```

Add your OpenAI API key to `.env`:

```
OPENAI_API_KEY=your_key_here
```

## Run

```bash
streamlit run app.py
```

The app opens in your browser at `http://localhost:8501`.

## Demo abstracts

Use these sample abstracts for live demos (also in `samples/`):

### Diabetes / metformin (topic: `Diabetes`)

```
Background: Type 2 diabetes mellitus is a major public health concern. Metformin is widely used as first-line therapy, but long-term cardiovascular outcomes require further evaluation in diverse populations.

Methods: We conducted a multicenter, randomized, double-blind, placebo-controlled trial enrolling 1,842 adults aged 45-70 years with type 2 diabetes and at least one cardiovascular risk factor. Participants were assigned to metformin extended-release (2000 mg daily) or placebo for 36 months. The primary endpoint was a composite of nonfatal myocardial infarction, stroke, or cardiovascular death.

Results: The primary endpoint occurred in 8.4% of the metformin group versus 11.2% of the placebo group (hazard ratio 0.74; 95% CI 0.58-0.94; p=0.01). HbA1c decreased by 0.9% in the metformin group compared with 0.2% in the placebo group. Gastrointestinal adverse events were more common with metformin (18.3% vs 7.1%).

Conclusions: In adults with type 2 diabetes and cardiovascular risk factors, metformin reduced major adverse cardiovascular events over 36 months compared with placebo. Limitations include a relatively short follow-up period and underrepresentation of adults over age 70.
```

### Cardiovascular / statin (topic: `cardiovascular`)

See [samples/cardiovascular_statin.txt](samples/cardiovascular_statin.txt).

## Demo checklist

1. Paste a sample abstract
2. Select **Medium** summary length
3. Enter a topic (e.g. `Diabetes`)
4. Click **Generate Summary**
5. Confirm structured cards and topic relevance appear
6. Try **Small** / **Detailed** to compare verbosity
7. Leave topic empty — relevance card should be hidden
8. Submit empty abstract — validation message should appear

## Documentation

Phased build plan: [doc/README.md](doc/README.md)

## Tech stack

- Python + Streamlit
- OpenAI API
- Pydantic for structured output validation
