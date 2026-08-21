import { MEETINGS } from "@/data/corpus";
import { buildMeetingCrmResult } from "@/lib/meeting-crm/build-result";
import { MeetingLibrary } from "@/app/components/meeting-library";

export default function Home() {
  const result = buildMeetingCrmResult(MEETINGS, new Date().toISOString());

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-dim">
          Day 021 of 100 · Meeting to CRM
        </p>
        <h1 className="mt-2 font-display text-4xl italic text-ink sm:text-5xl">
          Every call, extracted, evidenced, and graded.
        </h1>
        <p className="mt-4 text-ink-dim">
          {result.meetingCount} synthetic sales-call transcripts turned into structured CRM
          records — contacts, deal stage, action items — each field backed by evidence and a
          confidence level, and graded against a hidden ground-truth answer key.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="https://github.com/akshatiwarix/meeting-to-crm"
          >
            Source
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="/try-it"
          >
            Try It Yourself
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="/api/v1/meetings"
          >
            GET /api/v1/meetings
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="/api/schema"
          >
            GET /api/schema
          </a>
          <a
            className="underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            href="https://github.com/akshatiwarix/meeting-to-crm/blob/main/PLAN.md"
          >
            Plan
          </a>
        </p>
      </header>

      <MeetingLibrary result={result} />

      <footer className="mt-16 border-t border-line pt-6 text-xs text-ink-dim">
        Synthetic, seeded corpus — no real calls, no live API calls, no model calls. Every
        extraction rule and the grading formula are documented deterministic logic (see
        PLAN.md).
      </footer>
    </main>
  );
}
