export const NOT_SPECIFIED = "Not specified in the abstract."
export const MAX_ABSTRACT_CHARS = 15000
export const DEFAULT_MODEL = "gpt-4o-mini"

export type SummaryLength = "Small" | "Medium" | "Detailed"

export type TopicRelevance = {
  status: string
  justification: string
}

export type SummaryResult = {
  title: string
  objective: string
  study_type: string
  population: string
  methodology: string
  sample_size: string
  duration: string
  key_findings: string[]
  clinical_or_research_relevance: string
  conclusion: string
  limitations: string[]
  one_line_takeaway: string
  topic_relevance: TopicRelevance
}

export type SummarizeRequest = {
  abstract: string
  length: SummaryLength
  topic?: string
}

export const sampleAbstract = `Background: Type 2 diabetes mellitus is a major public health concern. Metformin is widely used as first-line therapy, but long-term cardiovascular outcomes require further evaluation in diverse populations.

Methods: We conducted a multicenter, randomized, double-blind, placebo-controlled trial enrolling 1,842 adults aged 45-70 years with type 2 diabetes and at least one cardiovascular risk factor. Participants were assigned to metformin extended-release (2000 mg daily) or placebo for 36 months. The primary endpoint was a composite of nonfatal myocardial infarction, stroke, or cardiovascular death.

Results: The primary endpoint occurred in 8.4% of the metformin group versus 11.2% of the placebo group (hazard ratio 0.74; 95% CI 0.58-0.94; p=0.01). HbA1c decreased by 0.9% in the metformin group compared with 0.2% in the placebo group. Gastrointestinal adverse events were more common with metformin (18.3% vs 7.1%).

Conclusions: In adults with type 2 diabetes and cardiovascular risk factors, metformin reduced major adverse cardiovascular events over 36 months compared with placebo. Limitations include a relatively short follow-up period and underrepresentation of adults over age 70.`

const lengthInstructions: Record<SummaryLength, string> = {
  Small:
    "Generate a highly concise summary focusing only on the most important information. Keep text fields brief and limit key_findings and limitations to the most essential items.",
  Medium:
    "Generate a balanced summary containing the main research information and findings. Include core methodology and findings with moderate detail.",
  Detailed:
    "Generate a more comprehensive summary including additional methodological and research details while still remaining concise compared to the original abstract.",
}

const jsonSchemaDescription = `{
  "title": "",
  "objective": "",
  "study_type": "",
  "population": "",
  "methodology": "",
  "sample_size": "",
  "duration": "",
  "key_findings": [],
  "clinical_or_research_relevance": "",
  "conclusion": "",
  "limitations": [],
  "one_line_takeaway": "",
  "topic_relevance": {
    "status": "",
    "justification": ""
  }
}`

export function buildSystemPrompt() {
  return `You are a medical literature summarization assistant.

Your task is to analyze the provided medical research abstract and return a structured JSON summary.

Rules:
1. Summarize only information present in the abstract.
2. Do not hallucinate facts or add information not contained in the abstract.
3. Preserve important numerical values when relevant.
4. Clearly distinguish study findings from assumptions.
5. Extract the research objective, study type/design, population, methodology, key findings, conclusion, and limitations.
6. Extract sample_size as a short string (e.g. "1,842 adults", "200 patients"). If not stated, use "Not specified in the abstract."
7. Extract duration as a short string (e.g. "36 months", "12 weeks"). If not stated, use "Not specified in the abstract."
8. Generate one_line_takeaway as a single concise sentence capturing the most important result of the study.
9. Do not make medical diagnoses or recommend treatments.
10. For any field that cannot be determined from the abstract, use exactly: "Not specified in the abstract."
11. key_findings and limitations must be arrays of strings (use empty arrays if none are stated).
12. Return valid JSON only, matching the required schema exactly.`
}

