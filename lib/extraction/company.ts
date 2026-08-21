import type { TranscriptLine } from "@/lib/domain/transcript";
import type { ExtractedField } from "@/lib/domain/extraction";

const COMPANY_PATTERN = /here at ([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*)\.$/;

/**
 * Reads the same "here at <Company>" clause a contact's introduction states.
 * No mention (the `missing-company-intro` corpus flag) means no guess — an
 * honest miss beats a wrong company name.
 */
export function extractCompany(transcript: TranscriptLine[]): ExtractedField<string | null> {
  for (let lineIndex = 0; lineIndex < transcript.length; lineIndex++) {
    const line = transcript[lineIndex]!;
    const match = COMPANY_PATTERN.exec(line.text);
    if (match) {
      return { value: match[1]!, confidence: "high", evidence: [{ lineIndex, quote: line.text }] };
    }
  }
  return { value: null, confidence: "low", evidence: [] };
}
