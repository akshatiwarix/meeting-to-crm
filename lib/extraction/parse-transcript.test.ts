import { describe, expect, it } from "vitest";
import { parseTranscriptText } from "./parse-transcript";

describe("parseTranscriptText", () => {
  it("parses well-formed lines", () => {
    const raw = [
      "Sam (rep): Thanks for hopping on the call today.",
      "Priya Chen (prospect): This is Priya Chen, I'm the VP of Engineering here.",
    ].join("\n");
    const result = parseTranscriptText(raw);
    expect(result.transcript).toHaveLength(2);
    expect(result.skippedLineCount).toBe(0);
    expect(result.transcript[0]).toEqual({
      speaker: "rep",
      speakerName: "Sam",
      text: "Thanks for hopping on the call today.",
    });
  });

  it("ignores blank lines without counting them as skipped", () => {
    const raw = "Sam (rep): Hello.\n\n\nSam (rep): Are you there?";
    const result = parseTranscriptText(raw);
    expect(result.transcript).toHaveLength(2);
    expect(result.skippedLineCount).toBe(0);
  });

  it("counts and skips lines that don't match the format", () => {
    const raw = "Sam (rep): Hello.\nthis line has no speaker format";
    const result = parseTranscriptText(raw);
    expect(result.transcript).toHaveLength(1);
    expect(result.skippedLineCount).toBe(1);
  });

  it("rejects a speaker role outside rep/prospect", () => {
    const raw = "Sam (narrator): Hello.";
    const result = parseTranscriptText(raw);
    expect(result.transcript).toHaveLength(0);
    expect(result.skippedLineCount).toBe(1);
  });
});
