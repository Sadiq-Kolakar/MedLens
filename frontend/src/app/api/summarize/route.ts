import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import OpenAI from "openai"

import {
  DEFAULT_MODEL,
  MAX_ABSTRACT_CHARS,
  buildSystemPrompt,
  buildUserPrompt,
  normalizeSummary,
  type SummarizeRequest,
  type SummaryLength,
} from "@/lib/medlens"

export const runtime = "nodejs"

const validLengths: SummaryLength[] = ["Small", "Medium", "Detailed"]
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
const OPENROUTER_DEFAULT_MODEL = "openai/gpt-4o-mini"

function readRootEnvValue(name: string) {
  try {
    const envPath = resolve(process.cwd(), "..", ".env")
    const envFile = readFileSync(envPath, "utf8")
    const line = envFile
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${name}=`))

    if (!line) {
      return undefined
    }

    return line
      .slice(line.indexOf("=") + 1)
      .trim()
      .replace(/^["']|["']$/g, "")
  } catch {
    return undefined
  }
}

function getOpenAiKey() {
  return (
    process.env.OPENROUTER_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    readRootEnvValue("OPENROUTER_API_KEY") ||
    readRootEnvValue("OPENAI_API_KEY")
  )
}

function getModel(apiKey: string) {
  if (apiKey.startsWith("sk-or-")) {
    return (
      process.env.OPENROUTER_MODEL?.trim() ||
      readRootEnvValue("OPENROUTER_MODEL") ||
      OPENROUTER_DEFAULT_MODEL
    )
  }

  return process.env.OPENAI_MODEL?.trim() || readRootEnvValue("OPENAI_MODEL") || DEFAULT_MODEL
}

function createAiClient(apiKey: string) {
  if (apiKey.startsWith("sk-or-")) {
    return new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MedLens",
      },
    })
  }

  return new OpenAI({ apiKey })
}

function extractJson(content: string) {
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error("Invalid JSON response.")
    }

    return JSON.parse(match[0])
  }
}

function describeOpenAiError(error: unknown, provider: string, model: string) {
  const details =
    error && typeof error === "object"
      ? (error as {
          code?: unknown
          message?: unknown
          status?: unknown
          type?: unknown
        })
      : {}
  const status = typeof details.status === "number" ? details.status : undefined
  const code = typeof details.code === "string" ? details.code : undefined
  const type = typeof details.type === "string" ? details.type : undefined
  const message = typeof details.message === "string" ? details.message : undefined

  console.error("MedLens summary generation failed", {
    code,
    message,
    model,
    provider,
    status,
    type,
  })

  if (status === 401) {
    return `${provider} API key was rejected. Check the key in your .env file.`
  }

  if (status === 403) {
    return `${provider} API access is not allowed for this key or project.`
  }

  if (status === 404) {
    return `The configured model (${model}) is not available for this key.`
  }

  if (status === 429) {
    return `${provider} rate limit or quota was reached. Please try again later.`
  }

  return "Unable to generate the summary. Please try again."
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SummarizeRequest | null

  if (!body || typeof body.abstract !== "string") {
    return Response.json({ error: "Please enter a medical abstract." }, { status: 400 })
  }

  const abstract = body.abstract.trim()
  const length = validLengths.includes(body.length) ? body.length : "Medium"
  const topic = typeof body.topic === "string" ? body.topic.trim() : undefined

  if (!abstract) {
    return Response.json({ error: "Please enter a medical abstract." }, { status: 400 })
  }

  if (abstract.length > MAX_ABSTRACT_CHARS) {
    return Response.json(
      {
        error: `The abstract exceeds the maximum length of ${MAX_ABSTRACT_CHARS.toLocaleString()} characters.`,
      },
      { status: 400 }
    )
  }

  const apiKey = getOpenAiKey()

  if (!apiKey || apiKey === "your_key_here") {
    return Response.json(
      { error: "API key is not configured." },
      { status: 500 }
    )
  }

  const provider = apiKey.startsWith("sk-or-") ? "OpenRouter" : "OpenAI"
  const model = getModel(apiKey)

  try {
    const client = createAiClient(apiKey)
    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: buildUserPrompt({ abstract, length, topic }),
        },
      ],
    })
    const content = response.choices[0]?.message.content

    if (!content) {
      throw new Error("Empty model response.")
    }

    return Response.json({ result: normalizeSummary(extractJson(content)) })
  } catch (error) {
    return Response.json(
      { error: describeOpenAiError(error, provider, model) },
      { status: 500 }
    )
  }
}
