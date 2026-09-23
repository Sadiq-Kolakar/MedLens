# Product Requirements Document (PRD)

# Project Name

Medlens

## 1. Product Overview

MedLens is an AI-powered medical literature summarization tool designed to help researchers and clinicians quickly understand medical research abstracts.

The application accepts a medical research abstract from the user, allows the user to choose the desired summary length, and optionally checks whether the abstract is relevant to a user-provided topic or keyword.

The system uses a pretrained Large Language Model through an API with domain-specific prompt engineering to generate a structured, concise, and accurate summary.

The main goal is to reduce the time required to read and understand medical literature while preserving the important information from the original abstract.

This is a hackathon MVP and must prioritize:

- Simplicity
- Reliability
- Fast implementation
- Clean UI
- Working end-to-end flow

Do NOT over-engineer the application.

---

# 2. Problem

Researchers and clinicians face information overload due to the rapidly increasing volume of medical literature.

Finding relevant papers is only one part of the problem. Reading and extracting the important information from multiple medical abstracts can also be time-consuming.

The system should help users quickly understand:

- What the study is about
- What was done
- Who/what was studied
- What the major findings were
- What the study concluded
- What limitations were mentioned

The system should also optionally determine whether an abstract is relevant to a user-provided topic or keyword.

---

# 3. Target Users

Primary users:

- Medical researchers
- Clinicians
- Healthcare students
- Biomedical researchers
- Students studying medical/scientific literature

The application is a research-assistance tool and NOT a medical diagnosis or treatment recommendation system.

---

# 4. MVP Scope

The MVP must contain the following features.

## Feature 1: Medical Abstract Input

The user must be able to enter or paste a medical research abstract.

Input UI:

- Large text area
- Clear label such as "Enter Medical Abstract"
- Placeholder explaining that the user should paste the abstract

The application should validate that the input is not empty.

---

## Feature 2: Summary Length Selection

The user should be able to select one of three summary lengths:

- Small
- Medium
- Detailed

Expected behavior:

### Small

Generate a highly concise summary focusing only on the most important information.

### Medium

Generate a balanced summary containing the main research information and findings.

### Detailed

Generate a more comprehensive summary containing additional methodological and research details while still remaining concise compared to the original abstract.

The selected summary length must be passed to the LLM as part of the prompt.

---

# 5. Feature 3: Topic / Keyword Relevance Check

The user can optionally enter a topic or keyword.

Example:

Topic:
"Diabetes"

The system should analyze whether the abstract is relevant to that topic.

The output must contain:

- Relevant / Not Relevant
- One-line justification

Example:

Relevant:
"Relevant because the study directly evaluates the effectiveness of the treatment in patients with Type 2 diabetes."

Not Relevant:
"Not relevant because the study focuses on cardiovascular disease and does not directly investigate diabetes."

The relevance check should be based only on the provided abstract and topic.

Do not invent information.

If no topic is provided, do not show a relevance result.

---

# 6. AI Summarization

The application should use a pretrained LLM through an API.

Recommended implementation:

- Python
- Streamlit
- OpenAI API
- Environment variables for API key

Do NOT train an LLM from scratch.

Do NOT implement model fine-tuning in the MVP.

Do NOT introduce a vector database unless explicitly required later.

The primary intelligence of the application should come from:

- Domain-specific prompt engineering
- Structured output
- Clear summarization instructions

---

# 7. Medical Summarization Prompt Requirements

The LLM should behave as a medical literature summarization assistant.

The model must:

1. Summarize only the information present in the provided abstract.
2. Avoid hallucinating facts.
3. Preserve important numerical values when relevant.
4. Clearly distinguish study findings from assumptions.
5. Identify the research objective.
6. Identify the study design/type when available.
7. Identify the study population/sample when available.
8. Identify the methodology when available.
9. Extract the major findings.
10. Extract the conclusion.
11. Mention limitations only when explicitly stated or reasonably identifiable from the abstract.
12. Avoid making medical diagnoses.
13. Avoid recommending treatments.
14. Avoid adding information that is not contained in the input.

---

# 8. Required Structured Output

The LLM should return structured data that can easily be displayed by the Streamlit UI.

Preferred schema:

{
"title": "",
"objective": "",
"study_type": "",
"population": "",
"methodology": "",
"key_findings": [],
"clinical_or_research_relevance": "",
"conclusion": "",
"limitations": [],
"topic_relevance": {
"status": "",
"justification": ""
}
}

The application should safely handle missing information.

If a field cannot be determined from the abstract, display something such as:

"Not specified in the abstract."

Do not fabricate missing information.

---

# 9. Output UI

The generated result must NOT be displayed as one large plain-text paragraph.

The result should be presented in clean visual cards/sections.

Recommended structure:

## Summary Header Card

Display:

- "AI Medical Literature Summary"
- Selected summary length
- Optional topic/keyword

## Research Objective Card

Display:

- Study objective

## Study Type Card

Display:

- Study design/type

## Population Card

Display:

- Participants / sample / population

## Methodology Card

Display:

- Main methodology
- Experimental setup if available

## Key Findings Card

Display findings as bullet points.

Example:

- Finding 1
- Finding 2
- Finding 3

## Research / Clinical Relevance Card

Display:

- Why the findings may be relevant to research
- This must be based only on the abstract

## Conclusion Card

Display:

- Main conclusion of the study

## Limitations Card

Display:

- Limitations explicitly mentioned in the abstract

## Topic Relevance Card

