"use client"

import {
  AlertCircle,
  BookOpenText,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  Download,
  FileText,
  FlaskConical,
  History,
  Info,
  Lightbulb,
  Loader2,
  Microscope,
  Search,
  Sparkles,
  Target,
  Upload,
  Users,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  MAX_ABSTRACT_CHARS,
  NOT_SPECIFIED,
  computeConfidence,
  extractTags,
  sampleAbstract,
  type SummaryLength,
  type SummaryResult,
} from "@/lib/medlens"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

/* ─── types ──────────────────────────────────────────────── */

type HistoryEntry = {
  id: string
  createdAt: string
  abstractPreview: string
  length: SummaryLength
  topic: string
  result: SummaryResult
}

type InputMode = "text" | "pdf"

const historyKey = "medlens-history"
const lengths: SummaryLength[] = ["Small", "Medium", "Detailed"]

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`
}

function displayText(value: string) {
  return value?.trim() || NOT_SPECIFIED
}

/* ─── PDF Text Extraction (client-side via pdfjs-dist) ─── */

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist")

  // Set worker source to bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString()

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items
      .filter((item) => "str" in item)
      .map((item) => (item as { str: string }).str)
    pageTexts.push(strings.join(" "))
  }

  return pageTexts.join("\n\n")
}

/* ─── PDF Export (jsPDF) ──────────────────────────────── */

async function exportResultAsPdf(result: SummaryResult, topic?: string) {
  const { default: jsPDF } = await import("jspdf")
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPage(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      y = margin
    }
  }

  function addHeading(text: string) {
    checkPage(12)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(text, margin, y)
    y += 8
  }

  function addSubHeading(text: string) {
    checkPage(10)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(text, margin, y)
    y += 7
  }

  function addBody(text: string) {
    checkPage(8)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const lines = doc.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      checkPage(6)
      doc.text(line, margin, y)
      y += 5
    }
    y += 3
  }

  function addBulletList(items: string[]) {
    for (const item of items) {
      checkPage(8)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 5)
      for (const line of lines) {
        checkPage(6)
        doc.text(line, margin + 3, y)
        y += 5
      }
    }
    y += 3
  }

  // Title
  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(30, 64, 175)
  const titleLines = doc.splitTextToSize(result.title, contentWidth)
  for (const line of titleLines) {
    checkPage(10)
    doc.text(line, margin, y)
    y += 9
  }
  doc.setTextColor(0, 0, 0)
  y += 4

  // Metadata line
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(100, 100, 100)
  const meta = [
    result.study_type !== NOT_SPECIFIED ? result.study_type : null,
    result.sample_size !== NOT_SPECIFIED ? `Sample: ${result.sample_size}` : null,
    result.duration !== NOT_SPECIFIED ? `Duration: ${result.duration}` : null,
    topic ? `Topic: ${topic}` : null,
  ]
    .filter(Boolean)
    .join("  |  ")
  if (meta) {
    doc.text(meta, margin, y)
    y += 6
  }
  doc.setTextColor(0, 0, 0)

  // Separator line
  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Sections
  addSubHeading("Objective")
  addBody(result.objective)

  addSubHeading("Methodology")
  addBody(result.methodology)

  if (result.key_findings.length > 0) {
    addSubHeading("Key Findings")
    addBulletList(result.key_findings)
  }

  addSubHeading("Clinical / Research Relevance")
  addBody(result.clinical_or_research_relevance)

  addSubHeading("Conclusion")
  addBody(result.conclusion)

  if (result.limitations.length > 0) {
    addSubHeading("Limitations")
    addBulletList(result.limitations)
  }

  if (result.one_line_takeaway !== NOT_SPECIFIED) {
    addSubHeading("One-Line Takeaway")
    addBody(result.one_line_takeaway)
  }

  if (topic && result.topic_relevance.status) {
    addSubHeading("Topic Relevance")
    addBody(`${result.topic_relevance.status}: ${result.topic_relevance.justification}`)
  }

  // Footer
  y += 5
  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6
  doc.setFontSize(8)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(120, 120, 120)
  doc.text(`Generated by MedLens AI — ${new Date().toLocaleDateString()}`, margin, y)

  const safeTitle = result.title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 50)
  doc.save(`MedLens_${safeTitle || "summary"}.pdf`)
}

/* ─── Confidence Gauge SVG ─────────────────────────────── */

function ConfidenceGauge({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 80
      ? "var(--confidence-high)"
      : score >= 50
        ? "var(--confidence-medium)"
        : "var(--confidence-low)"

  const label =
    score >= 80 ? "High confidence" : score >= 50 ? "Medium confidence" : "Low confidence"

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg className="confidence-ring" height="100" viewBox="0 0 100 100" width="100">
          <circle className="confidence-ring-track" cx="50" cy="50" r={radius} />
          <circle
            className="confidence-ring-fill"
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-2xl font-heading">{score}%</span>
      </div>
      <span className="text-sm font-heading">{label}</span>
      <span className="text-xs text-muted-foreground">
        Based on information present in the abstract.
      </span>
    </div>
  )
}

/* ─── Key Information Checklist ────────────────────────── */

function KeyInfoChecklist({ result }: { result: SummaryResult }) {
  const checks = [
    { label: "Objective", ok: result.objective !== NOT_SPECIFIED },
    { label: "Methodology", ok: result.methodology !== NOT_SPECIFIED },
    {
      label: "Results",
      ok: result.key_findings.length > 0,
    },
    { label: "Limitations", ok: result.limitations.length > 0 },
    { label: "Conclusion", ok: result.conclusion !== NOT_SPECIFIED },
  ]

  return (
    <div className="grid gap-2">
      {checks.map((c) => (
        <label className="flex items-center gap-2 text-sm" key={c.label}>
          {c.ok ? (
            <span className="flex size-5 items-center justify-center border-2 border-border bg-[#c8e6c9]">
              <Check className="size-3.5" />
            </span>
          ) : (
            <span className="flex size-5 items-center justify-center border-2 border-border bg-muted">
              <X className="size-3.5 text-muted-foreground" />
            </span>
          )}
          <span className={c.ok ? "font-medium" : "text-muted-foreground"}>{c.label}</span>
        </label>
      ))}
    </div>
  )
}

/* ─── Tags Panel ───────────────────────────────────────── */

const tagColors = ["tag-green", "tag-yellow", "tag-pink", "tag-blue", "tag-purple"]

function TagsPanel({ result, topic }: { result: SummaryResult; topic?: string }) {
  const tags = extractTags(result, topic)
  if (!tags.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          className={`inline-block border-2 px-2.5 py-1 text-xs font-heading ${tagColors[i % tagColors.length]}`}
          key={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

/* ─── Colored Result Card ──────────────────────────────── */

function ResultCard({
  title,
  icon: Icon,
  colorClass,
  children,
}: {
  title: string
  icon: typeof Target
  colorClass?: string
  children: React.ReactNode
}) {
  return (
    <Card className={`border-2 border-border shadow-shadow ${colorClass ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-5 shrink-0" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6">{children}</CardContent>
    </Card>
  )
}

