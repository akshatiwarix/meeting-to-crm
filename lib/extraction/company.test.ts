import { describe, expect, it } from "vitest";
import { extractCompany } from "./company";
import { makeTranscriptLine } from "@/lib/domain/fixtures";

describe("extractCompany", () => {
  it("extracts the company from an introduction clause", () => {
    const transcript = [
      makeTranscriptLine({ text: "This is Priya Chen, I'm the VP of Engineering here at Brightline Robotics." }),
    ];
    const result = extractCompany(transcript);
    expect(result.value).toBe("Brightline Robotics");
    expect(result.confidence).toBe("high");
  });

  it("misses honestly when no introduction states a company", () => {
    const transcript = [makeTranscriptLine({ text: "This is Priya Chen, I'm the VP of Engineering here." })];
    const result = extractCompany(transcript);
    expect(result.value).toBeNull();
    expect(result.confidence).toBe("low");
    expect(result.evidence).toEqual([]);
  });
});
