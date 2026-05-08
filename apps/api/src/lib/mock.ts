// Realistic mock responses for all AI routes.
// Activated when MOCK_AI=true in .dev.vars.
// All streaming mocks chunk text in 20-char pieces to simulate real token streaming.

export function mockStream(text: string): Response {
  const encoder = new TextEncoder()
  const chunks = chunkText(text, 20)

  const readable = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await sleep(15)
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
      "X-Mock": "true",
    },
  })
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ─── Brief Ingestion ────────────────────────────────────────────────────────

export const MOCK_BRIEF_RESPONSE = `{"type":"summary","title":"Critical Analysis of Organisational Change Management","deliverables":["2500-word essay","Reference list (min 12 academic sources)","Reflective paragraph"],"keyDates":["Draft due: 2 weeks before submission","Final submission: end of semester"],"submissionFormat":"PDF via LMS, double-spaced, 12pt Times New Roman","highRiskAreas":["Critical analysis depth","Recency of sources (post-2015)","Reflective component often skipped"]}
---SECTION---
{"type":"criteria","items":[{"name":"Critical Analysis","description":"Evaluate change management theories with evidence-based critique, not description","weight":35},{"name":"Use of Academic Literature","description":"Minimum 12 peer-reviewed sources, majority post-2015","weight":25},{"name":"Application to Real Organisation","description":"Apply theory to a real-world case study with specific examples","weight":20},{"name":"Structure and Argumentation","description":"Logical flow, clear thesis, coherent paragraph structure","weight":12},{"name":"Reflection","description":"Personal reflective paragraph on learnings","weight":8}]}
---SECTION---
{"type":"tasks","items":[{"title":"Select and research case study organisation","description":"Choose a real organisation that underwent significant change. Gather 3-4 specific examples of change initiatives.","priority":"critical","effortHours":3,"criterionName":"Application to Real Organisation","dependencies":[]},{"title":"Literature search — change management theories","description":"Find 12+ peer-reviewed sources. Focus on Kotter, Lewin, ADKAR, and post-2015 critiques. Use Google Scholar and university library databases.","priority":"high","effortHours":4,"criterionName":"Use of Academic Literature","dependencies":[]},{"title":"Draft thesis and essay outline","description":"Write a clear thesis statement and section-by-section outline before drafting. Get peer feedback on argument logic.","priority":"high","effortHours":2,"criterionName":"Structure and Argumentation","dependencies":["Select and research case study organisation"]},{"title":"Write critical analysis sections","description":"Draft the core body paragraphs. Each paragraph must critique a theory, not just describe it. Use counter-arguments.","priority":"critical","effortHours":5,"criterionName":"Critical Analysis","dependencies":["Draft thesis and essay outline","Literature search — change management theories"]},{"title":"Write reflective paragraph","description":"250-word personal reflection on what you learned about change management through this assignment. Use first person.","priority":"medium","effortHours":1,"criterionName":"Reflection","dependencies":["Write critical analysis sections"]},{"title":"Format references in APA 7th","description":"Compile and format all references. Check every in-text citation has a matching reference entry.","priority":"medium","effortHours":1.5,"criterionName":"Use of Academic Literature","dependencies":["Write critical analysis sections"]},{"title":"Proofread and submit","description":"Read aloud for flow. Check word count. Export as PDF and confirm LMS submission is successful.","priority":"high","effortHours":1,"criterionName":"Structure and Argumentation","dependencies":["Write reflective paragraph","Format references in APA 7th"]}]}`

// ─── Risk Audit ─────────────────────────────────────────────────────────────

export const MOCK_RISK_RESPONSE = {
  score: 62,
  narrative:
    "Your plan covers 3 of 5 rubric criteria. Critical Analysis (35%) has tasks assigned but none are complete — this is your highest-risk area. Reflection (8%) has no task mapped at all. Address these before your next work session.",
  criteriaStatuses: [
    { name: "Critical Analysis", status: "partial", reason: "Tasks exist but none marked complete" },
    { name: "Use of Academic Literature", status: "covered", reason: "Literature search task completed" },
    { name: "Application to Real Organisation", status: "covered", reason: "Case study task done" },
    { name: "Structure and Argumentation", status: "partial", reason: "Outline drafted, essay not started" },
    { name: "Reflection", status: "uncovered", reason: "No task mapped to this criterion" },
  ],
}