/* ─── Small Info Card (metadata row) ───────────────────── */

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: string
}) {
  const displayed = displayText(value)
  return (
    <Card className="border-2 border-border shadow-shadow card-meta">
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="text-xs font-heading uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-sm font-medium">{displayed}</p>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Bullet List ──────────────────────────────────────── */

function BulletList({ items }: { items: string[] }) {
  const cleaned = items.filter((item) => item.trim())

  if (!cleaned.length) {
    return <p className="text-muted-foreground">{NOT_SPECIFIED}</p>
  }

  return (
    <ul className="grid gap-2">
      {cleaned.map((item) => (
        <li className="flex gap-2" key={item}>
          <span className="mt-2 size-2 shrink-0 rounded-full bg-foreground ring-2 ring-border" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ─── Right Side Panel ─────────────────────────────────── */

function RightPanel({
  result,
  topic,
}: {
  result: SummaryResult
  topic?: string
}) {
  const confidence = computeConfidence(result)
  const [exporting, setExporting] = useState(false)

  async function handleExportPdf() {
    setExporting(true)
    try {
      await exportResultAsPdf(result, topic)
    } catch (e) {
      console.error("PDF export failed:", e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="grid content-start gap-4">
      {/* Confidence Score */}
      <Card className="border-2 border-border shadow-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-5" />
            Confidence Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfidenceGauge score={confidence} />
        </CardContent>
      </Card>

      {/* Key Information Extracted */}
      <Card className="border-2 border-border shadow-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Information Extracted</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyInfoChecklist result={result} />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="border-2 border-border shadow-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button
            className="w-full justify-start"
            disabled={exporting}
            onClick={handleExportPdf}
            size="sm"
            type="button"
            variant="neutral"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Export as PDF
          </Button>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="border-2 border-border shadow-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagsPanel result={result} topic={topic} />
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Results View (structured card layout) ────────────── */

function ResultsView({
  result,
  length,
  topic,
}: {
  result: SummaryResult
  length: SummaryLength
  topic: string
}) {
  const relevance = result.topic_relevance
  const showRelevance = topic.trim() && (relevance.status || relevance.justification)
  const [copied, setCopied] = useState(false)

  const analyzedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  function handleCopy() {
    const text = [
      `Title: ${result.title}`,
      `Objective: ${result.objective}`,
      `Study Type: ${result.study_type}`,
      `Population: ${result.population}`,
      `Methodology: ${result.methodology}`,
      `Sample Size: ${result.sample_size}`,
      `Duration: ${result.duration}`,
      `Key Findings:\n${result.key_findings.map((f) => `  • ${f}`).join("\n")}`,
      `Clinical Relevance: ${result.clinical_or_research_relevance}`,
      `Conclusion: ${result.conclusion}`,
      `Limitations:\n${result.limitations.map((l) => `  • ${l}`).join("\n")}`,
      `Takeaway: ${result.one_line_takeaway}`,
    ].join("\n\n")

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_280px]">
      {/* ── Main results ── */}
      <div className="grid gap-4">
        {/* Title header card */}
        <Card className="border-2 border-border bg-main shadow-shadow">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl leading-tight">
                  {displayText(result.title)}
                </CardTitle>
                <CardDescription className="text-foreground">
                  {displayText(result.study_type)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-2 border-border bg-secondary-background text-foreground">
                  {length}
                </Badge>
                {topic ? (
                  <Badge className="border-2 border-border bg-secondary-background text-foreground">
                    {topic}
                  </Badge>
                ) : null}
                <Button onClick={handleCopy} size="sm" type="button" variant="neutral">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy All"}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-foreground/70">
              <Calendar className="size-3.5" />
              Analyzed on {analyzedDate}
            </div>
          </CardHeader>
        </Card>

        {/* 3-column: Summary, Key Findings, Clinical Relevance */}
        <div className="grid gap-4 md:grid-cols-3">
          <ResultCard colorClass="card-summary" icon={BookOpenText} title="Summary">
            {displayText(result.objective)}
          </ResultCard>

          <ResultCard colorClass="card-findings" icon={ClipboardList} title="Key Findings">
            <BulletList items={result.key_findings} />
          </ResultCard>

          <ResultCard colorClass="card-relevance" icon={Sparkles} title="Clinical Relevance">
            {displayText(result.clinical_or_research_relevance)}
          </ResultCard>
        </div>

        {/* Metadata row: Study Type, Sample Size, Duration */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaCard icon={Microscope} label="Study Type" value={result.study_type} />
          <MetaCard icon={Users} label="Sample Size" value={result.sample_size} />
          <MetaCard icon={Clock} label="Duration" value={result.duration} />
        </div>

        {/* Bottom row: Limitations + One-Line Takeaway */}
        <div className="grid gap-4 md:grid-cols-2">
          <ResultCard colorClass="card-limitations" icon={AlertCircle} title="Limitations">
            <BulletList items={result.limitations} />
          </ResultCard>

          <ResultCard colorClass="card-takeaway" icon={Lightbulb} title="One-Line Takeaway">
            {displayText(result.one_line_takeaway)}
          </ResultCard>
        </div>

        {/* Methodology (full width) */}
        <ResultCard icon={FlaskConical} title="Methodology">
          {displayText(result.methodology)}
        </ResultCard>

        {/* Conclusion */}
        <ResultCard colorClass="card-conclusion" icon={Target} title="Conclusion">
          {displayText(result.conclusion)}
        </ResultCard>

        {/* Topic Relevance (conditional) */}
        {showRelevance ? (
          <ResultCard icon={Search} title="Topic Relevance">
            <div className="space-y-2">
              {relevance.status ? (
                <Badge className="border-2 border-border bg-main text-main-foreground">
                  {relevance.status}
                </Badge>
              ) : null}
              {relevance.justification ? <p>{relevance.justification}</p> : null}
            </div>
          </ResultCard>
        ) : null}
      </div>

      {/* ── Right Panel ── */}
      <RightPanel result={result} topic={topic} />
    </section>
  )
}

/* ─── Main App ─────────────────────────────────────────── */

export function MedLensApp() {
  const [abstract, setAbstract] = useState("")
  const [length, setLength] = useState<SummaryLength>("Medium")
  const [topic, setTopic] = useState("")
  const [inputMode, setInputMode] = useState<InputMode>("text")
  const [pdfFileName, setPdfFileName] = useState("")
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") {
      return []
    }

    const rawHistory = sessionStorage.getItem(historyKey)

    if (!rawHistory) {
      return []
    }

    try {
      return JSON.parse(rawHistory) as HistoryEntry[]
    } catch {
      sessionStorage.removeItem(historyKey)
      return []
    }
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    sessionStorage.setItem(historyKey, JSON.stringify(history))
  }, [history])

  const selectedEntry = useMemo(
    () => history.find((entry) => entry.id === selectedId) ?? history[0],
    [history, selectedId]
  )

  /* ── PDF file handler ── */
  const handlePdfUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setPdfError("Please upload a PDF file.")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setPdfError("PDF file is too large (max 20MB).")
      return
    }

    setPdfLoading(true)
    setPdfError("")
    setPdfFileName(file.name)

    try {
      const text = await extractTextFromPdf(file)
      if (!text.trim()) {
        setPdfError("Could not extract text from this PDF. It may be scanned or image-based.")
        return
      }
      setAbstract(text.trim().slice(0, MAX_ABSTRACT_CHARS))
      setPdfError("")
    } catch (err) {
      console.error("PDF extraction failed:", err)
      setPdfError("Failed to read the PDF. Please try a different file.")
    } finally {
      setPdfLoading(false)
    }
  }, [])

  /* ── Drag & Drop handlers ── */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handlePdfUpload(file)
    },
    [handlePdfUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (!abstract.trim()) {
      setError("Please enter a medical abstract or upload a PDF.")
      return
    }

    if (abstract.length > MAX_ABSTRACT_CHARS) {
      setError(`The abstract exceeds ${MAX_ABSTRACT_CHARS.toLocaleString()} characters.`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstract: abstract.trim(),
          length,
          topic: topic.trim() || undefined,
        }),
      })
      const payload = (await response.json()) as
        | { result: SummaryResult }
        | { error: string }

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Unable to generate summary.")
      }

      const entry: HistoryEntry = {
        id: makeId(),
        createdAt: new Date().toLocaleString([], {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        abstractPreview: abstract.trim().slice(0, 96),
        length,
        topic: topic.trim(),
        result: payload.result,
      }

      setHistory((current) => [entry, ...current].slice(0, 10))
      setSelectedId(entry.id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate summary.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-4 py-5 lg:px-6">
        {/* ─── Collapsible Sidebar ─── */}
        <aside
          className={`sidebar-transition shrink-0 border-2 border-border bg-secondary-background shadow-shadow lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] ${
            sidebarOpen ? "w-[300px] p-4" : "w-[52px] p-2"
          }`}
        >
          {/* Toggle button */}
          <button
            className="flex w-full items-center justify-center border-2 border-border bg-main p-1.5 shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            type="button"
          >
            {sidebarOpen ? (
              <ChevronLeft className="size-5" />
            ) : (
              <ChevronRight className="size-5" />
            )}
          </button>

          {/* Sidebar content (only visible when open) */}
          {sidebarOpen ? (
            <div className="sidebar-content-fade mt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-heading uppercase tracking-normal">
                    MedLens
                  </p>
                  <h2 className="text-lg font-heading">Recent Analyses</h2>
                </div>
                <History className="size-5" />
              </div>
              <Separator className="my-3 bg-border" />
              <ScrollArea className="h-[240px] pr-3 lg:h-[calc(100vh-12rem)]">
                {history.length ? (
                  <div className="grid gap-3">
                    {history.map((entry) => (
                      <button
                        className={`border-2 border-border bg-card p-3 text-left shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none ${
                          selectedEntry?.id === entry.id ? "bg-main" : ""
                        }`}
                        key={entry.id}
                        onClick={() => setSelectedId(entry.id)}
                        type="button"
                      >
                        <span className="block text-xs font-heading">
                          {entry.createdAt} / {entry.length}
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm">
                          {entry.abstractPreview}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border bg-muted p-4 text-sm">
                    No summaries yet. Generate one to start a session trail.
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            /* Collapsed: just show history icon vertically */
            <div className="mt-4 flex flex-col items-center gap-3">
              <History className="size-5 text-muted-foreground" />
              {history.length > 0 ? (
                <span className="text-xs font-heading">{history.length}</span>
              ) : null}
            </div>
          )}
        </aside>

        {/* ─── Main Content ─── */}
        <div className="ml-5 grid flex-1 gap-5">
          {/* Clean Hero — just the title and tagline */}
          <section className="border-2 border-border bg-main p-5 shadow-shadow md:p-7">
            <h1 className="max-w-3xl text-5xl font-heading leading-none md:text-7xl">
              MedLens
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7">
              AI-powered insights from medical research papers and abstracts.
            </p>
          </section>

          {/* Input Form */}
          <form className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit}>
            <section className="border-2 border-border bg-secondary-background p-4 shadow-shadow md:p-5">
              {/* Input mode tabs */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-0">
                  <button
                    className={`border-2 border-border px-4 py-2 text-sm font-heading transition-all ${
                      inputMode === "text"
                        ? "bg-main shadow-shadow"
                        : "bg-card hover:bg-muted"
                    }`}
                    onClick={() => setInputMode("text")}
                    type="button"
                  >
                    <FileText className="mr-2 inline size-4" />
                    Paste Abstract
                  </button>
                  <button
                    className={`-ml-[2px] border-2 border-border px-4 py-2 text-sm font-heading transition-all ${
                      inputMode === "pdf"
                        ? "bg-main shadow-shadow"
                        : "bg-card hover:bg-muted"
                    }`}
                    onClick={() => setInputMode("pdf")}
                    type="button"
                  >
                    <Upload className="mr-2 inline size-4" />
                    Upload PDF
                  </button>
                </div>
                <Button
                  onClick={() => {
                    setAbstract(sampleAbstract)
                    setTopic("Diabetes")
                    setInputMode("text")
                    setPdfFileName("")
                  }}
                  type="button"
                  variant="neutral"
                >
                  <FileText />
                  Load Sample
                </Button>
              </div>

              {/* Text input mode */}
              {inputMode === "text" ? (
                <>
                  <Textarea
                    className="mt-4 min-h-[320px] resize-y border-2 border-border bg-card text-base shadow-shadow"
                    id="abstract"
                    maxLength={MAX_ABSTRACT_CHARS}
                    onChange={(event) => setAbstract(event.target.value)}
                    placeholder="Paste a medical research abstract here. The summary will be generated from this text only."
                    value={abstract}
                  />
                  <p className="mt-3 text-sm">
                    {abstract.length.toLocaleString()} / {MAX_ABSTRACT_CHARS.toLocaleString()} characters
                  </p>
                </>
              ) : (
                /* PDF upload mode */
                <div className="mt-4">
                  <div
                    className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed border-border bg-card p-8 transition-colors hover:bg-muted"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 className="size-12 animate-spin text-main" />
                        <p className="text-lg font-heading">Extracting text from PDF...</p>
                      </>
                    ) : pdfFileName && abstract ? (
                      <>
                        <FileText className="size-12 text-main" />
                        <p className="text-lg font-heading">{pdfFileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {abstract.length.toLocaleString()} characters extracted
                        </p>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPdfFileName("")
                            setAbstract("")
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                          size="sm"
                          type="button"
                          variant="neutral"
                        >
                          <X className="size-4" />
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="size-12 text-muted-foreground" />
                        <p className="text-lg font-heading">
                          Drop a PDF here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports research papers up to 20MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePdfUpload(file)
                    }}
                    ref={fileInputRef}
                    type="file"
                  />
                  {pdfError ? (
                    <Alert className="mt-3 border-2 border-border bg-secondary-background shadow-shadow" variant="destructive">
                      <AlertCircle className="size-5" />
                      <AlertTitle>PDF Error</AlertTitle>
                      <AlertDescription>{pdfError}</AlertDescription>
                    </Alert>
                  ) : null}
                  {abstract && pdfFileName ? (
                    <p className="mt-3 text-sm">
                      {abstract.length.toLocaleString()} / {MAX_ABSTRACT_CHARS.toLocaleString()} characters extracted
                    </p>
                  ) : null}
                </div>
              )}
            </section>

            <section className="grid content-start gap-4">
              <Card className="border-2 border-border shadow-shadow">
                <CardHeader>
                  <CardTitle>Summary Length</CardTitle>
                  <CardDescription>
                    Choose the amount of detail in the generated cards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    className="grid gap-3"
                    onValueChange={(value) => setLength(value as SummaryLength)}
                    value={length}
                  >
                    {lengths.map((item) => (
                      <Label
                        className="flex cursor-pointer items-center gap-3 border-2 border-border bg-secondary-background p-3 shadow-shadow"
                        htmlFor={`length-${item}`}
                        key={item}
                      >
                        <RadioGroupItem id={`length-${item}`} value={item} />
                        <span>{item}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="border-2 border-border shadow-shadow">
                <CardHeader>
                  <CardTitle>Topic Check</CardTitle>
                  <CardDescription>
                    Optional keyword relevance check.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="topic">Topic / Keyword</Label>
                  <Input
                    className="mt-2 border-2 border-border bg-card shadow-shadow"
                    id="topic"
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Diabetes, cardiovascular risk"
                    value={topic}
                  />
                </CardContent>
              </Card>

              {error ? (
                <Alert
                  className="border-2 border-border bg-secondary-background shadow-shadow"
                  variant="destructive"
                >
                  <AlertCircle className="size-5" />
                  <AlertTitle>Could not generate</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button className="h-12 text-base" disabled={isLoading} size="lg" type="submit">
                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {isLoading ? "Generating" : "Generate Summary"}
              </Button>
            </section>
          </form>

          {/* Results */}
          {isLoading ? (
            <section className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card className="min-h-36 border-2 border-border shadow-shadow" key={index}>
                  <CardHeader>
                    <div className="h-5 w-40 animate-pulse bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 animate-pulse bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </section>
          ) : selectedEntry ? (
            <ResultsView
              length={selectedEntry.length}
              result={selectedEntry.result}
              topic={selectedEntry.topic}
            />
          ) : null}
        </div>
      </div>
    </main>
  )
}
