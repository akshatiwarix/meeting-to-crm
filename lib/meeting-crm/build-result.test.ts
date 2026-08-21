import { describe, expect, it } from "vitest";
import { buildMeetingCrmResult } from "./build-result";
import { MEETINGS } from "@/data/corpus";
import { MeetingCrmResultSchema } from "@/lib/domain/result";
import { makeMeeting } from "@/lib/domain/fixtures";

describe("buildMeetingCrmResult", () => {
  it("produces a schema-valid result for the full corpus", () => {
    const result = buildMeetingCrmResult(MEETINGS, "2026-01-01T00:00:00.000Z");
    expect(() => MeetingCrmResultSchema.parse(result)).not.toThrow();
    expect(result.meetingCount).toBe(MEETINGS.length);
    expect(result.meetings).toHaveLength(MEETINGS.length);
  });

  it("is deterministic for a fixed generatedAt", () => {
    const a = buildMeetingCrmResult(MEETINGS, "2026-01-01T00:00:00.000Z");
    const b = buildMeetingCrmResult(MEETINGS, "2026-01-01T00:00:00.000Z");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("splits corpus accuracy by ambiguity profile", () => {
    const clean = makeMeeting({
      id: "m-clean",
      ambiguityProfile: "clean",
      transcript: [{ speaker: "rep", speakerName: "Sam", text: "Thanks for joining." }],
      // Extraction defaults to 'discovery' when no keyword family matches, so
      // ground truth must say the same for this to be a correct match.
      groundTruth: { contacts: [], dealStage: "discovery", actionItems: [], companyMentioned: null },
    });
    const ambiguous = makeMeeting({
      id: "m-ambiguous",
      ambiguityProfile: "ambiguous",
      transcript: [{ speaker: "rep", speakerName: "Sam", text: "Thanks for joining." }],
      groundTruth: { contacts: [], dealStage: "demo", actionItems: [], companyMentioned: null },
    });
    const result = buildMeetingCrmResult([clean, ambiguous], "2026-01-01T00:00:00.000Z");
    expect(result.corpusAccuracy.byAmbiguityProfile.clean).toBe(100);
    // dealStage defaults to 'discovery' (low confidence) against a ground truth
    // of 'demo': incorrect, so fieldAccuracy is below 100 for this meeting.
    expect(result.corpusAccuracy.byAmbiguityProfile.ambiguous).toBeLessThan(100);
  });
});
