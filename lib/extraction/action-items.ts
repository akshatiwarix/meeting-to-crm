import type { TranscriptLine } from "@/lib/domain/transcript";
import type { ActionItemFact } from "@/lib/domain/meeting";
import type { ExtractedField, FieldConfidence } from "@/lib/domain/extraction";

const REP_OWNED = /^I'll (.+)\.$/;
const CONTACT_OWNED = /^([A-Z][a-zA-Z'-]+ [A-Z][a-zA-Z'-]+) will (.+)\.$/;
const SCHEDULE = /^Let's schedule (.+)\.$/;
const DUE_CLAUSE = /^(.*?)\s+(by\s.+|next\s.+|within\s.+|early\s.+)$/i;

function splitDue(text: string): { phrase: string; dueHint: string | null } {
  const match = DUE_CLAUSE.exec(text);
  if (match) return { phrase: match[1]!.trim(), dueHint: match[2]!.trim() };
  return { phrase: text.trim(), dueHint: null };
}

function confidenceFor(owner: string | null, dueHint: string | null): FieldConfidence {
  const resolved = Number(owner !== null) + Number(dueHint !== null);
  if (resolved === 2) return "high";
  if (resolved === 1) return "medium";
  return "low";
}

/**
 * Three sentence patterns, matched independently per line. A sentence
 * matching none of them (the `vague-action-item` corpus flag) is not
 * extracted at all — a missed field, the honest outcome for a sentence with
 * no clear grammatical owner or commitment.
 */
export function extractActionItems(transcript: TranscriptLine[]): ExtractedField<ActionItemFact>[] {
  const items: ExtractedField<ActionItemFact>[] = [];

  transcript.forEach((line, lineIndex) => {
    const repMatch = REP_OWNED.exec(line.text);
    if (repMatch) {
      const { phrase, dueHint } = splitDue(repMatch[1]!);
      const owner = line.speakerName;
      items.push({
        value: { text: phrase, owner, dueHint },
        confidence: confidenceFor(owner, dueHint),
        evidence: [{ lineIndex, quote: line.text }],
      });
      return;
    }

    const contactMatch = CONTACT_OWNED.exec(line.text);
    if (contactMatch) {
      const owner = contactMatch[1]!;
      const { phrase, dueHint } = splitDue(contactMatch[2]!);
      items.push({
        value: { text: phrase, owner, dueHint },
        confidence: confidenceFor(owner, dueHint),
        evidence: [{ lineIndex, quote: line.text }],
      });
      return;
    }

    const scheduleMatch = SCHEDULE.exec(line.text);
    if (scheduleMatch) {
      const { phrase, dueHint } = splitDue(scheduleMatch[1]!);
      items.push({
        value: { text: phrase, owner: null, dueHint },
        confidence: confidenceFor(null, dueHint),
        evidence: [{ lineIndex, quote: line.text }],
      });
    }
  });

  return items;
}
