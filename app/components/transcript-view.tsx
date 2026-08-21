import type { TranscriptLine } from "@/lib/domain/transcript";

export function TranscriptView({ transcript }: { transcript: TranscriptLine[] }) {
  return (
    <ol className="space-y-3">
      {transcript.map((line, i) => (
        <li key={i} className="text-sm">
          <span className="mr-2 font-mono text-xs uppercase tracking-wide text-ink-dim">
            {line.speakerName} · {line.speaker}
          </span>
          <span className="text-ink">{line.text}</span>
        </li>
      ))}
    </ol>
  );
}
