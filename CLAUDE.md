# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Day 021 of a 100-day portfolio series. A workflow that turns synthetic sales-call
transcripts into structured CRM records — contacts, deal stage, action items, a
company reference — each field carrying visible evidence and a confidence level,
and graded automatically against a hidden ground-truth answer key embedded in the
corpus at generation time. **`PLAN.md` is the contract for this repo** — it was
settled with the user before any code was written and is not a draft to improve
on. If code and `PLAN.md` disagree, the code is wrong; if `PLAN.md` needs to
change, it changes there first, in writing, with a reason. Read `PLAN.md` in full
before implementing anything — it contains the data model, the exact corpus
generative model, every extraction rule, the grading formula, and the numbered
implementation task order this repo is built in.

## Commands

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run typecheck` — `next typegen && tsc --noEmit`.
- `npm run lint` — ESLint (flat config, `eslint-config-next`).
- `npm test` / `npm run test:watch` — vitest over `lib/**/*.test.ts` and
  `data/**/*.test.ts`.
- `npm run sweep` — `vite-node` script (`scripts/sweep.mts`) asserting the nine
  corpus-wide invariants listed in `PLAN.md` (§ Validation / test plan). No
  network.
- `npm run corpus` — regenerates the committed synthetic corpus from
  `data/generate.ts` (fixed seed; only needed if the generator changes, since the
  JSON is committed).
- Run a single test file: `npx vitest run lib/extraction/contacts.test.ts`.

## Architecture

Six downward-only dependency layers. Nothing below `app/` may import React, HTTP,
or DOM APIs.

```
data/                corpus generation (transcripts + embedded ground truth, seeded RNG) + committed JSON + zod load schema
  ↓
lib/domain/           Meeting, TranscriptLine, ContactFact, ActionItemFact, GroundTruthRecord, ExtractedField, ExtractedRecord, MeetingGrade, MeetingResult, CorpusAccuracy — types + zod
  ↓
lib/extraction/        extractContacts, extractDealStage, extractActionItems, extractCompany, extractSummary, extractRecord
  ↓
lib/grading/            gradeScalarField, gradeListField, gradeRecord
  ↓
lib/meeting-crm/         orchestration — assembles MeetingCrmResult, aggregates CorpusAccuracy
  ↓
app/                      three screens (library, meeting detail, try-it) + /api/v1/meetings + /api/schema
```

Load-bearing rules (each enforced by a `npm run sweep` invariant — see `PLAN.md`):

- `lib/extraction/` and `lib/grading/` are pure and deterministic: same
  transcript ⇒ byte-identical `ExtractedRecord`; same extracted/ground-truth
  pair ⇒ byte-identical `MeetingGrade`. No `Date.now()`, no unseeded
  `Math.random()`.
- `extractRecord` must run identically in the browser (Try It Yourself) and on
  the server (precomputed library + API route) — no Node-only or DOM-only APIs
  below `app/`.
- Grading only ever runs against a meeting's own committed ground truth. The
  Try It Yourself page never imports `lib/grading/`.
- Confidence is assigned inside `lib/extraction/`, from properties of the match
  itself — never derived from whether the grader later judged the field
  correct.

## Stack

Next.js (App Router) + React + TypeScript strict with `noUncheckedIndexedAccess`,
Tailwind CSS 4, zod at every boundary (API output, corpus load), vitest +
vite-node for tests/scripts, deployed on Vercel. **Zero dependency exceptions**
— extraction is hand-rolled regex/keyword pattern matching, no NLP library.

## Corpus

`data/generate.ts` produces the committed corpus (50 meetings, each with a
turn-by-turn transcript and a hidden ground-truth answer key, ~40% flagged
`ambiguous`) from a fixed seed. Every extraction rule and the grading formula
are documented in full in `PLAN.md` (§ Method). If you touch the generator, run
`data/*.test.ts` and `npm run sweep` to confirm all nine invariants still hold.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
