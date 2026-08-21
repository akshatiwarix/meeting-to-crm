import { describe, expect, it } from "vitest";
import { extractRecord } from "./record";
import { MEETINGS } from "@/data/corpus";
import { ExtractedRecordSchema } from "@/lib/domain/extraction";

describe("extractRecord", () => {
  it("produces a schema-valid ExtractedRecord for every corpus meeting", () => {
    for (const meeting of MEETINGS) {
      const record = extractRecord(meeting.transcript);
      expect(() => ExtractedRecordSchema.parse(record)).not.toThrow();
    }
  });

  it("is deterministic: extracting the same transcript twice is byte-identical", () => {
    const meeting = MEETINGS[0]!;
    const a = extractRecord(meeting.transcript);
    const b = extractRecord(meeting.transcript);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("always produces a non-empty summary", () => {
    for (const meeting of MEETINGS) {
      expect(extractRecord(meeting.transcript).summary.length).toBeGreaterThan(0);
    }
  });
});
