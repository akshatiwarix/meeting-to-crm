import type { TranscriptLine } from "@/lib/domain/transcript";
import type { ContactFact } from "@/lib/domain/meeting";
import type { ExtractedField, Evidence } from "@/lib/domain/extraction";

const INTRO_PATTERN =
  /^This is ([A-Z][a-zA-Z'-]+(?: [A-Z][a-zA-Z'-]+)+), I'm the (.+?) here(?: at [A-Z][a-zA-Z ]*)?\.$/;
const EMAIL_PATTERN = /^You can reach me at ([\w.+-]+@[\w.-]+)\.$/;

/**
 * Matches the corpus generator's exact introduction shape: "This is <Name>,
 * I'm the <Role> here[ at <Company>]." A contact never introduced by name
 * (the `unnamed-contact` corpus flag) is simply not found here — a missed
 * field, not a low-confidence guess.
 */
export function extractContacts(transcript: TranscriptLine[]): ExtractedField<ContactFact>[] {
  const found: { fact: ContactFact; evidence: Evidence[] }[] = [];

  transcript.forEach((line, lineIndex) => {
    const match = INTRO_PATTERN.exec(line.text);
    if (!match) return;
    const name = match[1]!;
    const role = match[2]!;
    found.push({
      fact: { name, role, email: null },
      evidence: [{ lineIndex, quote: line.text }],
    });
  });

  transcript.forEach((line, lineIndex) => {
    const match = EMAIL_PATTERN.exec(line.text);
    if (!match) return;
    const contact = found.find((f) => f.fact.name === line.speakerName);
    if (!contact) return;
    contact.fact.email = match[1]!;
    contact.evidence.push({ lineIndex, quote: line.text });
  });

  return found.map(({ fact, evidence }) => ({
    value: fact,
    confidence: "high" as const,
    evidence,
  }));
}