export function buildUserPrompt({
  abstract,
  length,
  topic,
}: SummarizeRequest) {
  const topicSection = topic?.trim()
    ? `Topic / keyword for relevance check: ${topic.trim()}

Perform a topic relevance check using ONLY the provided abstract.
- Set topic_relevance.status to exactly "Relevant" or "Not Relevant".
- Set topic_relevance.justification to exactly one concise sentence.
- If relevant, begin the justification with "Relevant because".
- If not relevant, begin the justification with "Not relevant because".
- Base the decision only on whether the abstract directly addresses the topic.
- Do not invent information beyond the abstract.`
    : `No topic was provided. Leave topic_relevance.status and topic_relevance.justification as empty strings.`

  return `Summary length: ${length}
${lengthInstructions[length]}
${topicSection}

Required JSON schema:
${jsonSchemaDescription}

Abstract:
${abstract}`
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : NOT_SPECIFIED
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
      )
    : []
}

export function normalizeSummary(value: unknown): SummaryResult {
  const data = value && typeof value === "object" ? value : {}
  const record = data as Record<string, unknown>
  const relevance =
    record.topic_relevance && typeof record.topic_relevance === "object"
      ? (record.topic_relevance as Record<string, unknown>)
      : {}

  return {
    title: stringValue(record.title),
    objective: stringValue(record.objective),
    study_type: stringValue(record.study_type),
    population: stringValue(record.population),
    methodology: stringValue(record.methodology),
    sample_size: stringValue(record.sample_size),
    duration: stringValue(record.duration),
    key_findings: stringArray(record.key_findings),
    clinical_or_research_relevance: stringValue(
      record.clinical_or_research_relevance
    ),
    conclusion: stringValue(record.conclusion),
    limitations: stringArray(record.limitations),
    one_line_takeaway: stringValue(record.one_line_takeaway),
    topic_relevance: {
      status: typeof relevance.status === "string" ? relevance.status.trim() : "",
      justification:
        typeof relevance.justification === "string"
          ? relevance.justification.trim()
          : "",
    },
  }
}

/** Compute a confidence score (0-100) based on how many fields were populated. */
export function computeConfidence(result: SummaryResult): number {
  const fields: { value: unknown; weight: number }[] = [
    { value: result.title, weight: 1 },
    { value: result.objective, weight: 1.5 },
    { value: result.study_type, weight: 1 },
    { value: result.population, weight: 1 },
    { value: result.methodology, weight: 1.5 },
    { value: result.sample_size, weight: 0.75 },
    { value: result.duration, weight: 0.75 },
    { value: result.key_findings, weight: 2 },
    { value: result.clinical_or_research_relevance, weight: 1 },
    { value: result.conclusion, weight: 1.5 },
    { value: result.limitations, weight: 1 },
    { value: result.one_line_takeaway, weight: 1 },
  ]

  let earned = 0
  let total = 0

  for (const { value, weight } of fields) {
    total += weight
    if (Array.isArray(value)) {
      if (value.length > 0) earned += weight
    } else if (typeof value === "string" && value !== NOT_SPECIFIED && value.trim()) {
      earned += weight
    }
  }

  return total > 0 ? Math.round((earned / total) * 100) : 0
}

/** Extract keyword tags from the result title and topic. */
export function extractTags(result: SummaryResult, topic?: string): string[] {
  const tags: string[] = []

  // Add study type as a tag
  if (result.study_type && result.study_type !== NOT_SPECIFIED) {
    tags.push(result.study_type)
  }

  // Add topic if provided
  if (topic?.trim()) {
    tags.push(topic.trim())
  }

  // Extract meaningful words from title (3+ chars, not common words)
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "are", "was", "were",
    "has", "have", "had", "not", "but", "its", "can", "may", "will", "been",
    "into", "than", "also", "over", "such", "after", "between", "through",
    "about", "study", "research", "analysis", "effect", "effects", "among",
  ])

  if (result.title && result.title !== NOT_SPECIFIED) {
    const words = result.title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()))
      .slice(0, 5)

    for (const word of words) {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      if (!tags.some((t) => t.toLowerCase() === capitalized.toLowerCase())) {
        tags.push(capitalized)
      }
    }
  }

  return tags.slice(0, 7)
}
