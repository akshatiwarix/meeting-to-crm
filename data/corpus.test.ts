import { describe, expect, it } from "vitest";
import { MEETINGS } from "./corpus";
import { MEETING_COUNT } from "./generate";

describe("committed corpus structure", () => {
  it("has exactly 50 meetings with unique ids", () => {
    expect(MEETINGS.length).toBe(MEETING_COUNT);
    expect(new Set(MEETINGS.map((m) => m.id)).size).toBe(MEETING_COUNT);
  });

  it("gives every meeting at least one transcript line", () => {
    for (const meeting of MEETINGS) {
      expect(meeting.transcript.length).toBeGreaterThan(0);
    }
  });

  it("has at least 15 clean and 15 ambiguous meetings", () => {
    const clean = MEETINGS.filter((m) => m.ambiguityProfile === "clean").length;
    const ambiguous = MEETINGS.filter((m) => m.ambiguityProfile === "ambiguous").length;
    expect(clean).toBeGreaterThanOrEqual(15);
    expect(ambiguous).toBeGreaterThanOrEqual(15);
  });

  it("gives every meeting a fixed synthetic date, not derived from the real current date", () => {
    for (const meeting of MEETINGS) {
      expect(meeting.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("always states a ground-truth company for every meeting", () => {
    for (const meeting of MEETINGS) {
      expect(meeting.groundTruth.companyMentioned).not.toBeNull();
    }
  });
});
