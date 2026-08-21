import type { TranscriptLine } from "@/lib/domain/transcript";
import type { DealStage } from "@/lib/domain/meeting";
import type { ExtractedField, Evidence } from "@/lib/domain/extraction";

type NonDiscoveryStage = Exclude<DealStage, "discovery">;

const KEYWORD_FAMILIES: Record<NonDiscoveryStage, string[]> = {
  "closed-won": ["sign the contract", "let's get started", "moving forward with you"],
  "closed-lost": ["going with someone else", "not moving forward", "not a fit"],
  negotiation: ["legal review", "redlines", "contract terms"],
  proposal: ["send over pricing", "the proposal", "quote"],
  demo: ["schedule a demo", "walk you through the product"],
};

const DISCOVERY_HINTS = ["workflow", "evaluation process", "exploring options"];

/**
 * Scans every line for each family's literal keyword substrings. Exactly one
 * family matched is a confident read; two or more is a genuine conflict
 * (the `conflicting-stage` corpus flag) and the honest answer is null, not a
 * guess at which one "wins".
 */
export function extractDealStage(transcript: TranscriptLine[]): ExtractedField<DealStage | null> {
  const matched = new Map<NonDiscoveryStage, Evidence[]>();

  transcript.forEach((line, lineIndex) => {
    const text = line.text.toLowerCase();
    for (const [family, keywords] of Object.entries(KEYWORD_FAMILIES) as [NonDiscoveryStage, string[]][]) {
      const hit = keywords.find((keyword) => text.includes(keyword));
      if (!hit) continue;
      const evidence = matched.get(family) ?? [];
      evidence.push({ lineIndex, quote: line.text });
      matched.set(family, evidence);
    }
  });

  if (matched.size === 1) {
    const [family, evidence] = Array.from(matched.entries())[0]!;
    return { value: family, confidence: "high", evidence };
  }

  if (matched.size >= 2) {
    return { value: null, confidence: "low", evidence: Array.from(matched.values()).flat() };
  }

  const hintIndex = transcript.findIndex((line) =>
    DISCOVERY_HINTS.some((hint) => line.text.toLowerCase().includes(hint)),
  );
  if (hintIndex >= 0) {
    return {
      value: "discovery",
      confidence: "medium",
      evidence: [{ lineIndex: hintIndex, quote: transcript[hintIndex]!.text }],
    };
  }

  return { value: "discovery", confidence: "low", evidence: [] };
}
