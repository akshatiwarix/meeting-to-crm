import { describe, expect, it } from "vitest";
import { extractDealStage } from "./deal-stage";
import { makeTranscriptLine } from "@/lib/domain/fixtures";

describe("extractDealStage", () => {
  it("matches a single strong keyword family with high confidence", () => {
    const transcript = [
      makeTranscriptLine({ text: "We're currently in legal review on the contract." }),
    ];
    const result = extractDealStage(transcript);
    expect(result.value).toBe("negotiation");
    expect(result.confidence).toBe("high");
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it("returns null with low confidence when two families conflict", () => {
    const transcript = [
      makeTranscriptLine({ text: "We're moving forward with you on this." }),
      makeTranscriptLine({ text: "There are a couple of contract terms we still need to align on." }),
    ];
    const result = extractDealStage(transcript);
    expect(result.value).toBeNull();
    expect(result.confidence).toBe("low");
  });

  it("defaults to discovery with medium confidence when exploratory language is present", () => {
    const transcript = [
      makeTranscriptLine({ text: "Tell me more about your current workflow and where the friction is." }),
    ];
    const result = extractDealStage(transcript);
    expect(result.value).toBe("discovery");
    expect(result.confidence).toBe("medium");
  });

  it("defaults to discovery with low confidence when nothing at all matches", () => {
    const transcript = [makeTranscriptLine({ text: "Thanks for joining today." })];
    const result = extractDealStage(transcript);
    expect(result.value).toBe("discovery");
    expect(result.confidence).toBe("low");
  });

  it("does not cross-match action-item phrasing that merely contains related words", () => {
    const transcript = [
      makeTranscriptLine({ speaker: "rep", text: "I'll send over the pricing sheet by Friday." }),
      makeTranscriptLine({ speaker: "rep", text: "I'll send the contract for review by Friday." }),
    ];
    const result = extractDealStage(transcript);
    expect(result.value).toBe("discovery");
  });
});
