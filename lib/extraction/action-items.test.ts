import { describe, expect, it } from "vitest";
import { extractActionItems } from "./action-items";
import { makeTranscriptLine } from "@/lib/domain/fixtures";

describe("extractActionItems", () => {
  it("extracts a rep-owned item with a due hint at high confidence", () => {
    const transcript = [
      makeTranscriptLine({ speaker: "rep", speakerName: "Sam", text: "I'll send over the pricing sheet by Friday." }),
    ];
    const result = extractActionItems(transcript);
    expect(result).toHaveLength(1);
    expect(result[0]!.value).toEqual({ text: "send over the pricing sheet", owner: "Sam", dueHint: "by Friday" });
    expect(result[0]!.confidence).toBe("high");
  });

  it("extracts a rep-owned item with no due hint at medium confidence", () => {
    const transcript = [makeTranscriptLine({ speaker: "rep", speakerName: "Sam", text: "I'll share the case study." })];
    const result = extractActionItems(transcript);
    expect(result[0]!.value.dueHint).toBeNull();
    expect(result[0]!.confidence).toBe("medium");
  });

  it("extracts a contact-owned item and attributes the named owner", () => {
    const transcript = [
      makeTranscriptLine({ speaker: "rep", text: "Priya Chen will loop in the security team next Tuesday." }),
    ];
    const result = extractActionItems(transcript);
    expect(result[0]!.value).toEqual({
      text: "loop in the security team",
      owner: "Priya Chen",
      dueHint: "next Tuesday",
    });
  });

  it("extracts a schedule-pattern item with a null owner", () => {
    const transcript = [makeTranscriptLine({ speaker: "rep", text: "Let's schedule a kickoff call." })];
    const result = extractActionItems(transcript);
    expect(result[0]!.value.owner).toBeNull();
    expect(result[0]!.confidence).toBe("low");
  });

  it("finds nothing for a vaguely phrased sentence with no clear owner pattern", () => {
    const transcript = [
      makeTranscriptLine({ speaker: "rep", text: "Someone should probably send over the pricing sheet at some point." }),
    ];
    expect(extractActionItems(transcript)).toHaveLength(0);
  });
});
