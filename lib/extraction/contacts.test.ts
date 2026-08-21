import { describe, expect, it } from "vitest";
import { extractContacts } from "./contacts";
import { makeTranscriptLine } from "@/lib/domain/fixtures";

describe("extractContacts", () => {
  it("extracts name and role from a full introduction", () => {
    const transcript = [
      makeTranscriptLine({
        speaker: "prospect",
        speakerName: "Priya Chen",
        text: "This is Priya Chen, I'm the VP of Engineering here at Brightline Robotics.",
      }),
    ];
    const result = extractContacts(transcript);
    expect(result).toHaveLength(1);
    expect(result[0]!.value).toEqual({ name: "Priya Chen", role: "VP of Engineering", email: null });
    expect(result[0]!.confidence).toBe("high");
    expect(result[0]!.evidence).toEqual([{ lineIndex: 0, quote: transcript[0]!.text }]);
  });

  it("attaches a following email line to the matching contact", () => {
    const transcript = [
      makeTranscriptLine({
        speaker: "prospect",
        speakerName: "Priya Chen",
        text: "This is Priya Chen, I'm the VP of Engineering here.",
      }),
      makeTranscriptLine({
        speaker: "prospect",
        speakerName: "Priya Chen",
        text: "You can reach me at priya.chen@example.com.",
      }),
    ];
    const result = extractContacts(transcript);
    expect(result[0]!.value.email).toBe("priya.chen@example.com");
    expect(result[0]!.evidence).toHaveLength(2);
  });

  it("finds nothing for a contact who is never introduced by name", () => {
    const transcript = [
      makeTranscriptLine({
        speaker: "rep",
        speakerName: "Sam",
        text: "We've also got someone from your security team joining today, just to listen in.",
      }),
    ];
    expect(extractContacts(transcript)).toHaveLength(0);
  });

  it("extracts multiple distinct contacts", () => {
    const transcript = [
      makeTranscriptLine({
        speaker: "prospect",
        speakerName: "Leo Brown",
        text: "This is Leo Brown, I'm the Director of Operations here at Rivet Digital.",
      }),
      makeTranscriptLine({
        speaker: "prospect",
        speakerName: "Grace Davis",
        text: "This is Grace Davis, I'm the Director of Engineering here at Rivet Digital.",
      }),
    ];
    expect(extractContacts(transcript)).toHaveLength(2);
  });
});
