import type { TranscriptLine } from "@/lib/domain/transcript";

const LINE_PATTERN = /^(.+?)\s*\((rep|prospect)\):\s*(.+)$/;

export type ParsedTranscript = {
  transcript: TranscriptLine[];
  skippedLineCount: number;
};

/**
 * Parses "<Speaker Name> (rep|prospect): <text>" lines into TranscriptLine[]
 * — the same shape the corpus generator produces. Blank lines are ignored;
 * any non-blank line that doesn't match the format is skipped and counted,
 * so the caller can tell the user honestly rather than silently dropping
 * their input.
 */
export function parseTranscriptText(raw: string): ParsedTranscript {
  const transcript: TranscriptLine[] = [];
  let skippedLineCount = 0;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim();
    if (line.length === 0) continue;

    const match = LINE_PATTERN.exec(line);
    if (!match) {
      skippedLineCount++;
      continue;
    }

    const [, speakerName, speaker, text] = match;
    transcript.push({ speaker: speaker as "rep" | "prospect", speakerName: speakerName!.trim(), text: text! });
  }

  return { transcript, skippedLineCount };
}