Only display this section when a topic/keyword was provided.

Example:

Status:
✅ Relevant

Justification:
"The study directly investigates treatment outcomes related to diabetes."

---

# 10. UI Design Requirements

The interface should be simple, modern, and professional.

The UI should look like a dedicated medical research application rather than a generic chatbot.

Suggested layout:

---

                MedSynth AI
      Medical Literature Summarization

---

Medical Abstract

[ Large Text Area ]

Summary Length

[ Small ] [ Medium ] [ Detailed ]

Topic / Keyword (Optional)

[ Input ]

              [ Generate Summary ]

---

                  RESULTS

[ Research Objective Card ]

[ Study Type Card ] [ Population Card ]

[ Methodology Card ]

[ Key Findings Card ]

[ Research Relevance Card ]

[ Conclusion Card ]

[ Limitations Card ]

[ Topic Relevance Card ]

---

Use readable typography, spacing, clear headings, icons where useful, and responsive layout.

Use Streamlit components where possible.

Do not spend excessive time creating complex animations.

---

# 11. User Flow

The complete user flow should be:

1. User opens the application.
2. User pastes a medical abstract.
3. User selects:
   - Small
   - Medium
   - Detailed
4. User optionally enters a topic/keyword.
5. User clicks "Generate Summary".
6. Application validates the input.
7. Application constructs a domain-specific prompt.
8. Prompt is sent to the LLM API.
9. LLM returns structured summary data.
10. Application parses the response.
11. Application displays the results as formatted cards.
12. If a topic was provided, display relevance status and one-line justification.

---

# 12. Error Handling

The application must gracefully handle:

### Empty abstract

Show:
"Please enter a medical abstract."

### Missing API key

Show:
"OpenAI API key is not configured."

Do not expose the actual API key.

### API failure

Show a user-friendly error message such as:
"Unable to generate the summary. Please try again."

### Invalid LLM response

The application should attempt to safely handle malformed structured output rather than crashing.

### Very large input

Display an appropriate message if the input exceeds the supported limit.

---

# 13. Security Requirements

Never hard-code the API key.

Use a `.env` file for local development.

Example:

OPENAI_API_KEY=your_key_here

Add `.env` to `.gitignore`.

Never print the API key in logs or UI.

Do not commit secrets to GitHub.

---

# 14. Technology Stack

Use the following stack for the MVP:

Frontend/UI:

- Streamlit

Programming Language:

- Python

AI:

- OpenAI API

Configuration:

- python-dotenv

Optional libraries:

- Pydantic for structured data validation
- OpenAI Python SDK

Do NOT add:

- MongoDB
- PostgreSQL
- Authentication
- JWT
- Redis
- Docker
- Vector database
- Complex backend frameworks

unless they become necessary later.

The MVP should ideally run from a single Python application.

---

# 15. Optional Architecture Components

The following components may exist conceptually but should NOT block the MVP:

### Session History

Use Streamlit session state to store:

- Previous abstract
- Summary
- Summary length
- Topic
- Timestamp

No external database is required.

### Self-Critique

A second LLM call may optionally evaluate:

- Factual consistency
- Coverage
- Completeness

However, this feature is secondary and should only be implemented after the basic summarization workflow is working reliably.

### Local Model

A local medical-domain model such as PEGASUS-PubMed may be considered as an optional future/experimental component.

Do NOT spend hackathon time setting up or training a local model if the API-based MVP is not already complete.

---

# 16. Important Hackathon Constraint

This project must be treated as a 2–2.5 hour hackathon MVP.

Priority order:

1. Working end-to-end summarization
2. Clean and professional UI
3. Structured output cards
4. Topic relevance check
5. Error handling
6. Session history
7. Optional self-critique
8. Optional local model

If a feature threatens the stability of the core workflow, skip that feature.

A simple working system is more important than a complex incomplete system.

---

# 17. Non-Goals

The application is NOT intended to:

- Diagnose patients
- Recommend medication
- Recommend treatment plans
- Replace doctors
- Replace peer review
- Generate medical advice
- Train a medical LLM
- Fine-tune an LLM during the hackathon
- Automatically make clinical decisions

The system is strictly a medical literature summarization and relevance-assistance tool.

---

# 18. Success Criteria

The MVP will be considered successful when:

1. A user can paste a medical abstract.
2. A user can select Small, Medium, or Detailed summary.
3. A user can optionally enter a topic/keyword.
4. The system generates a summary successfully.
5. The output is structured into readable sections/cards.
6. Key findings are displayed as bullet points.
7. Topic relevance is displayed when a topic is provided.
8. Relevance contains a one-line justification.
9. The application handles basic errors gracefully.
10. The entire prototype can be demonstrated live without manual intervention.

---

# 19. Future Enhancements

Possible future versions can include:

- PubMed API integration
- Search medical literature directly from the application
- Upload PDF research papers
- Multiple abstract comparison
- Cross-paper synthesis
- Citation and PMID extraction
- Research trend analysis
- Local medical LLM
- Offline inference
- Evaluation benchmark using PubMed datasets
- Summary quality scoring
- Export summary as PDF
- Saved research history

These are future enhancements and should NOT be required for the initial MVP.

---

# 20. Development Principle

Build the smallest complete working version first.

The first milestone must be:

User enters abstract
↓
Selects summary length
↓
Optionally enters topic
↓
Clicks Generate
↓
LLM processes input
↓
Structured JSON result
↓
Beautiful card-based UI

Everything else is secondary.