// ─── Contract Validation ─────────────────────────────────────────────────────

export const MOCK_CONTRACT_VALIDATE_RESPONSE = {
  verdict: "partial",
  reason:
    "The proof demonstrates engagement with Kotter's 8-step model but does not include the required counter-argument or critique of the theory's limitations, which is central to the Critical Analysis criterion.",
  suggestion:
    "Add a paragraph critiquing Kotter's model — for example, its linear assumptions and poor fit for complex adaptive organisations (see Burnes, 2020).",
}

export const MOCK_CONTRACT_TIME_RESPONSE = {
  suggestedHours: 3.5,
  reasoning: "Critical analysis writing typically requires 1 hour per 500 words at essay level.",
  warning:
    "This task is depended on by 'Write reflective paragraph' — completing it late will compress your proofreading time.",
}

// ─── Chat Summarise ──────────────────────────────────────────────────────────

export const MOCK_CHAT_SUMMARY = `## Decisions Made
- Omar will handle the literature search; Maya will write the case study section
- Group agreed to use Kotter's 8-step model as the primary framework

## New Tasks Identified
- James to create a shared reference doc in Google Drive by Thursday
- Omar to share 5 source summaries in the group chat before the next check-in

## Blockers Raised
- Maya can't access the university library database from off-campus — needs VPN setup
- James flagged his section is blocked until the case study organisation is confirmed

## Unresolved Questions
- Which organisation to use as the case study — Kodak or Nokia? Still undecided
- Whether the reflective paragraph should be written in first or third person

## Rubric Risk Signals
- ⚠️ Nobody has mentioned the Reflection criterion (8%) in 3 days — no task is assigned to it
- ⚠️ "Critical Analysis" is the highest-weighted criterion (35%) but has not been discussed in chat at all`

// ─── Chat Scan ───────────────────────────────────────────────────────────────

export const MOCK_CHAT_SCAN_FLAGGED = {
  flagged: true,
  reason: "Message suggests a rubric criterion may be dropped or a team member is unable to complete their task.",
}

export const MOCK_CHAT_SCAN_CLEAR = {
  flagged: false,
  reason: null,
}

// ─── Submission Check ────────────────────────────────────────────────────────

export const MOCK_SUBMISSION_REPORT = `## Overall Assessment
This draft demonstrates a solid understanding of change management theory and a well-chosen case study. However, the critical analysis sections lean toward description rather than critique, and the Reflection is missing entirely — these two gaps represent 43% of available marks.

## Predicted Grade Range
**C+ to B– (62–68%)** — Adding genuine critique to the analysis sections and completing the reflection could push this to B+ or higher.

## Criteria Coverage

### Critical Analysis (35%) — ⚠️ Weak
The Kotter section summarises the 8 steps accurately but does not interrogate limitations. A single counter-argument paragraph would significantly strengthen this.
**Fix:** Add a paragraph critiquing Kotter's linear model using Burnes (2020) or Dawson (2019).

### Use of Academic Literature (25%) — ✅ Covered
11 peer-reviewed sources cited, majority post-2015. One source (Johnson, 2009) is outside the recommended date range but is acceptable given its canonical status.

### Application to Real Organisation (20%) — ✅ Covered
The Nokia case study is specific, relevant, and well-integrated across three sections. Strong work.

### Structure and Argumentation (12%) — ⚠️ Weak
The introduction lacks a clear thesis statement. Paragraph 4 introduces a new argument in the conclusion sentence, disrupting flow.
**Fix:** Add a one-sentence thesis to the introduction; move paragraph 4's final point to its own paragraph.

### Reflection (8%) — ❌ Missing
No reflective content detected in the submission. This is 8% of your grade.
**Fix:** Write a 200–250 word first-person paragraph on your personal learnings before submitting.

## Priority Actions Before Submission
1. Write the missing Reflection paragraph (8% of marks, ~30 minutes of work)
2. Add critique of Kotter's limitations to the Critical Analysis section (highest-weight criterion)
3. Add a clear thesis statement to the introduction`
